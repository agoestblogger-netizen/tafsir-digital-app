import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { DOA_QURANI } from "@/data/doa_qurani";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { ayat, hadits, topik = "" } = await req.json();

    if (!ayat) {
      return NextResponse.json({ error: "Missing ayat parameter" }, { status: 400 });
    }

    // STEP 1: Kumpulkan kandidat doa
    const candidates: any[] = [];
    const seen = new Set<string>();

    // 1a. Cari di database Supabase menggunakan semantic search jika ada pgvector match_doa
    try {
      const queryText = `${topik} ${ayat.terjemah ?? ""} ${hadits?.terjemah ?? ""}`.trim();
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: queryText,
      });
      const embedding = embeddingRes.data[0].embedding;

      const supabase = getSupabaseAdmin();
      const { data: dbDoa, error: dbError } = await supabase.rpc("match_doa", {
        query_embedding: embedding,
        match_threshold: 0.30,
        match_count: 15
      });

      if (!dbError && dbDoa) {
        for (const d of dbDoa) {
          const key = (d.judul ?? "").toLowerCase().trim();
          if (key && !seen.has(key)) {
            seen.add(key);
            candidates.push({
              id: d.id ?? `doa-${d.judul}`,
              type: "doa_quran" as const,
              judul: d.judul,
              deskripsi_singkat: d.keutamaan 
                ? d.keutamaan.slice(0, 120) + "..."
                : (d.terjemah ?? "").slice(0, 120) + "...",
              data: d
            });
          }
        }
      }
    } catch (e) {
      console.error("[suggest-doa] Semantic search failed, falling back to local search:", e);
    }

    // 1b. Gabungkan dengan data local DOA_QURANI berdasarkan pencocokan kata kunci topik
    const keywords = topik.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const matchedLocalDoa = DOA_QURANI.filter(d => {
      const haystack = [
        d.judul,
        d.konteks,
        d.keutamaan,
        ...(d.tags ?? []),
        ...(d.tema_hajat ?? [])
      ].filter(Boolean).join(" ").toLowerCase();
      
      return keywords.some((kw: string) => haystack.includes(kw));
    });

    for (const d of matchedLocalDoa) {
      const key = (d.judul ?? "").toLowerCase().trim();
      if (key && !seen.has(key) && candidates.length < 25) {
        seen.add(key);
        candidates.push({
          id: d.id ?? `doa-${d.judul}`,
          type: "doa_quran" as const,
          judul: d.judul,
          deskripsi_singkat: d.keutamaan 
            ? d.keutamaan.slice(0, 120) + "..."
            : (d.terjemah ?? "").slice(0, 120) + "...",
          data: d
        });
      }
    }

    // Fallback jika candidates masih kosong
    if (candidates.length === 0) {
      // Ambil 10 doa pertama sebagai fallback
      for (const d of DOA_QURANI.slice(0, 10)) {
        candidates.push({
          id: d.id ?? `doa-${d.judul}`,
          type: "doa_quran" as const,
          judul: d.judul,
          deskripsi_singkat: d.keutamaan 
            ? d.keutamaan.slice(0, 120) + "..."
            : (d.terjemah ?? "").slice(0, 120) + "...",
          data: d
        });
      }
    }

    // STEP 2: Re-rank dengan GPT-4o-mini berdasarkan kombinasi ayat + hadits yang dipilih
    const listStr = candidates
      .map((d, i) => `${i}. Doa "${d.judul}": "${(d.data?.terjemah ?? d.data?.terjemahan ?? d.data?.matan ?? "").slice(0, 150)}"`)
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
            content: `Kamu adalah asisten analis doa Islami. Tugasmu adalah memilih 3 sampai 5 doa dari daftar kandidat di bawah yang paling relevan untuk dibaca di akhir ceramah/kultum bertema "${topik}". Doa-doa ini harus melengkapi makna dari Ayat dan Hadits berikut.
Ayat: "${ayat.terjemah ?? ""}"
Hadits: "${hadits?.terjemah ?? "Tidak ada hadits khusus terpilih"}"

Jawab hanya dengan JSON format: {"selected_indices": [x, y, z]} dengan x, y, z adalah index 0-based dari doa terpilih.`
          },
          {
            role: "user",
            content: `Daftar kandidat doa:\n${listStr}`
          }
        ]
      });

      const parsed = JSON.parse(rerankResponse.choices[0]?.message?.content?.trim() ?? "{}");
      selectedIndices = parsed.selected_indices ?? [];
    } catch (e) {
      console.error("[suggest-doa] Error re-ranking doa:", e);
    }

    // Fallback jika re-ranker gagal
    if (selectedIndices.length === 0) {
      selectedIndices = Array.from({ length: Math.min(5, candidates.length) }, (_, i) => i);
    }

    // STEP 3: Return 3-5 doa paling relevan sebagai array KultumReferensi dengan type: 'doa_quran'
    const finalDoa = selectedIndices
      .map(idx => candidates[idx])
      .filter(Boolean)
      .map(d => ({
        id: d.id,
        type: "doa_quran" as const,
        judul: d.judul,
        deskripsi_singkat: d.deskripsi_singkat,
        relevansi_score: 95,
        data: {
          ...d.data,
          arab: d.data.arab,
          latin: d.data.latin,
          terjemah: d.data.terjemah || d.data.terjemahan,
          referensi: d.data.referensi,
          keutamaan: d.data.keutamaan,
          konteks: d.data.konteks
        }
      }));

    return NextResponse.json({ doa: finalDoa });
  } catch (err) {
    console.error("[suggest-doa] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
