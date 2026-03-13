import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";

// ─── Helper: Parse surah reference string → { surah, ayat } ─────
function parseSurahReference(ref: string): { surah: number; ayat: number } | null {
  const match = ref.match(/(\d+)\s*$/);
  const colonMatch = ref.match(/:\s*(\d+)/);

  const ayatStr = colonMatch?.[1] || match?.[1];
  if (!ayatStr) return null;

  const ayat = parseInt(ayatStr, 10);
  if (isNaN(ayat)) return null;

  const surahMap: Record<string, number> = {
    "al-fatihah": 1, "al-baqarah": 2, "ali imran": 3, "an-nisa": 4, "al-maidah": 5,
    "al-an'am": 6, "al-a'raf": 7, "al-anfal": 8, "at-taubah": 9, "yunus": 10,
    "hud": 11, "yusuf": 12, "ar-ra'd": 13, "ibrahim": 14, "al-hijr": 15,
    "an-nahl": 16, "al-isra": 17, "al-kahf": 18, "maryam": 19, "taha": 20,
    "al-anbiya": 21, "al-hajj": 22, "al-mu'minun": 23, "an-nur": 24, "al-furqan": 25,
    "asy-syu'ara": 26, "an-naml": 27, "al-qasas": 28, "al-ankabut": 29, "ar-rum": 30,
    "luqman": 31, "as-sajdah": 32, "al-ahzab": 33, "saba": 34, "fatir": 35,
    "yasin": 36, "as-saffat": 37, "sad": 38, "az-zumar": 39, "ghafir": 40,
    "fussilat": 41, "asy-syura": 42, "az-zukhruf": 43, "ad-dukhan": 44, "al-jasiyah": 45,
    "al-ahqaf": 46, "muhammad": 47, "al-fath": 48, "al-hujurat": 49, "qaf": 50,
    "adz-dzariyat": 51, "at-tur": 52, "an-najm": 53, "al-qamar": 54, "ar-rahman": 55,
    "al-waqi'ah": 56, "al-hadid": 57, "al-mujadalah": 58, "al-hasyr": 59, "al-mumtahanah": 60,
    "as-saff": 61, "al-jumu'ah": 62, "al-munafiqun": 63, "at-tagabun": 64, "at-talaq": 65,
    "at-tahrim": 66, "al-mulk": 67, "al-qalam": 68, "al-haqqah": 69, "al-ma'arij": 70,
    "nuh": 71, "al-jinn": 72, "al-muzzammil": 73, "al-muddassir": 74, "al-qiyamah": 75,
    "al-insan": 76, "al-mursalat": 77, "an-naba": 78, "an-nazi'at": 79, "abasa": 80,
    "at-takwir": 81, "al-infitar": 82, "al-mutaffifin": 83, "al-insyiqaq": 84, "al-buruj": 85,
    "at-tariq": 86, "al-a'la": 87, "al-gasiyah": 88, "al-fajr": 89, "al-balad": 90,
    "asy-syams": 91, "al-lail": 92, "ad-duha": 93, "al-insyirah": 94, "at-tin": 95,
    "al-alaq": 96, "al-qadr": 97, "al-bayyinah": 98, "az-zalzalah": 99, "al-adiyat": 100,
    "al-qari'ah": 101, "at-takasur": 102, "al-asr": 103, "al-humazah": 104, "al-fil": 105,
    "quraisy": 106, "al-ma'un": 107, "al-kausar": 108, "al-kafirun": 109, "an-nasr": 110,
    "al-lahab": 111, "al-ikhlas": 112, "al-falaq": 113, "an-nas": 114,
  };

  const lower = ref.toLowerCase().replace(/qs\.\s*/i, "").replace(/:\s*\d+.*$/, "").trim();
  const surah = surahMap[lower];

  if (surah) return { surah, ayat };

  for (const [name, num] of Object.entries(surahMap)) {
    if (lower.includes(name) || name.includes(lower)) return { surah: num, ayat };
  }

  return null;
}

// ─── Helper: Fetch Kemenag Tafsir ───────────────────────────────
async function fetchKemenagTafsir(surahNumber: number, verseNumber: number): Promise<string> {
  try {
    console.log(`[Encyclopedia RAG] Fetching Kemenag: Surah ${surahNumber}, Ayat ${verseNumber}`);
    const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return "Tafsir Kemenag tidak tersedia untuk ayat ini.";

    const json = await res.json();
    const tafsirList = json?.data?.tafsir;
    if (!Array.isArray(tafsirList)) return "Tafsir Kemenag tidak tersedia.";

    const match = tafsirList.find((t: { ayat: number }) => t.ayat === verseNumber);
    if (!match?.teks) return "Tidak ada tafsir Kemenag spesifik untuk ayat ini.";

    const clean = match.teks.replace(/<[^>]*>/g, "");
    console.log(`[Encyclopedia RAG] ✅ Kemenag tafsir found (${clean.length} chars)`);
    return clean;
  } catch (err) {
    console.error("[Encyclopedia RAG] Kemenag fetch error:", err);
    return "Gagal mengambil tafsir Kemenag.";
  }
}

// ─── POST Handler ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topicTitle = body.topicTitle;

    console.log("[Encyclopedia Detail] Received topicTitle:", topicTitle);

    if (!topicTitle || typeof topicTitle !== "string" || topicTitle.trim().length === 0) {
      return NextResponse.json({ error: "Judul topik tidak disertakan." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // ─── Step 1: Check cache + ambil metadata sumber ─────────
    const { data: existing, error: fetchError } = await supabase
      .from("encyclopedia_articles")
      .select("id, full_article, teaser, surah_reference, source_scholar, reference_book")
      .eq("title", topicTitle)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[Encyclopedia Detail] DB fetch error:", fetchError);
    }

    if (existing?.full_article) {
      console.log("[Encyclopedia Detail] ✅ Cache hit for:", topicTitle);
      try {
        const parsed = typeof existing.full_article === "string"
          ? JSON.parse(existing.full_article)
          : existing.full_article;
        return NextResponse.json(parsed);
      } catch (parseErr) {
        console.error("[Encyclopedia Detail] Cache parse error, regenerating:", parseErr);
      }
    }

    // ─── Step 2: Ambil data sumber dari DB ───────────────────
    const sourceScholar = existing?.source_scholar || null;
    const referenceBook = existing?.reference_book || null;
    const savedSurahRef = existing?.surah_reference || null;

    console.log(`[Encyclopedia Detail] Sumber: ${sourceScholar} — ${referenceBook}`);

    // ─── Step 3: Dapatkan surah reference ────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan di server." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    let surahRef = savedSurahRef || "";
    let surahNum = 0;
    let verseNum = 0;

    if (savedSurahRef) {
      // Gunakan surah_reference yang sudah tersimpan di DB
      const parsed = parseSurahReference(savedSurahRef);
      if (parsed) {
        surahNum = parsed.surah;
        verseNum = parsed.ayat;
      }
    }

    if (!surahNum || !verseNum) {
      // Fallback: tanya AI untuk identifikasi ayat
      console.log("[Encyclopedia Detail] Pass 1: Identifying surah reference for:", topicTitle);

      const refCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Untuk topik ensiklopedia berikut, identifikasi SATU ayat Al-Qur'an (Ayat Kauniyah) yang paling relevan. Kembalikan JSON: { "surah_reference": "QS. Nama Surah: Nomor Ayat", "surah_number": angka_surah, "verse_number": angka_ayat }. Pastikan JSON valid.`,
          },
          { role: "user", content: `Topik: "${topicTitle}"` },
        ],
      });

      const refData = JSON.parse(refCompletion.choices[0].message.content || "{}");
      surahRef = refData.surah_reference || "";
      surahNum = refData.surah_number || 0;
      verseNum = refData.verse_number || 0;

      if ((!surahNum || !verseNum) && surahRef) {
        const parsed = parseSurahReference(surahRef);
        if (parsed) {
          surahNum = parsed.surah;
          verseNum = parsed.ayat;
        }
      }
    }

    console.log(`[Encyclopedia Detail] Surah: ${surahRef} → Surah ${surahNum}, Ayat ${verseNum}`);

    // ─── Step 4: RAG — Fetch Kemenag Tafsir ──────────────────
    let kemenagTafsir = "Tafsir tidak tersedia.";
    if (surahNum > 0 && verseNum > 0) {
      kemenagTafsir = await fetchKemenagTafsir(surahNum, verseNum);
    }

    // ─── Step 5: Bangun system prompt berdasarkan sumber ─────
    console.log("[Encyclopedia Detail] Pass 2: Generating Literature Review article...");

    let systemPrompt: string;

    if (sourceScholar && referenceBook) {
      // ✅ MODE TINJAUAN PUSTAKA: Ada sumber tokoh → buat ulasan akademis atas pemikiran tokoh
      systemPrompt = `TUGASMU: Buatlah artikel ringkasan akademis dari pemikiran ${sourceScholar} dalam karyanya "${referenceBook}" mengenai ${surahRef}.

TOPIK ARTIKEL: "${topicTitle}"
AYAT RUJUKAN: ${surahRef}
TOKOH YANG DIKAJI: ${sourceScholar}
KARYA REFERENSI: ${referenceBook}

TAFSIR RESMI KEMENAG RI untuk ayat tersebut (sebagai pembanding dan penguat):
"""
${kemenagTafsir}
"""

ATURAN ARTIKEL TINJAUAN PUSTAKA:
1. Jelaskan BAGAIMANA ${sourceScholar} membedah ayat ${surahRef} dari sudut pandang sains dalam karyanya "${referenceBook}".
2. Gunakan pendekatan akademis: jelaskan metodologi penafsiran tokoh tersebut, argumen saintifiknya, dan bukti empiris yang ia gunakan.
3. JANGAN mengarang teori sains di luar apa yang dibahas oleh ${sourceScholar}. Jika tokoh tersebut menafsirkan Al-Anbiya 30 sebagai Big Bang, maka bahas Big Bang — jangan melantur ke biologi sel atau topik sains lain.
4. Kombinasikan dengan Tafsir resmi Kemenag sebagai rujukan tekstual resmi.
5. Artikel ini harus murni berupa ulasan akademis terhadap pemikiran tokoh tersebut.
6. Gunakan HARD FACTS: tahun publikasi, metode ilmiah yang dirujuk tokoh, data saintifik yang ia kutip.

Kembalikan JSON:
{
  "title": "Judul artikel akademis",
  "surah_reference": "${surahRef}",
  "verse_arabic": "Teks Arab ayat",
  "verse_translation": "Terjemahan Indonesia",
  "modern_discovery": "Penjelasan fakta sains/sejarah yang menjadi objek kajian ${sourceScholar} — 2 paragraf penuh dengan HARD FACTS.",
  "quranic_correlation": "Bagaimana ${sourceScholar} dalam '${referenceBook}' menganalisis ${surahRef} dan mengaitkannya dengan fakta sains — 2 paragraf akademis.",
  "scholar_profile": "Biografi singkat ${sourceScholar} dan konteks penulisan '${referenceBook}' — 1 paragraf.",
  "conclusion": "Kesimpulan akademis atas kontribusi ${sourceScholar} dalam bidang Tafsir Ilmi — 1 paragraf.",
  "source_scholar": "${sourceScholar}",
  "reference_book": "${referenceBook}",
  "is_cocoklogi": false
}

Pastikan JSON valid. Bahasa: Indonesia.`;
    } else {
      // ⚠️ FALLBACK MODE: Tidak ada data sumber → gunakan gaya ensiklopedia akademis umum dengan anti-cocoklogi
      systemPrompt = `Kamu adalah Penulis Ensiklopedia Islam berstandar Jurnal Akademis Internasional.

TOPIK ARTIKEL: "${topicTitle}"
AYAT RUJUKAN: ${surahRef}

TAFSIR RESMI KEMENAG RI untuk ayat tersebut:
"""
${kemenagTafsir}
"""

TUGASMU:
1. EVALUASI terlebih dahulu: Apakah topik "${topicTitle}" BENAR-BENAR relevan dengan tafsir Kemenag di atas?

2. JIKA RELEVAN: Tulis artikel ensiklopedia menggunakan HARD FACTS (nama ilmuwan nyata, tahun spesifik, data saintifik). Rujuk mufassir terkemuka (Tantawi Jawhari, Zaghloul El-Naggar, Quraish Shihab, Maurice Bucaille).

3. JIKA TIDAK NYAMBUNG / COCOKLOGI: Set is_cocoklogi ke true. Jelaskan makna asli ayat secara jujur berdasarkan Kemenag tanpa memaksakan korelasi sains.

ATURAN MUTLAK: DILARANG mengarang korelasi Qur'an-sains sendiri tanpa rujukan mufassir yang nyata.

Kembalikan JSON:
{
  "title": "Judul artikel akademis",
  "surah_reference": "${surahRef}",
  "verse_arabic": "Teks Arab ayat",
  "verse_translation": "Terjemahan Indonesia",
  "modern_discovery": "Penemuan sains/sejarah (HARD FACTS: nama, tahun, data) — 2 paragraf.",
  "quranic_correlation": "Korelasi Qur'ani menurut MUFASSIR TERKEMUKA yang nyata — 2 paragraf.",
  "scholar_profile": null,
  "conclusion": "Kesimpulan akademis — 1 paragraf.",
  "source_scholar": null,
  "reference_book": null,
  "is_cocoklogi": false
}

Pastikan JSON valid. Bahasa: Indonesia.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: sourceScholar
            ? `Buat artikel Tinjauan Pustaka tentang pemikiran ${sourceScholar} dalam "${referenceBook}" khusus mengenai: "${topicTitle}".`
            : `Buat artikel ensiklopedia akademis KHUSUS tentang: "${topicTitle}". Verifikasi korelasi ayat dengan tafsir Kemenag.`,
        },
      ],
    });

    const rawText = completion.choices[0].message.content || "{}";
    const article = JSON.parse(rawText);

    if (article.is_cocoklogi) {
      console.warn(`[Encyclopedia Detail] ⚠️ COCOKLOGI detected for: ${topicTitle}`);
    }

    // ─── Step 6: Cache to DB ─────────────────────────────────
    if (existing?.id) {
      const updatePayload: Record<string, unknown> = {
        full_article: JSON.stringify(article),
      };

      // Simpan surah_reference jika belum tersimpan
      if (!savedSurahRef && surahRef) {
        updatePayload.surah_reference = surahRef;
      }

      const { error: updateError } = await supabase
        .from("encyclopedia_articles")
        .update(updatePayload)
        .eq("id", existing.id);

      if (updateError) {
        console.error("[Encyclopedia Detail] DB update error:", updateError);
      } else {
        console.log("[Encyclopedia Detail] ✅ Article cached:", topicTitle);
      }
    } else {
      const insertPayload = {
        title: topicTitle,
        full_article: JSON.stringify(article),
        category: "Keajaiban Harian",
        surah_reference: surahRef || article.surah_reference || null,
        teaser: article.modern_discovery ? article.modern_discovery.substring(0, 100) + "..." : null,
      };

      const { error: insertError } = await supabase
        .from("encyclopedia_articles")
        .insert(insertPayload);
        
      if (insertError) {
        console.error("[Encyclopedia Detail] DB insert error:", insertError);
      } else {
        console.log("[Encyclopedia Detail] ✅ New Article inserted and cached:", topicTitle);
      }
    }

    return NextResponse.json(article);
  } catch (error: unknown) {
    console.error("ENCYCLOPEDIA DETAIL API ERROR:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
