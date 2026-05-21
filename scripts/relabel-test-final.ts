import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TOPIK_UTAMA = [
  "Shalat", "Haji & Umrah", "Puasa & Ramadan", "Zakat & Sedekah",
  "Pernikahan & Rumah Tangga", "Birrul Walidain", "Mendidik Anak",
  "Kejujuran & Amanah", "Sabar & Syukur", "Taubat & Ampunan",
  "Ilmu & Pendidikan", "Rezeki & Kerja", "Akhirat & Kiamat",
  "Iman & Akidah", "Doa & Dzikir", "Ukhuwah & Persaudaraan",
  "Kepemimpinan & Keadilan", "Muamalah & Jual Beli",
  "Kesehatan & Thibbun Nabawi", "Kisah Para Nabi",
  "Ikhlas & Niat", "Akhlak Mulia", "Adab & Sopan Santun",
  "Jihad & Dakwah", "Warisan & Wasiat", "Tazkiyatun Nafs",
  "Sirah Nabawiyah", "Larangan & Dosa Besar",
  "Makanan & Minuman Halal", "Fikih Wanita", "Tanda-tanda Kiamat",
  "Zuhud & Kesederhanaan", "Thaharah & Kebersihan"
]

const SISTEM = `Kamu adalah sistem klasifikasi hadits Islam.

DAFTAR TOPIK (33 pilihan):
${TOPIK_UTAMA.join(', ')}

ATURAN KETAT:
1. Pilih SATU topik dari daftar yang paling sesuai
2. Jika tidak ada yang cocok, buat topik baru SATU KATA atau format "X & Y" dengan X dan Y adalah NOUN bukan VERB
3. JANGAN gabungkan topik yang sudah ada di daftar (contoh SALAH: "Shalat & Mendidik Anak")
4. Jawab HANYA nama topik, tanpa penjelasan`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .limit(30)

  let valid = 0, baru = 0
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
    if (isExisting) valid++
    else { baru++; topikBaru.add(topik) }
    
    console.log(`LAMA: ${h.topik_nama} → BARU: ${topik} ${isExisting ? '✅' : '🆕'}`)
  }

  console.log(`\n✅ Valid: ${valid}/30 (${Math.round(valid/30*100)}%)`)
  console.log(`🆕 Topik baru: ${baru}`)
  if (topikBaru.size > 0) {
    console.log('\nTopik baru:')
    topikBaru.forEach(t => console.log(' -', t))
  }
}
main()
