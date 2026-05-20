import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai service role untuk bypass RLS
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// 102 topik granular + fallback
const DAFTAR_TOPIK = [
  // Akidah & Tauhid
  'Tauhid Uluhiyah', 'Tauhid Rububiyah', 'Tauhid Asma wa Sifat',
  'Menghindari Syirik', 'Menghindari Bid\'ah', 'Iman kepada Allah',
  'Iman kepada Malaikat', 'Iman kepada Kitab Allah', 'Iman kepada Rasul',
  'Iman kepada Hari Akhir', 'Iman kepada Qada & Qadar',
  'Taqwa', 'Ikhlas', 'Tawakkal', 'Syukur', 'Sabar',
  'Taubat & Istighfar', 'Takut kepada Allah', 'Harapan kepada Allah',
  'Cinta kepada Allah & Rasul', 'Manhaj & Pemahaman Islam', 'Menjawab Syubhat',
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
  'Hak Suami & Istri', 'Rumah Tangga Sakinah', 'Talak & Perceraian',
  'Poligami', 'Hak Anak dalam Islam', 'Nafkah & Tanggung Jawab',
  'Hubungan dengan Mertua', 'Muslimah & Peran Wanita', 'Pacaran & Pergaulan',
  // Ibadah
  'Shalat Wajib & Rukunnya', 'Shalat Sunnah & Tahajud', 'Shalat Berjamaah',
  'Shalat Jumat', 'Thaharah & Bersuci', 'Puasa Wajib & Sunnah',
  'Ramadan & Lailatul Qadr', 'Itikaf', 'Zakat & Nisab', 'Zakat Profesi',
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
  'Hutang Piutang', 'Zakat Profesi & Harta', 'Waris & Pembagiannya',
  'Wakaf & Sedekah Jariyah', 'Hukum Adat & Islam',
  'Muamalah Digital', 'Investasi & Keuangan Islam',
  // Akhirat & Kematian
  'Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur',
  'Hari Kiamat & Tanda-tandanya', 'Surga & Kenikmatan',
  'Neraka & Azab', 'Amal Jariyah', 'Hisab & Pertanggungjawaban',
  'Syafaat Rasulullah',
  // Kehidupan Modern
  'Media Sosial & Menjaga Lisan', 'Pergaulan & Aurat',
  'Mengatasi Kesedihan & Anxiety', 'Motivasi & Produktivitas Islam',
  'Kesehatan dalam Islam', 'Lingkungan & Alam',
  'Politik & Bernegara', 'Teknologi & Etika Islam',
  // Doa, Dzikir & Al-Qur'an
  'Doa & Munajat', 'Zikir & Wirid', 'Tilawah Al-Qur\'an',
  'Keutamaan Surah-surah', 'Tafsir & Tadabur', 'Adab dengan Al-Qur\'an',
  'Isra Miraj & Momen Islam', 'Doa Mustajab & Waktu Istimewa',
  // Tazkiyatun Nufus
  'Penyakit Hati & Penyembuhan', 'Cinta Dunia & Zuhud',
  'Muraqabah & Ihsan', 'Khusyuk dalam Ibadah',
  'Istiqamah & Konsistensi', 'Rezeki & Keberkahan Hidup',
  // Kategori fallback umum
  'Shalat', 'Puasa', 'Zakat', 'Sedekah', 'Akhlak',
  'Keluarga', 'Akhirat', 'Muamalah', 'Ibadah', 'Aqidah',
  'Iman', 'Sabar', 'Syukur', 'Ilmu', 'Rezeki'
]

const TOPIK_STRING = DAFTAR_TOPIK.join(', ')

const IS_TEST_MODE = false // Set ke false untuk produksi

import { ekstrakIntiHadits } from '../src/lib/ekstrak-inti-hadits'

async function labelBatch(hadits: any[]): Promise<Map<string, string[]>> {
  // Ekstrak matan dulu — prioritaskan kolom matan dari DB
  console.log('\n📤 Matan yang dikirim ke AI:')
  const input = hadits.map((h, i) => {
    const matan = (h.matan ?? ekstrakIntiHadits(h.terjemah ?? '')).slice(0, 600)
    console.log(`[${i}] ${h.perawi} No.${h.nomor}: ${matan.slice(0, 150)}...`)
    return `[${i}] ID:${h.id}\nPerawi: ${h.perawi} No.${h.nomor}\nTopik asal: ${h.topik_nama}\nMatan: ${matan}`
  }).join('\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah ahli hadits senior dan pakar klasifikasi konten Islam. Tugasmu adalah memberikan label topik yang SANGAT AKURAT untuk hadits yang diberikan.

DAFTAR TOPIK RESMI (HANYA PILIH DARI SINI):
${TOPIK_STRING}

ATURAN KETAT (WAJIB DIPATUHI):
1. KLASIFIKASI SEMUA: Jika input memberikan ${hadits.length} hadits, kamu HARUS mengembalikan tepat ${hadits.length} objek JSON.
2. JUMLAH TAG: Pilih minimal 2 dan maksimal 4 tag yang paling relevan untuk setiap hadits.
3. AKURASI TEMATIK: Analisa teks MATAN secara mendalam. Prioritaskan topik yang spesifik/granular. Gunakan topik umum (seperti 'Shalat', 'Akhlak') HANYA jika pesan hadits bersifat sangat general.
4. VALIDASI: HANYA gunakan teks yang ada dalam DAFTAR TOPIK RESMI di atas. Jangan membuat topik baru.
5. FORMAT: Balas HANYA dengan JSON array valid tanpa teks pengantar apapun.

Format: [{"id":"uuid","tags":["Topik A","Topik B"]},...]`
      },
      {
        role: 'user',
        content: `Klasifikasikan hadits berikut dengan tingkat akurasi tinggi:\n\n${input}`
      }
    ],
    max_tokens: 4000
  })

  const raw = response.choices[0].message.content ?? '[]'
  const clean = raw.replace(/```json|```/g, '').trim()
  const result: Map<string, string[]> = new Map()

  try {
    const parsed = JSON.parse(clean)
    console.log(`🤖 AI Suggestions:`, parsed.map((p: any) => `${p.id.slice(0,4)}: ${p.tags?.join(', ')}`).join(' | '))
    
    for (const item of parsed) {
      if (item.id && Array.isArray(item.tags)) {
        const validTags = item.tags.map((t: string) => {
          return DAFTAR_TOPIK.find(dt => dt.toLowerCase() === t.toLowerCase())
        }).filter((t: string | undefined): t is string => !!t)
        
        if (validTags.length === 0 && item.tags.length > 0) {
          console.warn(`⚠️ Invalid tags from AI for ${item.id}:`, item.tags)
        }
        
        result.set(item.id, validTags)
      }
    }
  } catch (e) {
    console.error('Parse error:', e, '\nRaw:', raw.slice(0, 200))
  }

  return result
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🚀 Resume AI Labeling Hadits (Strict Mode - PRODUCTION)...')
  
  if (IS_TEST_MODE) {
    console.log('🧪 RUNNING IN TEST MODE (Specific hadiths across perawis)')
    
    const { data: testHadits, error } = await supabase
      .from('hadits_topik_index')
      .select('id, nomor, perawi, terjemah, matan, topik_nama, tags')
      .in('nomor', [1, 52, 2231])

    if (error) {
      console.error('Test fetch error:', error)
      return
    }

    console.log('\n📋 Test hadits (Current State):')
    testHadits?.forEach(h => 
      console.log(` - ${h.perawi} No.${h.nomor} [${h.topik_nama}] current tags: ${JSON.stringify(h.tags)}`)
    )

    console.log('\n🔄 Re-labeling batch...')
    const labelMap = await labelBatch(testHadits ?? [])
    
    console.log('\n✨ Hasil re-labeling:')
    for (const [id, tags] of labelMap) {
      const h = testHadits?.find(x => x.id === id)
      console.log(`\n✅ ${h?.perawi} No.${h?.nomor} → Tags Baru: ${tags.join(', ')}`)
      console.log(`   Matan: ${(h?.matan ?? ekstrakIntiHadits(h?.terjemah ?? '')).slice(0, 100)}...`)
      
      // Update DB (opsional saat test, tapi user minta validasi)
      await supabase.from('hadits_topik_index').update({ tags }).eq('id', id)
    }
    
    console.log('\n✅ TEST MODE COMPLETED.')
    return
  }

  // --- LOGIKA RESET DIHAPUS UNTUK RESUME ---
  console.log('📝 Melanjutkan labeling dari posisi terakhir (Resume Mode)...')

  console.log(`📋 Total topik: ${DAFTAR_TOPIK.length}`)
  
  const BATCH_SIZE = 15
  let totalProcessed = 0
  let totalError = 0

  // Hitung total hadits sisa
  const { count: remainingUnlabeled } = await supabase
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .eq('tags', '{}')

  const { count: totalHadits } = await supabase
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Sisa hadits yang perlu di-label: ${remainingUnlabeled} dari total ${totalHadits}`)

  while (true) {
    // Ambil batch yang tags-nya kosong
    const { data: batch, error } = await supabase
      .from('hadits_topik_index')
      .select('id, terjemah, matan, topik_nama, nomor, perawi')
      .eq('tags', '{}')
      .limit(BATCH_SIZE)

    if (error) {
      console.error('Fetch error:', error)
      break
    }

    if (!batch || batch.length === 0) {
      console.log('✅ Semua hadits sudah di-label!')
      break
    }

    try {
      const labelMap = await labelBatch(batch)
      const updates = []
      for (const hadits of batch) {
        const tags = labelMap.get(hadits.id)
        if (tags && tags.length > 0) {
          updates.push(supabase.from('hadits_topik_index').update({ tags }).eq('id', hadits.id))
        } else {
          updates.push(supabase.from('hadits_topik_index').update({ tags: [hadits.topik_nama ?? 'Iman & Akidah'] }).eq('id', hadits.id))
        }
      }
      await Promise.all(updates)
      totalProcessed += batch.length
      
      const finished = totalHadits! - remainingUnlabeled! + totalProcessed
      console.log(`\n📈 PROGRESS: ${finished}/${totalHadits} (${Math.round((finished/(totalHadits||1))*100)}%)`)
    } catch (e) {
      console.error('Batch error:', e)
      totalError += batch.length
    }
    
    await sleep(1500)
  }
  console.log('\n🎉 PRODUKSI SELESAI!')
}

main().catch(console.error)
