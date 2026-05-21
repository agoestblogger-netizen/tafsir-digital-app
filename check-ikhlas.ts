import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // Cari tag yang mirip "ikhlas"
  const { data } = await sb
    .from('hadits_topik_index')
    .select('tags')
    .limit(100)
  
  const allTags = new Set<string>()
  data?.forEach((h: any) => h.tags?.forEach((t: string) => {
    if (t.toLowerCase().includes('ikhlas') || t.toLowerCase().includes('niat') || t.toLowerCase().includes('tulus')) {
      allTags.add(t)
    }
  }))
  
  console.log('Tags mirip ikhlas:', [...allTags])
}
main()
