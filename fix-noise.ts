import { createClient } from '@supabase/supabase-js'
async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await sb.from('hadits_topik_index').update({ topik_nama: 'Akhlak Mulia' }).eq('topik_nama', 'Akhak Mulia')
  await sb.from('hadits_topik_index').update({ topik_nama: 'Warisan & Wasiat' }).eq('topik_nama', 'Warisan')
  await sb.from('hadits_topik_index').update({ topik_nama: 'Jihad & Dakwah' }).eq('topik_nama', 'Hijrah')
  console.log('Done!')
}
main()
