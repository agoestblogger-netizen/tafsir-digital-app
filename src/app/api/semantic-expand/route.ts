import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as crypto from 'crypto'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

function hashTema(tema: string): string {
  return crypto
    .createHash('md5')
    .update(tema.toLowerCase().trim())
    .digest('hex')
}

const TOPIK_HADITS = [
  'Akhirat & Kiamat',
  'Akhlak Mulia',
  'Amal di Bulan Ramadan',
  'Birrul Walidain',
  'Doa & Dzikir',
  'Haji & Umrah',
  'Idul Fitri & Silaturahmi',
  'Ilmu & Pendidikan',
  'Iman & Akidah',
  "Isra' Mi'raj",
  'Istiqomah & Konsisten',
  'Kejujuran & Amanah',
  'Keluarga',
  'Kepemimpinan & Keadilan',
  'Kesehatan & Thibbun Nabawi',
  'Kesehatan Jiwa & Qalbu',
  'Kisah Para Nabi',
  'Memaafkan & Menahan Marah',
  'Mendidik Anak',
  'Menjaga Lisan',
  'Muamalah & Jual Beli',
  'Muhasabah & Introspeksi',
  'Optimisme & Harapan',
  'Penciptaan & Tanda Kebesaran Allah',
  'Pernikahan & Rumah Tangga',
  'Puasa & Ramadan',
  'Rezeki & Kerja',
  'Sabar & Syukur',
  'Shalat',
  'Sosial & Masyarakat',
  'Taubat & Ampunan',
  'Tawadhu & Rendah Hati',
  'Ukhuwah & Persaudaraan',
  'Zakat & Sedekah'
]

interface ExpandedTema {
  keywords: string[]
  konsep_terkait: string[]
  sinonim: string[]
  topik_hadits: string[]
  ayat_relevan: Array<{ surah_id: number; nomor_ayat: number }>
  konteks: string
}

async function expandTemaWithAI(tema: string): Promise<ExpandedTema> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah pakar Islamic studies dan semantik bahasa Indonesia.
Tugasmu adalah memperluas konteks tema kultum Islam untuk 
membantu sistem menemukan referensi Al-Qur'an dan hadits yang relevan.
Respond ONLY dengan valid JSON, tanpa markdown atau penjelasan.`
      },
      {
        role: 'user',
        content: `Perluas konteks tema kultum berikut:
TEMA: "${tema}"

Dari daftar topik hadits berikut, pilih yang PALING RELEVAN (max 5):
${TOPIK_HADITS.join(', ')}

Respond dengan JSON:
{
  "keywords": ["kata kunci 1", "kata kunci 2"],
  "konsep_terkait": ["konsep terkait 1", "konsep terkait 2"],
  "sinonim": ["sinonim/padanan kata tema"],
  "topik_hadits": ["Topik Hadits 1", "Topik Hadits 2"],
  "ayat_relevan": [
    {"surah_id": 2, "nomor_ayat": 261},
    {"surah_id": 65, "nomor_ayat": 3}
  ],
  "konteks": "penjelasan singkat konteks tema ini dalam 1 kalimat"
}

ATURAN:
- keywords: 3-5 kata kunci spesifik tema (huruf kecil)
- konsep_terkait: 3-5 konsep Islam yang berkaitan
- sinonim: 2-3 kata padanan/sinonim tema
- topik_hadits: HANYA dari daftar yang diberikan, max 5
- ayat_relevan: 3-5 ayat Al-Qur'an yang PALING relevan dengan tema
- konteks: 1 kalimat ringkas`
      }
    ]
  })

  const text = response.choices[0].message.content ?? ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as ExpandedTema
}

// Pecah compound keywords menjadi kata individual untuk ilike query
// Contoh: "Sabar & Syukur" → ["sabar", "syukur", "sabar & syukur"]
// Contoh: "keutamaan sabar" → ["keutamaan", "sabar", "keutamaan sabar"]
function splitCompoundKeywords(keywords: string[]): string[] {
  const result = new Set<string>()
  for (const kw of keywords) {
    const original = kw.toLowerCase().trim()
    // Tambahkan versi asli
    if (original.length > 2) result.add(original)
    // Split by & dan /
    const byAmpersand = original.split(/[&\/]/).map((p: string) => p.trim())
    for (const part of byAmpersand) {
      if (part.length > 2) result.add(part)
      // Split lagi per spasi — ambil kata yang cukup panjang
      for (const word of part.split(/\s+/)) {
        if (word.length > 3) result.add(word)
      }
    }
  }
  return Array.from(result)
}

export async function POST(req: NextRequest) {
  try {
    const { tema } = await req.json()

    if (!tema || typeof tema !== 'string' || tema.length < 3) {
      return NextResponse.json({ error: 'Tema terlalu pendek' }, { status: 400 })
    }

    const supabase = await createClient()
    // Admin client untuk bypass RLS pada tabel kultum_judul_bank
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const temaHash = hashTema(tema)

    // ── 1. Cek cache ──────────────────────────────────────────
    const { data: cached } = await supabaseAdmin
      .from('tema_semantic_cache')
      .select('*')
      .eq('tema_hash', temaHash)
      .maybeSingle()

    if (cached) {
      console.log('[semantic-expand] Cache HIT:', tema)
      return NextResponse.json({
        source: 'cache',
        keywords: cached.keywords,
        konsep_terkait: cached.konsep_terkait,
        sinonim: cached.sinonim,
        topik_hadits: cached.topik_hadits,
        ayat_relevan: cached.ayat_relevan,
        konteks: cached.konteks,
        judul_suggestions: cached.judul_suggestions ?? []
      })
    }

    // ── 2. Cache MISS → expand dengan AI ─────────────────────
    console.log('[semantic-expand] Cache MISS, calling AI:', tema)
    const expanded = await expandTemaWithAI(tema)

    // ── 3. Query judul suggestions sekalian ──────────────────
    // Gabungkan semua sumber lalu pecah compound keywords
    const allKeywords = splitCompoundKeywords([
      ...(expanded.keywords ?? []),
      ...(expanded.konsep_terkait ?? []),
      ...(expanded.sinonim ?? []),
      ...(expanded.topik_hadits ?? [])
    ]).slice(0, 12)

    let judulSuggestions: string[] = []

    if (allKeywords.length > 0) {
      // Ambil kata kunci primer untuk fetch (max 6) agar distribusi topik merata
      const primaryKeywords = splitCompoundKeywords([
        ...(expanded.keywords ?? []),
        ...(expanded.topik_hadits ?? [])
      ]).slice(0, 6)

      // Fetch 3 baris per keyword secara parallel → hindari dominasi satu topik
      const perKeywordResults = await Promise.all(
        primaryKeywords.map((kw: string) =>
          supabaseAdmin
            .from('kultum_judul_bank')
            .select('judul, topik')
            .or(`topik.ilike.%${kw}%,judul.ilike.%${kw}%`)
            .limit(3)
        )
      )
      const allRows = perKeywordResults.flatMap(r => r.data ?? [])

      console.log('[semantic-expand] primaryKeywords:', primaryKeywords, '| rows:', allRows.length)

      // Scoring: lebih banyak keyword match = skor lebih tinggi
      const scored = allRows.map((r: { judul: string; topik: string }) => {
        const haystack = (r.judul + ' ' + r.topik).toLowerCase()
        const score = allKeywords.filter((kw: string) => haystack.includes(kw.toLowerCase())).length
        return { judul: r.judul, score }
      })

      judulSuggestions = scored
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .map((r: { judul: string }) => r.judul)
        .filter((judul: string, idx: number, self: string[]) => self.indexOf(judul) === idx) // dedupe
        .slice(0, 5)
    }

    // Setelah query kultum_judul_bank
    if (judulSuggestions.length === 0) {
      // AI generate judul on-the-fly
      const judulResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        messages: [{
          role: 'system',
          content: 'Kamu adalah penulis judul kultum Islam yang kreatif. Respond ONLY dengan valid JSON array of strings, tanpa markdown.'
        }, {
          role: 'user',
          content: `Buat 5 judul kultum yang menarik, spesifik, dan relevan untuk tema: "${tema}"
          
Format: ["Judul 1", "Judul 2", "Judul 3", "Judul 4", "Judul 5"]

Kriteria judul yang baik:
- Spesifik dan tidak terlalu umum
- Mengandung kata kunci tema
- Menarik dan inspiratif
- Cocok untuk kultum Islam Indonesia
- Panjang 5-12 kata`
        }]
      })
      
      const judulText = judulResponse.choices[0].message.content ?? '[]'
      const judulClean = judulText.replace(/```json|```/g, '').trim()
      judulSuggestions = JSON.parse(judulClean)
    }

    // ── 4. Simpan ke cache (pakai admin untuk bypass RLS) ────
    const { error: insertError } = await supabaseAdmin
      .from('tema_semantic_cache')
      .insert({
        tema,
        tema_hash: temaHash,
        keywords: expanded.keywords,
        konsep_terkait: expanded.konsep_terkait,
        sinonim: expanded.sinonim,
        topik_hadits: expanded.topik_hadits,
        ayat_relevan: expanded.ayat_relevan,
        konteks: expanded.konteks,
        judul_suggestions: judulSuggestions
      })

    if (insertError) {
      console.error('[semantic-expand] Cache insert error:', insertError)
    } else {
      console.log('[semantic-expand] Cache saved for:', tema)
    }

    return NextResponse.json({
      source: 'ai',
      keywords: expanded.keywords,
      konsep_terkait: expanded.konsep_terkait,
      sinonim: expanded.sinonim,
      topik_hadits: expanded.topik_hadits,
      ayat_relevan: expanded.ayat_relevan,
      konteks: expanded.konteks,
      judul_suggestions: judulSuggestions
    })

  } catch (e) {
    console.error('[semantic-expand] Error:', e)
    return NextResponse.json({ error: 'Gagal expand tema' }, { status: 500 })
  }
}
