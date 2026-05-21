import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data } = await sb.from('hadits_topik_index').select('topik_nama').limit(10000)
  const count: Record<string, number> = {}
  data?.forEach((h: any) => { count[h.topik_nama] = (count[h.topik_nama] || 0) + 1 })
  const sorted = Object.entries(count).sort((a,b) => b[1]-a[1])
  sorted.forEach(([k,v]) => console.log(v, k))
}
main()
