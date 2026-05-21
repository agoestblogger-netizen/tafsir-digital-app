import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const backup = JSON.parse(fs.readFileSync('backup-topik-2026-05-21.json', 'utf8'))
  console.log(`🔄 Rollback ${backup.length} hadits...`)
  let restored = 0
  for (let i = 0; i < backup.length; i += 50) {
    const batch = backup.slice(i, i + 50)
    await Promise.all(batch.map((h: any) =>
      sb.from('hadits_topik_index')
        .update({ topik_nama: h.topik_nama, tags: h.tags })
        .eq('id', h.id)
    ))
    restored += batch.length
    if (restored % 500 === 0) console.log(`✅ ${restored}/${backup.length}`)
  }
  console.log('🎉 Rollback selesai!')
}
main()
