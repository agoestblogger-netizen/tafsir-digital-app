import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const topikTest = ['Thaharah & Kebersihan', 'Fikih Wanita', 'Jihad & Dakwah', 'Taubat & Ampunan', 'Birrul Walidain']
  
  for (const topik of topikTest) {
    const { data, count } = await sb
      .from('hadits_topik_index')
      .select('topik_nama, konteks_hadits', { count: 'exact' })
      .eq('topik_nama', topik)
      .limit(2)
    
    console.log(`\n=== ${topik} (total: ${count}) ===`)
    data?.forEach(h => {
      console.log(` - ${h.konteks_hadits?.ringkasan?.slice(0, 80)}...`)
    })
  }
}
main()
