/**
 * Ambil data ayat dari API resmi myquran.com
 * Return: { arab, latin, terjemah } dari sumber Kemenag RI
 */
export async function fetchAyatResmi(surahId: number, ayatNomor: number): Promise<{
  arab: string
  latin: string
  terjemah: string
} | null> {
  try {
    const res = await fetch(
      `https://api.myquran.com/v2/quran/ayat/${surahId}/${ayatNomor}`,
      { next: { revalidate: 86400 } } // cache 24 jam
    )
    if (!res.ok) throw new Error('myquran API error')
    const json = await res.json()
    if (!json.status || !json.data) throw new Error('Data tidak valid')

    return {
      arab: json.data.ar,
      latin: json.data.idn,
      terjemah: json.data.id,
    }
  } catch {
    // Fallback ke equran.id
    try {
      const res2 = await fetch(`https://equran.id/api/v2/surat/${surahId}`)
      const json2 = await res2.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ayat = json2.data?.ayat?.find((a: any) => a.nomorAyat === ayatNomor)
      if (!ayat) return null
      return {
        arab: ayat.teksArab,
        latin: ayat.teksLatin,
        terjemah: ayat.teksIndonesia,
      }
    } catch {
      return null
    }
  }
}

/**
 * Fetch terjemahan untuk range ayat sekaligus (lebih efisien)
 */
export async function fetchAyatRange(surahId: number, ayatStart: number, ayatEnd: number) {
  const promises = []
  for (let n = ayatStart; n <= ayatEnd; n++) {
    promises.push(fetchAyatResmi(surahId, n))
  }
  return Promise.all(promises)
}

const SURAH_MAP: Record<string, number> = {
  'al-fatihah': 1, 'al-baqarah': 2, 'ali imran': 3, 'an-nisa': 4, 'al-maidah': 5,
  'al-an\'am': 6, 'al-a\'raf': 7, 'al-anfal': 8, 'at-taubah': 9, 'yunus': 10,
  'hud': 11, 'yusuf': 12, 'ar-ra\'d': 13, 'ibrahim': 14, 'al-hijr': 15,
  'an-nahl': 16, 'al-isra\'': 17, 'al-kahfi': 18, 'maryam': 19, 'thaha': 20,
  'al-anbiya\'': 21, 'al-hajj': 22, 'al-mu\'minun': 23, 'an-nur': 24, 'al-furqan': 25,
  'asy-syu\'ara\'': 26, 'an-naml': 27, 'al-qashash': 28, 'al-ankabut': 29, 'ar-rum': 30,
  'luqman': 31, 'as-sajdah': 32, 'al-ahzab': 33, 'saba\'': 34, 'fathir': 35,
  'yasin': 36, 'as-saffat': 37, 'shad': 38, 'az-zumar': 39, 'ghafir': 40,
  'fussilat': 41, 'asy-syura': 42, 'az-zukhruf': 43, 'ad-dukhan': 44, 'al-jatsiyah': 45,
  'al-ahqaf': 46, 'muhammad': 47, 'al-fath': 48, 'al-hujurat': 49, 'qaf': 50,
  'adz-dzariyat': 51, 'at-thur': 52, 'an-najm': 53, 'al-qamar': 54, 'ar-rahman': 55,
  'al-waqi\'ah': 56, 'al-hadid': 57, 'al-mujadilah': 58, 'al-hasyr': 59, 'al-mumtahanah': 60,
  'as-saff': 61, 'al-jumu\'ah': 62, 'al-munafiqun': 63, 'at-taghabun': 64, 'ath-thalaq': 65,
  'at-tahrim': 66, 'al-mulk': 67, 'al-qalam': 68, 'al-haqqah': 69, 'al-ma\'arij': 70,
  'nuh': 71, 'al-jinn': 72, 'al-muzzammil': 73, 'al-muddaththir': 74, 'al-qiyamah': 75,
  'al-insan': 76, 'al-mursalat': 77, 'an-naba\'': 78, 'an-nazi\'at': 79, '\'abasa': 80,
  'at-takwir': 81, 'al-infitar': 82, 'al-mutaffifin': 83, 'al-insyiqaq': 84, 'al-buruj': 85,
  'ath-thariq': 86, 'al-a\'la': 87, 'al-ghasyiyah': 88, 'al-fajr': 89, 'al-balad': 90,
  'asy-syams': 91, 'al-lail': 92, 'ad-duha': 93, 'asy-syarh': 94, 'at-tin': 95,
  'al-\'alaq': 96, 'al-qadr': 97, 'al-bayyinah': 98, 'az-zalzalah': 99, 'al-\'adiyat': 100,
  'al-qari\'ah': 101, 'at-takatsur': 102, 'al-\'asr': 103, 'al-humazah': 104, 'al-fil': 105,
  'quraisy': 106, 'al-ma\'un': 107, 'al-kautsar': 108, 'al-kafirun': 109, 'an-nasr': 110,
  'al-lahab': 111, 'al-ikhlas': 112, 'al-falaq': 113, 'an-nas': 114
}

/**
 * Parse string seperti "QS. Al-Baqarah: 183" menjadi { surahId: 2, ayat: 183 }
 */
export function parseAyatReferensi(ref: string): { surahId: number; ayatNumber: number } | null {
  try {
    const match = ref.match(/QS\.?\s*(.+?)\s*:\s*(\d+)/i)
    if (!match) return null

    const surahName = match[1].toLowerCase().replace(/[^a-z0-9]/g, '')
    const ayatNumber = parseInt(match[2])

    // Cari key terdekat di SURAH_MAP
    let bestMatchId = 0
    let longestMatch = 0

    for (const [key, id] of Object.entries(SURAH_MAP)) {
      const cleanKey = key.replace(/[^a-z0-9]/g, '')
      if (surahName === cleanKey) {
        return { surahId: id, ayatNumber }
      }
      if (surahName.includes(cleanKey) || cleanKey.includes(surahName)) {
        if (cleanKey.length > longestMatch) {
          longestMatch = cleanKey.length
          bestMatchId = id
        }
      }
    }

    if (bestMatchId > 0) return { surahId: bestMatchId, ayatNumber }
    return null
  } catch {
    return null
  }
}

