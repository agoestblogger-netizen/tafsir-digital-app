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
Jawab HANYA dengan angka (1-${TOPIK_UTAMA.length}).`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .eq('topik_nama', 'Shalat')
    .limit(100)

  const dist: Record<string, number> = {}
  let processed = 0

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
    dist[topikBaru] = (dist[topikBaru] || 0) + 1
    processed++
    if (processed % 10 === 0) process.stdout.write(`${processed} `)
  }

  console.log('\n\n=== DISTRIBUSI 100 HADITS BERLABEL "SHALAT" ===')
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  sorted.forEach(([k, v]) => {
    const bar = '█'.repeat(Math.round(v / 2))
    console.log(`${v.toString().padStart(4)}  ${k.padEnd(30)} ${bar}`)
  })
  console.log(`\nTetap "Shalat": ${dist['Shalat'] ?? 0}/100`)
  console.log(`Pindah topik lain: ${100 - (dist['Shalat'] ?? 0)}/100`)
}
main()
