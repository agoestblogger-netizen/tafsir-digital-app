import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Database Fallback
async function queryJudulBankFallback(topik: string): Promise<string[]> {
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Stopwords for keyword extraction
    const STOPWORDS = new Set([
      'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan',
      'pada', 'adalah', 'ini', 'itu', 'atau', 'juga', 'serta',
      'tentang', 'dalam', 'oleh', 'maka', 'akan', 'telah',
      'sudah', 'dapat', 'bisa', 'ada', 'saat', 'ketika',
      'makna', 'pentingnya', 'keutamaan', 'bahaya', 'hikmah',
      'bagi', 'agar', 'itu', 'setiap', 'bukan', 'lebih',
    ])

    const keywords = topik
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !STOPWORDS.has(w))

    if (keywords.length === 0) return []

    const orConditions = keywords
      .slice(0, 5)
      .flatMap((kw: string) => [`topik.ilike.%${kw}%`, `judul.ilike.%${kw}%`])
      .join(',')

    const { data: results } = await supabase
      .from('kultum_judul_bank')
      .select('judul, topik')
      .or(orConditions)
      .limit(20)

    const pool = results ?? []
    if (pool.length === 0) return []

    const scored = pool.map((r: any) => {
      const haystack = (r.judul + ' ' + r.topik).toLowerCase()
      const score = keywords.filter((kw: string) => haystack.includes(kw)).length
      return { judul: r.judul, score }
    })

    return scored
      .sort((a: any, b: any) => b.score - a.score)
      .map((r: any) => r.judul)
      .slice(0, 5)
  } catch (err) {
    console.error('queryJudulBankFallback error:', err)
    return []
  }
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 10000 // 10s timeout
})

export async function POST(req: Request) {
  try {
    const { topik, referensi, karakter } = await req.json()
    const refs = Array.isArray(referensi) ? referensi : []

    // 1. Ekstrak detail lengkap referensi untuk pemahaman AI
    const konteksReferensi = refs
      .map((r: any) => {
        const d = r.data ?? r
        const judul = r.judul ?? d.judul ?? ''
        const tipe = r.type ?? ''
        const topikName = d.topik_nama ?? d.topik_utama ?? ''

        let detail = `Tipe: ${tipe}\nJudul/Sumber: ${judul}\n`
        if (topikName) detail += `Topik: ${topikName}\n`

        if (tipe === 'ayat_quran_db' || d.teks_arab || d.nomor_ayat) {
          detail += `Teks Arab: ${d.teks_arab ?? ''}\nTerjemah: "${d.terjemah ?? ''}"`
        } else if (tipe === 'hadits' || d.matan || d.perawi) {
          detail += `Matan Arab: ${d.arab ?? d.matan ?? ''}\nTerjemah: "${d.terjemah ?? ''}"\nPerawi: ${d.perawi ?? ''}\nNomor: ${d.nomor ?? d.no_hadits ?? ''}`
        } else {
          detail += `Isi/Terjemah: "${d.terjemah ?? d.deskripsi_singkat ?? JSON.stringify(d)}"`
        }
        return detail
      })
      .filter(Boolean)
      .join('\n\n')

    let toneKarakter = ""
    if (karakter === 'sains') {
      toneKarakter = "\n- Sesuaikan tone judul agar terasa ilmiah-religius, berfokus pada mukjizat Al-Qur'an & sains modern.\n"
    } else if (karakter === 'kisah') {
      toneKarakter = "\n- Sesuaikan tone judul agar terasa naratif, berfokus pada inspirasi kisah dan keteladanan kaum/nabi terdahulu.\n"
    } else {
      toneKarakter = "\n- Sesuaikan tone judul agar terasa religius dan praktis, berfokus pada akhlak & ibadah sehari-hari.\n"
    }

    const prompt = `Kamu adalah asisten AI yang ahli dalam menyusun judul kultum/ceramah Islam yang menarik, spesifik, dan tidak klise.
${toneKarakter}
TUGAS UTAMA:
Generate 5 rekomendasi judul kultum berdasarkan referensi (ayat/hadits) yang dipilih oleh user.

Topik Bahasan Umum: ${topik}

REFERENSI YANG DIPILIH USER:
${konteksReferensi}

INSTRUKSI (WAJIB DIPATUHI KETAT):
1. Baca semua referensi yang dipilih user secara utuh (terjemah/matan) dan pahami pesan utama dari setiap referensi.
2. Jika referensi-referensi tersebut BERKAITAN: generate 5 judul unified (menyatu) yang mencerminkan pesan gabungan dari referensi tersebut.
3. Jika referensi-referensi tersebut TIDAK BERKAITAN: generate 5 judul dengan format "[Tema A] dan [Tema B]" berdasarkan isi referensi tersebut.
4. Judul harus spesifik, menarik, dan layak untuk kultum/ceramah Islam. Jangan buat judul yang terlalu umum atau generik.
5. Output HANYA berupa JSON object dengan key "judul" berisi array 5 string judul, tidak ada teks penjelasan lain di luar JSON.

Contoh Output:
{
  "judul": ["Judul Kultum 1", "Judul Kultum 2", "Judul Kultum 3", "Judul Kultum 4", "Judul Kultum 5"]
}`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 300,
      })

      const text = completion.choices[0].message.content ?? '[]'
      const clean = text.replace(/```json|```/g, '').trim()
      
      const parsedObj = JSON.parse(clean)
      const parsedArray = Array.isArray(parsedObj.judul) ? parsedObj.judul : []

      if (parsedArray.length > 0) {
        return NextResponse.json({ judul: parsedArray.slice(0, 5) })
      }
      throw new Error('Parsed array is empty or invalid format')

    } catch (apiErr) {
      console.error('OpenAI GPT-4o-mini API failed or timed out. Falling back to database query. Error:', apiErr)
      const fallbackJudul = await queryJudulBankFallback(topik)
      return NextResponse.json({ judul: fallbackJudul })
    }

  } catch (err) {
    console.error('suggest-judul general error:', err)
    return NextResponse.json({ judul: [] })
  }
}
