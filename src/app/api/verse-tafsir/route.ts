import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";

// ─── Helper: Fetch Kemenag Tafsir from equran.id ────────────────
async function fetchKemenagTafsir(surahNumber: number, verseNumber: number): Promise<string> {
  try {
    console.log(`[RAG] Fetching Kemenag tafsir: Surah ${surahNumber}, Ayat ${verseNumber}`);

    const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[RAG] Kemenag API returned ${res.status}`);
      return "Tidak ada tafsir spesifik dari Kemenag untuk ayat ini.";
    }

    const json = await res.json();
    const tafsirList = json?.data?.tafsir;

    if (!Array.isArray(tafsirList)) {
      console.warn("[RAG] Kemenag response has no tafsir array");
      return "Tidak ada tafsir spesifik dari Kemenag untuk ayat ini.";
    }

    const match = tafsirList.find((t: { ayat: number }) => t.ayat === verseNumber);

    if (!match?.teks) {
      console.warn(`[RAG] No tafsir found for ayat ${verseNumber}`);
      return "Tidak ada tafsir spesifik dari Kemenag untuk ayat ini.";
    }

    const cleanText = match.teks.replace(/<[^>]*>/g, "");
    console.log(`[RAG] ✅ Kemenag tafsir found: ${cleanText.substring(0, 120)}...`);
    return cleanText;
  } catch (err) {
    console.error("[RAG] Kemenag fetch error:", err);
    return "Gagal mengambil tafsir dari Kemenag. AI akan menganalisis berdasarkan pengetahuan umum.";
  }
}

// ─── Build RAG-Grounded System Prompt (Anti-Cocoklogi v2) ────────
// Mengimplementasikan 3-step mandatory chain: Baca → Identifikasi Inti → Verifikasi Inline
function buildSystemPrompt(surahNumber: number, verseNumber: number, kemenagTafsir: string): string {
  return [
    `Kamu adalah Mufassir Kritis berbasis RAG (Retrieval-Augmented Generation). Sumber SATU-SATUNYA adalah Tafsir Kemenag RI di bawah. Seluruh analisismu WAJIB berakar dari teks ini — bukan dari pengetahuan umum.`,
    ``,
    `═══════════════════════════════════════════════════`,
    `📖 TAFSIR KEMENAG — Surah ${surahNumber} Ayat ${verseNumber}:`,
    `═══════════════════════════════════════════════════`,
    `"""`,
    kemenagTafsir,
    `"""`,
    ``,
    `═══════════════════════════════════════════════════`,
    `🔗 RANTAI KERJA WAJIB (IKUTI PERSIS — 3 LANGKAH)`,
    `═══════════════════════════════════════════════════`,
    ``,
    `LANGKAH 1 — EKSTRAK TEMA INTI KEMENAG (lakukan SEBELUM menulis apapun):`,
    `   Identifikasi 1-3 tema inti yang dibahas Kemenag. Ini menjadi JANGKAR seluruh analisis.`,
    `   Contoh: "Kemenag membahas: (a) larangan memakan harta yatim, (b) ancaman neraka bagi pelakunya."`,
    ``,
    `LANGKAH 2 — VERIFIKASI INLINE (terapkan sebelum menulis SETIAP perspektif):`,
    `   perspektif_sosial: "Apakah tema inti Kemenag LANGSUNG menyentuh dinamika sosial/masyarakat?"`,
    `   → YA → tulis analisis yang BERPUSAT pada tema itu.`,
    `   → TIDAK → kembalikan null. JANGAN tulis analisis sosial generik.`,
    ``,
    `   perspektif_psikologi: "Apakah tema inti Kemenag LANGSUNG menyentuh kondisi jiwa/perilaku?"`,
    `   → YA → tulis. TIDAK → null.`,
    ``,
    `   perspektif_sains: "Apakah tema inti Kemenag menyebut fenomena alam/fisik yang diverifikasi sains?"`,
    `   → YA → tulis fakta sains keras. TIDAK → null.`,
    ``,
    `LANGKAH 3 — CEK VALIDITAS (sebelum finalisasi output):`,
    `   Untuk setiap kalimat yang kamu tulis, jawab: "Paragraf mana di teks Kemenag yang menjadi dasar klaim ini?"`,
    `   Jika tidak bisa dijawab → hapus kalimat itu atau kembalikan null untuk perspektif tersebut.`,
    ``,
    `═══════════════════════════════════════════════════`,
    `🚫 ATURAN PENGGUGURAN — WAJIB NULL JIKA:`,
    `═══════════════════════════════════════════════════`,
    ``,
    `❌ NAME-DROPPING KOSONG: menyebut ulama/ilmuwan TANPA menghubungkan ke tema inti Kemenag.`,
    `   DILARANG: "Ibnu Khaldun membahas siklus peradaban." (tidak relevan jika Kemenag bahas larangan riba)`,
    `   BENAR: "Ibnu Khaldun (Muqaddimah) menjelaskan riba melemahkan ashabiyah ekonomi umat — inline`,
    `    dengan peringatan Kemenag tentang larangan memakan harta secara batil."`,
    ``,
    `❌ GENERALISASI: analisis sosial/psikologi generik yang bisa ditempel ke ayat manapun.`,
    `   DILARANG: "Ayat ini mengajarkan moral dan etika dalam bermasyarakat."`,
    `   BENAR: kaitkan ke tema SPESIFIK yang disebut Kemenag.`,
    ``,
    `❌ LOMPAT TOPIK: Kemenag bahas A, tapi perspektifmu bahas B yang tidak ada di teks Kemenag.`,
    `   Contoh: Kemenag bahas kelalaian waktu → perspektif_sosial tentang "pelanggaran moral umum" = DILARANG.`,
    `   Yang benar: perspektif_sosial tentang "manajemen waktu kolektif" = DIIZINKAN (inline dengan kelalaian).`,
    ``,
    `═══════════════════════════════════════════════════`,
    `📖 ADAB BAHASA & GAYA PENULISAN (SANGAT PENTING)`,
    `═══════════════════════════════════════════════════`,
    ``,
    `DILARANG KERAS menggunakan frasa meta-komentar seperti: "tema yang diangkat Kemenag", "Kemenag menyoroti", "tema ini menunjukkan", atau gaya penulisan makalah akademik/presentasi.`,
    `Gunakan bahasa yang BERWIBAWA, LANGSUNG, dan SESUAI ADAB TAFSIR. Posisikan teks Kemenag sebagai TAFSIR RESMI, bukan sekadar 'tema bacaan'.`,
    `Contoh bahasa yang BENAR: "Berdasarkan Tafsir Kemenag...", "Ayat ini menafsirkan...", "Secara sosial, tafsir ayat ini memberikan pelajaran...", atau langsung jelaskan intisarinya tanpa menyebut kata 'Kemenag'.`,
    ``,
    `═══════════════════════════════════════════════════`,
    `📋 ATURAN FORMAT KONTEN`,
    `═══════════════════════════════════════════════════`,
    ``,
    `perspektif_sains — Hanya HARD FACTS:`,
    `   • TAHUN spesifik penemuan/publikasi`,
    `   • NAMA ilmuwan/peneliti + karya/jurnal`,
    `   • DETAIL TEKNIS (nama senyawa, proses biologis, hukum alam)`,
    `   Standar: "Pada 1881, Gaston Maspero menemukan mumi Ramesses II. Dr. Maurice Bucaille (1976)`,
    `   menganalisis dan menemukan kristal garam laut di paru — konsisten dengan asfiksia submersif."`,
    `   → NULL jika tidak ada fakta ilmiah SPESIFIK yang LANGSUNG terhubung ke tema Kemenag.`,
    ``,
    `perspektif_psikologi & perspektif_sosial — Rujukan ulama Islam:`,
    `   a. Nama + kitab spesifik disebut`,
    `   b. Pemikirannya LANGSUNG relevan ke tema inti Kemenag (bukan generik)`,
    `   Rujukan valid: Al-Ghazali (Ihya Ulumuddin), Ibnu Qayyim (Madarij al-Salikin, Igatsatul Lahfan),`,
    `   Ibnu Khaldun (Muqaddimah), Quraish Shihab (Al-Misbah), Buya Hamka (Al-Azhar),`,
    `   Al-Attas (Islamisasi Ilmu), Al-Faruqi (Tauhid sebagai worldview), Izutsu (Semantik Al-Qur'an).`,
    `   DILARANG: Freud, Marx, Foucault, Durkheim — kecuali dikontraskan dengan pandangan Islam.`,
    `   → NULL jika tidak bisa menemukan ulama yang RELEVAN dan SPESIFIK untuk tema Kemenag ini.`,
    ``,
    `═══════════════════════════════════════════════════`,
    `📤 OUTPUT — JSON VALID SAJA (tanpa teks apapun di luar JSON)`,
    `═══════════════════════════════════════════════════`,
    ``,
    `{`,
    `  "tafsir_kemenag": "Ringkasan 2-3 paragraf padat dari teks Kemenag di atas",`,
    `  "asbabun_nuzul": "Jika asbabun nuzul tidak ditemukan, KEMBALIKAN STRING KOSONG \\"\\" ATAU NILAI null. Dilarang keras mengembalikan kalimat penjelasan atau teks placeholder apa pun.",`,
    `  "perspektif_sains": "Fakta ilmiah SPESIFIK (nama, tahun, detail teknis) inline Kemenag — atau null",`,
    `  "perspektif_psikologi": "Analisis jiwa berbasis ulama Islam (nama+kitab) inline Kemenag — atau null",`,
    `  "perspektif_sosial": "Analisis sosial berbasis ulama Islam (nama+kitab) inline Kemenag — atau null",`,
    `  "hadith": "1 hadist shahih yang menguatkan tema Kemenag. FORMAT WAJIB: Tulis isi terjemahan hadist langsung (tanpa kalimat pengantar), lalu di baris berikutnya sertakan referensi PERSIS mengikuti salah satu pola ini:\n  Pola A (satu perawi): (HR. Bukhari No. 6018)\n  Pola B (dua perawi): (HR. Bukhari No. 6018, Muslim No. 47)\n  Pola C (perawi lain): (HR. Tirmidzi No. 2516)\n  WAJIB: Selalu sertakan nomor hadits yang akurat setelah nama perawi. DILARANG KERAS: format tanpa nomor seperti (HR. Bukhari dan Muslim) atau (Muttafaq alaih) tanpa nomor. Contoh output yang benar: \"Sesungguhnya setiap amalan tergantung pada niatnya.\" (HR. Bukhari No. 1, Muslim No. 1907).",`,
    `  "todo_list": ["Aksi konkret 1 bersumber dari tema Kemenag", "Aksi konkret 2"]`,
    `}`,
    ``,
    `Bahasa output: Indonesia.`,
  ].join("\n");
}

// ─── POST Handler ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surahName, surahNumber, verseNumber, verseText, translation } = body;

    console.log("[VerseTafsir] Menerima request:", {
      surahName, surahNumber, verseNumber,
      hasVerseText: !!verseText, hasTranslation: !!translation,
    });

    if (!verseText || !verseNumber) {
      return NextResponse.json({ error: "Data ayat tidak lengkap." }, { status: 400 });
    }

    const sNum = Number(surahNumber) || 0;
    const vNum = Number(verseNumber) || 0;

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (sbErr) {
      console.error("[VerseTafsir] Supabase client error:", sbErr);
      supabase = null;
    }

    // ─── Step 1: Check cache ─────────────────────────────────
    if (sNum > 0 && vNum > 0 && supabase) {
      const { data: cached, error: cacheError } = await supabase
        .from("tafsir_cache")
        .select("*")
        .eq("surah_number", sNum)
        .eq("verse_number", vNum)
        .maybeSingle();

      if (cacheError) {
        console.error("[VerseTafsir] SELECT ERROR:", JSON.stringify(cacheError));
      }

      if (cached) {
        console.log(`[VerseTafsir] ✅ Cache hit: Surah ${sNum}, Ayat ${vNum}`);
        let todoList = cached.todo_list;
        if (typeof todoList === "string") {
          try { todoList = JSON.parse(todoList); } catch { todoList = []; }
        }

        return NextResponse.json({
          tafsir_kemenag: cached.tafsir_kemenag || null,
          asbabun_nuzul: cached.asbabun_nuzul || null,
          perspektif_sains: cached.perspektif_sains || null,
          perspektif_psikologi: cached.perspektif_psikologi || null,
          perspektif_sosial: cached.perspektif_sosial || null,
          hadith: cached.hadith || null,
          todo_list: todoList || [],
        });
      }
    }

    // ─── Step 2: RAG — Fetch Kemenag Tafsir ──────────────────
    const kemenagTafsir = await fetchKemenagTafsir(sNum, vNum);

    // ─── Step 3: OpenAI (Grounded on Kemenag) ────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key tidak ditemukan di server." }, { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const systemPrompt = buildSystemPrompt(sNum, vNum, kemenagTafsir);

    const userPrompt = `Analisis ayat berikut dengan KETAT merujuk pada Tafsir Kemenag yang ada di system prompt:
- Surah: ${surahName || "Tidak diketahui"} (No. ${sNum})
- Ayat ke-${vNum}
- Teks Arab: ${verseText}
- Terjemahan: ${translation || "Tidak tersedia"}

INGAT: Ikuti 3 langkah wajib. Setiap perspektif HARUS inline dengan tema inti Kemenag. Kembalikan null jika tidak ada korelasi langsung.`;

    console.log(`[VerseTafsir] RAG → OpenAI: Surah ${sNum}, Ayat ${vNum}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(rawText);

    // ─── Step 4: Cache to Supabase ───────────────────────────
    if (sNum > 0 && vNum > 0 && supabase) {
      const insertPayload = {
        surah_number: sNum,
        verse_number: vNum,
        tafsir_kemenag: parsed.tafsir_kemenag || null,
        asbabun_nuzul: parsed.asbabun_nuzul || null,
        perspektif_sains: parsed.perspektif_sains || null,
        perspektif_psikologi: parsed.perspektif_psikologi || null,
        perspektif_sosial: parsed.perspektif_sosial || null,
        hadith: parsed.hadith || null,
        todo_list: JSON.stringify(parsed.todo_list || []),
      };

      const { error: insertError } = await supabase
        .from("tafsir_cache")
        .upsert(insertPayload, { onConflict: "surah_number,verse_number" });

      if (insertError) {
        console.error("[VerseTafsir] INSERT ERROR:", JSON.stringify(insertError));
      } else {
        console.log(`[VerseTafsir] ✅ Cached: Surah ${sNum}, Ayat ${vNum}`);
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("VERSE TAFSIR ERROR:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
