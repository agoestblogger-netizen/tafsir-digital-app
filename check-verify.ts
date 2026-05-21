import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Cek hadits pertama yang seharusnya sudah di-relabel
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, konteks_hadits')
    .limit(5)
  
  console.log('Sample 5 hadits pertama di DB:')
  data?.forEach(h => {
    console.log(` ID: ${h.id.slice(0,8)}... | Topik: ${h.topik_nama}`)
  })
}
main()
