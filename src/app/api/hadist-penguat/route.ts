import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHadistFromMap } from '@/data/hadist_ayat_map'

const HADITS_API = 'https://api.myquran.com/v2/hadits'
const PERAWI_LIST = ['bukhari', 'muslim', 'abu-dawud', 'tirmidzi', 'nasai']
const PERAWI_NAMES: Record<string, string> = {
  'bukhari': 'Bukhari', 'muslim': 'Muslim',
  'abu-dawud': 'Abu Dawud', 'tirmidzi': 'Tirmidzi', 'nasai': "Nasa'i",
}

// Stop words — kata yang terlalu umum, tidak berguna untuk search
const STOP_WORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'atau',
  'ini', 'itu', 'ia', 'dia', 'kamu', 'kami', 'kita', 'mereka', 'adalah',
  'akan', 'telah', 'sudah', 'tidak', 'bukan', 'maka', 'jika', 'ketika',
  'oleh', 'dalam', 'antara', 'atas', 'bawah', 'sesungguhnya', 'bahwa',
  'kepada', 'tentang', 'setiap', 'semua', 'juga', 'serta', 'namun',
  'allah', 'tuhan', 'nabi', 'rasul', 'muhammad', 'saw', 'swt',
])

// Ekstrak keyword bermakna dari teks
function extractKeywords(text: string, maxWords = 3): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, maxWords)
}


// Fetch batch hadits secara paralel (API hanya support single per nomor)
async function fetchHaditsBatch(
  perawi: string,
  start: number,
  count: number
): Promise<Array<{ id: string; arab: string; number: number }>> {
  const promises = Array.from({ length: count }, (_, i) =>
    fetch(`${HADITS_API}/${perawi}/${start + i}`, { next: { revalidate: 86400 } })
      .then(r => r.ok ? r.json() : null)
      .then(j => j?.data || null)
      .catch(() => null)
  )
  const results = await Promise.all(promises)
  return results.filter(Boolean) as Array<{ id: string; arab: string; number: number }>
}

// Cari hadits di API — return null jika tidak ada yang match
async function searchHadits(keywords: string[]): Promise<{
  arab: string
  terjemah: string
  nomor: number
  perawi: string
} | null> {
  if (keywords.length === 0) return null

  // Batas hadits per perawi untuk search (nomor 1-150, 3 batch x 50)
  const PERAWI_TOTAL: Record<string, number> = {
    bukhari: 6638, muslim: 4930, 'abu-dawud': 4419,
    tirmidzi: 3625, nasai: 5761,
  }

  for (const perawi of PERAWI_LIST) {
    const total = PERAWI_TOTAL[perawi] ?? 1000
    for (let batch = 0; batch < 3; batch++) {
      const start = batch * 50 + 1
      if (start > total) break
      try {
        const hadiths = await fetchHaditsBatch(perawi, start, 50)
        if (hadiths.length === 0) break

        // Harus match MINIMAL 2 keyword agar cukup relevan
        const minMatch = keywords.length >= 2 ? 2 : 1
        const match = hadiths.find(h => {
          const teks = h.id.toLowerCase()
          const count = keywords.filter(kw => teks.includes(kw)).length
          return count >= minMatch
        })

        if (match) {
          console.log(`[Hadist] ✅ Found: ${perawi} No.${match.number}`)
          return {
            arab: match.arab,
            terjemah: match.id,
            nomor: match.number,
            perawi,
          }
        }
      } catch {
        break
      }
    }
  }

  console.log(`[Hadist] ❌ No match for keywords: ${keywords.join(', ')}`)
  return null
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surahId = parseInt(searchParams.get('surah_id') || '0')
    const ayatNumber = parseInt(searchParams.get('ayat_number') || '0')
    const ayatTeks = searchParams.get('ayat_teks') || ''
    const tafsirTeks = searchParams.get('tafsir_teks') || ''

    if (!surahId || !ayatNumber) {
      return NextResponse.json({ exists: false })
    }

    const supabase = await createClient()

    // ── STEP 1: Cek DB ──
    const { data: existing } = await supabase
      .from('hadist_penguat')
      .select('*')
      .eq('surah_id', surahId)
      .eq('ayat_number', ayatNumber)
      .maybeSingle()

    if (existing) {
      // Pernah dicari, tidak ada yang relevan
      if (existing.not_relevant) {
        return NextResponse.json({ exists: false })
      }
      // Ada data lengkap dari API
      if (existing.arab && existing.nomor_hadits) {
        return NextResponse.json({
          exists: true,
          source: 'database',
          arab: existing.arab,
          teks_hadist: existing.teks_hadist,
          referensi_lengkap: existing.referensi_lengkap,
          perawi: existing.perawi,
          perawi_name: existing.perawi_name,
          nomor_hadits: existing.nomor_hadits,
        })
      }
      // Data tidak lengkap → hapus & cari ulang
      await supabase
        .from('hadist_penguat')
        .delete()
        .eq('surah_id', surahId)
        .eq('ayat_number', ayatNumber)
    }

    // Cek static map terverifikasi
    const staticRef = getHadistFromMap(surahId, ayatNumber)
    if (staticRef) {
      const res = await fetch(`https://api.myquran.com/v2/hadits/${staticRef.perawi}/${staticRef.nomor}`)
      if (res.ok) {
        const data = await res.json()
        const h = data.data
        if (h?.arab && h?.id) {
          await supabase.from('hadist_penguat').insert({
            surah_id: surahId, ayat_number: ayatNumber,
            arab: h.arab, teks_hadist: h.id,
            perawi: staticRef.perawi, perawi_name: staticRef.perawiName,
            nomor_hadits: staticRef.nomor, referensi_lengkap: staticRef.referensi,
            not_relevant: false, has_tafsir_context: true,
          }).single()
          return NextResponse.json({
            exists: true, source: 'static_map',
            arab: h.arab, teks_hadist: h.id,
            referensi_lengkap: staticRef.referensi,
            perawi: staticRef.perawi, perawi_name: staticRef.perawiName,
            nomor_hadits: staticRef.nomor,
          })
        }
      }
    }

    // ── STEP 2: Ekstrak keyword dari teks ayat + tafsir ──
    // Prioritaskan tafsir karena lebih deskriptif
    const sourceText = tafsirTeks
      ? `${tafsirTeks} ${ayatTeks}`
      : ayatTeks
    const keywords = extractKeywords(sourceText, 3)

    console.log(`[Hadist] Surah ${surahId}:${ayatNumber} keywords: [${keywords.join(', ')}]`)

    // ── STEP 3: Search di API ──
    const found = await searchHadits(keywords)

    if (!found) {
      // Tidak ada yang relevan → simpan flag & tidak tampilkan
      await supabase.from('hadist_penguat').insert({
        surah_id: surahId,
        ayat_number: ayatNumber,
        not_relevant: true,
        arab: '',
        teks_hadist: '',
      })
      return NextResponse.json({ exists: false })
    }

    // ── STEP 4: Simpan ke DB & return ──
    const perawiName = PERAWI_NAMES[found.perawi] || found.perawi
    const referensi = `(HR. ${perawiName} No. ${found.nomor})`

    await supabase.from('hadist_penguat').insert({
      surah_id: surahId,
      ayat_number: ayatNumber,
      arab: found.arab,
      teks_hadist: found.terjemah,
      perawi: found.perawi,
      perawi_name: perawiName,
      nomor_hadits: found.nomor,
      referensi_lengkap: referensi,
      not_relevant: false,
      has_tafsir_context: !!tafsirTeks,
    })

    return NextResponse.json({
      exists: true,
      source: 'api_search',
      arab: found.arab,
      teks_hadist: found.terjemah,
      referensi_lengkap: referensi,
      perawi: found.perawi,
      perawi_name: perawiName,
      nomor_hadits: found.nomor,
    })

  } catch (error) {
    console.error('[Hadist] Error:', error)
    return NextResponse.json({ exists: false })
  }
}
