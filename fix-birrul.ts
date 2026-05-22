import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Ambil semua hadits bertag Birrul Walidain tapi topik_nama bukan Birrul Walidain
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .contains('tags', ['Birrul Walidain'])
    .neq('topik_nama', 'Birrul Walidain')
  
  console.log(`Total: ${data?.length}`)
  
  // Hanya update yang memang tentang orang tua/berbakti
  const keywords = ['orang tua', 'berbakti', 'ibu', 'bapak', 'ayah', 'wasiat orang', 'birrul']
  let updated = 0
  
  for (const h of data ?? []) {
    const ringkasan = (h.konteks_hadits?.ringkasan ?? '').toLowerCase()
    const isRelevant = keywords.some(k => ringkasan.includes(k))
    
    if (isRelevant) {
      await sb.from('hadits_topik_index')
        .update({ topik_nama: 'Birrul Walidain' })
        .eq('id', h.id)
      updated++
      console.log(`✅ Updated: ${h.topik_nama} → Birrul Walidain | ${h.konteks_hadits?.ringkasan?.slice(0,60)}`)
    } else {
      console.log(`⏭ Skip: ${h.topik_nama} | ${h.konteks_hadits?.ringkasan?.slice(0,60)}`)
    }
  }
  console.log(`\nUpdated: ${updated}`)
}
main()
