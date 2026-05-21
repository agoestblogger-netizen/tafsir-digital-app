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

const BATCH_SIZE = 20
let totalUpdated = 0
let totalError = 0
let offset = 0

async function main() {
  const { count } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
  
  console.log(`🚀 Mulai re-label ${count} hadits...`)
  console.log(`📋 ${TOPIK_UTAMA.length} topik tersedia\n`)

  while (true) {
    const { data, error } = await sb
      .from('hadits_topik_index')
      .select('id, konteks_hadits')
      .range(offset, offset + BATCH_SIZE - 1)
    
    if (error || !data || data.length === 0) break

    const results = await Promise.all(data.map(async (h) => {
      try {
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
          await sb
            .from('hadits_topik_index')
            .update({ topik_nama: topik })
            .eq('id', h.id)
          return true
        } else {
          console.error(`  ⚠ Invalid: "${raw}" for hadits ${h.id}`)
          return false
        }
      } catch (e) {
        console.error(`  ❌ Error hadits ${h.id}:`, (e as Error).message)
        return false
      }
    }))

    const batchOk = results.filter(Boolean).length
    const batchErr = results.filter(r => !r).length
    totalUpdated += batchOk
    totalError += batchErr
    
    const batchNum = Math.floor(offset / BATCH_SIZE) + 1
    const totalBatch = Math.ceil(count! / BATCH_SIZE)
    console.log(`📦 Batch ${batchNum}/${totalBatch} — ✅ ${batchOk} | ❌ ${batchErr} | Total: ${totalUpdated}/${count}`)
    
    offset += BATCH_SIZE
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n🎉 Selesai!`)
  console.log(`✅ Updated: ${totalUpdated}`)
  console.log(`❌ Error: ${totalError}`)
}
main()
