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

Jawab HANYA dengan angka (1-${TOPIK_UTAMA.length}). Tidak ada kata lain.`

const MODE = process.argv[2] ?? 'test' // 'test' = 100 hadits dry-run, 'gass' = full update
const BATCH_SIZE = 10
const JEDA_MS = 1000

function parseTopik(raw: string): string | null {
  const cleaned = raw.replace(/[^0-9]/g, '')
  const num = parseInt(cleaned)
  if (isNaN(num) || num < 1 || num > TOPIK_UTAMA.length) return null
  return TOPIK_UTAMA[num - 1]
}

async function labelWithRetry(ringkasan: string, pelajaran: string, retries = 2): Promise<string | null> {
  for (let i = 0; i <= retries; i++) {
    try {
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
      const topik = parseTopik(raw)
      if (topik) return topik
      if (i < retries) await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      if (i < retries) await new Promise(r => setTimeout(r, 2000))
    }
  }
  return null
}

async function main() {
  // STEP 1: Backup data lama
  console.log('💾 Step 1: Backup topik_nama lama...')
  const allPages: any[] = []
  let bOffset = 0
  while (true) {
    const { data } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, tags')
      .range(bOffset, bOffset + 999)
    if (!data || data.length === 0) break
    allPages.push(...data)
    bOffset += 1000
  }
  const backupFile = `backup-topik-${new Date().toISOString().slice(0,10)}.json`
  fs.writeFileSync(backupFile, JSON.stringify(allPages, null, 2))
  console.log(`✅ Backup ${allPages.length} hadits → ${backupFile}\n`)

  // STEP 2: Fetch hadits
  const limit = MODE === 'test' ? 100 : 99999
  const { count } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
  const total = Math.min(count!, limit)
  const totalBatch = Math.ceil(total / BATCH_SIZE)
  
  console.log(`🚀 Mode: ${MODE === 'test' ? 'TEST (100 hadits, dry-run)' : 'GASS (full update)'}`)
  console.log(`📋 ${TOPIK_UTAMA.length} topik | ${total} hadits | ${totalBatch} batches\n`)

  let offset = 0
  let updated = 0, skipped = 0, unchanged = 0
  const changes: Array<{id: string, lama: string, baru: string}> = []
  const skippedIds: string[] = []

  while (offset < total) {
    const { data } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, konteks_hadits')
      .range(offset, offset + BATCH_SIZE - 1)
    
    if (!data || data.length === 0) break

    for (const h of data) {
      const ringkasan = h.konteks_hadits?.ringkasan ?? ''
      const pelajaran = h.konteks_hadits?.pelajaran ?? ''
      const topikBaru = await labelWithRetry(ringkasan, pelajaran)
      
      if (!topikBaru) {
        skipped++
        skippedIds.push(h.id)
        continue
      }

      if (topikBaru === h.topik_nama) {
        unchanged++
        continue
      }

      changes.push({ id: h.id, lama: h.topik_nama, baru: topikBaru })

      if (MODE === 'gass') {
        await sb
          .from('hadits_topik_index')
          .update({ topik_nama: topikBaru })
          .eq('id', h.id)
      }
      updated++
    }
    
    const batchNum = Math.floor(offset / BATCH_SIZE) + 1
    console.log(`📦 ${batchNum}/${totalBatch} | ✏️ ${updated} changed | ✅ ${unchanged} same | ⏭ ${skipped} skip`)
    
    offset += BATCH_SIZE
    await new Promise(r => setTimeout(r, JEDA_MS))
  }

  // STEP 3: Report
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📊 HASIL ${MODE.toUpperCase()}:`)
  console.log(`  ✏️  Berubah: ${updated}`)
  console.log(`  ✅ Tetap sama: ${unchanged}`)
  console.log(`  ⏭  Skipped: ${skipped}`)
  console.log(`  📝 Total: ${updated + unchanged + skipped}`)

  if (skippedIds.length > 0) {
    console.log(`\n⏭ Skipped IDs:`)
    skippedIds.forEach(id => console.log(` - ${id}`))
  }

  // Distribusi topik baru
  const dist: Record<string, number> = {}
  changes.forEach(c => { dist[c.baru] = (dist[c.baru] || 0) + 1 })
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1])
  
  if (sorted.length > 0) {
    console.log(`\n📊 Distribusi perubahan (top 15):`)
    sorted.slice(0, 15).forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)} ${k}`))
  }

  // Simpan changelog
  const logFile = `relabel-${MODE}-${new Date().toISOString().slice(0,10)}.json`
  fs.writeFileSync(logFile, JSON.stringify({ changes, skippedIds, distribusi: dist }, null, 2))
  console.log(`\n📝 Detail log: ${logFile}`)
  
  if (MODE === 'test') {
    console.log(`\n👆 Ini DRY-RUN, belum ada data yang diubah.`)
    console.log(`   Kalau sudah yakin, jalankan: npx tsx -r dotenv/config scripts/relabel-safe.ts dotenv_config_path=.env.local gass`)
  }
}
main()
