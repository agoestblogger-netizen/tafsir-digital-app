import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Daftar surah yang akan di-seed
const SURAH_LIST = [
  // Surah yang BELUM ada di DB (perlu di-seed):
  1, 8, 13, 15, 20, 23, 25, 26, 27, 28, 29, 30,
  32, 34, 35, 37, 38, 40, 41, 42, 43, 44, 45, 46,
  47, 48, 50, 51, 52, 53, 54, 57, 58, 59, 60, 61,
  62, 63, 64, 65, 66, 69, 70, 71, 72, 73, 74, 75,
  76, 77
]

// Daftar topik granular (sama dengan sistem hadits)
const TOPIK_LIST = [
  // Akidah & Tauhid
  'Tauhid Uluhiyah', 'Tauhid Rububiyah', 'Tauhid Asma wa Sifat',
  'Menghindari Syirik', 'Menghindari Bid\'ah', 'Iman kepada Allah',
  'Iman kepada Malaikat', 'Iman kepada Kitab Allah', 'Iman kepada Rasul',
  'Iman kepada Hari Akhir', 'Iman kepada Qada & Qadar',
  'Taqwa', 'Ikhlas', 'Tawakkal', 'Syukur', 'Sabar',
  'Taubat & Istighfar', 'Takut kepada Allah', 'Harapan kepada Allah',
  'Cinta kepada Allah & Rasul', 'Manhaj & Pemahaman Islam',
  // Akhlak Terpuji
  'Kejujuran', 'Amanah', 'Tawadhu', 'Dermawan & Sedekah',
  'Zuhud', 'Qanaah', 'Malu', 'Pemaaf & Menahan Marah',
  'Kasih Sayang', 'Lemah Lembut', 'Wara & Kehati-hatian', 'Muhasabah Diri',
  // Akhlak Tercela
  'Sombong & Takabur', 'Riya & Sum\'ah', 'Hasad & Dengki',
  'Dusta & Bohong', 'Ghibah & Fitnah', 'Marah & Emosi',
  'Bakhil & Kikir', 'Hubbud Dunya',
  // Keluarga
  'Birrul Walidain', 'Mendidik Anak Islami', 'Pernikahan & Pranikah',
  'Hak Suami & Istri', 'Rumah Tangga Sakinah',
  'Hak Anak dalam Islam', 'Nafkah & Tanggung Jawab',
  'Muslimah & Peran Wanita',
  // Ibadah
  'Shalat Wajib & Rukunnya', 'Shalat Sunnah & Tahajud', 'Shalat Berjamaah',
  'Shalat Jumat', 'Thaharah & Bersuci', 'Puasa Wajib & Sunnah',
  'Ramadan & Lailatul Qadr', 'Itikaf', 'Zakat & Nisab',
  'Haji & Umrah', 'Qurban & Aqiqah',
  // Hubungan Sosial
  'Ukhuwah Islamiyah', 'Silaturahmi', 'Tolong Menolong',
  'Adab Bertetangga', 'Keadilan', 'Kepemimpinan & Amanah',
  'Hak Non-Muslim', 'Adab Berbedaan Pendapat',
  // Ilmu & Dakwah
  'Menuntut Ilmu', 'Adab Menuntut Ilmu', 'Mengajar & Berbagi Ilmu',
  'Dakwah & Amar Makruf', 'Jihad & Membela Islam', 'Sejarah Islam & Sirah',
  // Muamalah & Hukum
  'Riba & Bunga Bank', 'Halal Haram Makanan', 'Jual Beli & Bisnis Islam',
  'Hutang Piutang', 'Waris & Pembagiannya',
  'Wakaf & Sedekah Jariyah', 'Muamalah Digital', 'Investasi & Keuangan Islam',
  // Akhirat & Kematian
  'Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur',
  'Hari Kiamat & Tanda-tandanya', 'Surga & Kenikmatan',
  'Neraka & Azab', 'Amal Jariyah', 'Hisab & Pertanggungjawaban',
  'Syafaat Rasulullah',
  // Kisah & Mukjizat
  'Kisah Para Nabi', 'Kisah Kaum Terdahulu', 'Mukjizat & Tanda Kebesaran',
  'Sains & Alam Semesta', 'Lingkungan & Alam',
  // Kehidupan Modern
  'Media Sosial & Menjaga Lisan', 'Mengatasi Kesedihan & Anxiety',
  'Motivasi & Produktivitas Islam', 'Kesehatan dalam Islam',
  'Politik & Bernegara', 'Teknologi & Etika Islam',
  // Doa, Dzikir & Al-Qur'an
  'Doa & Munajat', 'Zikir & Wirid', 'Tilawah Al-Qur\'an',
  'Keutamaan Surah-surah', 'Tafsir & Tadabur', 'Adab dengan Al-Qur\'an',
  'Isra Miraj & Momen Islam', 'Doa Mustajab & Waktu Istimewa',
  // Tazkiyatun Nufus
  'Penyakit Hati & Penyembuhan', 'Cinta Dunia & Zuhud',
  'Muraqabah & Ihsan', 'Khusyuk dalam Ibadah',
  'Istiqamah & Konsistensi', 'Rezeki & Keberkahan Hidup',
  // Fallback umum
  'Shalat', 'Puasa', 'Zakat', 'Sedekah', 'Akhlak',
  'Keluarga', 'Akhirat', 'Muamalah', 'Ibadah', 'Aqidah',
  'Iman', 'Sabar', 'Syukur', 'Ilmu', 'Rezeki'
]

const TOPIK_STRING = TOPIK_LIST.join(', ')

async function fetchSurahFromAPI(surahId: number) {
  const res = await fetch(`https://equran.id/api/v2/surat/${surahId}`)
  const contentType = res.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    throw new Error(`Non-JSON response for surah ${surahId}`)
  }
  const data = await res.json()
  return data.data
}

async function labelAyatWithAI(
  surahNamaLatin: string,
  surahId: number,
  ayat: { nomorAyat: number; teksArab: string; teksIndonesia: string }
): Promise<{ tags: string[]; topik_utama: string; konteks_ayat: string }> {
  const nomorAyat = ayat.nomorAyat
  const teksArab = ayat.teksArab
  const terjemah = ayat.teksIndonesia

  const prompt = `Kamu adalah pakar tafsir Al-Qur'an dan 
Islamic studies Indonesia.

Analisis ayat berikut dan berikan label topik yang TEPAT 
dan KOMBINATIF.

AYAT: QS. ${surahNamaLatin}: ${nomorAyat}
Arab: ${teksArab}
Terjemah: ${terjemah}

DAFTAR TOPIK YANG TERSEDIA:
${TOPIK_LIST.join(', ')}

ATURAN LABELING:
1. Pilih 2-5 topik yang BENAR-BENAR relevan dengan ayat ini
2. KOMBINASIKAN topik jika ayat membahas lebih dari 1 konsep
   Contoh: ayat tentang sedekah dengan ikhlas → 
   ["Ikhlas", "Dermawan & Sedekah"]
3. JANGAN pilih topik yang hanya "menyentuh" ayat secara tidak langsung
4. topik_utama = topik PALING DOMINAN dalam ayat
5. konteks_ayat = 1 kalimat yang menjelaskan SPESIFIK 
   pesan utama ayat (bukan parafrase umum)
   
   CONTOH KONTEKS YANG BAIK:
   ✅ "Ayat ini memerintahkan sedekah dengan niat ikhlas tanpa riya"
   ✅ "Ayat ini menjelaskan kewajiban sabar saat menghadapi ujian hidup"
   
   CONTOH KONTEKS YANG BURUK:
   ❌ "Ayat ini menjelaskan tentang ibadah kepada Allah"
   ❌ "Ayat ini berisi perintah Allah kepada umat Islam"

Respond ONLY dengan valid JSON:
{
  "tags": ["topik1", "topik2", "topik3"],
  "topik_utama": "topik paling dominan",
  "konteks_ayat": "penjelasan spesifik 1 kalimat"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const raw = response.choices[0].message.content ?? '{}'
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    const parsed = JSON.parse(clean)
    if (Array.isArray(parsed.tags)) {
      const validTags = parsed.tags
        .map((t: string) => TOPIK_LIST.find(dt => dt.toLowerCase() === t.toLowerCase()))
        .filter((t: string | undefined): t is string => !!t)

      const mainTopic = TOPIK_LIST.find(dt => dt.toLowerCase() === (parsed.topik_utama ?? '').toLowerCase()) ?? validTags[0] ?? 'Aqidah'

      return {
        tags: validTags.length > 0 ? validTags : ['Aqidah'],
        topik_utama: mainTopic,
        konteks_ayat: parsed.konteks_ayat ?? ''
      }
    }
  } catch (e) {
    console.error('❌ Parse error:', e, '\nRaw:', raw.slice(0, 300))
  }

  return {
    tags: ['Aqidah'],
    topik_utama: 'Aqidah',
    konteks_ayat: ''
  }
}

async function seedSurah(surahId: number) {
  console.log(`\n📖 Fetching Surah ${surahId}...`)

  let surah: any
  try {
    surah = await fetchSurahFromAPI(surahId)
  } catch (e) {
    console.error(`❌ Gagal fetch surah ${surahId}:`, e)
    return
  }

  if (!surah) {
    console.error(`❌ Surah ${surahId} tidak ditemukan`)
    return
  }

  console.log(`✅ ${surah.namaLatin} (${surah.nama}) — ${surah.jumlahAyat} ayat`)

  let updated = 0
  
  const CHUNK_SIZE = 10
  for (let i = 0; i < surah.ayat.length; i += CHUNK_SIZE) {
    const chunk = surah.ayat.slice(i, i + CHUNK_SIZE)
    
    const promises = chunk.map(async (ayat: any) => {
      let retries = 3
      let success = false
      
      while (retries > 0 && !success) {
        try {
          const label = await labelAyatWithAI(surah.namaLatin, surahId, {
            nomorAyat: ayat.nomorAyat,
            teksArab: ayat.teksArab,
            teksIndonesia: ayat.teksIndonesia
          })

          const { error } = await supabase
            .from('ayat_quran_index')
            .upsert({
              surah_id: surahId,
              surah_nama: surah.nama,
              surah_nama_latin: surah.namaLatin,
              nomor_ayat: ayat.nomorAyat,
              teks_arab: ayat.teksArab,
              teks_latin: ayat.teksLatin,
              terjemah: ayat.teksIndonesia,
              tags: label.tags,
              topik_utama: label.topik_utama,
              konteks_ayat: label.konteks_ayat,
              generated_at: new Date().toISOString()
            }, {
              onConflict: 'surah_id,nomor_ayat',  // unique constraint
              ignoreDuplicates: false  // UPDATE jika sudah ada
            })

          if (error) throw error
          
          success = true
          updated++
          process.stdout.write('.')
        } catch (e: any) {
          retries--
          if (retries > 0) {
            await new Promise(r => setTimeout(r, 100 + Math.random() * 400)) // max 500ms backoff
          } else {
            console.error(`\n❌ Error QS. ${surah.namaLatin}: ${ayat.nomorAyat}:`, e?.message ?? e)
          }
        }
      }
    })
    
    await Promise.all(promises)
    // Small delay between chunks
    await new Promise(r => setTimeout(r, 50))
  }

  console.log(`\n✅ Surah ${surah.namaLatin}: ${updated} updated`)
}

async function main() {
  console.log('🚀 Starting AI labeling for ayat_quran_index...')
  console.log(`📊 Total surah: ${SURAH_LIST.length}`)

  // Laporan awal
  const { count: existing } = await supabase
    .from('ayat_quran_index')
    .select('*', { count: 'exact', head: true })
  console.log(`📋 Ayat sudah tersimpan: ${existing ?? 0}`)

  for (const surahId of SURAH_LIST) {
    await seedSurah(surahId)
    await new Promise(r => setTimeout(r, 200))
  }

  // Laporan akhir
  const { count } = await supabase
    .from('ayat_quran_index')
    .select('*', { count: 'exact', head: true })

  console.log(`\n🎉 SELESAI! Total ayat tersimpan: ${count}`)
}

main().catch(console.error)
