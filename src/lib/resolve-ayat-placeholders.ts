import { SURAH_NAME_TO_ID } from '@/lib/surah-map'

const PLACEHOLDER_RE = /\[\[AYAT:([^:]+):(\d+)(?:-(\d+))?\]\]/

/**
 * Resolve semua placeholder [[AYAT:x:y]] dalam objek konten kultum/khotbah.
 * Mutasi in-place: sets .arab, .latin, .terjemah, .is_resolved = true pada setiap ayat.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveAyatPlaceholders(konten: any): Promise<void> {
  if (!konten) return

  // Kumpulkan semua list ayat dari berbagai section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ayatLists: any[][] = [
    konten.bagian?.ayat_quran,           // kultum/tausiyah
    konten.khotbah_pertama?.ayat_quran,  // khotbah jumat
    konten.khotbah_kedua?.doa_quran_penutup, // doa quran jumat
  ].filter(Boolean)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue: { item: any; surah: number; ayat: string; ayatEnd?: string }[] = []

  for (const list of ayatLists) {
    for (const a of list) {
      // Cari placeholder di field mana saja (termasuk jika AI berhalusinasi dengan key 'isi' atau 'penjelasan')
      const rawText = JSON.stringify(a)
      let match = rawText.match(PLACEHOLDER_RE)

      let surahRaw = match ? match[1] : ''
      let ayatNum = match ? match[2] : ''
      let ayatEnd = match ? match[3] : ''

      // AUTO-HEAL: Jika placeholder tidak ditemukan atau berisi template literal/placeholder mentah (surah_id, dll)
      // tetapi ada field referensi/sumber yang valid (misal: "QS. Al-Mu'minun: 8" atau "QS. Ibrahim: 40")
      const isPlaceholderBuggy = match && (surahRaw === 'surah_id' || ayatNum === 'nomor_ayat')
      if (!match || isPlaceholderBuggy) {
        const refText = a.referensi || a.sumber || ''
        const refMatch = refText.match(/QS\.\s*([^:]+):\s*(\d+)(?:-(\d+))?/)
        if (refMatch) {
          surahRaw = refMatch[1].trim()
          ayatNum = refMatch[2].trim()
          ayatEnd = refMatch[3] ? refMatch[3].trim() : undefined
          // Recreate match for validation flow
          match = [refText, surahRaw, ayatNum, ayatEnd] as any
        }
      }

      if (!match) {
        // Jika tidak ada placeholder, periksa apakah ada teks arab manual
        const hasArab = Object.values(a).some(v => typeof v === 'string' && /[\u0600-\u06FF]/.test(v))
        if (!hasArab) {
          a.is_invalid = true // Skip, jangan tampilkan box kosong
        }
        continue
      }

      let surahId = Number(surahRaw)
      let ayatNumInt = Number(ayatNum)

      if (isNaN(surahId)) {
        // Normalize spasi, underscore, & tanda petik → lookup di map
        const key = surahRaw.toLowerCase().replace(/[\s_]+/g, '-').replace(/['`’‘]+/g, '')
        surahId = SURAH_NAME_TO_ID[key] ?? 0
      }

      // Validasi surahId dan ayatNum sebelum fetch
      if (
        isNaN(surahId) || isNaN(ayatNumInt) ||
        surahId < 1 || surahId > 114 ||  // Al-Quran hanya 114 surah
        ayatNumInt < 1 || ayatNumInt > 286     // Ayat terpanjang Al-Baqarah 286
      ) {
        console.warn('Invalid ayat reference:', surahRaw, ayatNum)
        a.arab = ''
        a.latin = ''
        a.terjemah = ''
        a.is_invalid = true // Skip, jangan tampilkan box kosong
        continue
      }

      // Bersihkan teks apapun setelah placeholder (AI kadang tambahkan terjemah di sini)
      a.arab = ayatEnd ? `[[AYAT:${surahId}:${ayatNum}-${ayatEnd}]]` : `[[AYAT:${surahId}:${ayatNum}]]`

      queue.push({ item: a, surah: surahId, ayat: ayatNum, ayatEnd })
    }
  }

  if (queue.length === 0) return

  console.log(`[resolveAyat] Resolving ${queue.length} placeholder(s)...`)

  await Promise.all(
    queue.map(async (p) => {
      try {
        console.log('Fetching ayat with fallback:', p.surah, p.ayat)
        const result = await fetchAyatWithFallback(p.surah, Number(p.ayat))
        
        if (result && result.arab) {
          p.item.arab = result.arab
          p.item.latin = result.latin || ''
          
          // Pertahankan narasi halusinasi AI (isi/penjelasan) jika ada, sebagai fallback terjemahan
          const existingText = p.item.terjemah || p.item.isi || p.item.penjelasan || ''
          p.item.terjemah = result.terjemah || existingText || ''
          p.item.is_resolved = true

          const surahNames: Record<number, string> = {
            1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa',
            5: 'Al-Maidah', 6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal',
            9: 'At-Taubah', 10: 'Yunus', 11: 'Hud', 12: 'Yusuf',
            13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl',
            17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
            21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur',
            25: 'Al-Furqan', 26: 'Asy-Syuara', 27: 'An-Naml', 28: 'Al-Qasas',
            29: 'Al-Ankabut', 30: 'Ar-Rum', 31: 'Luqman', 32: 'As-Sajdah',
            33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir', 36: 'Yasin',
            37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
            41: 'Fussilat', 42: 'Asy-Syura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan',
            45: 'Al-Jasiyah', 46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath',
            49: 'Al-Hujurat', 50: 'Qaf', 51: 'Az-Zariyat', 52: 'At-Tur',
            53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman', 56: 'Al-Waqiah',
            57: 'Al-Hadid', 58: 'Al-Mujadilah', 59: 'Al-Hasyr', 60: 'Al-Mumtahanah',
            61: 'As-Saf', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Tagabun',
            65: 'At-Talaq', 66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam',
            69: 'Al-Haqqah', 70: 'Al-Maarij', 71: 'Nuh', 72: 'Al-Jin',
            73: 'Al-Muzzammil', 74: 'Al-Muddassir', 75: 'Al-Qiyamah', 76: 'Al-Insan',
            77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
            81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Insyiqaq',
            85: 'Al-Buruj', 86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Gasyiyah',
            89: 'Al-Fajr', 90: 'Al-Balad', 91: 'Asy-Syams', 92: 'Al-Lail',
            93: 'Ad-Duha', 94: 'Al-Insyirah', 95: 'At-Tin', 96: 'Al-Alaq',
            97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
            101: 'Al-Qariah', 102: 'At-Takasur', 103: 'Al-Asr', 104: 'Al-Humazah',
            105: 'Al-Fil', 106: 'Quraisy', 107: 'Al-Maun', 108: 'Al-Kausar',
            109: 'Al-Kafirun', 110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas',
            113: 'Al-Falaq', 114: 'An-Nas'
          }
          p.item.surah_nama = surahNames[p.surah] || `Surah ${p.surah}`
          p.item.ayat_num = p.ayat
          if (p.ayatEnd) {
            p.item.referensi = `QS. ${p.item.surah_nama}: ${p.ayat}-${p.ayatEnd}`
            p.item.sumber = p.item.referensi
          }
        } else {
          console.warn(`[resolveAyat] No arab data found for ${p.surah}:${p.ayat}`)
          p.item.arab = ''
          p.item.is_invalid = true // Skip jika gagal fetch
        }
      } catch (e) {
        console.error('[resolveAyat] Fetch error:', p.surah, p.ayat, e)
        p.item.arab = ''
        p.item.is_invalid = true
      }
    })
  )
}

/**
 * Resolve placeholder [[AYAT:x:y]] dalam sebuah string teks.
 * Berguna untuk teks narasi yang mengandung referensi ayat.
 */
export async function resolvePlaceholdersInString(text: string): Promise<string> {
  if (!text || !text.includes('[[AYAT:')) return text

  let resolvedText = text
  const matches = [...text.matchAll(new RegExp(PLACEHOLDER_RE, 'g'))]

  for (const match of matches) {
    const fullMatch = match[0]
    const surahRaw = match[1]
    const ayatNum = match[2]
    const ayatEnd = match[3]

    let surahId = Number(surahRaw)
    if (isNaN(surahId)) {
      const key = surahRaw.toLowerCase().replace(/[\s_]+/g, '-')
      surahId = SURAH_NAME_TO_ID[key] ?? 0
    }

    if (surahId > 0 && surahId <= 114) {
      const result = await fetchAyatWithFallback(surahId, Number(ayatNum))
      if (result && result.arab) {
        const sumberTxt = ayatEnd ? `(ayat ${ayatNum}-${ayatEnd})` : `(ayat ${ayatNum})`
        const replacement = `
<div class="ayat-block my-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 shadow-inner">
  <div class="text-2xl md:text-3xl leading-loose text-right text-amber-200 font-amiri mb-4" dir="rtl">
    ${result.arab}
  </div>
  <div class="text-sm italic text-right text-amber-500/60 mb-3 font-cairo">
    ${result.latin}
  </div>
  <div class="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent my-3"></div>
  <div class="text-sm text-amber-100/80 leading-relaxed font-cairo italic">
    "${result.terjemah}"
  </div>
  <div class="text-right mt-2 text-xs text-amber-500/50 font-cinzel tracking-wider uppercase">
    ${result.sumber ? result.sumber.replace(/: \d+$/, '') : ''} ${sumberTxt}
  </div>
</div>`
        resolvedText = resolvedText.replace(fullMatch, replacement)
      }
    }
  }

  return resolvedText.replace(/\n{3,}/g, '\n\n').trim()
}

// Setelah fetch myquran gagal, coba equran.id sebagai fallback:
export async function fetchAyatWithFallback(surah: number, ayat: number) {
  // Coba equran.id dulu (lebih reliable)
  try {
    const res = await fetch(
      `https://equran.id/api/v2/surat/${surah}`,
      { signal: AbortSignal.timeout(10000) }
    )
    const json = await res.json()
    const ayatData = json.data?.ayat?.find((a: any) => a.nomorAyat === ayat)
    if (ayatData) {
      return {
        arab: ayatData.teksArab,
        latin: ayatData.teksLatin,
        terjemah: ayatData.teksIndonesia,
        sumber: `QS. ${json.data?.namaLatin ?? ''}: ${ayat}`
      }
    }
  } catch (e) {
    console.warn(`equran failed for ${surah}:${ayat}`, e)
  }

  // Fallback: myquran
  try {
    const res = await fetch(
      `https://api.myquran.com/v2/quran/ayat/${surah}/${ayat}`,
      { signal: AbortSignal.timeout(5000) }
    )
    const json = await res.json()
    const ayatData = Array.isArray(json.data) ? json.data[0] : json.data
    if (json.status && ayatData?.ar) {
      return {
        arab: ayatData.ar,
        latin: ayatData.idn || ayatData.latin || '',
        terjemah: ayatData.id || ayatData.terjemah || '',
        sumber: `QS. ${surah}: ${ayat}`
      }
    }
  } catch (e) {
    console.warn(`myquran failed for ${surah}:${ayat}`, e)
  }

  // Fallback 2: alquran.cloud
  try {
    const [arRes, idRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayat}/ar.alafasy`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayat}/id.indonesian`, { signal: AbortSignal.timeout(8000) })
    ])
    const arJson = await arRes.json()
    const idJson = await idRes.json()
    if (arJson.data?.text) {
      return {
        arab: arJson.data.text,
        latin: '',
        terjemah: idJson.data?.text || '',
        sumber: `QS. ${surah}: ${ayat}`
      }
    }
  } catch (e) {
    console.warn(`alquran.cloud failed for ${surah}:${ayat}`, e)
  }

  return null
}

