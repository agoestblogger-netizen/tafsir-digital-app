import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TOPIK_UTAMA = [
  "Shalat", "Haji & Umrah", "Puasa & Ramadan", "Zakat & Sedekah",
  "Keluarga", "Pernikahan & Rumah Tangga", "Birrul Walidain", "Mendidik Anak",
  "Akhlak Mulia", "Kejujuran & Amanah", "Sabar & Syukur", "Taubat & Ampunan",
  "Ilmu & Pendidikan", "Rezeki & Kerja", "Akhirat & Kiamat", "Iman & Akidah",
  "Doa & Dzikir", "Ukhuwah & Persaudaraan", "Kepemimpinan & Keadilan",
  "Muamalah & Jual Beli", "Kesehatan & Thibbun Nabawi", "Kisah Para Nabi",
  "Ikhlas & Niat", "Tawakkal & Sabar"
]

const SISTEM = `Kamu adalah sistem klasifikasi hadits Islam.

ATURAN:
1. topik_nama: PILIH SATU dari daftar topik ini yang paling sesuai: ${TOPIK_UTAMA.join(', ')}
2. tags: 2-4 tag spesifik Title Case tentang isi hadits (boleh di luar daftar)
3. JANGAN gunakan "Hadits", "Rasulullah", "Islam" sebagai tag
4. Jawab HANYA JSON`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .limit(10)

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const pelajaran = h.konteks_hadits?.pelajaran ?? ''
    
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user', content: `Ringkasan: "${ringkasan}"\nPelajaran: "${pelajaran}"\n\nJSON:` }
      ],
      max_tokens: 80,
      temperature: 0.1,
    })
    
    const text = res.choices[0].message.content ?? '{}'
    try {
      const label = JSON.parse(text.replace(/```json|```/g, '').trim())
      console.log('LAMA:', h.topik_nama)
      console.log('BARU:', label.topik_nama, '|', label.tags)
      console.log('---')
    } catch {
      console.log('PARSE ERROR:', text)
    }
  }
}
main()
