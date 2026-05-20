// scripts/seed-hadits-fix.js
// Jalankan: node scripts/seed-hadits-fix.js
// Fix seeding untuk topik yang hasilnya 0 atau sedikit

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://crrcijfzujegmeuaffvl.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const API_BASE = 'https://api.myquran.com/v2/hadits'
const DELAY_MS = 150

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

// ── TOPIK YANG DIFIX ────────────────────────────────────────────────────────

const TOPIK_FIX = {

  tawadhu: {
    nama: 'Tawadhu & Rendah Hati',
    // Perluas keyword — pakai kata yang lebih umum muncul di terjemahan
    keywords: [
      'sombong', 'angkuh', 'takabur', 'membanggakan',
      'merendah', 'rendah hati', 'tidak sombong',
      'kibr', 'ujub', 'memuliakan', 'merendahkan diri',
      'tawadhu', 'sederhana', 'tidak merasa lebih',
      'meninggikan', 'membesarkan diri', 'besar kepala',
    ],
    // Perluas range ke seluruh bab akhlak
    ranges: {
      bukhari: [[5900, 6200]],
      muslim: [[2560, 2650]],
      tirmidzi: [[1990, 2080]],
      'abu-dawud': [[4750, 4900]],
      'ibnu-majah': [[4100, 4210]],
      ahmad: [[1, 100]],
    }
  },

  pemaaf: {
    nama: 'Memaafkan & Menahan Marah',
    keywords: [
      'marah', 'amarah', 'menahan marah', 'jangan marah',
      'maaf', 'memaafkan', 'dendam', 'pemaaf',
      'lapang dada', 'sabar marah', 'emosi',
      'murka', 'ghadab', 'hilm', 'lembut',
      'tidak marah', 'janganlah marah',
    ],
    ranges: {
      bukhari: [[5765, 5820], [6114, 6140]],
      muslim: [[2607, 2620]],
      tirmidzi: [[2020, 2050]],
      'abu-dawud': [[4770, 4810]],
      ahmad: [[200, 280]],
      malik: [[1560, 1587]],
    }
  },

  istiqomah: {
    nama: 'Istiqomah & Konsisten',
    keywords: [
      'istiqomah', 'istiqamah', 'konsisten', 'terus menerus',
      'amal yang paling dicintai', 'amal rutin', 'berkelanjutan',
      'tidak terputus', 'sedikit tapi', 'rutin',
      'teguh', 'lurus', 'jalan yang lurus',
      'berkesinambungan', 'dawam', 'terus',
    ],
    ranges: {
      bukhari: [[43, 80], [6462, 6490]],
      muslim: [[782, 820], [2818, 2840]],
      tirmidzi: [[2680, 2720]],
      'abu-dawud': [[1368, 1400]],
      'ibnu-majah': [[4238, 4270]],
      nasai: [[760, 800]],
    }
  },

  optimisme: {
    nama: 'Optimisme & Harapan',
    keywords: [
      'jangan berputus asa', 'tidak berputus asa', 'harapan',
      'rahmat Allah', 'ampunan Allah', 'pintu taubat',
      'kemudahan', 'jalan keluar', 'pertolongan Allah',
      'yakin', 'husnudzan', 'prasangka baik',
      'kabar gembira', 'surga', 'pahala besar',
      'tidak putus', 'masih ada waktu',
    ],
    ranges: {
      bukhari: [[6306, 6340], [5673, 5690]],
      muslim: [[2751, 2780], [2999, 3020]],
      tirmidzi: [[3496, 3560]],
      'ibnu-majah': [[4166, 4240]],
      'abu-dawud': [[1474, 1510]],
      ahmad: [[300, 380]],
    }
  },

  isra_miraj: {
    nama: "Isra' Mi'raj",
    keywords: [
      'isra', 'miraj', "mi'raj", 'masjidil aqsa',
      'buraq', 'sidratul muntaha', 'shalat lima waktu',
      'lima waktu', 'perjalanan malam', 'langit ketujuh',
      'bertemu nabi', 'malaikat jibril', 'baitulmaqdis',
      'malam itu', 'dibawa', 'naik ke langit',
    ],
    ranges: {
      bukhari: [[342, 365], [3886, 3910], [7515, 7530]],
      muslim: [[163, 185]],
      tirmidzi: [[3340, 3380]],
      'abu-dawud': [[1215, 1230]],
      nasai: [[447, 462]],
    }
  },

  muhasabah: {
    nama: 'Muhasabah & Introspeksi',
    keywords: [
      'muhasabah', 'hisab diri', 'introspeksi', 'koreksi diri',
      'evaluasi', 'sebelum dihisab', 'amal baik dan buruk',
      'timbang amal', 'persiapkan', 'bekal',
      'waktu luang', 'sehat', 'sebelum mati',
      'jangan menunda', 'kesempatan', 'lima perkara',
    ],
    ranges: {
      bukhari: [[6049, 6080], [6491, 6520]],
      muslim: [[2740, 2770]],
      tirmidzi: [[2457, 2510]],
      'ibnu-majah': [[4240, 4280]],
      ahmad: [[400, 450]],
    }
  },

  birrul_walidain: {
    nama: 'Birrul Walidain',
    keywords: [
      'orang tua', 'ibu', 'bapak', 'ayah',
      'birrul walidain', 'berbakti', 'durhaka',
      'ridha orang tua', 'ibumu', 'bapakmu',
      'memuliakan', 'berbuat baik kepada',
      'doa untuk orang tua', 'hak orang tua',
      'surga di bawah kaki ibu', 'jangan membentak',
    ],
    ranges: {
      bukhari: [[5626, 5660], [2227, 2250], [5971, 5990]],
      muslim: [[2548, 2575]],
      'abu-dawud': [[5120, 5160]],
      tirmidzi: [[1895, 1930]],
      'ibnu-majah': [[3657, 3690]],
      nasai: [[3103, 3130]],
    }
  },

  tarbiyah: {
    nama: 'Mendidik Anak',
    keywords: [
      'mendidik', 'tarbiyah', 'adab anak', 'hak anak',
      'didik', 'ajarkan', 'anak-anakmu', 'anaknya',
      'mengajari', 'nafkah anak', 'anak yatim',
      'membesarkan', 'tanggung jawab anak',
      'nama yang baik', 'aqiqah', 'sunatan',
      'anak lahir', 'mendoakan anak',
    ],
    ranges: {
      bukhari: [[5641, 5740], [2760, 2820], [3909, 3930]],
      muslim: [[2608, 2680]],
      'abu-dawud': [[2050, 2160], [5140, 5230]],
      tirmidzi: [[1900, 1980]],
      'ibnu-majah': [[3660, 3740]],
      nasai: [[3619, 3660]],
    }
  },

}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seedTopik(topikId, config) {
  console.log(`\n📚 Fix seeding: ${config.nama}`)
  let total = 0
  let batch = []

  for (const [perawi, ranges] of Object.entries(config.ranges)) {
    for (const [start, end] of ranges) {
      console.log(`  → ${perawi} No. ${start}-${end}`)
      for (let nomor = start; nomor <= end; nomor++) {
        const data = await fetchHadits(perawi, nomor)
        await sleep(DELAY_MS)
        if (!data) continue
        if (!matchKeywords(data.id || '', config.keywords)) continue

        batch.push({
          perawi,
          nomor,
          topik_id: topikId,
          topik_nama: config.nama,
          arab: data.arab,
          terjemah: data.id,
          created_at: new Date().toISOString(),
        })

        total++
        process.stdout.write(`\r    ✓ Ditemukan: ${total} hadits`)

        if (batch.length >= 20) {
          await saveToSupabase(batch)
          batch = []
        }
      }
    }
  }

  if (batch.length > 0) await saveToSupabase(batch)
  console.log(`\n  ✅ Total: ${total} hadits untuk "${config.nama}"`)
  return total
}

async function main() {
  console.log('🔧 Fix seeding 8 topik yang hasilnya 0 atau sedikit...')
  console.log('⚠️  Estimasi: 20-30 menit\n')

  let grand = 0
  for (const [id, config] of Object.entries(TOPIK_FIX)) {
    grand += await seedTopik(id, config)
  }

  console.log(`\n🎉 Fix selesai! Total: ${grand} hadits baru tersimpan`)
}

main().catch(console.error)
