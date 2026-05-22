import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .contains('tags', ['Mendidik Anak'])
    .neq('topik_nama', 'Mendidik Anak')
  
  console.log(`Total: ${data?.length}`)
  
  const keywords = ['anak', 'mendidik', 'pendidikan anak', 'membesarkan', 'generasi', 'cukur rambut', 'aqiqah', 'nama anak']
  let updated = 0
  
  for (const h of data ?? []) {
    const ringkasan = (h.konteks_hadits?.ringkasan ?? '').toLowerCase()
    const isRelevant = keywords.some(k => ringkasan.includes(k))
    if (isRelevant) {
      await sb.from('hadits_topik_index').update({ topik_nama: 'Mendidik Anak' }).eq('id', h.id)
      updated++
      console.log(`✅ ${h.topik_nama} → Mendidik Anak | ${h.konteks_hadits?.ringkasan?.slice(0,60)}`)
    } else {
      console.log(`⏭ Skip: ${h.topik_nama} | ${h.konteks_hadits?.ringkasan?.slice(0,60)}`)
    }
  }
  console.log(`\nUpdated: ${updated}`)
}
main()
