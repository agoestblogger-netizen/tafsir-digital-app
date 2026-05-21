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
  "Ikhlas & Niat", "Adab & Sopan Santun", "Larangan & Dosa Besar",
  "Jihad & Dakwah"
]

const SISTEM = `Kamu adalah sistem klasifikasi hadits Islam.

DAFTAR TOPIK YANG ADA:
${TOPIK_UTAMA.join(', ')}

ATURAN:
1. Pilih SATU topik dari daftar yang paling sesuai
2. Jika TIDAK ADA yang cocok, buat topik baru: 2-3 kata, Title Case, format "X & Y" atau "Kata Benda"
3. Jawab HANYA satu nama topik, tanpa penjelasan
4. JANGAN jawab lebih dari satu topik`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .limit(20)

  const topikBaru = new Set<string>()

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const pelajaran = h.konteks_hadits?.pelajaran ?? ''
    
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user', content: `Ringkasan: "${ringkasan}"\nPelajaran: "${pelajaran}"` }
      ],
      max_tokens: 15,
      temperature: 0,
    })
    
    const topik = res.choices[0].message.content?.trim() ?? ''
    const isExisting = TOPIK_UTAMA.includes(topik)
    if (!isExisting) topikBaru.add(topik)
    
    console.log(`LAMA: ${h.topik_nama}`)
    console.log(`BARU: ${topik} ${isExisting ? '✅' : '🆕 BARU'}`)
    console.log('---')
  }

  if (topikBaru.size > 0) {
    console.log('\n=== TOPIK BARU YANG MUNCUL ===')
    topikBaru.forEach(t => console.log('-', t))
  }
}
main()
