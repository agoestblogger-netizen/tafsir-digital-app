import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { referensi_dipilih } = await req.json();

    if (!referensi_dipilih || referensi_dipilih.length < 2) {
      return NextResponse.json({ is_related: false, reason: "Kurang dari 2 referensi" });
    }

    // Ringkas referensi untuk prompt — hanya info yang relevan
    const ringkasan = referensi_dipilih.map((r: any, i: number) => {
      const d = r.data ?? r;
      const teks = d.terjemah ?? d.matan_indo ?? d.terjemah ?? "";
      const label = r.type === "ayat_quran_db" ? "Ayat" :
                    r.type === "hadits" ? "Hadits" :
                    r.type === "doa_quran" ? "Doa" : "Referensi";
      return `${i + 1}. [${label}] ${r.judul ?? ""}: "${teks.slice(0, 150)}"`;
    }).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Kamu adalah analis konten ceramah Islam. Tentukan apakah referensi-referensi berikut membahas SATU tema spesifik yang sama.

KRITERIA is_related TRUE:
- Semua referensi membahas tema spesifik yang sama (contoh: semua sabar, semua taubat, semua rezeki)
- ATAU tema adalah gabungan yang saling berkaitan erat (contoh: sabar & syukur, iman & taqwa, rezeki & sedekah) — dalam hal ini referensi boleh membahas salah satu atau keduanya
- Referensi bisa saling memperkuat dalam satu narasi

KRITERIA is_related FALSE:
- Referensi membahas tema yang TIDAK berkaitan sama sekali (contoh: sabar + pernikahan = tidak berkaitan)
- Berkaitan hanya secara sangat umum/longgar

Jawab HANYA dengan JSON valid, tanpa markdown:
{"is_related": true/false, "reason": "alasan singkat 1 kalimat"}`
        },
        {
          role: "user",
          content: `Referensi yang dipilih:\n${ringkasan}\n\nApakah referensi-referensi ini saling berkaitan secara tema?`
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({
        is_related: Boolean(parsed.is_related),
        reason: parsed.reason ?? ""
      });
    } catch {
      return NextResponse.json({ is_related: false, reason: "Gagal parse response AI" });
    }
  } catch (err) {
    console.error("[analisa-referensi] Error:", err);
    return NextResponse.json({ is_related: false, reason: "Error server" }, { status: 500 });
  }
}
