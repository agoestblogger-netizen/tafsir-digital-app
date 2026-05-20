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

const BATCH_SIZE = 20
const DELAY_MS = 1000

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function seedHaditsEmbeddings() {
  console.log('🚀 Mulai seed embedding hadits...')

  const FORCE_RESEED = true

  const query = supabase
    .from('hadits_topik_index')
    .select('id, topik_nama, matan, terjemah, arab, tags, konteks_hadits')
    .limit(7000)

  if (!FORCE_RESEED) {
    query.is('embedding', null)
  }

  const { data: haditsList, error } = await query

  if (error) {
    console.error('Error fetch hadits:', error)
    return
  }

  console.log(`📖 Total hadits perlu di-embed: ${haditsList.length}`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < haditsList.length; i += BATCH_SIZE) {
    const batch = haditsList.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatch = Math.ceil(haditsList.length / BATCH_SIZE)

    console.log(`\n📦 Batch ${batchNum}/${totalBatch} (hadits ${i+1}-${Math.min(i+BATCH_SIZE, haditsList.length)})`)

    for (const hadits of batch) {
      let retries = 3
      let success = false

      while (retries > 0 && !success) {
        try {
          const tagsStr = Array.isArray(hadits.tags) 
            ? hadits.tags.join(', ') : ''
          
          const konteks = hadits.konteks_hadits as any
          const inputText = [
            `Topik utama: ${hadits.topik_nama}`,
            tagsStr ? `Tema terkait: ${tagsStr}` : '',
            konteks?.ringkasan ? `Ringkasan: ${konteks.ringkasan}` : '',
            konteks?.pelajaran ? `Pelajaran: ${konteks.pelajaran}` : '',
            `Isi hadits: ${hadits.terjemah ?? hadits.matan ?? ''}`
          ].filter(Boolean).join('. ')

          const embedding = await generateEmbedding(inputText)

          const { error: updateError } = await supabase
            .from('hadits_topik_index')
            .update({ embedding })
            .eq('id', hadits.id)

          if (updateError) throw updateError

          successCount++
          process.stdout.write('.')
          success = true

        } catch (err: any) {
          retries--
          if (retries > 0) {
            process.stdout.write('r')
            await sleep(1000 * (4 - retries))
          } else {
            errorCount++
            console.error(`\n❌ Error hadits ${hadits.id}:`, err?.message ?? err)
          }
        }
      }

      await sleep(100)
    }

    console.log(`\n✅ Batch ${batchNum} selesai — total: ${successCount} sukses, ${errorCount} error`)

    if (i + BATCH_SIZE < haditsList.length) {
      console.log(`⏳ Jeda ${DELAY_MS}ms...`)
      await sleep(DELAY_MS)
    }
  }

  console.log('\n🎉 Selesai!')
  console.log(`✅ Sukses: ${successCount}`)
  console.log(`❌ Error: ${errorCount}`)
  console.log(`📊 Total: ${successCount + errorCount}`)
}

seedHaditsEmbeddings().catch(console.error)
