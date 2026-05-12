import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { data } = await supabase.from('hadist_penguat').select('*').eq('surah_id', 2).eq('ayat_number', 43)
  console.log(data)
}
check()
