import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan',
  'pada', 'adalah', 'ini', 'itu', 'atau', 'juga', 'serta',
  'tentang', 'dalam', 'oleh', 'maka', 'akan', 'telah',
  'sudah', 'dapat', 'bisa', 'ada', 'saat', 'ketika',
  'makna', 'pentingnya', 'keutamaan', 'bahaya', 'hikmah',
  'bagi', 'agar', 'itu', 'setiap', 'bukan', 'lebih',
])

const FORMAT_MAP: Record<string, string> = {
  'Tausiyah': 'tausiyah',
  'Kultum': 'kultum',
  'Ceramah': 'ceramah',
  "Khotbah Jum'at": 'khotbah',
  'khotbah_jumat': 'khotbah',
  'khotbah jumat': 'khotbah',
}

export async function POST(req: NextRequest) {
  try {
    const { tema, format } = await req.json()
    if (!tema || typeof tema !== 'string') {
      return NextResponse.json({ judul: [] })
    }

    const supabase = await createClient()

    // Extract meaningful keywords from tema
    const keywords = tema
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !STOPWORDS.has(w))

    if (keywords.length === 0) {
      return NextResponse.json({ judul: [] })
    }

    const formatDB = FORMAT_MAP[format] ?? 'kultum'

    // Build OR condition: match any keyword in judul or topik
    const orConditions = keywords
      .slice(0, 5) // Cap to 5 keywords to avoid query bloat
      .flatMap((kw: string) => [`topik.ilike.%${kw}%`, `judul.ilike.%${kw}%`])
      .join(',')

    // Query 1: format-specific match
    const { data: results } = await supabase
      .from('kultum_judul_bank')
      .select('judul, topik')
      .or(orConditions)
      .eq('format', formatDB)
      .limit(15)

    let pool = results ?? []

    // Fallback: no format-specific results → search all formats
    if (pool.length === 0) {
      const { data: fallback } = await supabase
        .from('kultum_judul_bank')
        .select('judul, topik')
        .or(orConditions)
        .limit(15)
      pool = fallback ?? []
    }

    if (pool.length === 0) {
      return NextResponse.json({ judul: [] })
    }

    // Score by keyword hit count (more hits = more relevant)
    const scored = pool.map((r: { judul: string; topik: string }) => {
      const haystack = (r.judul + ' ' + r.topik).toLowerCase()
      const score = keywords.filter((kw: string) => haystack.includes(kw)).length
      return { judul: r.judul, score }
    })

    const judul = scored
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .map((r: { judul: string }) => r.judul)
      .slice(0, 5)

    return NextResponse.json({ judul })

  } catch (e) {
    console.error('kultum-judul-suggest error:', e)
    return NextResponse.json({ judul: [] })
  }
}
