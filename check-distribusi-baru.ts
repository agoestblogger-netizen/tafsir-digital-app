import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const allPages: any[] = []
  let offset = 0
  while (true) {
    const { data } = await sb.from('hadits_topik_index').select('topik_nama').range(offset, offset + 999)
    if (!data || data.length === 0) break
    allPages.push(...data)
    offset += 1000
  }
  const count: Record<string, number> = {}
  allPages.forEach((h: any) => { count[h.topik_nama] = (count[h.topik_nama] || 0) + 1 })
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
  console.log(`Total topik unik: ${sorted.length} | Total hadits: ${allPages.length}\n`)
  sorted.forEach(([k, v]) => console.log(`${v.toString().padStart(5)}  ${k}`))
}
main()
