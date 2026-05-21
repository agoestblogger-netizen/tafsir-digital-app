import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { count: withKonteks } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .not('konteks_hadits', 'is', null)

  const { count: total } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })

  console.log('Total hadits:', total)
  console.log('Punya konteks_hadits:', withKonteks)
  console.log('Belum punya konteks:', (total! - withKonteks!))
}
main()
