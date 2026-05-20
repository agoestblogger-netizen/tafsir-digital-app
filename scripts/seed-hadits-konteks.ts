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

// 34 topik yang ada di hadits_topik_index
const TOPIK_LIST = [
  'Akhirat & Kiamat', 'Akhlak Mulia', 'Amal di Bulan Ramadan',
  'Birrul Walidain', 'Doa & Dzikir', 'Haji & Umrah',
  'Idul Fitri & Silaturahmi', 'Ilmu & Pendidikan', 'Iman & Akidah',
  'Isra\' Mi\'raj', 'Istiqomah & Konsisten', 'Kejujuran & Amanah',
  'Keluarga', 'Kepemimpinan & Keadilan', 'Kesehatan & Thibbun Nabawi',
  'Kesehatan Jiwa & Qalbu', 'Kisah Para Nabi', 'Memaafkan & Menahan Marah',
  'Mendidik Anak', 'Menjaga Lisan', 'Muamalah & Jual Beli',
  'Muhasabah & Introspeksi', 'Optimisme & Harapan',
  'Penciptaan & Tanda Kebesaran Allah', 'Pernikahan & Rumah Tangga',
  'Puasa & Ramadan', 'Rezeki & Kerja', 'Sabar & Syukur',
  'Shalat', 'Sosial & Masyarakat', 'Taubat & Ampunan',
  'Tawadhu & Rendah Hati', 'Ukhuwah & Persaudaraan', 'Zakat & Sedekah'
]

async function labelHaditsWithAI(
  perawi: string,
  nomor: string,
  arab: string,
  terjemah: string,
  topikNamaExisting: string
): Promise<{
  tags: string[]
  topik_utama: string
  konteks_hadits: {
    ringkasan: string
    sebab_wurud: string
    pelajaran: string
    aplikasi: string
  }
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    temperature: 0.3,
    messages: [{
      role: 'system',
      content: `Kamu adalah pakar hadits dan Islamic studies Indonesia.
Respond ONLY dengan valid JSON tanpa markdown.`
    }, {
      role: 'user',
      content: `Analisis hadits berikut dan berikan label yang TEPAT dan KOMBINATIF.

HADITS: ${perawi} No. ${nomor}
Arab: ${arab?.slice(0, 200) ?? ''}
Terjemah: ${terjemah}
Topik existing: ${topikNamaExisting}

DAFTAR TOPIK YANG TERSEDIA:
${TOPIK_LIST.join(', ')}

ATURAN LABELING:
1. Pilih 2-4 topik yang BENAR-BENAR relevan
2. KOMBINASIKAN jika hadits membahas lebih dari 1 konsep
   Contoh: hadits tentang sedekah dengan ikhlas → 
   tags: ["Zakat & Sedekah", "Akhlak Mulia"]
3. topik_utama = topik PALING DOMINAN dari hadits ini
4. JANGAN pilih topik yang hanya "menyentuh" secara tidak langsung

Respond dengan JSON:
{
  "tags": ["topik1", "topik2"],
  "topik_utama": "topik paling dominan",
  "konteks_hadits": {
    "ringkasan": "pesan utama hadits dalam 1 kalimat",
    "sebab_wurud": "konteks/situasi hadits disampaikan (jika diketahui, jika tidak tulis 'Umum')",
    "pelajaran": "hikmah/pelajaran utama dari hadits ini",
    "aplikasi": "contoh penerapan praktis dalam kehidupan sehari-hari"
  }
}`
    }]
  })

  const text = response.choices[0].message.content ?? '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function main() {
  console.log('🚀 Starting hadits konteks seeding...')
  
  const BATCH_LIMIT = parseInt(process.env.BATCH_LIMIT ?? '500')
  
  // Count sisa yang belum sebelum run
  const { count: totalBelumRaw, error: countErr } = await supabase
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .is('konteks_hadits', null)
    
  if (countErr) {
    console.error('Error count sisa hadits:', countErr)
  }
  const totalBelum = totalBelumRaw ?? 0
  
  // Fetch hadits yang belum punya konteks_hadits
  const { data: haditsData, error } = await supabase
    .from('hadits_topik_index')
    .select('id, perawi, nomor, arab, terjemah, topik_nama, tags')
    .is('konteks_hadits', null)
    .limit(BATCH_LIMIT)
  
  if (error) {
    console.error('Error fetch hadits:', error)
    return
  }
  
  console.log(`📊 Total hadits belum ter-label: ${totalBelum}`)
  console.log(`⚙️ Mengambil ${haditsData?.length} hadits untuk batch run ini (Limit: ${BATCH_LIMIT})`)
  
  // Batch proses 10 hadits sekaligus
  const BATCH_SIZE = 10
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < (haditsData?.length ?? 0); i += BATCH_SIZE) {
    const batch = haditsData!.slice(i, i + BATCH_SIZE)
    
    await Promise.all(batch.map(async (hadits) => {
      try {
        const label = await labelHaditsWithAI(
          hadits.perawi,
          hadits.nomor,
          hadits.arab,
          hadits.terjemah,
          hadits.topik_nama
        )
        
        await supabase
          .from('hadits_topik_index')
          .update({
            tags: label.tags,
            topik_nama: label.topik_utama,
            konteks_hadits: label.konteks_hadits
          })
          .eq('id', hadits.id)
        
        successCount++
        process.stdout.write('.')
      } catch (e) {
        errorCount++
        process.stdout.write('x')
      }
    }))
    
    // Rate limit: tunggu 500ms antar batch
    await new Promise(r => setTimeout(r, 500))
    
    if ((i + BATCH_SIZE) % 100 === 0) {
      console.log(`\n✅ Progress: ${successCount} processed, ${errorCount} failed`)
    }
  }
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`✅ Berhasil: ${successCount}`)
  console.log(`❌ Gagal: ${errorCount}`)
  console.log(`⏭️ Sisa yang belum: ${totalBelum - successCount}`)
  console.log(`🔄 Jalankan workflow lagi untuk lanjutkan`)
}

main().catch(console.error)
