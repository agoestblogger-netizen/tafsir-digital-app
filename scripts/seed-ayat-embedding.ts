import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const BATCH_SIZE = 20  // proses 20 ayat sekaligus
const DELAY_MS = 1000   // jeda 1000ms antar batch (hindari rate limit)

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // 1536 dimensi, murah & akurat
    input: text,
  })
  return response.data[0].embedding
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function seedEmbeddings() {
  console.log("🚀 Mulai seed embedding ayat Al-Qur'an...")

  // Ambil ayat yang belum punya embedding
  const { data: ayatList, error } = await supabase
    .from('ayat_quran_index')
    .select('id, surah_id, surah_nama, nomor_ayat, terjemah, tags')
    .is('embedding', null)
    .order('surah_id', { ascending: true })
    .order('nomor_ayat', { ascending: true })
    .limit(7000)

  if (error) {
    console.error('Error fetch ayat:', error)
    return
  }

  console.log(`📖 Total ayat perlu di-embed: ${ayatList.length}`)

  let successCount = 0
  let errorCount = 0

  // Proses per batch
  for (let i = 0; i < ayatList.length; i += BATCH_SIZE) {
    const batch = ayatList.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatch = Math.ceil(ayatList.length / BATCH_SIZE)
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatch} (ayat ${i+1}-${Math.min(i+BATCH_SIZE, ayatList.length)})`)

    for (const ayat of batch) {
      let retries = 3
      let success = false
      
      while (retries > 0 && !success) {
        try {
          const tagsStr = Array.isArray(ayat.tags) ? ayat.tags.join(', ') : ''
          const inputText = [
            `Surah ${ayat.surah_nama} ayat ${ayat.nomor_ayat}`,
            ayat.terjemah,
            tagsStr ? `Tema: ${tagsStr}` : ''
          ].filter(Boolean).join('. ')

          const embedding = await generateEmbedding(inputText)

          const { error: updateError } = await supabase
            .from('ayat_quran_index')
            .update({ embedding })
            .eq('id', ayat.id)

          if (updateError) throw updateError

          successCount++
          process.stdout.write('.')
          success = true

        } catch (err: any) {
          retries--
          if (retries > 0) {
            process.stdout.write('r') // 'r' = retry
            await sleep(1000 * (4 - retries)) // backoff: 1s, 2s, 3s
          } else {
            errorCount++
            console.error(`\n❌ Error ayat ${ayat.surah_id}:${ayat.nomor_ayat}:`, err?.message ?? err)
          }
        }
      }
      
      // Jeda kecil antar ayat untuk hindari rate limit
      await sleep(100)
    }
    
    console.log(`\n✅ Batch ${batchNum} selesai — total: ${successCount} sukses, ${errorCount} error`)
    
    // Jeda antar batch
    if (i + BATCH_SIZE < ayatList.length) {
      console.log(`⏳ Jeda ${DELAY_MS}ms...`)
      await sleep(DELAY_MS)
    }
  }

  console.log('\n🎉 Selesai!')
  console.log(`✅ Sukses: ${successCount}`)
  console.log(`❌ Error: ${errorCount}`)
  console.log(`📊 Total: ${successCount + errorCount}`)
}

seedEmbeddings().catch(console.error)
