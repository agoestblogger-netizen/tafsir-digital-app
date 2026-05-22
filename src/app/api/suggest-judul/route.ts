import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { topik, referensi } = await req.json()

  // Ekstrak konteks dari referensi terpilih
  const konteksReferensi = referensi
    .filter((r: any) => r.type !== 'doa')
    .map((r: any) => {
      const d = r.data ?? r
      if (r.type === 'ayat_quran_db') return `Ayat ${r.judul}: "${d.terjemah?.slice(0, 120)}"`
      if (r.type === 'hadits') return `Hadits (${d.perawi}): "${d.matan?.slice(0, 100)}"`
      if (r.type === 'ayat_sains') return `Sains: ${r.judul} - ${r.deskripsi_singkat}`
      if (r.type === 'tokoh_sains') return `Tokoh: ${r.judul}`
      return ''
    }).filter(Boolean).join('\n')

  const prompt = `
Kamu adalah asisten yang membantu menyusun judul kultum Islam.

Topik: ${topik}

Referensi yang dipilih:
${konteksReferensi}

Berdasarkan topik dan referensi di atas, buat 5 judul kultum yang:
- Menarik dan tidak klise
- Spesifik berdasarkan referensi yang dipilih
- Panjang 6-12 kata
- Bahasa Indonesia yang baik
- Setiap judul berbeda angle/sudut pandang

Output HANYA array JSON:
["judul 1", "judul 2", "judul 3", "judul 4", "judul 5"]
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 300,
  })

  const text = completion.choices[0].message.content ?? '[]'
  const clean = text.replace(/```json|```/g, '').trim()
  
  try {
    const judul = JSON.parse(clean)
    return NextResponse.json({ judul })
  } catch {
    return NextResponse.json({ judul: [] })
  }
}
