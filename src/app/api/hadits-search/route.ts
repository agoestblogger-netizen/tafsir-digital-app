import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { query, perawi } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ results: [], error: 'Query terlalu pendek' }, { status: 400 })
    }

    // 1. Generate embedding dari query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.trim(),
    })
    const embedding = embeddingResponse.data[0].embedding

    // 2. Panggil match_hadits RPC
    const supabase = getSupabaseAdmin()
    const { data: rawHadits, error } = await supabase.rpc('match_hadits', {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: 20,
    })

    if (error) {
      console.error('[hadits-search] match_hadits RPC error:', error)
      return NextResponse.json({ results: [], error: 'Database error' }, { status: 500 })
    }

    let results = (rawHadits ?? []) as Array<{
      id: number
      perawi: string
      nomor: number
      topik_nama: string
      terjemah: string
      arab: string
      similarity: number
    }>

    // 3. Filter by perawi jika ada
    if (Array.isArray(perawi) && perawi.length > 0) {
      const perawiLower = perawi.map((p: string) => p.toLowerCase())
      results = results.filter(h => perawiLower.some(p => h.perawi?.toLowerCase().includes(p)))
    }

    // 4. Return hasil
    return NextResponse.json({
      results: results.map(h => ({
        id: h.id,
        perawi: h.perawi,
        nomor: h.nomor,
        topik_nama: h.topik_nama,
        terjemah: h.terjemah,
        arab: h.arab,
        similarity: h.similarity,
      })),
    })
  } catch (err) {
    console.error('[hadits-search] error:', err)
    return NextResponse.json({ results: [], error: 'Internal Server Error' }, { status: 500 })
  }
}
