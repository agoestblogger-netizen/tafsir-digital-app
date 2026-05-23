import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, matan, konteks_hadits')
    .or('matan.ilike.%surga%,matan.ilike.%istri%')
    .limit(10)
  data?.forEach(h => console.log(h.topik_nama, '|', h.matan?.slice(0,100)))
}
main()
