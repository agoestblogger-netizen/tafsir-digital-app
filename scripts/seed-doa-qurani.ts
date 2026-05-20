import OpenAI from 'openai'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

async function generateDoaQurani(batch: number): Promise<any[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah ahli Al-Qur'an yang sangat paham doa-doa dalam Al-Qur'an beserta konteks dan keutamaannya.
Buat data doa-doa dari Al-Qur'an yang belum ada di list berikut:
Sudah ada: QS 2:201, 3:8, 3:16, 3:53, 2:286, 14:40, 14:41, 17:24, 18:10, 23:118, 25:74, 26:83, 27:19, 59:10, 3:147.
Response HANYA JSON array valid, tidak ada teks lain di luar JSON.`
      },
      {
        role: 'user',
        content: `Buat 10 doa Al-Qur'an dengan format PERSIS berikut (batch ${batch}):
[
  {
    "id": "rabbana-${batch}01",
    "judul": "Judul doa yang deskriptif",
    "kategori": "rabbana",
    "arab": "teks Arab doa",
    "latin": "transliterasi latin",
    "terjemah": "terjemahan Indonesia",
    "surah_id": 2,
    "surah_nama": "Al-Baqarah",
    "nomor_ayat": "201",
    "referensi": "QS. Al-Baqarah: 201",
    "konteks": "kapan dan bagaimana doa ini digunakan dalam kehidupan sehari-hari",
    "keutamaan": "keutamaan membaca doa ini",
    "mustajab": true,
    "tema_hajat": ["rezeki", "keluarga", "taubat"],
    "tags": ["Doa & Munajat", "Taqwa", "Syukur"]
  }
]

Aturan:
- kategori harus salah satu: "rabbana", "rabbi", "nabi", "hajat"
- tema_hajat dari: rezeki, keluarga, taubat, perlindungan, ilmu, kesehatan, hidayah, jodoh, anak, karir, hutang, musibah
- tags dari 102 topik kultum seperti: Doa & Munajat, Taqwa, Syukur, Sabar, Tawakkal, Birrul Walidain, Keluarga, dll
- Pilih doa yang berbeda-beda dari berbagai surah
- arab, latin, terjemah harus akurat sesuai Al-Qur'an
- mustajab: true jika doa ini terkenal sangat mustajab`
      }
    ],
    max_tokens: 3000
  })

  const raw = response.choices[0].message.content ?? '[]'
  const clean = raw.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch (e) {
    console.error(`Parse error batch ${batch}:`, e)
    return []
  }
}

async function main() {
  console.log("🚀 Generate doa Qur'ani baru...")

  const allNew: any[] = []
  for (let i = 1; i <= 3; i++) {
    console.log(`📦 Batch ${i}/3...`)
    const batch = await generateDoaQurani(i)
    console.log(`  ✅ ${batch.length} doa di-generate`)
    allNew.push(...batch)
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✅ Total: ${allNew.length} doa baru`)
  console.log('Sample:', JSON.stringify(allNew[0], null, 2).slice(0, 400))

  // Simpan untuk review dulu
  fs.writeFileSync('scripts/output-doa-qurani.json', JSON.stringify(allNew, null, 2))
  console.log('✅ Disimpan ke scripts/output-doa-qurani.json untuk review')
}

main().catch(console.error)
