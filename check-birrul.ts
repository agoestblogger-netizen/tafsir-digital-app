import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Cek hadits yang tags-nya Birrul Walidain tapi topik_nama bukan Birrul Walidain
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .contains('tags', ['Birrul Walidain'])
    .neq('topik_nama', 'Birrul Walidain')
    .limit(10)
  
  console.log(`Hadits bertag Birrul Walidain tapi topik lain: ${data?.length}`)
  data?.forEach(h => {
    console.log(`  topik: ${h.topik_nama} | ${h.konteks_hadits?.ringkasan?.slice(0,60)}`)
  })
}
main()
