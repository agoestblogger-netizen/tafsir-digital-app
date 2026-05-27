import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'
import { searchHaditsExternal } from './hadits-external'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function generateQueryEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ ayat: [], hadits: [] })
    }

    const embedding = await generateQueryEmbedding(query.trim())
    const supabaseAdmin = getSupabaseAdmin()

    // Query match_ayat_quran, match_hadits, and searchHaditsExternal concurrently
    const [ayatResult, haditsResult, externalHadits] = await Promise.all([
      supabaseAdmin.rpc('match_ayat_quran', {
        query_embedding: embedding,
        match_threshold: 0.55,
        match_count: 3
      }),
      supabaseAdmin.rpc('match_hadits', {
        query_embedding: embedding,
        match_threshold: 0.35,
        match_count: 5
      }),
      searchHaditsExternal(query.trim()).catch(err => {
        console.error('[Semantic Search] searchHaditsExternal error:', err)
        return []
      })
    ])

    if (ayatResult.error) {
      console.error('[Semantic Search] match_ayat_quran RPC error:', ayatResult.error)
    }
    if (haditsResult.error) {
      console.error('[Semantic Search] match_hadits RPC error:', haditsResult.error)
    }

    const rawAyat = ayatResult.data ?? []
    const rawHadits = haditsResult.data ?? []

    // Format Ayat
    const ayatFormatted = rawAyat.map((ayat: any) => ({
      type: 'ayat_quran_db' as const,
      id: `ayat-${ayat.surah_id}-${ayat.nomor_ayat}`,
      judul: `QS. ${ayat.surah_nama_latin ?? ayat.surah_nama ?? ''}: ${ayat.nomor_ayat}`,
      deskripsi_singkat: ayat.konteks_ayat ?? (ayat.terjemah ?? '').slice(0, 150) + '...',
      relevansi_score: ayat.similarity ? Math.round(ayat.similarity * 100) : 85,
      data: {
        surah_id: ayat.surah_id,
        surah_nama_latin: ayat.surah_nama_latin ?? ayat.surah_nama ?? '',
        nomor_ayat: ayat.nomor_ayat,
        teks_arab: ayat.teks_arab,
        teks_latin: ayat.teks_latin,
        terjemah: ayat.terjemah,
        topik_utama: ayat.topik_utama,
        konteks: ayat.konteks_ayat,
        tags: ayat.tags
      }
    }))

    // Format Hadits
    const haditsFormatted = rawHadits.map((h: any) => ({
      id: String(h.id),
      type: 'hadits' as const,
      judul: `Hadits ${h.perawi ? `(${h.perawi})` : ''} — ${h.topik_nama ?? ''}`,
      deskripsi_singkat: h.konteks_hadits?.ringkasan ?? (h.terjemah ?? h.matan ?? '').slice(0, 120) + '...',
      relevansi_score: typeof h.similarity === 'number' ? Math.round(h.similarity * 100) : 70,
      data: {
        id: h.id,
        arab: h.arab,
        matan: h.matan,
        terjemah: h.terjemah,
        perawi: h.perawi,
        nomor: h.nomor,
        topik_nama: h.topik_nama,
        tags: h.tags,
        konteks_hadits: h.konteks_hadits,
        similarity: h.similarity,
        sumber: 'internal'
      }
    }))

    // Merge internal and external results, deduplicating by perawi + nomor clean
    const allHadits = [...haditsFormatted, ...externalHadits]
    const haditsUnik = allHadits.filter((item, index, self) =>
      index === self.findIndex(h => 
        h.data?.perawi?.toLowerCase().trim() === item.data?.perawi?.toLowerCase().trim() &&
        String(h.data?.nomor).trim() === String(item.data?.nomor).trim()
      )
    )

    return NextResponse.json({
      ayat: ayatFormatted,
      hadits: haditsUnik
    })

  } catch (err) {
    console.error('[Semantic Search] Error processing similarity request:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
