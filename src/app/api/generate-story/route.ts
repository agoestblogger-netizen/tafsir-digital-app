export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import OpenAI from "openai";

const SYSTEM_INSTRUCTION = [
  "Kamu adalah asisten Ensiklopedia Al-Qur'an dan edukator berwawasan luas.",
  "Tugasmu: Ubah teks mentah peninggalan ilmuwan ini menjadi format Markdown bertutur/storytelling modern yang mengalir.",
  "PISAHKAN secara mutlak antara bahasan sains/fakta sejarah (Refleksi) dan renungan spiritual transendental (Renungan).",
  "PENTING: Tanamkan hyperlink cerdas (Markdown Link) `[Istilah Asli](Wikipedia)` pada minimal 3 hingga 5 istilah akademis kunci, teori, atau lokasi sejarah (misal: '[Gravitasi](Wikipedia)') agar bisa dipanggil oleh kamus inline di aplikasi UI pengguna. Utamakan kata kunci sains.",
  "OUTPUT HARUS JSON STRICT dengan dua properti persis seperti format berikut:",
  "{",
  "  \"refleksi_md\": \"Bahas murni sains/sejarah/fenomena secara dinamis dan padat (WAJIB mengandung markdown smart link).\",",
  "  \"renungan_md\": \"Bahas murni hikmah/spiritual dalam format narasi merenung (WAJIB mengandung markdown smart link).\"",
  "}"
].join("\n");

export async function POST(request: NextRequest) {
  try {
    const { id, teks_refleksi_mentah, teks_renungan_mentah } = await request.json();

    if (!id || typeof teks_refleksi_mentah !== "string" || typeof teks_renungan_mentah !== "string") {
      return NextResponse.json(
        { error: "ID, teks_refleksi_mentah, dan teks_renungan_mentah tidak boleh kosong." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Storyteller AI] OPENAI_API_KEY tidak ditemukan di environment.");
      return NextResponse.json(
        { error: "API Key tidak ditemukan di server. Pastikan OPENAI_API_KEY sudah di-set di .env.local." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    console.log(`[Storyteller AI] Meracik kisah ganda untuk ID: ${id}...`);

    const userPromptText = `
Teks Sains (Refleksi):
${teks_refleksi_mentah.trim()}

Teks Hikmah (Renungan):
${teks_renungan_mentah.trim()}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        {
          role: "user",
          content: userPromptText,
        },
      ],
      temperature: 0.7,
    });

    const outputRaw = completion.choices[0].message.content || "";
    
    if (!outputRaw) {
       throw new Error("AI gagal mereturn teks respons.");
    }

    let parsedOutput = { refleksi_md: "", renungan_md: "" };
    try {
      parsedOutput = JSON.parse(outputRaw);
    } catch (parseError) {
      console.error("Gagal mem-parsing output JSON API:", outputRaw);
      throw new Error("Format JSON respons AI tidak valid.");
    }

    // Update to Supabase using Admin client to bypass RLs if necessary
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase
      .from('penemu_muslim')
      .update({ 
        refleksi_kosmetik: parsedOutput.refleksi_md || null,
        renungan_kosmetik: parsedOutput.renungan_md || null
      })
      .eq('id', id);

    if (dbError) {
      console.error("[Storyteller AI] Supabase Update Error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan hasil AI ke database." },
        { status: 500 }
      );
    }

    console.log(`[Storyteller AI] Split Caching berhasil untuk ID: ${id}`);

    // Return the generated markdown to the frontend for immediate use
    return NextResponse.json({ 
      refleksi_md: parsedOutput.refleksi_md,
      renungan_md: parsedOutput.renungan_md
    });

  } catch (error: unknown) {
    console.error("[Storyteller AI] API ERROR:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
