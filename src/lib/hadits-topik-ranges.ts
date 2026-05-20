export const TOPIK_RANGES: Record<string, {
  topik_id: string
  keywords: string[]
  ranges: Record<string, number[][]>
}> = {
  iman: {
    topik_id: 'iman',
    keywords: ['iman', 'tauhid', 'islam', 'syahadat', 'akidah', 'taqwa'],
    ranges: {
      bukhari: [[1, 100], [6500, 6638]],
      muslim: [[1, 100]],
      tirmidzi: [[2600, 2700]],
    }
  },
  shalat: {
    topik_id: 'shalat',
    keywords: ['shalat', 'salat', 'wudhu', 'adzan', 'masjid', 'rukuk', 'sujud'],
    ranges: {
      bukhari: [[300, 900]],
      muslim: [[200, 600]],
      'abu-dawud': [[1, 500]],
      nasai: [[1, 700]],
      tirmidzi: [[1, 400]],
    }
  },
  puasa: {
    topik_id: 'puasa',
    keywords: ['puasa', 'shaum', 'ramadan', 'sahur', 'iftar', 'lailatul qadar'],
    ranges: {
      bukhari: [[1800, 1980]],
      muslim: [[1090, 1180]],
      tirmidzi: [[680, 820]],
    }
  },
  zakat: {
    topik_id: 'zakat',
    keywords: ['zakat', 'sedekah', 'infaq', 'shadaqah', 'wakaf'],
    ranges: {
      bukhari: [[1395, 1520]],
      muslim: [[980, 1080]],
      tirmidzi: [[630, 680]],
    }
  },
  haji: {
    topik_id: 'haji',
    keywords: ['haji', 'umrah', 'makkah', 'kabah', 'tawaf', 'ihram', 'arafah'],
    ranges: {
      bukhari: [[1513, 1800]],
      muslim: [[1180, 1400]],
      tirmidzi: [[820, 1000]],
    }
  },
  akhlak: {
    topik_id: 'akhlak',
    keywords: ['akhlak', 'adab', 'jujur', 'amanah', 'silaturahmi', 'malu', 'pemaaf'],
    ranges: {
      bukhari: [[5900, 6100]],
      muslim: [[2540, 2640]],
      tirmidzi: [[1920, 2060]],
    }
  },
  ilmu: {
    topik_id: 'ilmu',
    keywords: ['ilmu', 'belajar', 'mengajar', 'ulama', 'hikmah', 'pengetahuan'],
    ranges: {
      bukhari: [[98, 135]],
      muslim: [[2690, 2760]],
      tirmidzi: [[2570, 2690]],
    }
  },
  sabar: {
    topik_id: 'sabar',
    keywords: ['sabar', 'syukur', 'ujian', 'cobaan', 'musibah', 'ridha', 'tawakal'],
    ranges: {
      bukhari: [[1418, 1470]],
      muslim: [[900, 940]],
      tirmidzi: [[2390, 2500]],
    }
  },
  keluarga: {
    topik_id: 'keluarga',
    keywords: ['nikah', 'istri', 'suami', 'anak', 'ibu', 'ayah', 'orang tua', 'keluarga'],
    ranges: {
      bukhari: [[4999, 5400]],
      muslim: [[1400, 1580]],
      tirmidzi: [[1080, 1250]],
    }
  },
  rezeki: {
    topik_id: 'rezeki',
    keywords: ['rezeki', 'harta', 'kerja', 'jual beli', 'halal', 'haram', 'riba'],
    ranges: {
      bukhari: [[1999, 2240]],
      muslim: [[1530, 1620]],
      tirmidzi: [[1200, 1380]],
    }
  },
  doa: {
    topik_id: 'doa',
    keywords: ['doa', 'dzikir', 'wirid', 'istighfar', 'tasbih', 'tahmid'],
    ranges: {
      bukhari: [[6290, 6460]],
      muslim: [[2670, 2740]],
      tirmidzi: [[3370, 3600]],
    }
  },
  taubat: {
    topik_id: 'taubat',
    keywords: ['taubat', 'tobat', 'ampun', 'istighfar', 'dosa'],
    ranges: {
      bukhari: [[6300, 6360]],
      muslim: [[2740, 2810]],
      tirmidzi: [[3530, 3610]],
    }
  },
  akhirat: {
    topik_id: 'akhirat',
    keywords: ['kiamat', 'akhirat', 'surga', 'neraka', 'syafaat', 'mati', 'kubur'],
    ranges: {
      bukhari: [[6520, 6640]],
      muslim: [[2820, 2970]],
      tirmidzi: [[2430, 2620]],
    }
  },
  sosial: {
    topik_id: 'sosial',
    keywords: ['tetangga', 'tamu', 'ukhuwah', 'tolong menolong', 'pemimpin', 'adil'],
    ranges: {
      bukhari: [[2430, 2520]],
      muslim: [[2580, 2640]],
      tirmidzi: [[1920, 2000]],
    }
  },
  kisah_nabi: {
    topik_id: 'kisah_nabi',
    keywords: ['nabi', 'rasul', 'ibrahim', 'musa', 'isa', 'yunus', 'sulaiman', 'yusuf'],
    ranges: {
      bukhari: [[3300, 3520]],
      muslim: [[2360, 2460]],
      tirmidzi: [[3340, 3420]],
    }
  },
  kesehatan: {
    topik_id: 'kesehatan',
    keywords: ['sehat', 'sakit', 'obat', 'bekam', 'madu', 'habbatus sauda', 'thibbun nabawi'],
    ranges: {
      bukhari: [[5670, 5800]],
      muslim: [[2190, 2240]],
      tirmidzi: [[2030, 2110]],
    }
  },
}

// Mapping keyword tema kultum → topik_id
export const TEMA_TO_TOPIK: Record<string, string> = {
  // Iman
  'iman': 'iman', 'tauhid': 'iman', 'akidah': 'iman', 'syahadat': 'iman', 'taqwa': 'iman',
  'kafir': 'iman', 'munafik': 'iman', 'keyakinan': 'iman',

  // Shalat
  'shalat': 'shalat', 'salat': 'shalat', 'sholat': 'shalat', 'wudhu': 'shalat',
  'adzan': 'shalat', 'masjid': 'shalat', 'subuh': 'shalat', 'dzuhur': 'shalat',
  'ashar': 'shalat', 'maghrib': 'shalat', 'isya': 'shalat', 'tahajud': 'shalat',

  // Puasa
  'puasa': 'puasa', 'shaum': 'puasa', 'ramadan': 'puasa', 'ramadhan': 'puasa',
  'sahur': 'puasa', 'iftar': 'puasa', 'lailatul': 'puasa', 'tarawih': 'puasa',

  // Zakat
  'zakat': 'zakat', 'sedekah': 'zakat', 'infaq': 'zakat', 'shadaqah': 'zakat', 'wakaf': 'zakat',

  // Haji
  'haji': 'haji', 'umrah': 'haji', 'makkah': 'haji', 'kabah': 'haji',
  'tawaf': 'haji', 'ihram': 'haji', 'arafah': 'haji',

  // Akhlak
  'akhlak': 'akhlak', 'adab': 'akhlak', 'silaturahmi': 'akhlak', 'malu': 'akhlak',
  'sopan': 'akhlak',

  'jujur': 'kejujuran', 'kejujuran': 'kejujuran', 'amanah': 'kejujuran',
  'bohong': 'kejujuran', 'dusta': 'kejujuran',

  'sombong': 'tawadhu', 'tawadhu': 'tawadhu', 'rendah hati': 'tawadhu',
  'takabur': 'tawadhu',

  'marah': 'pemaaf', 'memaafkan': 'pemaaf', 'pemaaf': 'pemaaf', 'dendam': 'pemaaf',

  // Ilmu
  'ilmu': 'ilmu', 'belajar': 'ilmu', 'mengajar': 'ilmu', 'pendidikan': 'ilmu',
  'hikmah': 'ilmu', 'ulama': 'ilmu', 'pengetahuan': 'ilmu',

  // Sabar
  'sabar': 'sabar', 'syukur': 'sabar', 'ujian': 'sabar', 'cobaan': 'sabar',
  'musibah': 'sabar', 'ridha': 'sabar', 'tawakal': 'sabar', 'qanaah': 'sabar',
  'ikhlas': 'sabar',

  'optimis': 'optimisme', 'harapan': 'optimisme', 'putus asa': 'optimisme',

  'istiqomah': 'istiqomah', 'istiqamah': 'istiqomah', 'konsisten': 'istiqomah',

  // Keluarga
  'istri': 'keluarga', 'suami': 'keluarga', 'anak': 'keluarga', 'keluarga': 'keluarga',

  'nikah': 'pernikahan', 'pernikahan': 'pernikahan', 'mahar': 'pernikahan',
  'talak': 'pernikahan',

  'birrul walidain': 'birrul_walidain', 'berbakti': 'birrul_walidain',
  'durhaka': 'birrul_walidain', 'orang tua': 'birrul_walidain',
  'ibu bapak': 'birrul_walidain', 'ibu': 'birrul_walidain',
  'ayah': 'birrul_walidain',

  'mendidik': 'tarbiyah', 'tarbiyah': 'tarbiyah', 'didik anak': 'tarbiyah',
  'adab anak': 'tarbiyah',

  // Rezeki
  'rezeki': 'rezeki', 'harta': 'rezeki', 'kerja': 'rezeki', 'usaha': 'rezeki',
  'dagang': 'rezeki', 'halal': 'rezeki', 'haram': 'rezeki',

  'jual beli': 'muamalah', 'muamalah': 'muamalah', 'hutang': 'muamalah',
  'riba': 'muamalah',

  // Doa
  'doa': 'doa', 'dzikir': 'doa', 'wirid': 'doa', 'istighfar': 'doa',
  'tasbih': 'doa', 'tahmid': 'doa', 'takbir': 'doa',

  // Taubat
  'taubat': 'taubat', 'tobat': 'taubat', 'ampun': 'taubat', 'dosa': 'taubat',

  // Akhirat
  'kiamat': 'akhirat', 'akhirat': 'akhirat', 'surga': 'akhirat', 'neraka': 'akhirat',
  'syafaat': 'akhirat', 'mati': 'akhirat', 'kubur': 'akhirat', 'barzakh': 'akhirat',

  // Sosial
  'tetangga': 'ukhuwah', 'tamu': 'ukhuwah', 'ukhuwah': 'ukhuwah', 'persaudaraan': 'ukhuwah',
  'pemimpin': 'kepemimpinan', 'kepemimpinan': 'kepemimpinan', 'adil': 'kepemimpinan', 'zalim': 'kepemimpinan',

  // Kisah Nabi
  'yunus': 'kisah_nabi', 'musa': 'kisah_nabi', 'ibrahim': 'kisah_nabi',
  'yusuf': 'kisah_nabi', 'sulaiman': 'kisah_nabi', 'isa': 'kisah_nabi',
  'adam': 'kisah_nabi', 'nuh': 'kisah_nabi', 'ayyub': 'kisah_nabi',

  // Kesehatan
  'sehat': 'kesehatan', 'sakit': 'kesehatan', 'obat': 'kesehatan',
  'bekam': 'kesehatan', 'madu': 'kesehatan', 'thibbun': 'kesehatan',

  'isra': 'isra_miraj', "mi'raj": 'isra_miraj', 'isra miraj': 'isra_miraj',

  'muhasabah': 'muhasabah', 'introspeksi': 'muhasabah',

  'penciptaan': 'penciptaan', 'alam semesta': 'penciptaan',

  'qalbu': 'kesehatan_jiwa', 'ketenangan': 'kesehatan_jiwa', 'penyakit hati': 'kesehatan_jiwa',
}

export function temaToTopikId(tema: string): string[] {
  const temaLower = tema.toLowerCase()
  console.log('[temaToTopikId] tema:', temaLower)

  const entries = Object.entries(TEMA_TO_TOPIK)
    .sort((a, b) => b[0].length - a[0].length)

  for (const [keyword, topikId] of entries) {
    if (temaLower.includes(keyword)) {
      console.log('[temaToTopikId] match:', keyword, '->', topikId)
    }
  }

  const matched = new Set<string>()
  for (const [keyword, topikId] of entries) {
    if (temaLower.includes(keyword)) matched.add(topikId)
  }

  const result = Array.from(matched).slice(0, 3)
  console.log('[temaToTopikId] result:', result)
  return result
}
