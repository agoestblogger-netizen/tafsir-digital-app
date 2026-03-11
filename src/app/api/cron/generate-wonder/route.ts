import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";

// ─── Category List ──────────────────────────────────────────────
const CATEGORIES = [
  "Astronomi & Kosmologi",
  "Biologi & Embriologi Manusia",
  "Geografi & Oseanografi",
  "Sejarah Kaum Lampau",
  "Psikologi Kognitif & Neurosains",
];

// ─── Helper: Build blacklist string ─────────────────────────────
function buildBlacklist(titles: string[]): string {
  if (titles.length === 0) return "Belum ada topik di database.";
  return titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
}

// ─── Helper: Check if title is a duplicate (fuzzy match) ────────
function isDuplicate(newTitle: string, existingTitles: string[]): boolean {
  const normalized = newTitle.toLowerCase().trim();
  return existingTitles.some((t) => {
    const existing = t.toLowerCase().trim();
    if (existing === normalized) return true;
    if (existing.includes(normalized) || normalized.includes(existing)) return true;
    return false;
  });
}

export async function GET(request: Request) {
  try {
    // ─── Auth Check ──────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid cron secret." },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY tidak ditemukan di server." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const supabase = getSupabaseAdmin();
    const results: Record<string, unknown> = {};

    // ═══════════════════════════════════════════════════════════
    // TUGAS 1: Generate 1 'Keajaiban Hari Ini' (with blacklist)
    // ═══════════════════════════════════════════════════════════
    console.log("[Cron] ── Tugas 1: Fetching existing hero titles...");

    const { data: existingHeroes } = await supabase
      .from("daily_wonders")
      .select("title");

    const existingHeroTitles = (existingHeroes || []).map((h) => h.title);
    const heroBlacklist = buildBlacklist(existingHeroTitles);

    console.log(`[Cron] Hero blacklist: ${existingHeroTitles.length} titles loaded.`);

    const wonderPrompt = `Kamu adalah Asisten Peneliti Jurnal Tafsir Ilmi (Scientific Exegesis).

TUGAS MUTLAK: Kamu TIDAK BOLEH mengarang korelasi sains dan ayat sendiri. Kamu WAJIB mengambil korelasi yang sudah tertulis secara nyata dalam buku/jurnal ilmuwan atau ulama ternama, seperti:
- Seri 'Tafsir Ilmi' terbitan Kemenag-LIPI Indonesia
- 'The Bible, The Qur'an and Science' karya Dr. Maurice Bucaille
- Jurnal dan karya Dr. Zaghloul El-Naggar (pakar geologi dan tafsir ilmi)
- 'Tafsir Al-Jawahir fi Tafsir Al-Qur'an al-Karim' karya Tantawi Jawhari
- Karya-karya Harun Yahya (Adnan Oktar) tentang mukjizat saintifik Al-Qur'an
- Karya Prof. Dr. Quraish Shihab dalam Tafsir Al-Misbah
- Atau tokoh Tafsir Ilmi Muslim tepercaya lainnya

Pilih satu korelasi ayat dan fakta sains yang spesifik dari literatur mereka. Bukan karangan sendiri.

PENTING — DAFTAR HITAM: Kamu TIDAK BOLEH membahas topik berikut karena sudah ada di database:
${heroBlacklist}

Cari Ayat Kauniyah yang BERBEDA dan telah DIBAHAS OLEH TOKOH DI ATAS.

Kembalikan respons dalam format JSON:
{
  "title": "Judul menarik maksimal 8 kata",
  "surah": "QS. Nama Surah: Nomor Ayat",
  "teaser": "Satu kalimat pemantik rasa penasaran (maksimal 25 kata)"
}

Pastikan JSON valid. Bahasa: Indonesia.`;

    const wonderCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.95,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: wonderPrompt },
        {
          role: "user",
          content: "Berikan 1 fakta sains/sejarah dari literatur Tafsir Ilmi yang sudah ada dan hubungkan dengan ayat Al-Qur'an. Pastikan BERBEDA dari daftar hitam.",
        },
      ],
    });

    const wonder = JSON.parse(wonderCompletion.choices[0].message.content || "{}");

    if (wonder.title && wonder.surah && wonder.teaser) {
      if (isDuplicate(wonder.title, existingHeroTitles)) {
        console.warn("[Cron] ⚠️ AI returned duplicate hero title:", wonder.title);
        results.wonder = { success: false, error: "Duplikat terdeteksi", title: wonder.title };
      } else {
        const { data, error } = await supabase
          .from("daily_wonders")
          .insert({ title: wonder.title, surah: wonder.surah, teaser: wonder.teaser })
          .select()
          .single();

        if (error) {
          console.error("[Cron] Wonder insert error:", error);
          results.wonder = { success: false, error: error.message };
        } else {
          console.log("[Cron] ✅ Wonder saved:", data.title);
          results.wonder = { success: true, title: data.title };
        }
      }
    } else {
      results.wonder = { success: false, error: "Format AI tidak valid", raw: wonder };
    }

    // ═══════════════════════════════════════════════════════════
    // TUGAS 2: Generate 1 topik baru per kategori (with blacklist)
    // ═══════════════════════════════════════════════════════════
    console.log("[Cron] ── Tugas 2: Generating topics for 5 categories...");

    const topicPromises = CATEGORIES.map(async (category) => {
      try {
        // Fetch existing titles for THIS category
        const { data: existingTopics } = await supabase
          .from("encyclopedia_articles")
          .select("title")
          .eq("category", category);

        const existingCategoryTitles = (existingTopics || []).map((t) => t.title);
        const categoryBlacklist = buildBlacklist(existingCategoryTitles);

        console.log(`[Cron] [${category}] Blacklist: ${existingCategoryTitles.length} titles`);

        const topicPrompt = `Kamu adalah Asisten Peneliti Jurnal Tafsir Ilmi (Scientific Exegesis).

TUGAS MUTLAK: Kamu TIDAK BOLEH mengarang korelasi sains dan ayat sendiri. Kamu WAJIB mengambil korelasi yang sudah tertulis secara nyata dalam buku/jurnal ilmuwan atau ulama ternama, seperti:
- Seri 'Tafsir Ilmi' terbitan Kemenag-LIPI Indonesia
- 'The Bible, The Qur'an and Science' karya Dr. Maurice Bucaille
- Jurnal dan karya Dr. Zaghloul El-Naggar
- 'Tafsir Al-Jawahir fi Tafsir Al-Qur'an al-Karim' karya Tantawi Jawhari
- Karya-karya Harun Yahya tentang mukjizat saintifik Al-Qur'an
- Karya Prof. Dr. Quraish Shihab dalam Tafsir Al-Misbah
- Atau tokoh Tafsir Ilmi Muslim tepercaya lainnya

Pilih satu korelasi ayat dan fakta sains yang SUDAH DIKAJI oleh tokoh tersebut, khusus untuk kategori ilmu: "${category}".

WAJIB — DAFTAR HITAM topik yang sudah ada:
${categoryBlacklist}

Kembalikan respons dalam format JSON:
{
  "title": "Judul topik yang menarik dan deskriptif (Bahasa Indonesia)",
  "teaser": "Satu kalimat pemantik rasa penasaran (maksimal 20 kata)",
  "surah_reference": "QS. Nama Surah: Nomor Ayat",
  "source_scholar": "Nama lengkap tokoh/ilmuwan yang membahas korelasi ini",
  "reference_book": "Judul buku/jurnal/karya tempat korelasi ini dibahas"
}

Pastikan JSON valid. Bahasa: Indonesia.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.95,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: topicPrompt },
            {
              role: "user",
              content: `Kategori: "${category}". Cari 1 topik dari literatur Tafsir Ilmi yang BERBEDA dari daftar hitam. Sertakan nama tokoh dan buku referensinya.`,
            },
          ],
        });

        const topic = JSON.parse(completion.choices[0].message.content || "{}");

        if (!topic.title) {
          return { category, success: false, error: "No title from AI" };
        }

        if (isDuplicate(topic.title, existingCategoryTitles)) {
          console.warn(`[Cron] ⚠️ Duplicate topic [${category}]:`, topic.title);
          return { category, success: false, error: "Duplikat terdeteksi", title: topic.title };
        }

        const { data, error } = await supabase
          .from("encyclopedia_articles")
          .insert({
            category,
            title: topic.title,
            teaser: topic.teaser || null,
            surah_reference: topic.surah_reference || null,
            source_scholar: topic.source_scholar || null,
            reference_book: topic.reference_book || null,
          })
          .select("id, title, source_scholar, reference_book")
          .single();

        if (error) {
          console.error(`[Cron] Topic insert error (${category}):`, error);
          return { category, success: false, error: error.message };
        }

        console.log(`[Cron] ✅ Topic saved [${category}]: ${data.title} — Sumber: ${data.source_scholar}`);
        return {
          category,
          success: true,
          title: data.title,
          id: data.id,
          source_scholar: data.source_scholar,
          reference_book: data.reference_book,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { category, success: false, error: msg };
      }
    });

    const topicResults = await Promise.all(topicPromises);
    results.topics = topicResults;

    // ─── Summary ─────────────────────────────────────────────
    const successCount = topicResults.filter((t) => t.success).length;
    const dupeCount = topicResults.filter((t) => !t.success && "title" in t).length;
    console.log(`[Cron] ── Selesai: Wonder=${results.wonder && (results.wonder as Record<string, unknown>).success ? "✅" : "❌"}, Topics=${successCount}/5 ✅, Dupes=${dupeCount}`);

    return NextResponse.json({
      success: true,
      message: `Cron selesai: ${successCount}/5 topics baru + ${dupeCount} duplikat terdeteksi.`,
      results,
    });
  } catch (error: unknown) {
    console.error("CRON ERROR:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
