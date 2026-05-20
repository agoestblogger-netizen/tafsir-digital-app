import OpenAI from 'openai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const KATEGORI_SAINS = [
  'Kosmologi', 'Biologi', 'Fisika', 'Geologi', 'Meteorologi',
  'Zoologi', 'Botani', 'Oseanografi', 'Embriologi', 'Astronomi'
]

const TOPIK_KULTUM_SAINS = [
  'Kebesaran Allah dalam alam semesta',
  'Penciptaan manusia dan embriologi',
  'Siklus air dan hujan',
  'Lebah dan madu',
  'Tumbuhan dan fotosintesis',
  'Laut dan samudra',
  'Gunung dan kerak bumi',
  'Bintang dan galaksi',
  'Angin dan atmosfer',
  'Hewan dan ekosistem'
]

async function generateAyatSains(startId: number): Promise<any[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah ahli tafsir ilmi (sains dalam Al-Qur'an) yang sangat paham hubungan ayat Al-Qur'an dengan ilmu pengetahuan modern.
Buat data ayat sains dari Al-Qur'an yang belum ada di list berikut (sudah ada: QS 21:30, 51:47, 86:6-7, 24:45, 16:68-69, 2:164, 41:11, 36:40, 39:21, 23:12-14, 78:6-7, 13:17, 30:48, 16:79, 55:19-20).
Response HANYA JSON array, tidak ada teks lain.`
      },
      {
        role: 'user',
        content: `Buat 10 item ayat sains Al-Qur'an dengan format PERSIS berikut:
[
  {
    "id": ${startId},
    "surah_id": 2,
    "surah_nama": "الْبَقَرَة",
    "surah_nama_latin": "Al-Baqarah",
    "nomor_ayat": "164",
    "teks_arab": "teks Arab ayat",
    "terjemahan": "terjemahan Indonesia",
    "topik_sains": "judul spesifik fenomena sains",
    "kategori": "salah satu dari: ${KATEGORI_SAINS.join(', ')}",
    "penjelasan": "penjelasan mendalam 3-4 kalimat hubungan ayat dengan sains modern",
    "tags": ["topik kultum 1", "topik kultum 2"],
    "videos": []
  }
]

Pastikan:
- Ayat yang dipilih benar-benar membahas fenomena alam/sains
- Penjelasan sains akurat dan relevan dengan penemuan modern
- tags berisi topik kultum yang relevan dari: Kebesaran Allah, Taqwa, Menuntut Ilmu, Syukur, Iman kepada Allah, Tafsir & Tadabur
- Gunakan surah yang berbeda-beda
- nomor_ayat adalah string`
      }
    ],
    max_tokens: 3000
  })

  const raw = response.choices[0].message.content ?? '[]'
  const clean = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch (e) {
    console.error('Parse error:', e)
    return []
  }
}

async function main() {
  console.log('🚀 Generate ayat sains baru...')

  // Generate 3 batch = 30 ayat baru
  const allNew: any[] = []
  for (let i = 0; i < 3; i++) {
    console.log(`📦 Batch ${i + 1}/3...`)
    const batch = await generateAyatSains(16 + (i * 10))
    allNew.push(...batch)
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`✅ Generated: ${allNew.length} ayat sains baru`)
  console.log('Sample:', JSON.stringify(allNew[0], null, 2).slice(0, 300))

  // Append ke file existing
  // const filePath = 'src/data/sains_ayat.ts'
  // const existing = fs.readFileSync(filePath, 'utf-8')

  // Log item baru siap di-append
  const newItemsFormatted = allNew.map(item => `  ${JSON.stringify(item, null, 2).replace(/^/gm, '  ').trim()},`).join('\n')

  console.log('\n📝 Item baru siap di-append (cek scripts/output-sains-ayat.json):')
  // console.log(newItemsFormatted.slice(0, 500))
  console.log('\n⚠️ Review dulu sebelum append ke file!')

  // Simpan ke file terpisah untuk review
  fs.writeFileSync('scripts/output-sains-ayat.json', JSON.stringify(allNew, null, 2))
  console.log('✅ Disimpan ke scripts/output-sains-ayat.json untuk review')
}

main().catch(console.error)
