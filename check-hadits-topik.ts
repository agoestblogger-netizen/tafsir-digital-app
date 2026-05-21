import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const temaList = ['Sabar & Syukur', 'Birrul Walidain', 'Taubat & Ampunan', 'Ikhlas', 'Ukhuwah & Persaudaraan']
  
  for (const tema of temaList) {
    // Cara B: tag matching
    const { data: byTag } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, tags')
      .contains('tags', [tema])
      .limit(10)
    
    // Cara C: topik_nama fuzzy
    const { data: byTopik } = await sb
      .from('hadits_topik_index')
      .select('id, topik_nama, tags')
      .ilike('topik_nama', `%${tema}%`)
      .limit(10)

    console.log(`\n=== ${tema} ===`)
    console.log(`Tag match: ${byTag?.length ?? 0} hadits`)
    console.log(`Topik match: ${byTopik?.length ?? 0} hadits`)
  }
}
main()
