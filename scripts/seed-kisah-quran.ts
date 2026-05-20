import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Daftar 29 kisah yang perlu di-seed (dari user request)
const KISAH_TO_SEED = [
  // Kategori: kisah_nabi
  { slug: 'kisah-idris', nama: 'Nabi Idris AS', tipe: 'kisah_nabi', 
    referensi: 'QS. Maryam: 56-57, Al-Anbiya: 85-86' },
  { slug: 'kisah-hud', nama: 'Nabi Hud AS', tipe: 'kisah_nabi',
    referensi: 'QS. Al-Araf: 65-72, Hud: 50-60' },
  { slug: 'kisah-saleh', nama: 'Nabi Saleh AS', tipe: 'kisah_nabi',
    referensi: 'QS. Al-Araf: 73-79, Hud: 61-68' },
  { slug: 'kisah-ishaq', nama: 'Nabi Ishaq AS', tipe: 'kisah_nabi',
    referensi: 'QS. As-Saffat: 112-113' },
  { slug: 'kisah-yaqub', nama: 'Nabi Yaqub AS', tipe: 'kisah_nabi',
    referensi: 'QS. Yusuf: 4-100' },
  { slug: 'kisah-harun', nama: 'Nabi Harun AS', tipe: 'kisah_nabi',
    referensi: 'QS. Thaha: 29-35, Al-Araf: 122' },
  { slug: 'kisah-dzulkifli', nama: 'Nabi Dzulkifli AS', tipe: 'kisah_nabi',
    referensi: 'QS. Al-Anbiya: 85-86, Sad: 48' },
  { slug: 'kisah-ilyas', nama: 'Nabi Ilyas AS', tipe: 'kisah_nabi',
    referensi: 'QS. As-Saffat: 123-132' },
  { slug: 'kisah-ilyasa', nama: 'Nabi Ilyasa AS', tipe: 'kisah_nabi',
    referensi: 'QS. Al-Anam: 86-87, Sad: 48' },
  { slug: 'kisah-dawud', nama: 'Nabi Dawud AS', tipe: 'kisah_nabi',
    referensi: 'QS. Sad: 17-26, Al-Baqarah: 251' },
  { slug: 'kisah-zakaria', nama: 'Nabi Zakaria AS', tipe: 'kisah_nabi',
    referensi: 'QS. Maryam: 1-11, Ali Imran: 37-41' },
  { slug: 'kisah-yahya', nama: 'Nabi Yahya AS', tipe: 'kisah_nabi',
    referensi: 'QS. Maryam: 12-15' },

  // Kategori: kisah_pilihan
  { slug: 'kisah-habil-qabil', nama: 'Habil dan Qabil', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Maidah: 27-32' },
  { slug: 'kisah-thalut-jalut', nama: 'Thalut dan Jalut', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Baqarah: 246-251' },
  { slug: 'kisah-luqman', nama: 'Luqman Al-Hakim', tipe: 'kisah_pilihan',
    referensi: 'QS. Luqman: 12-19' },
  { slug: 'kisah-qarun', nama: 'Qarun', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Qasas: 76-82' },
  { slug: 'kisah-ashabul-ukhdud', nama: 'Ashabul Ukhdud', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Buruj: 4-10' },
  { slug: 'kisah-ashabus-sabt', nama: 'Ashabus Sabt', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Araf: 163-166' },
  { slug: 'kisah-ratu-balqis', nama: 'Ratu Balqis (Saba)', tipe: 'kisah_pilihan',
    referensi: 'QS. An-Naml: 22-44' },
  { slug: 'kisah-kaum-tsamud', nama: 'Kaum Tsamud', tipe: 'kaum_diazab',
    referensi: 'QS. Hud: 61-68, Al-Araf: 73-79' },
  { slug: 'kisah-keluar-ribuan', nama: 'Kaum yang Keluar Ribuan', tipe: 'kisah_pilihan',
    referensi: 'QS. Al-Baqarah: 243' },

  // Kategori: sirah_nabawiyah
  { slug: 'sirah-isra-miraj', nama: 'Isra Miraj', tipe: 'sirah_nabawiyah',
    referensi: 'QS. Al-Isra: 1, An-Najm: 1-18' },
  { slug: 'sirah-perang-badar', nama: 'Perang Badar', tipe: 'sirah_nabawiyah',
    referensi: 'QS. Ali Imran: 123-127, Al-Anfal: 5-19' },
  { slug: 'sirah-perang-uhud', nama: 'Perang Uhud', tipe: 'sirah_nabawiyah',
    referensi: 'QS. Ali Imran: 121-179' },
  { slug: 'sirah-perang-ahzab', nama: 'Perang Ahzab (Khandaq)', tipe: 'sirah_nabawiyah',
    referensi: 'QS. Al-Ahzab: 9-27' },
  { slug: 'sirah-perang-hunain', nama: 'Perang Hunain', tipe: 'sirah_nabawiyah',
    referensi: 'QS. At-Taubah: 25-27' },
  { slug: 'sirah-hijrah', nama: 'Hijrah Nabi ke Madinah', tipe: 'sirah_nabawiyah',
    referensi: 'QS. At-Taubah: 40' },
  { slug: 'sirah-fathu-makkah', nama: 'Fathu Makkah', tipe: 'sirah_nabawiyah',
    referensi: 'QS. Al-Fath: 1-29' },
  { slug: 'sirah-kisah-ifk', nama: 'Kisah Ifk (Fitnah Aisyah)', tipe: 'sirah_nabawiyah',
    referensi: 'QS. An-Nur: 11-26' },
]

async function generateKisahWithAI(kisah: {
  slug: string
  nama: string
  tipe: string
  referensi: string
}) {
  const isSirah = kisah.tipe === 'sirah_nabawiyah'
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    temperature: 0.3,
    messages: [{
      role: 'system',
      content: `Kamu adalah pakar sejarah Islam dan tafsir Al-Qur'an Indonesia.
Tugasmu menghasilkan data lengkap kisah Al-Qur'an untuk database aplikasi kultum.
Respond ONLY dengan valid JSON tanpa markdown.`
    }, {
      role: 'user',
      content: `Generate data lengkap untuk kisah Al-Qur'an berikut:

Nama: ${kisah.nama}
Tipe: ${kisah.tipe}
Referensi utama: ${kisah.referensi}

Respond dengan JSON:
{
  "nama_arab": "nama dalam tulisan Arab jika ada, kosong jika tidak ada",
  "periode": "estimasi periode (contoh: ± 2000 SM, Abad 7 M)",
  "lokasi": "lokasi utama kejadian",
  "nabi_diutus": "${isSirah ? 'Nabi Muhammad SAW' : 'nama nabi yang diutus ke kaum ini, atau N/A'}",
  "ringkasan": "ringkasan singkat 2-3 kalimat tentang kisah ini",
  "latar_belakang": "latar belakang situasi sebelum kisah terjadi",
  "kondisi_kaum": "${isSirah ? 'kondisi umat Islam saat peristiwa ini terjadi' : 'kondisi kaum/masyarakat saat itu'}",
  "kisah_lengkap": "narasi lengkap kisah dalam 3-5 paragraf, sertakan referensi ayat (QS. Surah: ayat) di setiap bagian penting",
  "azab_atau_kejadian": "azab yang menimpa atau kejadian utama yang terjadi",
  "pelajaran": "5 pelajaran/hikmah utama dari kisah ini, format: 1. ... 2. ... dst",
  "ayat_utama": [
    {
      "surah_id": angka_id_surah,
      "nomor_ayat": "nomor ayat",
      "surah_nama": "nama surah",
      "teks_arab": "teks arab ayat (singkat/representatif)",
      "terjemah": "terjemah Indonesia ayat tersebut"
    }
  ],
  "semua_surah": [
    {
      "surah_id": angka_id_surah,
      "surah_nama": "nama surah",
      "ayat_range": "range ayat misal 1-28",
      "konteks": "konteks kisah di surah ini"
    }
  ],
  "referensi": "${kisah.referensi}"
}`
    }]
  })

  const text = response.choices[0].message.content ?? '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function main() {
  console.log('🚀 Starting kisah Al-Qur\'an seeding...')
  console.log(`📊 Total kisah to seed: ${KISAH_TO_SEED.length}`)

  // Cek kisah yang sudah ada
  const { data: existing } = await supabase
    .from('kaum_lampau')
    .select('slug')
  
  const existingSlugs = new Set(existing?.map(k => k.slug) ?? [])
  const toSeed = KISAH_TO_SEED.filter(k => !existingSlugs.has(k.slug))
  
  console.log(`✅ Sudah ada: ${existingSlugs.size}`)
  console.log(`📝 Perlu di-seed: ${toSeed.length}`)

  let success = 0
  let failed = 0

  for (const kisah of toSeed) {
    console.log(`\n📖 Generating: ${kisah.nama}...`)
    
    try {
      const data = await generateKisahWithAI(kisah)
      
      const { error } = await supabase
        .from('kaum_lampau')
        .insert({
          slug: kisah.slug,
          nama: kisah.nama,
          nama_arab: data.nama_arab ?? '',
          kategori: kisah.tipe,
          tipe_kisah: kisah.tipe,
          periode: data.periode ?? '',
          lokasi: data.lokasi ?? '',
          nabi_diutus: data.nabi_diutus ?? '',
          ringkasan: data.ringkasan ?? '',
          latar_belakang: data.latar_belakang ?? '',
          kondisi_kaum: data.kondisi_kaum ?? '',
          kisah_lengkap: data.kisah_lengkap ?? '',
          azab_atau_kejadian: data.azab_atau_kejadian ?? '',
          pelajaran: data.pelajaran ?? '',
          ayat_utama: data.ayat_utama ?? [],
          semua_surah: data.semua_surah ?? [],
          referensi: data.referensi ?? kisah.referensi
        })

      if (error) {
        console.error(`❌ Error insert ${kisah.slug}:`, error.message)
        failed++
      } else {
        console.log(`✅ ${kisah.nama} berhasil di-seed!`)
        success++
      }

      // Rate limit: tunggu 1 detik antar request
      await new Promise(r => setTimeout(r, 1000))

    } catch (e) {
      console.error(`❌ Error generate ${kisah.slug}:`, e)
      failed++
    }
  }

  console.log(`\n🎉 SELESAI!`)
  console.log(`✅ Berhasil: ${success}`)
  console.log(`❌ Gagal: ${failed}`)

  // Laporan akhir
  const { count } = await supabase
    .from('kaum_lampau')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 Total kisah di DB: ${count}`)
}

main().catch(console.error)
