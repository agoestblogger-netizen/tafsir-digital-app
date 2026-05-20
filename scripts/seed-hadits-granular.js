// scripts/seed-hadits-granular.js
// Jalankan: node scripts/seed-hadits-granular.js
// Seeding 17 topik granular baru ke Supabase hadits_topik_index

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://crrcijfzujegmeuaffvl.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_BKZ_-BlfRXG_0CDhJQDZ1g_b_ffaRLN'
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

// ── 17 TOPIK GRANULAR BARU ───────────────────────────────────────────────────

const TOPIK_GRANULAR = {

  // ── DARI KELUARGA ────────────────────────────────────────────────────────
  tarbiyah: {
    nama: 'Mendidik Anak',
    keywords: ['mendidik', 'tarbiyah', 'adab anak', 'hak anak', 'didik anak',
               'ajarkan anak', 'anak-anakmu', 'anaknya', 'mendidiknya',
               'nafkah anak', 'anak yatim', 'membesarkan'],
    ranges: {
      bukhari: [[5641, 5720], [2760, 2810]],
      muslim: [[2608, 2660]],
      'abu-dawud': [[2050, 2130], [5140, 5200]],
      tirmidzi: [[1900, 1960]],
      'ibnu-majah': [[3660, 3720]],
    }
  },

  pernikahan: {
    nama: 'Pernikahan & Rumah Tangga',
    keywords: ['nikah', 'menikah', 'mahar', 'mas kawin', 'suami istri',
               'talak', 'cerai', 'rujuk', 'perkawinan', 'walimah',
               'wali nikah', 'khitbah', 'lamaran'],
    ranges: {
      bukhari: [[4999, 5120], [5230, 5310]],
      muslim: [[1400, 1490]],
      'abu-dawud': [[2050, 2200]],
      nasai: [[3200, 3380]],
      tirmidzi: [[1080, 1170]],
      'ibnu-majah': [[1840, 1990]],
    }
  },

  birrul_walidain: {
    nama: 'Birrul Walidain',
    keywords: ['orang tua', 'ibu bapak', 'birrul walidain', 'berbakti',
               'durhaka', 'ridha orang tua', 'ibumu', 'bapakmu', 'ayahmu',
               'berbakti kepada', 'memuliakan orang tua', 'doa orang tua'],
    ranges: {
      bukhari: [[5626, 5640], [2227, 2240]],
      muslim: [[2548, 2560]],
      'abu-dawud': [[5120, 5145]],
      tirmidzi: [[1895, 1910]],
      'ibnu-majah': [[3660, 3680]],
    }
  },

  // ── DARI AKHLAK ──────────────────────────────────────────────────────────
  kejujuran: {
    nama: 'Kejujuran & Amanah',
    keywords: ['jujur', 'kejujuran', 'shidq', 'amanah', 'bohong', 'dusta',
               'berbohong', 'berdusta', 'berkata benar', 'berkata jujur',
               'dipercaya', 'khianat', 'munafik'],
    ranges: {
      bukhari: [[2508, 2530], [6094, 6110]],
      muslim: [[58, 110]],
      tirmidzi: [[1970, 2000]],
      'abu-dawud': [[4988, 5010]],
      'ibnu-majah': [[3840, 3880]],
    }
  },

  tawadhu: {
    nama: 'Tawadhu & Rendah Hati',
    keywords: ['tawadhu', 'rendah hati', 'sombong', 'takabur', 'kibr',
               'merendahkan', 'angkuh', 'membanggakan diri', 'humble',
               'tidak sombong', 'memuliakan'],
    ranges: {
      bukhari: [[6071, 6090]],
      muslim: [[2588, 2610]],
      tirmidzi: [[2000, 2030]],
      'abu-dawud': [[4790, 4820]],
    }
  },

  pemaaf: {
    nama: 'Memaafkan & Menahan Marah',
    keywords: ['maaf', 'memaafkan', 'marah', 'menahan marah', 'dendam',
               'pemaaf', 'ampuni', 'tidak dendam', 'lapang dada',
               'hilm', 'sabar marah'],
    ranges: {
      bukhari: [[5765, 5800], [6114, 6120]],
      muslim: [[2607, 2610]],
      tirmidzi: [[2020, 2030]],
      'abu-dawud': [[4770, 4795]],
    }
  },

  lisan: {
    nama: 'Menjaga Lisan',
    keywords: ['lisan', 'ucapan', 'perkataan', 'ghibah', 'gosip', 'fitnah',
               'namimah', 'adu domba', 'diam', 'bicara baik',
               'kata-kata', 'berkata baik', 'menjaga mulut'],
    ranges: {
      bukhari: [[6474, 6500], [6057, 6075]],
      muslim: [[2560, 2590]],
      tirmidzi: [[2410, 2440]],
      'abu-dawud': [[4990, 5020]],
      'ibnu-majah': [[3960, 4000]],
    }
  },

  // ── DARI SOSIAL ──────────────────────────────────────────────────────────
  kepemimpinan: {
    nama: 'Kepemimpinan & Keadilan',
    keywords: ['pemimpin', 'khalifah', 'imam', 'adil', 'zalim', 'hakim',
               'kepemimpinan', 'memimpin', 'amanah pemimpin',
               'rakyat', 'pemerintah', 'keadilan'],
    ranges: {
      bukhari: [[3455, 3480], [6729, 6760]],
      muslim: [[1820, 1870]],
      'abu-dawud': [[2928, 2970]],
      tirmidzi: [[1330, 1380]],
      'ibnu-majah': [[2300, 2340]],
    }
  },

  muamalah: {
    nama: 'Muamalah & Jual Beli',
    keywords: ['jual beli', 'dagang', 'perdagangan', 'hutang', 'piutang',
               'riba', 'gharar', 'penipuan', 'timbangan', 'takaran',
               'bayar hutang', 'kontrak', 'muamalah'],
    ranges: {
      bukhari: [[2064, 2130], [2235, 2260]],
      muslim: [[1530, 1590]],
      'abu-dawud': [[3325, 3440]],
      nasai: [[4440, 4530]],
      tirmidzi: [[1200, 1300]],
      'ibnu-majah': [[2140, 2270]],
    }
  },

  ukhuwah: {
    nama: 'Ukhuwah & Persaudaraan',
    keywords: ['saudara', 'ukhuwah', 'persaudaraan', 'tetangga', 'tamu',
               'tolong menolong', 'gotong royong', 'cinta sesama',
               'hak tetangga', 'memuliakan tamu', 'membantu'],
    ranges: {
      bukhari: [[2333, 2380], [6010, 6030]],
      muslim: [[2553, 2580]],
      tirmidzi: [[1923, 1950]],
      'abu-dawud': [[5151, 5200]],
    }
  },

  // ── MOTIVASI ─────────────────────────────────────────────────────────────
  optimisme: {
    nama: 'Optimisme & Harapan',
    keywords: ['harapan', 'jangan putus asa', 'semangat', 'optimis',
               'rahmat Allah', 'tidak berputus asa', 'yakin',
               'husnudzan', 'prasangka baik', 'kemudahan', 'jalan keluar'],
    ranges: {
      bukhari: [[6306, 6320], [5673, 5680]],
      muslim: [[2751, 2760], [2999, 3010]],
      tirmidzi: [[3496, 3530]],
      'ibnu-majah': [[4166, 4200]],
    }
  },

  istiqomah: {
    nama: 'Istiqomah & Konsisten',
    keywords: ['istiqomah', 'konsisten', 'teguh', 'istiqamah', 'terus menerus',
               'amal rutin', 'amal yang dicintai', 'berkelanjutan',
               'tidak putus', 'sedikit tapi rutin'],
    ranges: {
      bukhari: [[6462, 6470], [43, 55]],
      muslim: [[783, 800], [2818, 2830]],
      tirmidzi: [[2687, 2700]],
    }
  },

  // ── MOMEN KHUSUS ─────────────────────────────────────────────────────────
  ramadan_amal: {
    nama: 'Amal di Bulan Ramadan',
    keywords: ['amal ramadan', 'sedekah ramadan', 'qiyamul lail',
               'lailatul qadar', 'itikaf', 'zakat fitrah',
               'memberi makan', 'berbuka', 'iftar'],
    ranges: {
      bukhari: [[1894, 1980]],
      muslim: [[1090, 1180]],
      tirmidzi: [[680, 750]],
      'ibnu-majah': [[1620, 1700]],
    }
  },

  idul_fitri: {
    nama: 'Idul Fitri & Silaturahmi',
    keywords: ['idul fitri', 'lebaran', 'fitrah', 'silaturahmi', 'eid',
               'shalat ied', 'takbir', 'menyambung', 'maaf memaafkan',
               'berkunjung', 'halal bihalal'],
    ranges: {
      bukhari: [[952, 990]],
      muslim: [[884, 910]],
      'abu-dawud': [[1134, 1165]],
      tirmidzi: [[530, 560]],
    }
  },

  isra_miraj: {
    nama: "Isra' Mi'raj",
    keywords: ["isra", "mi'raj", "miraj", "masjidil aqsa", "buraq",
               "sidratul muntaha", "shalat wajib", "lima waktu",
               "perjalanan malam", "langit ketujuh"],
    ranges: {
      bukhari: [[342, 360], [3886, 3900]],
      muslim: [[163, 175]],
      tirmidzi: [[3340, 3360]],
    }
  },

  tahun_baru_hijriyah: {
    nama: 'Muhasabah & Introspeksi',
    keywords: ['muhasabah', 'introspeksi', 'hisab diri', 'evaluasi',
               'perbaiki diri', 'koreksi diri', 'amal masa lalu',
               'bertaubat', 'tahun baru', 'hijriah', 'waktu berlalu'],
    ranges: {
      bukhari: [[6491, 6510]],
      muslim: [[2740, 2760]],
      tirmidzi: [[2457, 2480]],
      'ibnu-majah': [[4240, 4260]],
    }
  },

  // ── SAINS ────────────────────────────────────────────────────────────────
  penciptaan: {
    nama: 'Penciptaan & Tanda Kebesaran Allah',
    keywords: ['menciptakan', 'ciptaan', 'alam semesta', 'langit bumi',
               'tanda kekuasaan', 'tanda kebesaran', 'ciptaan Allah',
               'makhluk', 'alam', 'bintang', 'hujan', 'bumi'],
    ranges: {
      bukhari: [[3186, 3210], [4477, 4510]],
      muslim: [[2612, 2640]],
      tirmidzi: [[3298, 3340]],
    }
  },

  kesehatan_jiwa: {
    nama: 'Kesehatan Jiwa & Qalbu',
    keywords: ['hati', 'qalbu', 'jiwa', 'ketenangan', 'gelisah', 'gundah',
               'tenteram', 'damai', 'stress', 'resah', 'batin',
               'bersih hati', 'hati yang sakit', 'penyakit hati'],
    ranges: {
      bukhari: [[52, 60]],
      muslim: [[1599, 1610]],
      tirmidzi: [[2516, 2540]],
      'ibnu-majah': [[3984, 4020]],
    }
  },
}

// ── Main seeding ─────────────────────────────────────────────────────────────

async function seedTopik(topikId, config) {
  console.log(`\n📚 Seeding: ${config.nama}`)
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
  console.log('🚀 Seeding 17 topik granular baru...')
  console.log('⚠️  Estimasi: 45-60 menit\n')

  // Pilih topik yang mau di-seed (comment yang tidak perlu untuk test)
  const SEED_LIST = Object.keys(TOPIK_GRANULAR)
  // Test satu topik dulu:
  // const SEED_LIST = ['tarbiyah']

  let grand = 0
  for (const id of SEED_LIST) {
    grand += await seedTopik(id, TOPIK_GRANULAR[id])
  }

  console.log(`\n🎉 Selesai! Total: ${grand} hadits tersimpan`)
}

main().catch(console.error)
