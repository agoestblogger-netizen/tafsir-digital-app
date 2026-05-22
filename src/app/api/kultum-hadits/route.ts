import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEMA_TAG_MAPPING: Record<string, string[]> = {
  'Sabar & Syukur': ['Sabar & Syukur', 'Sabar', 'Syukur'],
  'Birrul Walidain': ['Birrul Walidain', 'Keluarga'],
  'Taubat & Ampunan': ['Taubat & Ampunan', 'Taubat'],
  'Ikhlas': ['Jihad & Niat'],
  'Ukhuwah & Persaudaraan': ['Ukhuwah & Persaudaraan', 'Ukhuwah'],
  'Mendidik Anak': ['Mendidik Anak'],
  'Keluarga': ['Keluarga'],
  'keluarga': ['Keluarga'],
  'Kematian & Akhirat': ['Akhirat & Kiamat', 'Kematian & Akhirat'],
  'Sedekah & Zakat': ['Zakat & Sedekah', 'Sedekah & Zakat'],
  'Ilmu & Pendidikan': ['Ilmu & Pendidikan', 'Ilmu'],
  'Shalat': ['Shalat'],
  'Rezeki & Kerja': ['Rezeki & Kerja', 'Rezeki'],
  'Pernikahan & Rumah Tangga': ['Pernikahan & Rumah Tangga'],
  'thaharah': ['Thaharah & Kebersihan'],
  'Thaharah': ['Thaharah & Kebersihan'],
  'Thaharah & Kebersihan': ['Thaharah & Kebersihan'],
  'Bersuci': ['Thaharah & Kebersihan'],
}

async function generateQueryEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

// ── Fetch ayat Al-Qur'an dari ayat_quran_index (untuk card UI) ──────────
// Pakai admin client (service_role) karena ayat_quran_index punya RLS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAyatQuranCard(
  supabaseAdmin: any,
  queryText: string,
  ayatRelevanFromAI: Array<{surah_id: number, nomor_ayat: number}>,
  ayatDataFromParallel: any[] | null
): Promise<any[]> {
  const hasil: any[] = []
  const seen = new Set<string>()

  // STEP 1: Ayat spesifik dari AI suggestion
  for (const ayat of (ayatRelevanFromAI ?? []).slice(0, 3)) {
    const { data } = await supabaseAdmin
      .from('ayat_quran_index')
      .select('surah_id, surah_nama_latin, nomor_ayat, teks_arab, teks_latin, terjemah, topik_utama, tags, konteks_ayat')
      .eq('surah_id', ayat.surah_id)
      .eq('nomor_ayat', ayat.nomor_ayat)
      .maybeSingle()
    
    if (data) {
      const key = `${data.surah_id}-${data.nomor_ayat}`
      if (!seen.has(key)) {
        seen.add(key)
        hasil.push(data)
      }
    }
  }

  // STEP 2: Vector similarity search via pgvector RPC (sudah difetch paralel)
  if (ayatDataFromParallel) {
    for (const a of ayatDataFromParallel) {
      const key = `${a.surah_id}-${a.nomor_ayat}`
      if (!seen.has(key) && hasil.length < 8) {
        seen.add(key)
        hasil.push({
          ...a,
          surah_nama_latin: a.surah_nama_latin ?? a.surah_nama,
          similarity: a.similarity
        })
      }
    }
  }

  return hasil
}

export async function POST(req: Request) {
  const { tema, semanticExpanded, judul, kisah_id, kisahData, topik, judulKultum } = await req.json()
  const supabase = await createClient()
  const supabaseAdmin = getSupabaseAdmin()

  // Define queryText using the parameters passed or existing definitions
  let queryText = `${tema ?? topik ?? judul ?? ''} ${judulKultum ?? ''}`.trim()
  if (kisah_id || kisahData) {
    queryText = `${kisahData?.nama ?? tema} ${kisahData?.ringkasan ?? ''}`.trim()
  }

  // 1. Generate embedding sekali
  const embedding = await generateQueryEmbedding(queryText)

  // 2. Jalankan SEMUA query secara paralel dengan Promise.all
  const [ayatResult, haditsResult, doaResult] = await Promise.all([
    // Ayat Al-Qur'an
    supabaseAdmin.rpc('match_ayat_quran', {
      query_embedding: embedding,
      match_threshold: 0.55,
      match_count: 3
    }),
    
    // Hadits
    supabase.rpc('match_hadits', {
      query_embedding: embedding,
      match_threshold: 0.25,
      match_count: 15
    }),
    
    // Doa — text search, tidak perlu embedding
    supabaseAdmin
      .from('doa_qurani')
      .select('*')
      .or(`tema_hajat.cs.{"${queryText}"},judul.ilike.%${queryText}%,tags.cs.{"${queryText}"}`)
      .limit(3)
  ])

  const ayatData = ayatResult.data ?? []
  if (ayatResult.error) console.error('Ayat vector search error:', ayatResult.error)

  const haditsVectorData: any[] = haditsResult.data ?? []
  if (haditsResult.error) console.error('Hadits vector search error:', haditsResult.error)

  const doaData = doaResult.data ?? []

  // 3. Hadits via topik_nama langsung (akurat, tidak pakai vector)
  const temaMapped = (TEMA_TAG_MAPPING[tema] ?? [tema])[0]
  const haditsQ = supabaseAdmin
    .from('hadits_topik_index')
    .select('id, arab, matan, terjemah, perawi, topik_nama, tags, konteks_hadits')
    .limit(15)
  const temaVariants = Array.from(new Set([tema, temaMapped].filter(Boolean)))
  const { data: haditsTopikDirect } = temaVariants.length === 1
    ? await haditsQ.eq('topik_nama', temaVariants[0])
    : await haditsQ.in('topik_nama', temaVariants)
  const haditsData = haditsTopikDirect ?? []
  console.log('DEBUG tema:', JSON.stringify(tema))
  console.log('DEBUG temaMapped:', JSON.stringify(temaMapped))
  console.log('DEBUG temaVariants:', JSON.stringify(temaVariants))
  console.log('DEBUG haditsData.length:', haditsData.length)

  // Format Hadits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const haditsFormatted = haditsData.map((h: any) => ({
    id: h.id,
    type: 'hadits',
    judul: `Hadits ${h.perawi ? `(${h.perawi})` : ''} — ${h.topik_nama}`,
    deskripsi_singkat: h.konteks_hadits?.ringkasan ?? (h.terjemah ?? h.matan ?? '').slice(0, 120) + '...',
    relevansi_score: typeof h.similarity === 'number' ? Math.round(h.similarity * 100) : 70,
    data: {
      id: h.id,
      arab: h.arab,
      matan: h.matan,
      terjemah: h.terjemah,
      perawi: h.perawi,
      topik_nama: h.topik_nama,
      tags: h.tags,
      konteks_hadits: h.konteks_hadits,
      similarity: h.similarity,
    }
  }))



  // Format Doa
  const doaFormatted = doaData.map((d: any) => ({
    id: d.id,
    type: 'doa_quran',
    judul: d.judul,
    deskripsi_singkat: d.konteks ?? (d.terjemah ?? '').slice(0, 120) + '...',
    relevansi_score: 85, // Default score for text match
    data: d
  }))

  // Format Ayat
  const ayatRelevanFromAI = (semanticExpanded?.ayat_relevan ?? []) as Array<{ surah_id: number; nomor_ayat: number }>
  const ayatQuranRaw = await fetchAyatQuranCard(supabaseAdmin, queryText, ayatRelevanFromAI, ayatData)

  const ayatQuranForUI = ayatQuranRaw.map((ayat: any) => ({
    type: 'ayat_quran_db' as const,
    id: `ayat-${ayat.surah_id}-${ayat.nomor_ayat}`,
    judul: `QS. ${ayat.surah_nama_latin ?? ayat.surah_nama}: ${ayat.nomor_ayat}`,
    deskripsi_singkat: ayat.konteks_ayat ?? (ayat.terjemah ?? '').slice(0, 150) + '...',
    relevansi_score: ayat.similarity ? Math.round(ayat.similarity * 100) : 85,
    data: {
      surah_id: ayat.surah_id,
      surah_nama_latin: ayat.surah_nama_latin,
      nomor_ayat: ayat.nomor_ayat,
      teks_arab: ayat.teks_arab,
      teks_latin: ayat.teks_latin,
      terjemah: ayat.terjemah,
      topik_utama: ayat.topik_utama,
      konteks: ayat.konteks_ayat,
      tags: ayat.tags
    }
  }))

  console.log(`[kultum-hadits] hadits:${haditsFormatted.length} | ayat:${ayatQuranForUI.length} | doa:${doaFormatted.length}`)
  return NextResponse.json({ 
    hadits: haditsFormatted, 
    ayat_quran: ayatQuranForUI,
    doa_quran: doaFormatted
  })
}
