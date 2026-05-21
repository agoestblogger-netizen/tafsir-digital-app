import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SISTEM = `Kamu adalah sistem klasifikasi hadits Islam. Tugasmu memberi label topik hadits dalam Bahasa Indonesia.

ATURAN KETAT:
1. topik_nama: MAKSIMAL 3 kata, Title Case, tema utama (contoh: "Shalat Berjamaah", "Taubat & Ampunan", "Birrul Walidain")
2. tags: 2-4 tag, Title Case, spesifik tapi tidak terlalu detail (contoh: "Shalat", "Waktu Shalat", "Taubat", "Doa")
3. Gunakan istilah Islam yang umum dikenal
4. JANGAN gunakan kata generik seperti "Hadits", "Rasulullah", "Islam" sebagai tag
5. Jawab HANYA JSON tanpa penjelasan apapun`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .limit(10)

  for (const h of data ?? []) {
    const ringkasan = h.konteks_hadits?.ringkasan ?? ''
    const pelajaran = h.konteks_hadits?.pelajaran ?? ''
    
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SISTEM },
        { role: 'user', content: `Ringkasan: "${ringkasan}"\nPelajaran: "${pelajaran}"\n\nJSON:` }
      ],
      max_tokens: 80,
      temperature: 0.1,
    })
    
    const text = res.choices[0].message.content ?? '{}'
    try {
      const label = JSON.parse(text.replace(/```json|```/g, '').trim())
      console.log('LAMA:', h.topik_nama)
      console.log('BARU:', label.topik_nama, '|', label.tags)
      console.log('---')
    } catch {
      console.log('PARSE ERROR:', text)
    }
  }
}
main()
