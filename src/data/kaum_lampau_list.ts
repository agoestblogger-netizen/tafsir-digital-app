export interface KisahConfig {
  slug: string
  nama: string
  nama_arab: string
  kategori: 'kaum_diazab' | 'kisah_pilihan' | 'kisah_nabi'
  periode?: string
  lokasi?: string
  nabi_diutus?: string
  surah_utama: { surah_id: number; surah_nama: string; ayat_range: string }[]
  icon: string
}

export const KISAH_LIST: KisahConfig[] = [
  // ── KAUM YANG DIAZAB ──────────────────────────────────────
  {
    slug: 'kaum-nuh',
    nama: "Kaum Nuh",
    nama_arab: 'قَوْمُ نُوحٍ',
    kategori: 'kaum_diazab',
    periode: '± 5000-4000 SM',
    lokasi: 'Mesopotamia / Timur Tengah',
    nabi_diutus: 'Nabi Nuh AS',
    icon: '🌊',
    surah_utama: [
      { surah_id: 71, surah_nama: 'Nuh', ayat_range: '1-28' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '25-49' },
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '59-64' },
    ]
  },
  {
    slug: 'kaum-ad',
    nama: "Kaum 'Ad",
    nama_arab: 'قَوْمُ عَادٍ',
    kategori: 'kaum_diazab',
    periode: '± 3000-2000 SM',
    lokasi: 'Ahqaf (Yaman / Oman)',
    nabi_diutus: 'Nabi Hud AS',
    icon: '🏛️',
    surah_utama: [
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '65-72' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '50-60' },
      { surah_id: 46, surah_nama: 'Al-Ahqaf', ayat_range: '21-26' },
      { surah_id: 89, surah_nama: 'Al-Fajr', ayat_range: '6-8' },
    ]
  },
  {
    slug: 'kaum-tsamud',
    nama: "Kaum Tsamud",
    nama_arab: 'قَوْمُ ثَمُودَ',
    kategori: 'kaum_diazab',
    periode: '± 2000-1000 SM',
    lokasi: 'Al-Hijr (Arab Saudi bagian barat laut)',
    nabi_diutus: 'Nabi Shalih AS',
    icon: '🗿',
    surah_utama: [
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '73-79' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '61-68' },
      { surah_id: 91, surah_nama: 'Asy-Syams', ayat_range: '11-15' },
    ]
  },
  {
    slug: 'kaum-luth',
    nama: "Kaum Luth",
    nama_arab: 'قَوْمُ لُوطٍ',
    kategori: 'kaum_diazab',
    periode: '± 2000 SM',
    lokasi: 'Sodom (Laut Mati / Yordania)',
    nabi_diutus: 'Nabi Luth AS',
    icon: '🔥',
    surah_utama: [
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '80-84' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '77-83' },
      { surah_id: 26, surah_nama: 'Asy-Syu\'ara\'', ayat_range: '160-175' },
    ]
  },
  {
    slug: 'kaum-firaun',
    nama: "Kaum Fir'aun",
    nama_arab: 'قَوْمُ فِرْعَوْنَ',
    kategori: 'kaum_diazab',
    periode: '± 1400-1200 SM',
    lokasi: 'Mesir (Lembah Nil)',
    nabi_diutus: 'Nabi Musa AS',
    icon: '⚡',
    surah_utama: [
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '103-136' },
      { surah_id: 20, surah_nama: 'Thaha', ayat_range: '9-79' },
      { surah_id: 26, surah_nama: "Asy-Syu'ara'", ayat_range: '10-68' },
      { surah_id: 40, surah_nama: 'Ghafir', ayat_range: '23-50' },
    ]
  },
  {
    slug: 'kaum-saba',
    nama: "Kaum Saba'",
    nama_arab: 'قَوْمُ سَبَأٍ',
    kategori: 'kaum_diazab',
    periode: '± 1000-500 SM',
    lokasi: 'Yaman (Marib)',
    nabi_diutus: '-',
    icon: '🌿',
    surah_utama: [
      { surah_id: 34, surah_nama: "Saba'", ayat_range: '15-21' },
      { surah_id: 27, surah_nama: 'An-Naml', ayat_range: '22-44' },
    ]
  },
  {
    slug: 'kaum-madyan',
    nama: "Kaum Madyan",
    nama_arab: 'قَوْمُ مَدْيَنَ',
    kategori: 'kaum_diazab',
    periode: '± 2000-1500 SM',
    lokasi: 'Madyan (Arab Saudi / Yordania)',
    nabi_diutus: "Nabi Syu'aib AS",
    icon: '⚖️',
    surah_utama: [
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '85-93' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '84-95' },
      { surah_id: 26, surah_nama: "Asy-Syu'ara'", ayat_range: '176-191' },
    ]
  },
  {
    slug: 'kaum-aikah',
    nama: "Ashabul Aikah",
    nama_arab: 'أَصْحَابُ الأَيْكَةِ',
    kategori: 'kaum_diazab',
    periode: '± 2000-1500 SM',
    lokasi: 'Dekat Madyan',
    nabi_diutus: "Nabi Syu'aib AS",
    icon: '🌳',
    surah_utama: [
      { surah_id: 26, surah_nama: "Asy-Syu'ara'", ayat_range: '176-191' },
      { surah_id: 15, surah_nama: 'Al-Hijr', ayat_range: '78-79' },
    ]
  },
  {
    slug: 'ashabul-hijr',
    nama: "Ashabul Hijr",
    nama_arab: 'أَصْحَابُ الحِجْرِ',
    kategori: 'kaum_diazab',
    periode: '± 2000-1000 SM',
    lokasi: 'Al-Hijr (Arab Saudi)',
    nabi_diutus: 'Nabi Shalih AS',
    icon: '🏔️',
    surah_utama: [
      { surah_id: 15, surah_nama: 'Al-Hijr', ayat_range: '80-84' },
    ]
  },
  {
    slug: 'kaum-tubba',
    nama: "Kaum Tubba'",
    nama_arab: 'قَوْمُ تُبَّعٍ',
    kategori: 'kaum_diazab',
    periode: '± 400-500 M',
    lokasi: 'Yaman',
    nabi_diutus: '-',
    icon: '👑',
    surah_utama: [
      { surah_id: 44, surah_nama: 'Ad-Dukhan', ayat_range: '37' },
      { surah_id: 50, surah_nama: 'Qaf', ayat_range: '14' },
    ]
  },
  {
    slug: 'ashabul-fil',
    nama: "Ashabul Fil (Pasukan Gajah)",
    nama_arab: 'أَصْحَابُ الفِيلِ',
    kategori: 'kaum_diazab',
    periode: '570 M (Tahun Kelahiran Nabi)',
    lokasi: 'Makkah',
    nabi_diutus: '-',
    icon: '🐘',
    surah_utama: [
      { surah_id: 105, surah_nama: 'Al-Fil', ayat_range: '1-5' },
    ]
  },
  {
    slug: 'bani-israil',
    nama: "Bani Israil",
    nama_arab: 'بَنُو إِسْرَائِيلَ',
    kategori: 'kaum_diazab',
    periode: '± 1400-500 SM',
    lokasi: 'Mesir, Sinai, Palestina',
    nabi_diutus: 'Nabi Musa, Harun, Daud, Sulaiman AS',
    icon: '✡️',
    surah_utama: [
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '40-74' },
      { surah_id: 17, surah_nama: 'Al-Isra\'', ayat_range: '1-8' },
      { surah_id: 5, surah_nama: 'Al-Maidah', ayat_range: '20-26' },
    ]
  },

  // ── KISAH ORANG-ORANG PILIHAN ──────────────────────────────
  {
    slug: 'ashabul-kahfi',
    nama: "Ashabul Kahfi",
    nama_arab: 'أَصْحَابُ الكَهْفِ',
    kategori: 'kisah_pilihan',
    periode: '± Abad ke-3 M',
    lokasi: 'Ephesus (Turki)',
    nabi_diutus: '-',
    icon: '🕌',
    surah_utama: [
      { surah_id: 18, surah_nama: 'Al-Kahfi', ayat_range: '9-26' },
    ]
  },
  {
    slug: 'dzulqarnain',
    nama: "Dzulqarnain",
    nama_arab: 'ذُو القَرْنَيْنِ',
    kategori: 'kisah_pilihan',
    periode: 'Tidak pasti',
    lokasi: 'Timur dan Barat Dunia',
    nabi_diutus: '-',
    icon: '🗺️',
    surah_utama: [
      { surah_id: 18, surah_nama: 'Al-Kahfi', ayat_range: '83-98' },
    ]
  },
  {
    slug: 'maryam',
    nama: "Maryam binti Imran",
    nama_arab: 'مَرْيَمُ بِنْتُ عِمْرَانَ',
    kategori: 'kisah_pilihan',
    periode: '± Abad ke-1 SM',
    lokasi: 'Palestina',
    nabi_diutus: '-',
    icon: '🌹',
    surah_utama: [
      { surah_id: 19, surah_nama: 'Maryam', ayat_range: '16-34' },
      { surah_id: 3, surah_nama: 'Ali Imran', ayat_range: '42-47' },
    ]
  },
  {
    slug: 'ashabul-ukhdud',
    nama: "Ashabul Ukhdud",
    nama_arab: 'أَصْحَابُ الأُخْدُودِ',
    kategori: 'kisah_pilihan',
    periode: '± Abad ke-5-6 M',
    lokasi: 'Najran (Arab Saudi)',
    nabi_diutus: '-',
    icon: '🔥',
    surah_utama: [
      { surah_id: 85, surah_nama: 'Al-Buruj', ayat_range: '4-10' },
    ]
  },
  {
    slug: 'luqman',
    nama: "Luqman Al-Hakim",
    nama_arab: 'لُقْمَانُ الحَكِيمُ',
    kategori: 'kisah_pilihan',
    periode: 'Tidak pasti',
    lokasi: 'Afrika / Arab',
    nabi_diutus: '-',
    icon: '📚',
    surah_utama: [
      { surah_id: 31, surah_nama: 'Luqman', ayat_range: '12-19' },
    ]
  },
  {
    slug: 'ashabul-jannah',
    nama: "Ashabul Jannah (Pemilik Kebun)",
    nama_arab: 'أَصْحَابُ الجَنَّةِ',
    kategori: 'kisah_pilihan',
    periode: 'Tidak pasti',
    lokasi: 'Yaman',
    nabi_diutus: '-',
    icon: '🌳',
    surah_utama: [
      { surah_id: 68, surah_nama: 'Al-Qalam', ayat_range: '17-33' },
    ]
  },

  // ── KISAH PARA NABI ────────────────────────────────────────
  {
    slug: 'kisah-adam',
    nama: "Nabi Adam AS",
    nama_arab: 'آدَمُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: 'Awal penciptaan',
    lokasi: 'Surga → Bumi',
    nabi_diutus: '-',
    icon: '🌿',
    surah_utama: [
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '30-39' },
      { surah_id: 7, surah_nama: "Al-A'raf", ayat_range: '11-25' },
      { surah_id: 20, surah_nama: 'Thaha', ayat_range: '115-123' },
    ]
  },
  {
    slug: 'kisah-ibrahim',
    nama: "Nabi Ibrahim AS",
    nama_arab: 'إِبْرَاهِيمُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 2000 SM',
    lokasi: 'Ur (Irak) → Palestina → Makkah',
    nabi_diutus: '-',
    icon: '🔥',
    surah_utama: [
      { surah_id: 21, surah_nama: "Al-Anbiya'", ayat_range: '51-73' },
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '83-113' },
      { surah_id: 14, surah_nama: 'Ibrahim', ayat_range: '35-41' },
    ]
  },
  {
    slug: 'kisah-yusuf',
    nama: "Nabi Yusuf AS",
    nama_arab: 'يُوسُفُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 1800-1700 SM',
    lokasi: 'Palestina → Mesir',
    nabi_diutus: '-',
    icon: '⭐',
    surah_utama: [
      { surah_id: 12, surah_nama: 'Yusuf', ayat_range: '1-101' },
    ]
  },
  {
    slug: 'kisah-musa',
    nama: "Nabi Musa AS",
    nama_arab: 'مُوسَى عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 1400-1300 SM',
    lokasi: 'Mesir → Sinai → Palestina',
    nabi_diutus: '-',
    icon: '⚡',
    surah_utama: [
      { surah_id: 20, surah_nama: 'Thaha', ayat_range: '9-98' },
      { surah_id: 28, surah_nama: 'Al-Qashash', ayat_range: '1-43' },
      { surah_id: 26, surah_nama: "Asy-Syu'ara'", ayat_range: '10-68' },
    ]
  },
  {
    slug: 'kisah-sulaiman',
    nama: "Nabi Sulaiman AS",
    nama_arab: 'سُلَيْمَانُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 1000-900 SM',
    lokasi: 'Palestina (Yerusalem)',
    nabi_diutus: '-',
    icon: '👑',
    surah_utama: [
      { surah_id: 27, surah_nama: 'An-Naml', ayat_range: '15-44' },
      { surah_id: 34, surah_nama: "Saba'", ayat_range: '12-14' },
      { surah_id: 38, surah_nama: 'Shad', ayat_range: '30-40' },
    ]
  },
  {
    slug: 'kisah-isa',
    nama: "Nabi Isa AS",
    nama_arab: 'عِيسَى عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 1 SM - 30 M',
    lokasi: 'Palestina',
    nabi_diutus: '-',
    icon: '✨',
    surah_utama: [
      { surah_id: 3, surah_nama: 'Ali Imran', ayat_range: '45-59' },
      { surah_id: 19, surah_nama: 'Maryam', ayat_range: '30-36' },
      { surah_id: 5, surah_nama: 'Al-Maidah', ayat_range: '110-120' },
    ]
  },
  {
    slug: 'kisah-yunus',
    nama: "Nabi Yunus AS",
    nama_arab: 'يُونُسُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: '± 800-700 SM',
    lokasi: 'Niniwe (Irak)',
    nabi_diutus: '-',
    icon: '🐋',
    surah_utama: [
      { surah_id: 21, surah_nama: "Al-Anbiya'", ayat_range: '87-88' },
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '139-148' },
      { surah_id: 68, surah_nama: 'Al-Qalam', ayat_range: '48-50' },
    ]
  },
  {
    slug: 'kisah-ayyub',
    nama: "Nabi Ayyub AS",
    nama_arab: 'أَيُّوبُ عَلَيْهِ السَّلَامُ',
    kategori: 'kisah_nabi',
    periode: 'Tidak pasti',
    lokasi: 'Hauran (Suriah/Yordania)',
    nabi_diutus: '-',
    icon: '💪',
    surah_utama: [
      { surah_id: 21, surah_nama: "Al-Anbiya'", ayat_range: '83-84' },
      { surah_id: 38, surah_nama: 'Shad', ayat_range: '41-44' },
    ]
  },
]

// Helper functions
export function getByKategori(kategori: KisahConfig['kategori']) {
  return KISAH_LIST.filter(k => k.kategori === kategori)
}

export function getBySlug(slug: string) {
  return KISAH_LIST.find(k => k.slug === slug) ?? null
}
