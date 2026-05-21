import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TOPIK_UTAMA = [
  "Shalat", "Haji & Umrah", "Puasa & Ramadan", "Zakat & Sedekah",
  "Keluarga", "Pernikahan & Rumah Tangga", "Birrul Walidain", "Mendidik Anak",
  "Akhlak Mulia", "Kejujuran & Amanah", "Sabar & Syukur", "Taubat & Ampunan",
  "Ilmu & Pendidikan", "Rezeki & Kerja", "Akhirat & Kiamat", "Iman & Akidah",
  "Doa & Dzikir", "Ukhuwah & Persaudaraan", "Kepemimpinan & Keadilan",
  "Muamalah & Jual Beli", "Kesehatan & Thibbun Nabawi", "Kisah Para Nabi",
  "Ikhlas & Niat", "Tawakkal & Sabar", "Adab & Sopan Santun",
  "Larangan & Dosa Besar", "Keutamaan Ibadah", "Sedekah & Infak"
]

const CONTOH = `
CONTOH LABEL YANG BAIK:
- Ringkasan: "Hadits tentang keutamaan shalat berjamaah di masjid"
  → {"topik_nama": "Shalat", "tags": ["Shalat Berjamaah", "Keutamaan Masjid", "Pahala Berlipat"]}

- Ringkasan: "Hadits tentang berbakti kepada orang tua dan larangan durhaka"
  → {"topik_nama": "Birrul Walidain", "tags": ["Berbakti Orang Tua", "Larangan Durhaka", "Ridha Allah"]}

- Ringkasan: "Hadits tentang ancaman bagi orang yang tidak menunaikan zakat"
  → {"topik_nama": "Zakat & Sedekah", "tags": ["Zakat Mal", "Ancaman Meninggalkan Zakat", "Harta"]}

- Ringkasan: "Hadits tentang keutamaan membaca istighfar dan bertaubat"
  → {"topik_nama": "Taubat & Ampunan", "tags": ["Istighfar", "Taubat Nasuha", "Ampunan Allah"]}

- Ringkasan: "Hadits tentang larangan menimbun barang dan dampaknya"  
  → {"topik_nama": "Muamalah & Jual Beli", "tags": ["Larangan Ihtikar", "Keadilan Ekonomi", "Dosa Menimbun"]}`

const SISTEM = `Kamu adalah sistem klasifikasi hadits Islam yang presisi.

DAFTAR TOPIK (pilih SATU yang paling tepat):
${TOPIK_UTAMA.join(', ')}

${CONTOH}

ATURAN TAG:
- 2-4 tag, Title Case
- Gunakan istilah fiqh/Islam yang spesifik
- JANGAN gunakan: "Sunnah", "Hadits", "Rasulullah", "Islam", "Ibadah", "Ajaran"
- Tag harus nama konsep konkret, bukan deskripsi umum

Jawab HANYA JSON: {"topik_nama": "...", "tags": ["...", "..."]}`

async function main() {
  const { data } = await sb
    .from('hadits_topik_index')
    .select('id, topik_nama, tags, konteks_hadits')
    .limit(15)

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
