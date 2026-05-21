import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as fs from 'fs'

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
Jawab HANYA dengan angka (1-${TOPIK_UTAMA.length}).`

async function main() {
  const topikLama = ['Shalat', 'Keluarga', 'Haji & Umrah', 'Iman & Akidah', 'Rezeki & Kerja']
  const results: any[] = []

  for (const topik of topikLama) {
    const { data } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, konteks_hadits, terjemah')
      .eq('topik_nama', topik)
      .limit(10)

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
      const num = parseInt(raw.replace(/[^0-9]/g, ''))
      const topikBaru = TOPIK_UTAMA[num - 1] ?? 'INVALID'
      const berubah = topikBaru !== h.topik_nama
      results.push({ topik_lama: h.topik_nama, topik_baru: topikBaru, berubah, ringkasan: ringkasan.slice(0, 120) })
      process.stdout.write(berubah ? 'X' : '.')
    }
  }

  console.log('\n\n=== HASIL EVALUASI 50 HADITS ===')
  const berubah = results.filter(r => r.berubah)
  console.log(`Tetap sama: ${results.length - berubah.length}`)
  console.log(`Berubah: ${berubah.length}`)
  console.log('\n--- YANG BERUBAH ---')
  berubah.forEach(r => {
    console.log(`  ${r.topik_lama} -> ${r.topik_baru}`)
    console.log(`  ${r.ringkasan}\n`)
  })
  fs.writeFileSync('eval-50-result.json', JSON.stringify(results, null, 2))
}
main()
