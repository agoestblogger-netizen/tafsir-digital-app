import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  const { count } = await sb
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
  
  console.log('Total hadits:', count)
  console.log('Estimasi token OpenAI: ~', (count! * 200).toLocaleString(), 'tokens')
  console.log('Estimasi biaya (gpt-4o-mini): ~$', ((count! * 200 / 1000000) * 0.15).toFixed(3))
}
main()
