// scripts/seed-hadits-topik.js
// Jalankan: node scripts/seed-hadits-topik.js
//
// Script ini fetch hadits dari API myquran.com berdasarkan range per topik,
// filter by keyword, lalu simpan ke Supabase tabel hadits_topik_index

const { createClient } = require('@supabase/supabase-js')

// ── Supabase config ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://crrcijfzujegmeuaffvl.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── API config ───────────────────────────────────────────────────────────────
const API_BASE = 'https://api.myquran.com/v2/hadits'
const DELAY_MS = 150 // delay antar request agar tidak overload API

// ── Range per topik per perawi ───────────────────────────────────────────────
// Berdasarkan urutan bab kitab hadits yang sudah diketahui
const { TOPIK_RANGES } = require('../src/lib/hadits-topik-ranges')

// ── Helper functions ─────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function matchKeywords(terjemah, keywords) {
  const lower = terjemah.toLowerCase()
  return keywords.some(kw => lower.includes(kw.toLowerCase()))
}

async function fetchHadits(perawi, nomor) {
  try {
    const res = await fetch(`${API_BASE}/${perawi}/${nomor}`)
    if (!res.ok) return null
    const json = await res.json()
    if (!json.status || !json.data) return null
    return json.data
  } catch {
    return null
  }
}

async function saveToSupabase(records) {
  if (records.length === 0) return
  const { error } = await supabase
    .from('hadits_topik_index')
    .upsert(records, { onConflict: 'perawi,nomor,topik_id' })
  if (error) console.error('Supabase error:', error.message)
}

// ── Main seeding function ────────────────────────────────────────────────────

async function seedTopik(topikId, topikConfig) {
  console.log(`\n📚 Seeding topik: ${topikConfig.topik_id}`)
  let totalFound = 0
  let batch = []

  for (const [perawi, ranges] of Object.entries(topikConfig.ranges)) {
    for (const [start, end] of ranges) {
      console.log(`  → ${perawi} No. ${start}-${end}`)
      for (let nomor = start; nomor <= end; nomor++) {
        const data = await fetchHadits(perawi, nomor)
        await sleep(DELAY_MS)

        if (!data) continue
        if (!matchKeywords(data.id || '', topikConfig.keywords)) continue

        batch.push({
          perawi,
          nomor,
          topik_id: topikId,
          topik_nama: topikConfig.topik_id,
          arab: data.arab,
          terjemah: data.id,
          created_at: new Date().toISOString(),
        })

        totalFound++
        process.stdout.write(`\r    ✓ Ditemukan: ${totalFound} hadits`)

        // Simpan per 20 records
        if (batch.length >= 20) {
          await saveToSupabase(batch)
          batch = []
        }
      }
    }
  }

  // Simpan sisa batch
  if (batch.length > 0) await saveToSupabase(batch)
  console.log(`\n  ✅ Total: ${totalFound} hadits untuk topik ${topikConfig.topik_id}`)
  return totalFound
}

async function main() {
  console.log('🚀 Mulai seeding hadits topik ke Supabase...')
  console.log('⚠️  Estimasi waktu: 30-60 menit tergantung koneksi\n')

  // Buat tabel jika belum ada
  console.log('📋 Pastikan tabel hadits_topik_index sudah dibuat di Supabase!')
  console.log('   SQL: lihat di bawah script ini\n')

  // Pilih topik yang mau di-seed (comment yang tidak perlu)
  const TOPIK_TO_SEED = Object.keys(TOPIK_RANGES)
  // Atau seed satu topik dulu untuk test:
  // const TOPIK_TO_SEED = ['shalat']

  let grandTotal = 0
  for (const topikId of TOPIK_TO_SEED) {
    const count = await seedTopik(topikId, TOPIK_RANGES[topikId])
    grandTotal += count
  }

  console.log(`\n🎉 Seeding selesai! Total: ${grandTotal} hadits tersimpan di Supabase`)
}

main().catch(console.error)

/*
── SQL untuk buat tabel di Supabase ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hadits_topik_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perawi TEXT NOT NULL,
  nomor INTEGER NOT NULL,
  topik_id TEXT NOT NULL,
  topik_nama TEXT NOT NULL,
  arab TEXT,
  terjemah TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(perawi, nomor, topik_id)
);

ALTER TABLE hadits_topik_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua bisa baca" ON hadits_topik_index FOR SELECT USING (true);
CREATE POLICY "Service role insert" ON hadits_topik_index FOR INSERT WITH CHECK (true);

CREATE INDEX idx_hadits_topik_id ON hadits_topik_index(topik_id);
CREATE INDEX idx_hadits_perawi_nomor ON hadits_topik_index(perawi, nomor);

────────────────────────────────────────────────────────────────────────────────
*/
