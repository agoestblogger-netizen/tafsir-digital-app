export interface HaditsTopik {
  id: string
  nama: string
  icon: string
  deskripsi: string
  warna: string
  hadits_kurasi: Array<{ perawi: string; nomor: number; label: string }>
  keyword_search: string // untuk fallback API search
}

export const HADITS_TOPIK: HaditsTopik[] = [
  {
    id: 'iman',
    nama: 'Iman & Akidah',
    icon: '🌟',
    deskripsi: 'Hadits tentang rukun iman, tauhid, dan keyakinan',
    warna: 'gold',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 8, label: 'Rukun Islam' },
      { perawi: 'muslim', nomor: 8, label: 'Hadits Jibril tentang Iman' },
      { perawi: 'bukhari', nomor: 6, label: 'Wahyu pertama' },
    ],
    keyword_search: 'iman islam ihsan',
  },
  {
    id: 'shalat',
    nama: 'Shalat',
    icon: '🕌',
    deskripsi: 'Hadits tentang keutamaan dan tata cara shalat',
    warna: 'teal',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 528, label: 'Keutamaan shalat tepat waktu' },
      { perawi: 'muslim', nomor: 233, label: 'Shalat menghapus dosa' },
      { perawi: 'tirmidzi', nomor: 214, label: 'Shalat tiang agama' },
    ],
    keyword_search: 'shalat sembahyang',
  },
  {
    id: 'puasa',
    nama: 'Puasa & Ramadan',
    icon: '🌙',
    deskripsi: 'Hadits tentang puasa, Ramadan, dan keutamaannya',
    warna: 'purple',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 1894, label: 'Keutamaan puasa Ramadan' },
      { perawi: 'muslim', nomor: 1151, label: 'Puasa perisai' },
      { perawi: 'bukhari', nomor: 1901, label: 'Lailatul Qadar' },
    ],
    keyword_search: 'puasa ramadan shaum',
  },
  {
    id: 'zakat',
    nama: 'Zakat & Sedekah',
    icon: '💰',
    deskripsi: 'Hadits tentang zakat, infaq, dan sedekah',
    warna: 'gold',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 1410, label: 'Keutamaan sedekah' },
      { perawi: 'muslim', nomor: 1010, label: 'Sedekah tidak mengurangi harta' },
      { perawi: 'bukhari', nomor: 1442, label: 'Zakat wajib' },
    ],
    keyword_search: 'zakat sedekah infaq',
  },
  {
    id: 'akhlak',
    nama: 'Akhlak Mulia',
    icon: '✨',
    deskripsi: 'Hadits tentang budi pekerti dan karakter Islam',
    warna: 'teal',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 6029, label: 'Akhlak mulia' },
      { perawi: 'muslim', nomor: 2553, label: 'Silaturahmi' },
      { perawi: 'tirmidzi', nomor: 1975, label: 'Malu bagian dari iman' },
    ],
    keyword_search: 'akhlak adab sopan',
  },
  {
    id: 'ilmu',
    nama: 'Ilmu & Pendidikan',
    icon: '📚',
    deskripsi: 'Hadits tentang keutamaan menuntut ilmu',
    warna: 'sci-blue',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 100, label: 'Kewajiban menuntut ilmu' },
      { perawi: 'tirmidzi', nomor: 2682, label: 'Keutamaan orang berilmu' },
      { perawi: 'muslim', nomor: 2699, label: 'Ilmu yang bermanfaat' },
    ],
    keyword_search: 'ilmu belajar mengajar',
  },
  {
    id: 'sabar',
    nama: 'Sabar & Syukur',
    icon: '🤲',
    deskripsi: 'Hadits tentang kesabaran dan rasa syukur',
    warna: 'amber',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 1469, label: 'Keutamaan sabar' },
      { perawi: 'muslim', nomor: 918, label: 'Sabar atas musibah' },
      { perawi: 'tirmidzi', nomor: 2396, label: 'Sabar adalah cahaya' },
    ],
    keyword_search: 'sabar syukur ujian cobaan',
  },
  {
    id: 'keluarga',
    nama: 'Keluarga',
    icon: '👨👩👧👦',
    deskripsi: 'Hadits tentang pernikahan, anak, dan orang tua',
    warna: 'rose',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 5186, label: 'Berbuat baik kepada istri' },
      { perawi: 'muslim', nomor: 1468, label: 'Hak suami istri' },
      { perawi: 'bukhari', nomor: 5971, label: 'Birrul walidain' },
    ],
    keyword_search: 'keluarga nikah anak orang tua',
  },
  {
    id: 'rezeki',
    nama: 'Rezeki & Kerja',
    icon: '💼',
    deskripsi: 'Hadits tentang mencari rezeki yang halal',
    warna: 'gold',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 2067, label: 'Rezeki halal' },
      { perawi: 'tirmidzi', nomor: 2344, label: 'Zuhud dan rezeki' },
      { perawi: 'bukhari', nomor: 2072, label: 'Bekerja dengan tangan sendiri' },
    ],
    keyword_search: 'rezeki harta kerja halal',
  },
  {
    id: 'doa',
    nama: 'Doa & Dzikir',
    icon: '📿',
    deskripsi: 'Hadits tentang doa-doa dan dzikir harian',
    warna: 'teal',
    hadits_kurasi: [
      { perawi: 'tirmidzi', nomor: 3371, label: 'Doa adalah ibadah' },
      { perawi: 'bukhari', nomor: 6340, label: 'Keutamaan berdoa' },
      { perawi: 'muslim', nomor: 2675, label: 'Dzikir pagi petang' },
    ],
    keyword_search: 'doa dzikir wirid',
  },
  {
    id: 'taubat',
    nama: 'Taubat & Ampunan',
    icon: '🌱',
    deskripsi: 'Hadits tentang taubat dan pintu ampunan Allah',
    warna: 'teal',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 6308, label: 'Allah menerima taubat' },
      { perawi: 'muslim', nomor: 2758, label: 'Taubat sebelum kiamat' },
      { perawi: 'tirmidzi', nomor: 3537, label: 'Istighfar menghapus dosa' },
    ],
    keyword_search: 'taubat ampun istighfar',
  },
  {
    id: 'akhirat',
    nama: 'Akhirat & Kiamat',
    icon: '⚖️',
    deskripsi: 'Hadits tentang hari akhir, surga, dan neraka',
    warna: 'amber',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 6561, label: 'Gambaran surga' },
      { perawi: 'muslim', nomor: 2841, label: 'Hari kiamat' },
      { perawi: 'tirmidzi', nomor: 2460, label: 'Persiapan menghadapi maut' },
    ],
    keyword_search: 'akhirat kiamat surga neraka',
  },
  {
    id: 'sosial',
    nama: 'Sosial & Masyarakat',
    icon: '🤝',
    deskripsi: 'Hadits tentang hubungan antar manusia',
    warna: 'sci-blue',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 13, label: 'Mencintai sesama mukmin' },
      { perawi: 'muslim', nomor: 2564, label: 'Muslim bersaudara' },
      { perawi: 'bukhari', nomor: 2442, label: 'Tolong menolong' },
    ],
    keyword_search: 'sosial masyarakat tolong ukhuwah',
  },
  {
    id: 'kisah_nabi',
    nama: 'Kisah Para Nabi',
    icon: '🌟',
    deskripsi: 'Hadits tentang kisah para nabi dan rasul',
    warna: 'gold',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 3376, label: 'Nabi Sulaiman dan semut' },
      { perawi: 'bukhari', nomor: 3395, label: 'Nabi Musa dan Khidir' },
      { perawi: 'bukhari', nomor: 3416, label: 'Kisah Nabi Yunus' },
    ],
    keyword_search: 'nabi rasul kisah',
  },
  {
    id: 'kesehatan',
    nama: 'Kesehatan & Thibbun Nabawi',
    icon: '🌿',
    deskripsi: 'Hadits tentang pengobatan dan kesehatan Islami',
    warna: 'teal',
    hadits_kurasi: [
      { perawi: 'bukhari', nomor: 5678, label: 'Habbatus sauda' },
      { perawi: 'muslim', nomor: 2204, label: 'Setiap penyakit ada obatnya' },
      { perawi: 'bukhari', nomor: 5373, label: 'Makan secukupnya' },
    ],
    keyword_search: 'sehat obat thibbun nabawi',
  },
]
