import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .limit(5)

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Kamu adalah ahli hadits. Berikan label topik untuk hadits berikut.\n\nRingkasan: "${ringkasan}"\n\nTentukan:\n1. topik_nama: 1 topik utama (2-4 kata, Bahasa Indonesia)\n2. tags: 2-4 tag granular\n\nJawab HANYA JSON:\n{"topik_nama": "...", "tags": ["...", "..."]}` }],
      max_tokens: 100,
      temperature: 0.1,
    })
    const text = res.choices[0].message.content ?? '{}'
    const label = JSON.parse(text.replace(/```json|```/g, '').trim())
    console.log('LAMA:', h.topik_nama, h.tags)
    console.log('BARU:', label.topik_nama, label.tags)
    console.log('---')
  }
}
main()
