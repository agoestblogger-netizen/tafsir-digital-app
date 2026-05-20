export interface KisahConfig {
  slug: string
  nama: string
  nama_arab: string
  kategori: 'kaum_diazab' | 'kisah_pilihan' | 'kisah_nabi' | 'sirah_nabawiyah'
  tipe_kisah?: 'kaum_diazab' | 'kisah_pilihan' | 'kisah_nabi' | 'sirah_nabawiyah'
  periode?: string
  lokasi?: string
  nabi_diutus?: string
  ringkasan?: string
  surah_utama: { 
    surah_id: number
    surah_nama: string
    ayat_range: string 
  }[]
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
    slug: 'kisah-ibrahim-api',
    nama: 'Nabi Ibrahim AS — Dibakar Api',
    nama_arab: 'إِبْرَاهِيمُ عَلَيْهِ السَّلَّام',
    kategori: 'kisah_nabi',
    periode: '± 2000 SM',
    lokasi: 'Ur (Irak)',
    nabi_diutus: 'Nabi Ibrahim AS',
    icon: '🔥',
    surah_utama: [
      { surah_id: 21, surah_nama: "Al-Anbiya'", ayat_range: '58-70' },
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '83-98' },
    ]
  },
  {
    slug: 'kisah-ibrahim-ismail',
    nama: 'Nabi Ibrahim AS — Pengorbanan Ismail',
    nama_arab: 'إِبْرَاهِيمُ وَإِسْمَاعِيلُ عَلَيْهِمَا السَّلَام',
    kategori: 'kisah_nabi',
    periode: '± 2000 SM',
    lokasi: 'Makkah (Arab Saudi)',
    nabi_diutus: 'Nabi Ibrahim AS',
    icon: '🐑',
    surah_utama: [
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '100-113' },
    ]
  },
  {
    slug: 'kisah-ibrahim-kabah',
    nama: 'Nabi Ibrahim AS — Membangun Kabah',
    nama_arab: 'إِبْرَاهِيمُ يَبْنِي الْكَعْبَة',
    kategori: 'kisah_nabi',
    periode: '± 2000 SM',
    lokasi: 'Makkah (Arab Saudi)',
    nabi_diutus: 'Nabi Ibrahim AS',
    icon: '🕋',
    surah_utama: [
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '125-129' },
      { surah_id: 14, surah_nama: 'Ibrahim', ayat_range: '35-41' },
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
  // KISAH NABI BARU
  { slug: 'kisah-idris', nama: 'Nabi Idris AS', 
    nama_arab: 'نَبِيّ إِدْرِيس', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 3000 SM',
    lokasi: 'Babilonia', icon: '⭐',
    ringkasan: 'Nabi pertama yang menulis dengan pena dan ahli dalam ilmu astronomi. Allah mengangkat derajatnya ke tempat yang tinggi.',
    surah_utama: [
      { surah_id: 19, surah_nama: 'Maryam', ayat_range: '56-57' },
      { surah_id: 21, surah_nama: 'Al-Anbiya', ayat_range: '85-86' }
    ]
  },
  { slug: 'kisah-hud', nama: 'Nabi Hud AS',
    nama_arab: 'نَبِيّ هُود', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 2500 SM',
    lokasi: 'Ahqaf, Jazirah Arab', icon: '🌪️',
    ringkasan: 'Diutus kepada Kaum Ad yang sombong dan kuat. Mereka menolak dakwah hingga Allah menghancurkan mereka dengan angin kencang selama 7 malam 8 hari.',
    surah_utama: [
      { surah_id: 7, surah_nama: 'Al-Araf', ayat_range: '65-72' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '50-60' }
    ]
  },
  { slug: 'kisah-saleh', nama: 'Nabi Saleh AS',
    nama_arab: 'نَبِيّ صَالِح', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 2000 SM',
    lokasi: 'Al-Hijr, Jazirah Arab', icon: '🐪',
    ringkasan: 'Diutus kepada Kaum Tsamud. Mukjizatnya seekor unta betina dari batu. Kaum Tsamud menyembelih unta tersebut hingga azab menimpa mereka.',
    surah_utama: [
      { surah_id: 7, surah_nama: 'Al-Araf', ayat_range: '73-79' },
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '61-68' }
    ]
  },
  { slug: 'kisah-ishaq', nama: 'Nabi Ishaq AS',
    nama_arab: 'نَبِيّ إِسْحَاق', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1900 SM',
    lokasi: 'Kanaan (Palestina)', icon: '🌟',
    ringkasan: 'Putra Nabi Ibrahim dari Sarah, lahir sebagai karunia Allah di usia tua. Menjadi nabi dan meneruskan risalah tauhid ayahnya.',
    surah_utama: [
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '112-113' }
    ]
  },
  { slug: 'kisah-yaqub', nama: 'Nabi Yaqub AS',
    nama_arab: 'نَبِيّ يَعْقُوب', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1800 SM',
    lokasi: 'Kanaan & Mesir', icon: '👴',
    ringkasan: 'Ayah dari 12 putra yang menjadi cikal bakal Bani Israil. Kesabarannya menghadapi kehilangan Yusuf hingga akhirnya bersatu kembali di Mesir.',
    surah_utama: [
      { surah_id: 12, surah_nama: 'Yusuf', ayat_range: '4-100' }
    ]
  },
  { slug: 'kisah-harun', nama: 'Nabi Harun AS',
    nama_arab: 'نَبِيّ هَارُون', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1400 SM',
    lokasi: 'Mesir & Sinai', icon: '📜',
    ringkasan: 'Saudara kandung Nabi Musa yang menjadi pendamping dan juru bicara dalam dakwah kepada Firaun. Dikaruniai kemampuan bicara yang fasih.',
    surah_utama: [
      { surah_id: 20, surah_nama: 'Thaha', ayat_range: '29-35' },
      { surah_id: 7, surah_nama: 'Al-Araf', ayat_range: '122' }
    ]
  },
  { slug: 'kisah-dzulkifli', nama: 'Nabi Dzulkifli AS',
    nama_arab: 'نَبِيّ ذُو الْكِفْل', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1500 SM',
    lokasi: 'Syam (Suriah)', icon: '⚖️',
    ringkasan: 'Nabi yang terkenal karena kesabaran dan komitmennya dalam menunaikan janji. Selalu melaksanakan shalat dan tidak pernah marah.',
    surah_utama: [
      { surah_id: 21, surah_nama: 'Al-Anbiya', ayat_range: '85-86' },
      { surah_id: 38, surah_nama: 'Sad', ayat_range: '48' }
    ]
  },
  { slug: 'kisah-ilyas', nama: 'Nabi Ilyas AS',
    nama_arab: 'نَبِيّ إِلْيَاس', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 900 SM',
    lokasi: 'Baalbek, Libanon', icon: '⚡',
    ringkasan: 'Diutus kepada kaum yang menyembah berhala Baal. Berdakwah dengan gigih namun kaumnya menolak hingga Allah menyelamatkannya.',
    surah_utama: [
      { surah_id: 37, surah_nama: 'As-Saffat', ayat_range: '123-132' }
    ]
  },
  { slug: 'kisah-ilyasa', nama: 'Nabi Ilyasa AS',
    nama_arab: 'نَبِيّ الْيَسَع', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 850 SM',
    lokasi: 'Palestina', icon: '🌊',
    ringkasan: 'Penerus dakwah Nabi Ilyas. Seorang nabi yang sabar and tabah dalam menyebarkan agama Allah kepada Bani Israil.',
    surah_utama: [
      { surah_id: 6, surah_nama: 'Al-Anam', ayat_range: '86-87' },
      { surah_id: 38, surah_nama: 'Sad', ayat_range: '48' }
    ]
  },
  { slug: 'kisah-dawud', nama: 'Nabi Dawud AS',
    nama_arab: 'نَبِيّ دَاوُد', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1000 SM',
    lokasi: 'Palestina & Yerusalem', icon: '👑',
    ringkasan: 'Raja dan nabi yang membunuh Jalut saat masih muda. Dikaruniai suara merdu, kitab Zabur, kemampuan melunakkan besi, dan berbicara dengan burung.',
    surah_utama: [
      { surah_id: 38, surah_nama: 'Sad', ayat_range: '17-26' },
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '251' }
    ]
  },
  { slug: 'kisah-zakaria', nama: 'Nabi Zakaria AS',
    nama_arab: 'نَبِيّ زَكَرِيَّا', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 100 SM',
    lokasi: 'Palestina & Yerusalem', icon: '🕊️',
    ringkasan: 'Di usia tua dengan istri yang mandul, berdoa kepada Allah agar dikaruniai keturunan. Allah mengabulkan doanya dengan kelahiran Yahya secara mukjizat.',
    surah_utama: [
      { surah_id: 19, surah_nama: 'Maryam', ayat_range: '1-11' },
      { surah_id: 3, surah_nama: 'Ali Imran', ayat_range: '37-41' }
    ]
  },
  { slug: 'kisah-yahya', nama: 'Nabi Yahya AS',
    nama_arab: 'نَبِيّ يَحْيَى', kategori: 'kisah_nabi',
    tipe_kisah: 'kisah_nabi', periode: '± 1 SM',
    lokasi: 'Palestina', icon: '🌿',
    ringkasan: 'Putra Nabi Zakaria yang lahir secara mukjizat. Hidup sederhana, zuhud, dan menjadi nabi sejak kecil. Diberi hikmah dan kasih sayang sejak dini.',
    surah_utama: [
      { surah_id: 19, surah_nama: 'Maryam', ayat_range: '12-15' }
    ]
  },

  // KISAH PILIHAN BARU
  { slug: 'kisah-habil-qabil', nama: 'Habil dan Qabil',
    nama_arab: 'هَابِيل وَقَابِيل', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: 'Awal penciptaan manusia',
    lokasi: 'Bumi', icon: '⚔️',
    ringkasan: 'Dua putra Nabi Adam yang mempersembahkan kurban. Kurban Habil diterima Allah, Qabil tidak. Karena dengki, Qabil membunuh Habil — pembunuhan pertama dalam sejarah.',
    surah_utama: [
      { surah_id: 5, surah_nama: 'Al-Maidah', ayat_range: '27-32' }
    ]
  },
  { slug: 'kisah-thalut-jalut', nama: 'Thalut dan Jalut',
    nama_arab: 'طَالُوت وَجَالُوت', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 1000 SM',
    lokasi: 'Palestina', icon: '🛡️',
    ringkasan: 'Thalut dipilih Allah memimpin Bani Israil melawan Jalut yang zalim. Dawud muda berhasil membunuh Jalut dengan ketapel atas izin Allah.',
    surah_utama: [
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '246-251' }
    ]
  },
  { slug: 'kisah-luqman', nama: 'Luqman Al-Hakim',
    nama_arab: 'لُقْمَان الْحَكِيم', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 1000 SM',
    lokasi: 'Afrika / Nubia', icon: '📖',
    ringkasan: 'Seorang yang dikaruniai hikmah oleh Allah. Terkenal dengan nasihat-nasihatnya kepada putranya tentang tauhid, shalat, akhlak, dan larangan sombong.',
    surah_utama: [
      { surah_id: 31, surah_nama: 'Luqman', ayat_range: '12-19' }
    ]
  },
  { slug: 'kisah-qarun', nama: 'Qarun',
    nama_arab: 'قَارُون', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 1400 SM',
    lokasi: 'Mesir', icon: '💰',
    ringkasan: 'Diberi kekayaan berlimpah namun menjadi sombong dan ingkar. Mengklaim kekayaannya hasil kepintaran sendiri. Allah membenamkannya beserta hartanya ke dalam bumi.',
    surah_utama: [
      { surah_id: 28, surah_nama: 'Al-Qasas', ayat_range: '76-82' }
    ]
  },
  { slug: 'kisah-ashabul-ukhdud', nama: 'Ashabul Ukhdud',
    nama_arab: 'أَصْحَابُ الْأُخْدُود', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 500 M',
    lokasi: 'Najran, Yaman', icon: '🔥',
    ringkasan: 'Para penguasa zalim membuat parit berisi api untuk membakar orang-orang beriman yang tidak mau meninggalkan agamanya. Mereka mati syahid dengan penuh keimanan.',
    surah_utama: [
      { surah_id: 85, surah_nama: 'Al-Buruj', ayat_range: '4-10' }
    ]
  },
  { slug: 'kisah-ashabus-sabt', nama: 'Ashabus Sabt',
    nama_arab: 'أَصْحَابُ السَّبْت', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 800 SM',
    lokasi: 'Eilat, Palestina', icon: '🐟',
    ringkasan: 'Bani Israil yang melanggar larangan memancing di hari Sabtu dengan tipu muslihat. Allah mengutuk mereka menjadi kera sebagai pelajaran bagi generasi berikutnya.',
    surah_utama: [
      { surah_id: 7, surah_nama: 'Al-Araf', ayat_range: '163-166' }
    ]
  },
  { slug: 'kisah-ratu-balqis', nama: 'Ratu Balqis (Saba)',
    nama_arab: 'مَلِكَةُ سَبَأ', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: '± 1000 SM',
    lokasi: 'Saba, Yaman', icon: '👸',
    ringkasan: 'Ratu Saba yang cerdas dan bijaksana. Setelah menerima surat Nabi Sulaiman, ia datang menghadap dan akhirnya beriman kepada Allah bersama Sulaiman.',
    surah_utama: [
      { surah_id: 27, surah_nama: 'An-Naml', ayat_range: '22-44' }
    ]
  },
  { slug: 'kisah-kaum-tsamud', nama: 'Kaum Tsamud',
    nama_arab: 'قَوْمُ ثَمُود', kategori: 'kaum_diazab',
    tipe_kisah: 'kaum_diazab', periode: '± 2000 SM',
    lokasi: 'Al-Hijr, Jazirah Arab', icon: '🪨',
    ringkasan: 'Kaum yang menyembelih unta mukjizat Nabi Saleh. Tiga hari setelah peringatan, mereka diazab dengan suara petir yang dahsyat hingga binasa.',
    surah_utama: [
      { surah_id: 11, surah_nama: 'Hud', ayat_range: '61-68' },
      { surah_id: 7, surah_nama: 'Al-Araf', ayat_range: '73-79' }
    ]
  },
  { slug: 'kisah-keluar-ribuan', nama: 'Kaum yang Keluar Ribuan',
    nama_arab: 'الَّذِينَ خَرَجُوا', kategori: 'kisah_pilihan',
    tipe_kisah: 'kisah_pilihan', periode: 'Zaman Bani Israil',
    lokasi: 'Syam', icon: '👥',
    ringkasan: 'Ribuan orang keluar meninggalkan kampung halaman karena takut wabah/perang. Allah mematikan mereka lalu menghidupkan kembali sebagai pelajaran tentang kekuasaan-Nya.',
    surah_utama: [
      { surah_id: 2, surah_nama: 'Al-Baqarah', ayat_range: '243' }
    ]
  },

  // SIRAH NABAWIYAH BARU
  { slug: 'sirah-isra-miraj', nama: 'Isra Miraj',
    nama_arab: 'الْإِسْرَاء وَالْمِعْرَاج', 
    kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '621 M',
    lokasi: 'Makkah → Yerusalem → Sidratul Muntaha',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🌙',
    ringkasan: 'Perjalanan malam Rasulullah dari Masjidil Haram ke Masjidil Aqsa lalu naik ke langit hingga Sidratul Muntaha. Menerima perintah shalat 5 waktu langsung dari Allah.',
    surah_utama: [
      { surah_id: 17, surah_nama: 'Al-Isra', ayat_range: '1' },
      { surah_id: 53, surah_nama: 'An-Najm', ayat_range: '1-18' }
    ]
  },
  { slug: 'sirah-perang-badar', nama: 'Perang Badar',
    nama_arab: 'غَزْوَةُ بَدْر', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '2 H / 624 M',
    lokasi: 'Badar, Hijaz', 
    nabi_diutus: 'Nabi Muhammad SAW', icon: '⚔️',
    ringkasan: '313 pasukan Muslim menghadapi 1.000 tentara Quraisy. Dengan pertolongan Allah dan malaikat, kaum Muslim meraih kemenangan besar pertama dalam sejarah Islam.',
    surah_utama: [
      { surah_id: 3, surah_nama: 'Ali Imran', ayat_range: '123-127' },
      { surah_id: 8, surah_nama: 'Al-Anfal', ayat_range: '5-19' }
    ]
  },
  { slug: 'sirah-perang-uhud', nama: 'Perang Uhud',
    nama_arab: 'غَزْوَةُ أُحُد', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '3 H / 625 M',
    lokasi: 'Bukit Uhud, Madinah',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🏔️',
    ringkasan: 'Kaum Muslim awalnya menang namun sebagian pemanah meninggalkan pos karena mengincar harta rampasan. Pelajaran besar tentang ketaatan dan strategi perang.',
    surah_utama: [
      { surah_id: 3, surah_nama: 'Ali Imran', ayat_range: '121-179' }
    ]
  },
  { slug: 'sirah-perang-ahzab', nama: 'Perang Ahzab (Khandaq)',
    nama_arab: 'غَزْوَةُ الْأَحْزَاب', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '5 H / 627 M',
    lokasi: 'Madinah',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🏰',
    ringkasan: '10.000 pasukan koalisi mengepung Madinah. Strategi parit (khandaq) yang dicetuskan Salman Al-Farisi berhasil menahan musuh hingga Allah mengirimkan angin kencang.',
    surah_utama: [
      { surah_id: 33, surah_nama: 'Al-Ahzab', ayat_range: '9-27' }
    ]
  },
  { slug: 'sirah-perang-hunain', nama: 'Perang Hunain',
    nama_arab: 'غَزْوَةُ حُنَيْن', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '8 H / 630 M',
    lokasi: 'Lembah Hunain, Hijaz',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🏹',
    ringkasan: 'Setelah Fathu Makkah, 12.000 pasukan Muslim kalah di awal karena ujub (sombong). Ketabahan Rasulullah and pertolongan Allah membalikkan keadaan menjadi kemenangan.',
    surah_utama: [
      { surah_id: 9, surah_nama: 'At-Taubah', ayat_range: '25-27' }
    ]
  },
  { slug: 'sirah-hijrah', nama: 'Hijrah Nabi ke Madinah',
    nama_arab: 'هِجْرَةُ النَّبِيّ', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '1 H / 622 M',
    lokasi: 'Makkah → Gua Tsur → Madinah',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🌙',
    ringkasan: 'Rasulullah dan Abu Bakar bersembunyi di Gua Tsur 3 hari menghindari kejaran Quraisy. Allah mengirimkan ketenangan dan pertolongan-Nya hingga selamat sampai Madinah.',
    surah_utama: [
      { surah_id: 9, surah_nama: 'At-Taubah', ayat_range: '40' }
    ]
  },
  { slug: 'sirah-fathu-makkah', nama: 'Fathu Makkah',
    nama_arab: 'فَتْحُ مَكَّة', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '8 H / 630 M',
    lokasi: 'Makkah',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '🕌',
    ringkasan: '10.000 pasukan Muslim memasuki Makkah tanpa pertumpahan darah. Rasulullah memaafkan seluruh penduduk Makkah yang pernah menyakitinya — penaklukan penuh rahmat.',
    surah_utama: [
      { surah_id: 48, surah_nama: 'Al-Fath', ayat_range: '1-29' }
    ]
  },
  { slug: 'sirah-kisah-ifk', nama: 'Kisah Ifk (Fitnah Aisyah)',
    nama_arab: 'حَدِيثُ الْإِفْك', kategori: 'sirah_nabawiyah',
    tipe_kisah: 'sirah_nabawiyah', periode: '5 H / 627 M',
    lokasi: 'Madinah',
    nabi_diutus: 'Nabi Muhammad SAW', icon: '📜',
    ringkasan: 'Fitnah keji yang disebarkan kaum munafik terhadap kehormatan Aisyah RA. Allah menurunkan 10 ayat membebaskan Aisyah dan menetapkan hukum qadzaf.',
    surah_utama: [
      { surah_id: 24, surah_nama: 'An-Nur', ayat_range: '11-26' }
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
