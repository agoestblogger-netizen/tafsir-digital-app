import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Ambil hadits range 0-9 persis seperti yang diproses batch 1
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama')
    .range(0, 9)
  
  console.log('Batch 1 hadits (range 0-9):')
  data?.forEach(h => {
    console.log(` ${h.topik_nama}`)
  })
  
  // Cek juga topik baru yang harusnya ada
  const { count: thaharah } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .eq('topik_nama', 'Thaharah & Kebersihan')
  
  const { count: fikih } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .eq('topik_nama', 'Fikih Wanita')

  console.log(`\nThaharah & Kebersihan: ${thaharah}`)
  console.log(`Fikih Wanita: ${fikih}`)
}
main()
