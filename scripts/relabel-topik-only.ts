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
  "Ikhlas & Niat", "Adab & Sopan Santun", "Larangan & Dosa Besar"
]

const SISTEM = `Kamu adalah sistem klasifikasi hadits. Pilih SATU topik yang paling sesuai dari daftar ini:
${TOPIK_UTAMA.join(', ')}

Jawab HANYA dengan nama topik persis dari daftar, tanpa penjelasan apapun.`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .limit(15)

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const pelajaran = h.konteks_hadits?.pelajaran ?? ''
    
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user', content: `Ringkasan: "${ringkasan}"\nPelajaran: "${pelajaran}"` }
      ],
      max_tokens: 20,
      temperature: 0,
    })
    
    const topik = res.choices[0].message.content?.trim() ?? ''
    const valid = TOPIK_UTAMA.includes(topik)
    console.log(`LAMA: ${h.topik_nama}`)
    console.log(`BARU: ${topik} ${valid ? '✅' : '❌ TIDAK VALID'}`)
    console.log('---')
  }
}
main()
