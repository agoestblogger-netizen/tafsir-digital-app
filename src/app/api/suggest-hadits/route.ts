import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { temaToTags } from "@/lib/tema-to-tags";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export async function POST(req: NextRequest) {
  try {
    const { ayat } = await req.json();

    if (!ayat) {
      return NextResponse.json({ error: "Missing ayat parameter" }, { status: 400 });
    }

    const { terjemah = "", konteks = "", topik_utama = "", surah_nama_latin = "", nomor_ayat = "", tags = [] } = ayat;

    // STEP 1: Dapatkan tags dari topik_utama dan tags bawaan ayat
    const tagsFromAyat = Array.isArray(tags) ? tags : [];
    const tagsFromTopik = temaToTags(topik_utama);
    const tagsFromTerjemah = temaToTags(terjemah);

    const combinedTags = Array.from(new Set([
      ...tagsFromAyat,
      ...tagsFromTopik,
      ...tagsFromTerjemah
    ])).filter((t: string) => typeof t === "string" && t.trim().length > 1);

    const topikToQuery = combinedTags.map((t: string) => toTitleCase(t));

    // STEP 2: Query hadits_topik_index dengan topik_nama IN (tags) — exact match dulu
    const supabase = getSupabaseAdmin();

    const { data: tier1Data, error: err1 } = await supabase
      .from("hadits_topik_index")
      .select("id, arab, matan, terjemah, perawi, nomor, topik_nama, tags, konteks_hadits")
      .in("topik_nama", topikToQuery)
      .limit(30);

    if (err1) {
      console.error("[suggest-hadits] Exact match query error:", err1.message);
    }

    // Fallback ilike jika hasil exact match kurang dari 5
    let tier2Data: any[] = [];
    if ((tier1Data?.length ?? 0) < 5) {
      const singleWords = topikToQuery
        .flatMap((t: string) => t.split(/[&\/,]/).map((p: string) => p.trim()))
        .filter((w: string) => w.length > 3)
        .slice(0, 5);

      if (singleWords.length > 0) {
        const ilikeCond = singleWords.map((w: string) => `topik_nama.ilike.%${w}%`).join(",");
        const { data: fallbackData, error: err2 } = await supabase
          .from("hadits_topik_index")
          .select("id, arab, matan, terjemah, perawi, nomor, topik_nama, tags, konteks_hadits")
          .or(ilikeCond)
          .limit(20);

        if (err2) {
          console.error("[suggest-hadits] Fallback query error:", err2.message);
        }

        if (fallbackData) {
          tier2Data = fallbackData.filter(
            (h: any) => !(tier1Data ?? []).some((t: any) => t.id === h.id)
          );
        }
      }
    }

    let candidates = [...(tier1Data ?? []), ...tier2Data];

    // Global fallback jika keduanya kosong sama sekali
    if (candidates.length === 0) {
      const { data: fallback } = await supabase
        .from("hadits_topik_index")
        .select("id, arab, matan, terjemah, perawi, nomor, topik_nama, tags, konteks_hadits")
        .eq("topik_nama", "Taqwa")
        .limit(10);
      candidates = fallback ?? [];
    }

    // Deduplicate candidates dan ambil max 20 kandidat
    const seen = new Set<string>();
    candidates = candidates.filter((h: any) => {
      const key = `${h.perawi}-${h.nomor}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);

    if (candidates.length === 0) {
      return NextResponse.json({ hadits: [] });
    }

    // STEP 3: Re-rank dengan GPT-4o-mini — pilih 3-5 yang paling selaras
    // Gunakan field matan (bukan terjemah) untuk representasi isi hadits
    const listStr = candidates
      .map((h: any, i: number) => `${i}. [HR. ${h.perawi} No. ${h.nomor}] ${h.topik_nama}: "${(h.matan ?? h.terjemah ?? "").slice(0, 200)}"`)
      .join("\n");

    let selectedIndices: number[] = [];
    try {
      const rerankResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 150,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `Kamu adalah asisten analis hadits. Tugasmu adalah memilih 3 sampai 5 hadits dari daftar kandidat di bawah yang paling relevan, memiliki keselarasan makna yang mendalam, dan mendukung isi dari Ayat Al-Qur'an berikut.
Ayat Terjemah: "${terjemah}"
Konteks Ayat: "${konteks}"

Pilih 3 sampai 5 hadits yang paling selaras. Jawab hanya dengan JSON format: {"selected_indices": [x, y, z]} dengan x, y, z adalah index 0-based dari hadits terpilih.`
          },
          {
            role: "user",
            content: `Daftar kandidat hadits:\n${listStr}`
          }
        ]
      });

      const parsed = JSON.parse(rerankResponse.choices[0]?.message?.content?.trim() ?? "{}");
      selectedIndices = parsed.selected_indices ?? [];
    } catch (e) {
      console.error("[suggest-hadits] Error re-ranking hadits:", e);
    }

    // Fallback jika re-ranker gagal
    if (selectedIndices.length === 0) {
      selectedIndices = Array.from({ length: Math.min(5, candidates.length) }, (_, i) => i);
    }

    // STEP 4: Return sebagai array KultumReferensi dengan type: 'hadits'
    const finalHadits = selectedIndices
      .map(idx => candidates[idx])
      .filter(Boolean)
      .map((h: any) => ({
        id: `hadits-${h.id ?? h.perawi + "-" + h.nomor}`,
        type: "hadits" as const,
        judul: `Hadits ${h.perawi ? `(${h.perawi})` : ""} — ${h.topik_nama || "Referensi"}`,
        deskripsi_singkat: h.konteks_hadits?.ringkasan ?? (h.terjemah ?? h.matan ?? "").slice(0, 120) + "...",
        relevansi_score: 90,
        data: {
          id: h.id,
          arab: h.arab,
          matan: h.matan,
          terjemah: h.terjemah,
          perawi: h.perawi,
          nomor: h.nomor,
          topik_nama: h.topik_nama,
          tags: h.tags,
          konteks_hadits: h.konteks_hadits
        }
      }));

    return NextResponse.json({ hadits: finalHadits });
  } catch (err) {
    console.error("[suggest-hadits] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
