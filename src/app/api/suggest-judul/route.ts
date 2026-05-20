import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { topik, referensi } = await req.json()

  // Ekstrak konteks dari referensi terpilih
  const konteksReferensi = referensi.map((r: any) => {
    if (r.terjemah) return `Ayat: "${r.terjemah}" (${r.surah_nama}: ${r.ayat_ke})`
    if (r.matan) return `Hadits: "${r.matan?.slice(0, 100)}..."`
    if (r.nama_doa) return `Doa: ${r.nama_doa}`
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
