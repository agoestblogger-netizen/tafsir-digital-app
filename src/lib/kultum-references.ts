import { AYAT_SAINS } from '@/data/sains_ayat'
import { KISAH_LIST } from '@/data/kaum_lampau_list'
import { getHaditsList, PERAWI_LIST } from '@/lib/api/hadits'
import { DOA_QURANI } from '@/data/doa_qurani'
import { createClient } from '@/lib/supabase/client'

export interface KultumReferensi {
  type: 'ayat_sains' | 'tokoh_sains' | 'kaum_lampau' | 'hadits' | 'doa_quran' | 'ayat_quran_db'
  id: string
  judul: string
  deskripsi_singkat: string
  relevansi_score: number
  data: Record<string, unknown>
}



export function extractKisahSlug(tema: string): string | null {
  const KISAH_MAP: Record<string, string> = {
    // Kisah Nabi
    'yunus': 'kisah-yunus',
    'paus': 'kisah-yunus',
    'dzun nun': 'kisah-yunus',
    'musa': 'kisah-musa',
    'firaun': 'kisah-musa',

    // ── Sub-kisah Ibrahim (spesifik — harus di atas entry umum) ──
    'api': 'kisah-ibrahim-api',
    'bakar': 'kisah-ibrahim-api',
    'nemrud': 'kisah-ibrahim-api',
    'berhala': 'kisah-ibrahim-api',
    'dibakar': 'kisah-ibrahim-api',
    'ismail': 'kisah-ibrahim-ismail',
    'sembelih': 'kisah-ibrahim-ismail',
    'qurban': 'kisah-ibrahim-ismail',
    'korban': 'kisah-ibrahim-ismail',
    'domba': 'kisah-ibrahim-ismail',
    'kabah': 'kisah-ibrahim-kabah',
    'baitullah': 'kisah-ibrahim-kabah',
    'membangun kabah': 'kisah-ibrahim-kabah',

    // ── Entry umum Ibrahim (fallback jika tidak ada keyword spesifik) ──
    'ibrahim': 'kisah-ibrahim',

    'yusuf': 'kisah-yusuf',
    'zulaikha': 'kisah-yusuf',
    'ayyub': 'kisah-ayyub',
    'sulaiman': 'kisah-sulaiman',
    'ratu balqis': 'kisah-sulaiman',
    'isa': 'kisah-isa',
    'adam': 'kisah-adam',
    'hawa': 'kisah-adam',
    // Kisah Pilihan
    'ashabul kahfi': 'ashabul-kahfi',
    'kahfi': 'ashabul-kahfi',
    'pemuda gua': 'ashabul-kahfi',
    'tujuh pemuda': 'ashabul-kahfi',
    'dzulqarnain': 'dzulqarnain',
    'maryam': 'maryam',
    'luqman': 'luqman',
    'ashabul jannah': 'ashabul-jannah',
    'pemilik kebun': 'ashabul-jannah',
    'ashabul ukhdud': 'ashabul-ukhdud',
    'parit': 'ashabul-ukhdud',
    'bani israil': 'bani-israil',
    // Kaum Diazab
    'kaum nuh': 'kaum-nuh',
    'banjir': 'kaum-nuh',
    'kaum aad': 'kaum-ad',
    'aad': 'kaum-ad',
    'angin': 'kaum-ad',
    'kaum tsamud': 'kaum-tsamud',
    'tsamud': 'kaum-tsamud',
    'unta': 'kaum-tsamud',
    'kaum luth': 'kaum-luth',
    'luth': 'kaum-luth',
    'sodom': 'kaum-luth',
    'kaum firaun': 'kaum-firaun',
    'mesir': 'kaum-firaun',
    'kaum saba': 'kaum-saba',
    "saba'": 'kaum-saba',
    'bendungan marib': 'kaum-saba',
    'kaum madyan': 'kaum-madyan',
    'madyan': 'kaum-madyan',
    'kaum aikah': 'kaum-aikah',
    'aikah': 'kaum-aikah',
    'ashabul hijr': 'ashabul-hijr',
    'hijr': 'ashabul-hijr',
    'kaum tubba': 'kaum-tubba',
    'tubba': 'kaum-tubba',
    'ashabul fil': 'ashabul-fil',
    'gajah': 'ashabul-fil',
    'abrahah': 'ashabul-fil',
  }

  const temaLower = tema.toLowerCase()

  // Prioritaskan slug sub-kisah (lebih banyak part/hyphen) dulu, baru keyword yang lebih panjang (hindari false match)
  const sortedEntries = Object.entries(KISAH_MAP)
    .sort((a, b) => {
      const aParts = a[1].split('-').length
      const bParts = b[1].split('-').length
      if (aParts !== bParts) {
        return bParts - aParts // Prioritaskan sub-kisah yang lebih spesifik
      }
      return b[0].length - a[0].length // Fallback: keyword yang lebih panjang
    })

  for (const [keyword, slug] of sortedEntries) {
    // Gunakan word boundary — keyword harus diawali/diakhiri spasi, tanda baca, atau awal/akhir string
    const regex = new RegExp(`(^|[\\s\\-—,])${keyword}($|[\\s\\-—,])`, 'i')
    const matched = regex.test(temaLower)
    if (matched) return slug
  }

  return null
}

export function cariReferensiDataset(
  tema: string, 
  keywords: string[],
  options?: { forceKeywords?: string[] }
): KultumReferensi[] {
  // Ekstrak kata bermakna — hapus stopwords
  const STOPWORDS = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah',
    'ini', 'itu', 'atau', 'juga', 'serta', 'tentang', 'dalam', 'oleh',
    'maka', 'akan', 'telah', 'sudah', 'dapat', 'bisa', 'ada', 'saat',
    'nabi', 'allah', 'islam', 'muslim', 'quran', 'makkah', 'madinah'
  ])

  const temaWords = [...tema.toLowerCase().split(/\s+/), ...keywords.map(k => k.toLowerCase())]
    .filter(w => w.length > 2 && !STOPWORDS.has(w))

  const results: KultumReferensi[] = []

  // --- Ayat Sains ---
  for (const ayat of AYAT_SAINS) {
    const haystack = [ayat.topik_sains, ayat.kategori, ayat.penjelasan, ayat.terjemahan, ayat.surah_nama].join(' ').toLowerCase()
    const score = hitungScoreCerdas(temaWords, haystack, [])
    if (score >= 40) {
      results.push({
        type: 'ayat_sains',
        id: `${ayat.surah_id}:${ayat.nomor_ayat}`,
        judul: `QS. ${ayat.surah_nama}: ${ayat.nomor_ayat} — ${ayat.topik_sains}`,
        deskripsi_singkat: ayat.penjelasan?.slice(0, 100) + '...',
        relevansi_score: score,
        data: ayat as unknown as Record<string, unknown>,
      })
    }
  }

  // --- Kaum Lampau ---
  const targetSlug = extractKisahSlug(tema)

  for (const kisah of KISAH_LIST) {
    // Jika ada target slug spesifik — hanya include yang slug-nya cocok
    if (targetSlug) {
      if (kisah.slug === targetSlug || kisah.slug.includes(targetSlug)) {
        results.push({
          type: 'kaum_lampau',
          id: kisah.slug,
          judul: `${kisah.icon} ${kisah.nama}`,
          deskripsi_singkat: `Kisah ${kisah.nama} — Lokasi: ${kisah.lokasi || '-'}`,
          relevansi_score: 95,
          data: kisah as unknown as Record<string, unknown>,
        })
      }
      continue // skip scoring biasa jika ada target slug
    }

    // Jika tidak ada target slug — pakai scoring biasa
    const haystack = [kisah.nama, kisah.kategori, kisah.periode, kisah.lokasi, kisah.nabi_diutus].join(' ').toLowerCase()
    const score = hitungScoreCerdas(temaWords, haystack, [])
    if (score >= 40) {
      results.push({
        type: 'kaum_lampau',
        id: kisah.slug,
        judul: `${kisah.icon} ${kisah.nama}`,
        deskripsi_singkat: `Kisah ${kisah.nama} — Lokasi: ${kisah.lokasi || '-'}`,
        relevansi_score: score,
        data: kisah as unknown as Record<string, unknown>,
      })
    }
  }

  // Dedupe ayat_sains by surah_id + nomor_ayat (ada duplikat di data file)
  const seenAyat = new Set<string>()
  const dedupedResults = results.filter(ref => {
    if (ref.type !== 'ayat_sains') return true
    const ayat = ref.data as { surah_id?: number; nomor_ayat?: string }
    const key = `${ayat.surah_id}-${ayat.nomor_ayat}`
    if (seenAyat.has(key)) return false
    seenAyat.add(key)
    return true
  })

  return dedupedResults.sort((a, b) => b.relevansi_score - a.relevansi_score).slice(0, 6)
}

function hitungScoreCerdas(
  temaWords: string[],
  haystack: string,
  namaKhusus: string[]
): number {
  if (temaWords.length === 0) return 0
  let score = 0
  let matchCount = 0

  for (const word of temaWords) {
    if (haystack.includes(word)) {
      matchCount++
      score += 35
    }
  }

  // Hanya beri score jika minimal 50% kata tema cocok
  const matchRatio = matchCount / temaWords.length
  if (matchRatio < 0.5 && temaWords.length > 1) return 0

  // Bonus jika nama khusus cocok
  for (const nama of namaKhusus) {
    if (haystack.includes(nama.replace('_', ' '))) score += 40
  }

  return Math.min(score, 100)
}

export async function cariReferensiHadits(
  tema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  semanticExpanded?: any
): Promise<KultumReferensi[]> {
  try {
    const res = await fetch('/api/kultum-hadits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema, semanticExpanded }),
    })
    const json = await res.json()
    // Gabungkan hadits + ayat_quran_db + doa_quran dari response
    const haditsRefs: KultumReferensi[] = json.hadits ?? []
    const ayatRefs: KultumReferensi[] = json.ayat_quran ?? []
    const doaRefs: KultumReferensi[] = json.doa_quran ?? []
    return [...haditsRefs, ...ayatRefs, ...doaRefs]
  } catch {
    return []
  }
}

export function cariDoaQurani(tema: string): KultumReferensi[] {
  const temaLower = tema.toLowerCase()
  const results: KultumReferensi[] = []

  for (const doa of DOA_QURANI) {
    // Guard — skip item yang tidak valid
    if (!doa || !doa.judul) continue

    const haystack = [
      doa.judul, doa.nabi, doa.konteks, doa.keutamaan,
      ...(doa.tema_hajat ?? []),
      ...(doa.tags ?? [])
    ].filter(Boolean).join(' ').toLowerCase()

    // Cek relevansi
    const temaWords = temaLower.split(/\s+/).filter(w => w.length > 3)
    const matchCount = temaWords.filter(w => haystack.includes(w)).length
    const score = temaWords.length > 0
      ? Math.round((matchCount / temaWords.length) * 100)
      : 0

    if (score >= 30 || temaWords.some(w => haystack.includes(w) && w.length > 5)) {
      results.push({
        type: 'doa_quran',
        id: `doa:${doa.id}`,
        judul: doa.judul,
        deskripsi_singkat: doa.konteks?.slice(0, 120) + '...',
        relevansi_score: Math.max(score, 70),
        data: doa as unknown as Record<string, unknown>,
      })
    }
  }

  return results.slice(0, 3)
}

export async function fetchKisahLengkap(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('kaum_lampau')
      .select('slug, nama, nama_arab, ringkasan, latar_belakang, kisah_lengkap, pelajaran, ayat_utama, semua_surah')
      .eq('slug', slug)
      .single()
    if (error || !data) return null
    return data as Record<string, unknown>
  } catch {
    return null
  }
}

export async function cariSemuaReferensi(
  tema: string,
  keywords: string[],
  options?: { forceKeywords?: string[] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  semanticExpanded?: any
): Promise<KultumReferensi[]> {
  // Fetch paralel: hadits + dataset lokal
  const [haditsRefs] = await Promise.all([cariReferensiHadits(tema, semanticExpanded)])
  const datasetRefs = cariReferensiDataset(tema, keywords, options)
  const doaRefs: KultumReferensi[] = cariDoaQurani(tema) // doa dari data lokal

  // Upgrade kisah kaum_lampau — fetch data lengkap dari Supabase
  const upgradedDatasetRefs = await Promise.all(
    datasetRefs.map(async (ref) => {
      if (ref.type !== 'kaum_lampau') return ref

      // Fetch data lengkap dari Supabase
      const dataLengkap = await fetchKisahLengkap(ref.id)
      if (!dataLengkap) return ref

      // Override data dengan yang dari Supabase (lebih lengkap)
      return {
        ...ref,
        deskripsi_singkat: dataLengkap.ringkasan 
          ? (dataLengkap.ringkasan as string).slice(0, 120) + '...' 
          : ref.deskripsi_singkat,
        data: {
          ...ref.data,       // pertahankan metadata lokal (surah_utama, icon, dll)
          ...dataLengkap,    // override dengan data Supabase yang lengkap
        }
      }
    })
  )

  const all = [...upgradedDatasetRefs, ...haditsRefs, ...doaRefs]
  
  const URUTAN_TIPE: Record<string, number> = {
    'ayat_quran_db': 1,
    'ayat_sains': 2,
    'hadits': 3,
    'doa_quran': 4,
    'tokoh_sains': 5,
  }

  const referensiUrut = all.sort((a, b) => {
    const urutanA = URUTAN_TIPE[a.type] ?? 99
    const urutanB = URUTAN_TIPE[b.type] ?? 99
    if (urutanA !== urutanB) return urutanA - urutanB
    // Jika tipe sama, sort by relevansi score descending
    return (b.relevansi_score ?? 0) - (a.relevansi_score ?? 0)
  })

  return referensiUrut.slice(0, 30)
}

/**
 * Konversi referensi terpilih menjadi context string untuk prompt AI
 */
export function referensiToPromptContext(refs: KultumReferensi[], tema?: string): string {
  if (refs.length === 0) return ''

  const lines: string[] = ['=== REFERENSI DARI DATABASE (WAJIB DIGUNAKAN) ===']

  for (const ref of refs) {
    if (ref.type === 'ayat_sains') {
      const d = ref.data
      lines.push(`\n[AYAT SAINS] ${ref.judul}`)
      lines.push(`Teks Arab: ${d.teks_arab}`)
      lines.push(`Terjemah: ${d.terjemahan}`)
      lines.push(`Tafsir Sains & Penjelasan: ${d.penjelasan}`)
    } else if (ref.type === 'kaum_lampau') {
      const d = ref.data
      lines.push(`\n[SEJARAH AL-QUR'AN] ${ref.judul}`)
      lines.push(`Periode: ${d.periode} | Lokasi: ${d.lokasi}`)
      lines.push(`Nabi yang diutus: ${d.nabi_diutus}`)
      if (d.ringkasan) lines.push(`Ringkasan: ${d.ringkasan}`)
      if (d.pelajaran) lines.push(`Pelajaran: ${d.pelajaran}`)
      if (d.kisah_lengkap) lines.push(`Kisah: ${(d.kisah_lengkap as string).slice(0, 500)}...`)
      const surahList = (d.surah_utama as Array<{surah_nama: string; ayat_range: string}>)
        ?.map(s => `QS. ${s.surah_nama}: ${s.ayat_range}`).join(', ')
      if (surahList) lines.push(`Surah terkait: ${surahList}`)
      lines.push(`Instruksi: Gunakan kisah ini sebagai contoh/ibrah dalam kultum`)
    } else if (ref.type === 'hadits') {
      const d = ref.data as any
      lines.push(`\n[HADITS SHAHIH] ${ref.judul}`)
      lines.push(`Teks Arab: ${d.arab}`)
      lines.push(`Terjemahan: ${d.terjemah}`)
      lines.push(`Intisari: ${d.inti}`)
      lines.push(`Instruksi: Kutip hadits ini dengan menyebut sumbernya (${ref.judul})`)
    } else if (ref.type === 'doa_quran') {
      const d = ref.data
      lines.push(`\n[DOA AL-QUR'AN] ${ref.judul}`)
      lines.push(`Teks Arab: ${d.arab}`)
      lines.push(`Terjemah: ${d.terjemah}`)
      lines.push(`Instruksi: Gunakan doa ini sebagai DOA PENUTUP sebelum doa sapu jagat`)
    }
  }

  lines.push('\nJika ada [DOA AL-QUR\'AN] di atas, WAJIB sisipkan sebagai doa tambahan sebelum Doa Penutup (Rabbana atina).')
  lines.push('\n=== INSTRUKSI: Gunakan referensi di atas sebagai sumber utama kultum. AI hanya menyusun narasi. ===')
  return lines.join('\n')
}
