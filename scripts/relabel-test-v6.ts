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

const SISTEM = `Klasifikasi hadits Islam. Pilih nomor topik yang paling sesuai:

${TOPIK_UTAMA.map((t, i) => `${i+1}. ${t}`).join('\n')}

Jawab HANYA dengan angka (1-${TOPIK_UTAMA.length}). Tidak ada kata lain.`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .limit(30)

  let valid = 0, invalid = 0

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const pelajaran = h.konteks_hadits?.pelajaran ?? ''
    
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user', content: `"${ringkasan}. ${pelajaran}"` }
      ],
      max_tokens: 5,
      temperature: 0,
    })
    
    const raw = res.choices[0].message.content?.trim() ?? ''
    const num = parseInt(raw)
    const topik = TOPIK_UTAMA[num - 1]
    
    if (topik) {
      valid++
      console.log(`LAMA: ${h.topik_nama} → BARU: ${topik} ✅`)
    } else {
      invalid++
      console.log(`LAMA: ${h.topik_nama} → RAW: "${raw}" ❌`)
    }
  }

  console.log(`\n✅ Valid: ${valid}/30 (${Math.round(valid/30*100)}%)`)
  console.log(`❌ Invalid: ${invalid}`)
}
main()
