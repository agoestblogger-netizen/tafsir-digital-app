import { getSupabase } from '@/lib/supabase'
import { DOA_QURANI } from '@/data/doa_qurani'
import { AYAT_SAINS } from '@/data/sains_ayat'

export interface ReferensiKultum {
  hadits: Array<{
    arab: string
    terjemah: string
    perawi: string
    nomor: string | number
    kitab: string
    topik_nama?: string
  }>
  kisah: Array<{
    judul: string
    ringkasan: string
    hikmah: string
    sumber_ayat?: string
  }>
  doa_quran: Array<{
    judul: string
    arab: string
    latin: string
    terjemah: string
    referensi: string
    konteks: string
  }>
  ayat_sains: Array<{
    topik_sains: string
    teks_arab: string
    terjemahan: string
    penjelasan: string
    surah_nama_latin: string
    nomor_ayat: string
  }>
  tokoh_sains: Array<{
    nama: string
    bidang: string
    kontribusi: string
    relevansi_islam: string
  }>
  // Ayat dari tabel ayat_quran_index (labeled by AI)
  ayat_quran: Array<{
    surah_id: number
    surah_nama: string
    surah_nama_latin: string
    nomor_ayat: number
    teks_arab: string
    teks_latin: string
    terjemah: string
    topik_utama: string
    konteks: string
    tags: string[]
  }>
}

import { temaToTags } from '@/lib/tema-to-tags'

// ── Helper: ekstrak topik dari kata kunci tema (fallback tanpa semantic expand) ──
function extractTopikDariTema(tema: string): string[] {
  const TOPIK_MAP: Record<string, string[]> = {
    'sabar': ['Sabar & Syukur', 'Sabar & Ujian'],
    'syukur': ['Sabar & Syukur', 'Syukur & Nikmat'],
    'rezeki': ['Rezeki & Ikhtiar', 'Tawakkal & Doa'],
    'ikhtiar': ['Rezeki & Ikhtiar', 'Motivasi & Produktivitas Islam'],
    'tawakkal': ['Tawakkal & Doa', 'Rezeki & Ikhtiar'],
    'shalat': ['Ibadah & Shalat', 'Shalat Wajib & Rukunnya'],
    'puasa': ['Puasa Wajib & Sunnah', 'Ramadan & Lailatul Qadr'],
    'zakat': ['Zakat & Infaq', 'Dermawan & Sedekah'],
    'haji': ['Haji & Umrah'],
    'quran': ['Al-Quran & Ilmu', 'Tafsir & Tadabur'],
    'ilmu': ['Menuntut Ilmu', 'Al-Quran & Ilmu'],
    'akhlak': ['Akhlak & Adab', 'Kejujuran'],
    'keluarga': ['Rumah Tangga Sakinah', 'Birrul Walidain'],
    'idul adha': ['Qurban & Aqiqah', 'Iman kepada Allah'],
    'qurban': ['Qurban & Aqiqah'],
    'kematian': ['Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur'],
    'akhirat': ['Iman kepada Hari Akhir', 'Kematian & Sakaratul Maut'],
    'taubat': ['Taubat & Istighfar'],
    'doa': ['Doa & Munajat', 'Tawakkal & Doa'],
    'sedekah': ['Dermawan & Sedekah', 'Zakat & Infaq'],
    'iman': ['Iman kepada Allah', 'Iman kepada Hari Akhir'],
    'tauhid': ['Tauhid Uluhiyah', 'Tauhid Rububiyah'],
    'kepemimpinan': ['Kepemimpinan & Amanah'],
  }

  const temaLower = tema.toLowerCase()
  const result = new Set<string>()
  for (const [keyword, topiks] of Object.entries(TOPIK_MAP)) {
    if (temaLower.includes(keyword)) topiks.forEach(t => result.add(t))
  }
  return Array.from(result)
}

// Scoring relevansi sederhana — hitung berapa keyword tema cocok
function skorRelevansi(teks: string, tema: string): number {
  const keywords = tema.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  return keywords.filter(kw => teks.toLowerCase().includes(kw)).length
}

// ── FIX 1: Fetch ayat dari ayat_quran_index (3-step strategy) ────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAyatQuranRelevan(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  topikHadits: string[],
  keywords: string[],
  ayatRelevanFromAI: Array<{ surah_id: number; nomor_ayat: number }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasil: any[] = []
  const seen = new Set<string>()

  // STEP 1: Fetch ayat spesifik yang disuggest AI
  if (ayatRelevanFromAI?.length > 0) {
    for (const ayat of ayatRelevanFromAI.slice(0, 3)) {
      const { data } = await supabase
        .from('ayat_quran_index')
        .select('*')
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
  }

  // STEP 2: Query berdasarkan topik (pakai tags GIN index)
  if (topikHadits?.length > 0 && hasil.length < 5) {
    // Pecah compound topik: "Sabar & Syukur" → ["Sabar", "Syukur"]
    const tagsToQuery = topikHadits
      .flatMap(t => t.split(/[&\/]/).map(p => p.trim()))
      .filter(t => t.length > 2)
      .slice(0, 5)

    for (const tag of tagsToQuery) {
      if (hasil.length >= 5) break

      const { data } = await supabase
        .from('ayat_quran_index')
        .select('*')
        .contains('tags', [tag])
        .limit(3)

      for (const ayat of (data ?? [])) {
        const key = `${ayat.surah_id}-${ayat.nomor_ayat}`
        if (!seen.has(key)) {
          seen.add(key)
          hasil.push(ayat)
        }
      }
    }
  }

  // STEP 3: Fallback keyword search jika masih kurang
  if (hasil.length < 3 && keywords?.length > 0) {
    for (const kw of keywords.slice(0, 3)) {
      if (hasil.length >= 5) break

      const { data } = await supabase
        .from('ayat_quran_index')
        .select('*')
        .or(`topik_utama.ilike.%${kw}%,konteks_ayat.ilike.%${kw}%`)
        .limit(2)

      for (const ayat of (data ?? [])) {
        const key = `${ayat.surah_id}-${ayat.nomor_ayat}`
        if (!seen.has(key)) {
          seen.add(key)
          hasil.push(ayat)
        }
      }
    }
  }

  console.log(`[ayat_quran] ditemukan: ${hasil.length} ayat`)
  return hasil.slice(0, 5)
}

// ── FIX 3: fetchHaditsRelevan dengan scoring & filter relevansi ketat ─────────
async function fetchHaditsRelevan(
  tema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  limit = 3,
  topikOverride?: string[]
) {
  // Normalize ke Title Case agar cocok dengan topik_nama di DB
  function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    )
  }

  // Gunakan topik dari semantic expansion jika ada, fallback ke temaToTags
  // Normalize ke Title Case karena topik_nama di DB selalu Title Case
  const topikToQuery = topikOverride?.length
    ? topikOverride.map(t => toTitleCase(t))
    : temaToTags(tema)

  console.log(`[hadits] tema: "${tema}" → topikToQuery: ${topikToQuery.join(', ')} ${topikOverride ? '(semantic)' : '(fallback)'}`)

  // ── Query 1: match topik_nama exact (paling akurat) ──────────────────────
  const { data: tier1Data, error: err1 } = await supabase
    .from('hadits_topik_index')
    .select('id, arab, terjemah, perawi, nomor, topik_nama, tags')
    .in('topik_nama', topikToQuery)
    .limit(30)

  if (err1) console.error('[hadits] in query error:', err1.message)

  // ── Query 2: fallback ilike topik_nama (partial match) ───────────────────
  // Pecah compound: "Sabar & Syukur" → ["Sabar", "Syukur"]
  const singleWords = topikToQuery
    .flatMap(t => t.split(/[&\/,]/).map(p => p.trim()))
    .filter(w => w.length > 3)
    .slice(0, 5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tier2Data: any[] = []
  if ((tier1Data?.length ?? 0) < limit && singleWords.length > 0) {
    const ilikeCond = singleWords.map(w => `topik_nama.ilike.%${w}%`).join(',')
    const { data: fallbackData } = await supabase
      .from('hadits_topik_index')
      .select('id, arab, terjemah, perawi, nomor, topik_nama, tags')
      .or(ilikeCond)
      .limit(20)
    tier2Data = (fallbackData ?? []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h: any) => !(tier1Data ?? []).some((t: any) => t.id === h.id)
    )
  }

  // Global fallback jika keduanya kosong
  if (!tier1Data?.length && !tier2Data.length) {
    const { data: fallback } = await supabase
      .from('hadits_topik_index')
      .select('id, arab, terjemah, perawi, nomor, topik_nama, tags')
      .not('tags', 'eq', '{}')
      .eq('topik_nama', 'Iman & Akidah')
      .limit(limit)
    console.log(`[hadits] ditemukan: ${fallback?.length ?? 0} hadits (global fallback)`)
    return (fallback ?? []).map((h: { arab?: string; terjemah?: string; perawi?: string; nomor?: string | number; topik_nama?: string; tags?: string[] }) => ({
      arab: h.arab ?? '', terjemah: h.terjemah ?? '', perawi: h.perawi ?? '',
      nomor: h.nomor ?? '', kitab: h.perawi ?? '', topik_nama: h.topik_nama ?? '', tags: h.tags ?? []
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tier1 = (tier1Data ?? []).slice(0, limit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tier2 = tier2Data.slice(0, limit)

  const finalHadits = tier1.length > 0 ? tier1 : tier2

  console.log(`[hadits] ditemukan: ${finalHadits.length} hadits (tier1: ${tier1.length}, tier2: ${tier2.length})`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return finalHadits.map((h: any) => ({
    arab: h.arab ?? '',
    terjemah: h.terjemah ?? '',
    perawi: h.perawi ?? '',
    nomor: h.nomor ?? '',
    kitab: h.perawi ?? '',
    topik_nama: h.topik_nama ?? '',
    tags: h.tags ?? []
  }))
}

export async function fetchReferensiUntukTema(
  tema: string,
  format: string,
  semanticExpanded?: {
    keywords?: string[]
    konsep_terkait?: string[]
    topik_hadits?: string[]
    ayat_relevan?: Array<{ surah_id: number; nomor_ayat: number }>
    konteks?: string
  } | null
): Promise<ReferensiKultum> {
  const supabase = getSupabase()
  const ref: ReferensiKultum = {
    hadits: [], kisah: [], doa_quran: [], ayat_sains: [], tokoh_sains: [],
    ayat_quran: []  // FIX 2: inisialisasi field baru
  }

  // Tentukan topik query: semantic expansion jika ada, fallback ke extractTopikDariTema
  const topikOverride: string[] | undefined = semanticExpanded?.topik_hadits?.length
    ? semanticExpanded.topik_hadits
    : extractTopikDariTema(tema).length
      ? extractTopikDariTema(tema)
      : undefined

  // ── 1. Hadits dari Supabase ──
  try {
    ref.hadits = await fetchHaditsRelevan(tema, supabase, 3, topikOverride)
  } catch (e) { console.error('hadits fetch error', e) }

  // ── 2. Ayat Al-Qur'an dari ayat_quran_index ── (FIX 2)
  try {
    const rawAyat = await fetchAyatQuranRelevan(
      supabase,
      semanticExpanded?.topik_hadits ?? [],
      semanticExpanded?.keywords ?? [],
      semanticExpanded?.ayat_relevan ?? []
    )
    console.log(`[ayat] ditemukan: ${rawAyat?.length ?? 0} ayat`)
    ref.ayat_quran = rawAyat.map(ayat => ({
      surah_id: ayat.surah_id,
      surah_nama: ayat.surah_nama ?? '',
      surah_nama_latin: ayat.surah_nama_latin ?? '',
      nomor_ayat: ayat.nomor_ayat,
      teks_arab: ayat.teks_arab ?? '',
      teks_latin: ayat.teks_latin ?? '',
      terjemah: ayat.terjemah ?? '',
      topik_utama: ayat.topik_utama ?? '',
      konteks: ayat.konteks_ayat ?? '',
      tags: ayat.tags ?? []
    }))
  } catch (e) { console.error('ayat_quran fetch error', e) }

  // ── 3. Kisah Kaum Lampau dari Supabase ──
  try {
    const { data } = await supabase
      .from('kisah_kaum_lampau')
      .select('judul, ringkasan, hikmah, sumber_ayat, topik')
      .ilike('topik', `%${tema}%`)
      .limit(2)
    if (data?.length) ref.kisah = data
  } catch (e) { /* tabel mungkin belum ada data */ }

  // ── 4. Doa Al-Qur'an dari hardcode ──
  try {
    const scored = DOA_QURANI
      .map(d => ({
        item: d,
        skor: skorRelevansi(
          `${d.judul} ${d.konteks} ${d.tema_hajat?.join(' ')}`,
          tema
        )
      }))
      .filter(x => x.skor > 0)
      .sort((a, b) => b.skor - a.skor)
      .slice(0, 2)

    ref.doa_quran = scored.map(x => ({
      judul: x.item.judul,
      arab: x.item.arab,
      latin: x.item.latin,
      terjemah: x.item.terjemah,
      referensi: x.item.referensi,
      konteks: x.item.konteks ?? ''
    }))

    // Jika tidak ada yang cocok, ambil doa umum (rabbana-001)
    if (!ref.doa_quran.length) {
      const doaUmum = DOA_QURANI.find(d => d.id === 'rabbana-001')
      if (doaUmum) ref.doa_quran = [{
        judul: doaUmum.judul,
        arab: doaUmum.arab,
        latin: doaUmum.latin,
        terjemah: doaUmum.terjemah,
        referensi: doaUmum.referensi,
        konteks: doaUmum.konteks ?? ''
      }]
    }
  } catch (e) { console.error('doa_quran error', e) }

  // ── 5. Ayat Sains dari hardcode ──
  const formatButuhSains = ['kultum', 'tausiyah', 'ceramah']
  if (formatButuhSains.includes(format?.toLowerCase())) {
    try {
      const scored = AYAT_SAINS
        .map(a => ({
          item: a,
          skor: skorRelevansi(
            `${a.topik_sains} ${a.penjelasan} ${a.kategori}`,
            tema
          )
        }))
        .filter(x => x.skor > 0)
        .sort((a, b) => b.skor - a.skor)
        .slice(0, 1)

      ref.ayat_sains = scored.map(x => ({
        topik_sains: x.item.topik_sains,
        teks_arab: x.item.teks_arab,
        terjemahan: x.item.terjemahan,
        penjelasan: x.item.penjelasan,
        surah_nama_latin: x.item.surah_nama_latin,
        nomor_ayat: x.item.nomor_ayat
      }))
    } catch (e) { console.error('ayat_sains error', e) }
  }

  // ── 6. Tokoh Sains dari Supabase ──
  try {
    const { data } = await supabase
      .from('tokoh_sains')
      .select('nama, bidang, kontribusi, relevansi_islam, topik')
      .ilike('topik', `%${tema}%`)
      .limit(1)
    if (data?.length) ref.tokoh_sains = data
  } catch (e) { /* tabel mungkin belum ada data */ }

  return ref
}

export function buildReferensiPrompt(ref: ReferensiKultum): string {
  const adaReferensi = ref.hadits.length || ref.kisah.length ||
    ref.doa_quran.length || ref.ayat_sains.length || ref.tokoh_sains.length ||
    ref.ayat_quran.length
  if (!adaReferensi) return ''

  const parts: string[] = [
    'REFERENSI DATABASE INTERNAL — Gunakan secara natural dalam narasi:'
  ]

  if (ref.ayat_quran.length) {
    parts.push('\n[AYAT AL-QUR\'AN — Kutip teks Arab dan terjemah dengan benar]')
    ref.ayat_quran.forEach(a => {
      parts.push(`• QS. ${a.surah_nama_latin}: ${a.nomor_ayat} (${a.surah_nama})`)
      if (a.teks_arab) parts.push(`  Arab: ${a.teks_arab}`)
      parts.push(`  Terjemah: "${a.terjemah}"`)
      if (a.konteks) parts.push(`  Konteks: ${a.konteks}`)
    })
  }

  if (ref.hadits.length) {
    parts.push('\n[HADITS]')
    ref.hadits.forEach((h, i) => {
      parts.push(`${i+1}. "${h.terjemah}"`)
      parts.push(`   → ${h.kitab} No. ${h.nomor} (${h.perawi})`)
    })
  }

  if (ref.kisah.length) {
    parts.push('\n[KISAH KAUM LAMPAU]')
    ref.kisah.forEach(k => {
      parts.push(`• ${k.judul}`)
      parts.push(`  Ringkasan: ${k.ringkasan}`)
      parts.push(`  Hikmah: ${k.hikmah}`)
      if (k.sumber_ayat) parts.push(`  Sumber: ${k.sumber_ayat}`)
    })
  }

  if (ref.doa_quran.length) {
    parts.push('\n[DOA AL-QUR\'AN — gunakan di bagian penutup]')
    ref.doa_quran.forEach(d => {
      parts.push(`• ${d.judul} (${d.referensi})`)
      parts.push(`  Arab: ${d.arab}`)
      parts.push(`  Terjemah: "${d.terjemah}"`)
    })
  }

  if (ref.ayat_sains.length) {
    parts.push('\n[AYAT SAINS — sertakan jika relevan dengan tema]')
    ref.ayat_sains.forEach(a => {
      parts.push(`• ${a.topik_sains} (QS. ${a.surah_nama_latin}: ${a.nomor_ayat})`)
      parts.push(`  Penjelasan: ${a.penjelasan}`)
    })
  }

  if (ref.tokoh_sains.length) {
    parts.push('\n[TOKOH SAINS ISLAM]')
    ref.tokoh_sains.forEach(t => {
      parts.push(`• ${t.nama} — ${t.bidang}`)
      parts.push(`  ${t.relevansi_islam}`)
    })
  }

  return parts.join('\n')
}
