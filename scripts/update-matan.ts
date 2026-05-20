import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { ekstrakIntiHadits } from '../src/lib/ekstrak-inti-hadits'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🚀 Update kolom matan (BULK MODE - Full Schema)...')

  // Ambil total dulu
  const { count } = await supabase
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
  console.log(`📊 Total hadits: ${count}`)

  let offset = 0
  const BATCH = 150 // sedikit lebih kecil agar payload tidak terlalu besar
  let total = 0

  while (true) {
    const { data, error } = await supabase
      .from('hadits_topik_index')
      .select('*') // ambil semua kolom agar upsert tidak melanggar not-null constraint
      .order('id')
      .range(offset, offset + BATCH - 1)

    if (error) {
      console.error('❌ Fetch error:', error.message)
      break
    }
    if (!data?.length) break

    console.log(`📦 Batch ${Math.floor(offset/BATCH) + 1}: ${data.length} hadits...`)

    // Siapkan data untuk upsert
    const updates = data.map(h => ({
      ...h, // sebarkan semua kolom asal
      matan: ekstrakIntiHadits(h.terjemah ?? '')
    }))

    const { error: upsertError } = await supabase
      .from('hadits_topik_index')
      .upsert(updates, { onConflict: 'id' })

    if (upsertError) {
      console.error(`❌ Upsert error batch ${offset}:`, upsertError.message)
      // Fallback: update satu per satu jika bulk gagal
      console.log('🔄 Menjalankan fallback satu per satu untuk batch ini...')
      for (const u of updates) {
        const { error: e } = await supabase
          .from('hadits_topik_index')
          .update({ matan: u.matan })
          .eq('id', u.id)
        if (e) console.error(`  ❌ Failed id ${u.id}:`, e.message)
      }
    }

    total += data.length
    const persen = Math.round(total * 100 / (count ?? 5518))
    console.log(`✅ Progress: ${total}/${count} (${persen}%)`)

    offset += BATCH
  }

  // Verifikasi hasil
  const { data: stats } = await supabase
    .from('hadits_topik_index')
    .select('matan')
    .limit(1000)

  const pendek = stats?.filter(h => (h.matan?.length ?? 0) < 50).length ?? 0
  console.log(`\n🎉 Selesai! Total: ${total} hadits`)
  console.log(`⚠️ Matan pendek (<50 char) dari sample 1000: ${pendek}`)
}

main().catch(console.error)
