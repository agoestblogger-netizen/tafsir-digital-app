import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── Konstanta ────────────────────────────────────────────────────────────────
const TOPIK_UTAMA = [
  'Shalat', 'Haji & Umrah', 'Puasa & Ramadan', 'Zakat & Sedekah',
  'Pernikahan & Rumah Tangga', 'Birrul Walidain', 'Mendidik Anak',
  'Kejujuran & Amanah', 'Sabar & Syukur', 'Taubat & Ampunan',
  'Ilmu & Pendidikan', 'Rezeki & Kerja', 'Akhirat & Kiamat',
  'Iman & Akidah', 'Doa & Dzikir', 'Ukhuwah & Persaudaraan',
  'Kepemimpinan & Keadilan', 'Muamalah & Jual Beli',
  'Kesehatan & Thibbun Nabawi', 'Kisah Para Nabi',
  'Ikhlas & Niat', 'Akhlak Mulia', 'Adab & Sopan Santun',
  'Jihad & Dakwah', 'Warisan & Wasiat', 'Tazkiyatun Nafs',
  'Sirah Nabawiyah', 'Larangan & Dosa Besar',
  'Makanan & Minuman Halal', 'Fikih Wanita', 'Tanda-tanda Kiamat',
  'Zuhud & Kesederhanaan', 'Thaharah & Kebersihan',
]

const SISTEM = `Klasifikasi hadits Islam. Pilih nomor topik yang paling sesuai:
${TOPIK_UTAMA.map((t, i) => `${i + 1}. ${t}`).join('\n')}
Jawab HANYA dengan angka (1-${TOPIK_UTAMA.length}).`

const BATCH_SIZE  = 50
const CONCURRENCY = 10
const DELAY_MS    = 200
const MAX_RETRY   = 2

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function classifyHadits(
  id: string,
  ringkasan: string,
  pelajaran: string,
  retryLeft = MAX_RETRY
): Promise<string | null> {
  const userContent = `"${ringkasan}. ${pelajaran}"`.slice(0, 800)
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user',   content: userContent },
      ],
      max_tokens: 5,
      temperature: 0,
    })
    const raw = res.choices[0].message.content?.trim() ?? ''
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    if (!num || num < 1 || num > TOPIK_UTAMA.length) {
      if (retryLeft > 0) return classifyHadits(id, ringkasan, pelajaran, retryLeft - 1)
      console.warn(`  ⚠️  Invalid response for ${id}: "${raw}"`)
      return null
    }
    return TOPIK_UTAMA[num - 1]
  } catch (err) {
    if (retryLeft > 0) {
      await sleep(500)
      return classifyHadits(id, ringkasan, pelajaran, retryLeft - 1)
    }
    console.error(`  ❌ OpenAI error for ${id}:`, (err as Error).message)
    return null
  }
}

// ── Fetch semua hadits (paginate 1000/hal) ────────────────────────────────────
async function fetchAllHadits() {
  const all: Array<{ id: string; topik_nama: string; konteks_hadits: any }> = []
  let from = 0
  const PAGE = 1000

  while (true) {
    const { data, error } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, konteks_hadits')
      .range(from, from + PAGE - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return all
}

// ── Proses satu batch dengan concurrency ─────────────────────────────────────
async function processBatch(
  rows: Array<{ id: string; topik_nama: string; konteks_hadits: any }>,
  stats: { changed: number; same: number; skip: number }
) {
  // Slice rows menjadi chunk CONCURRENCY, proses parallel per chunk
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY)
    await Promise.all(chunk.map(async (h) => {
      const ringkasan = h.konteks_hadits?.ringkasan ?? ''
      const pelajaran = h.konteks_hadits?.pelajaran  ?? ''

      if (!ringkasan && !pelajaran) {
        stats.skip++
        return
      }

      const topikBaru = await classifyHadits(h.id, ringkasan, pelajaran)
      if (!topikBaru) { stats.skip++; return }

      if (topikBaru === h.topik_nama) {
        stats.same++
        return
      }

      const { error } = await sb
        .from('hadits_topik_index')
        .update({ topik_nama: topikBaru })
        .eq('id', h.id)

      if (error) {
        console.error(`  ❌ Update error for ${h.id}:`, error.message)
        stats.skip++
      } else {
        stats.changed++
      }
    }))
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Fetching all hadits...')
  const all = await fetchAllHadits()
  console.log(`✅ Total hadits: ${all.length}`)

  const totalBatches = Math.ceil(all.length / BATCH_SIZE)
  const stats = { changed: 0, same: 0, skip: 0 }
  const startAll = Date.now()

  for (let b = 0; b < totalBatches; b++) {
    const batchStart = Date.now()
    const rows = all.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE)
    const batchStats = { changed: 0, same: 0, skip: 0 }

    await processBatch(rows, batchStats)

    stats.changed += batchStats.changed
    stats.same    += batchStats.same
    stats.skip    += batchStats.skip

    const elapsed = ((Date.now() - batchStart) / 1000).toFixed(1)
    console.log(
      `Batch ${b + 1}/${totalBatches} | ` +
      `changed: ${batchStats.changed} | same: ${batchStats.same} | skip: ${batchStats.skip} | ` +
      `elapsed: ${elapsed}s`
    )

    if (b < totalBatches - 1) await sleep(DELAY_MS)
  }

  // ── Distribusi topik baru ──────────────────────────────────────────────────
  console.log('\n📊 Menghitung distribusi topik final...')
  const { data: dist } = await sb
    .from('hadits_topik_index')
    .select('topik_nama')

  const counts: Record<string, number> = {}
  for (const row of dist ?? []) {
    counts[row.topik_nama] = (counts[row.topik_nama] ?? 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

  console.log('\n=== DISTRIBUSI TOPIK BARU ===')
  sorted.forEach(([topik, n]) => {
    const bar = '█'.repeat(Math.round(n / 3))
    console.log(`  ${String(n).padStart(4)} ${bar}  ${topik}`)
  })

  const totalElapsed = ((Date.now() - startAll) / 1000).toFixed(0)
  console.log('\n=== SELESAI ===')
  console.log(`Total berubah : ${stats.changed}`)
  console.log(`Total sama    : ${stats.same}`)
  console.log(`Total skip    : ${stats.skip}`)
  console.log(`Total waktu   : ${totalElapsed}s`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
