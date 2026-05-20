const DAFTAR_TOPIK = [
  'Tauhid Uluhiyah', 'Tauhid Rububiyah', 'Tauhid Asma wa Sifat',
  'Menghindari Syirik', "Menghindari Bid'ah", 'Iman kepada Allah',
  'Iman kepada Malaikat', 'Iman kepada Kitab Allah', 'Iman kepada Rasul',
  'Iman kepada Hari Akhir', 'Iman kepada Qada & Qadar',
  'Taqwa', 'Ikhlas', 'Tawakkal', 'Syukur', 'Sabar',
  'Taubat & Istighfar', 'Takut kepada Allah', 'Harapan kepada Allah',
  'Cinta kepada Allah & Rasul', 'Manhaj & Pemahaman Islam', 'Menjawab Syubhat',
  'Kejujuran', 'Amanah', 'Tawadhu', 'Dermawan & Sedekah',
  'Zuhud', 'Qanaah', 'Malu', 'Pemaaf & Menahan Marah',
  'Kasih Sayang', 'Lemah Lembut', 'Wara & Kehati-hatian', 'Muhasabah Diri',
  'Sombong & Takabur', "Riya & Sum'ah", 'Hasad & Dengki',
  'Dusta & Bohong', 'Ghibah & Fitnah', 'Marah & Emosi',
  'Bakhil & Kikir', 'Hubbud Dunya',
  'Birrul Walidain', 'Mendidik Anak Islami', 'Pernikahan & Pranikah',
  'Hak Suami & Istri', 'Rumah Tangga Sakinah', 'Talak & Perceraian',
  'Poligami', 'Hak Anak dalam Islam', 'Nafkah & Tanggung Jawab',
  'Hubungan dengan Mert Mertua', 'Muslimah & Peran Wanita', 'Pacaran & Pergaulan',
  'Shalat Wajib & Rukunnya', 'Shalat Sunnah & Tahajud', 'Shalat Berjamaah',
  'Shalat Jumat', 'Thaharah & Bersuci', 'Puasa Wajib & Sunnah',
  'Ramadan & Lailatul Qadr', 'Itikaf', 'Zakat & Nisab', 'Zakat Profesi',
  'Haji & Umrah', 'Qurban & Aqiqah',
  'Ukhuwah Islamiyah', 'Silaturahmi', 'Tolong Menolong',
  'Adab Bertetangga', 'Keadilan', 'Kepemimpinan & Amanah',
  'Hak Non-Muslim', 'Adab Berbeda Pendapat',
  'Menuntut Ilmu', 'Adab Menuntut Ilmu', 'Mengajar & Berbagi Ilmu',
  'Dakwah & Amar Makruf', 'Jihad & Membela Islam', 'Sejarah Islam & Sirah',
  'Riba & Bunga Bank', 'Halal Haram Makanan', 'Jual Beli & Bisnis Islam',
  'Hutang Piutang', 'Zakat Profesi & Harta', 'Waris & Pembagiannya',
  'Wakaf & Sedekah Jariyah', 'Hukum Adat & Islam',
  'Muamalah Digital', 'Investasi & Keuangan Islam',
  'Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur',
  'Hari Kiamat & Tanda-tandanya', 'Surga & Kenikmatan',
  'Neraka & Azab', 'Amal Jariyah', 'Hisab & Pertanggungjawaban',
  'Syafaat Rasulullah',
  'Media Sosial & Menjaga Lisan', 'Pergaulan & Aurat',
  'Mengatasi Kesedihan & Anxiety', 'Motivasi & Produktivitas Islam',
  'Kesehatan dalam Islam', 'Lingkungan & Alam',
  'Politik & Bernegara', 'Teknologi & Etika Islam',
  'Doa & Munajat', 'Zikir & Wirid', "Tilawah Al-Qur'an",
  'Keutamaan Surah-surah', 'Tafsir & Tadabur', "Adab dengan Al-Qur'an",
  'Isra Miraj & Momen Islam', 'Doa Mustajab & Waktu Istimewa',
  'Penyakit Hati & Penyembuhan', 'Cinta Dunia & Zuhud',
  'Muraqabah & Ihsan', 'Khusyuk dalam Ibadah',
  'Istiqamah & Konsistensi', 'Rezeki & Keberkahan Hidup'
]

const SINONIM_TOPIK: Record<string, string[]> = {
  'rumah tangga': ['Rumah Tangga Sakinah', 'Hak Suami & Istri', 'Pernikahan & Pranikah', 'Keluarga'],
  'sakinah': ['Rumah Tangga Sakinah', 'Hak Suami & Istri', 'Keluarga'],
  'pernikahan': ['Pernikahan & Pranikah', 'Hak Suami & Istri', 'Rumah Tangga Sakinah'],
  'suami': ['Hak Suami & Istri', 'Rumah Tangga Sakinah', 'Keluarga'],
  'istri': ['Hak Suami & Istri', 'Rumah Tangga Sakinah', 'Keluarga'],
  'ghibah': ['Ghibah & Fitnah', 'Media Sosial & Menjaga Lisan', 'Dusta & Bohong'],
  'fitnah': ['Ghibah & Fitnah', 'Dusta & Bohong', 'Media Sosial & Menjaga Lisan'],
  'gosip': ['Ghibah & Fitnah', 'Dusta & Bohong'],
  'birrul': ['Birrul Walidain', 'Keluarga'],
  'walidain': ['Birrul Walidain', 'Keluarga', 'Hak Anak dalam Islam'],
  'orang tua': ['Birrul Walidain', 'Keluarga'],
  'anak': ['Mendidik Anak Islami', 'Hak Anak dalam Islam', 'Keluarga'],
  'mendidik': ['Mendidik Anak Islami', 'Keluarga', 'Menuntut Ilmu'],
  'shalat': ['Shalat Wajib & Rukunnya', 'Shalat Berjamaah', 'Shalat Sunnah & Tahajud', 'Shalat'],
  'puasa': ['Puasa Wajib & Sunnah', 'Ramadan & Lailatul Qadr', 'Puasa'],
  'zakat': ['Zakat & Nisab', 'Zakat Profesi', 'Dermawan & Sedekah'],
  'sedekah': ['Dermawan & Sedekah', 'Wakaf & Sedekah Jariyah', 'Zakat & Nisab'],
  'riba': ['Riba & Bunga Bank', 'Jual Beli & Bisnis Islam', 'Muamalah'],
  'hutang': ['Hutang Piutang', 'Amanah', 'Muamalah'],
  'ilmu': ['Menuntut Ilmu', 'Adab Menuntut Ilmu', 'Mengajar & Berbagi Ilmu'],
  'dakwah': ['Dakwah & Amar Makruf', 'Mengajar & Berbagi Ilmu'],
  'sabar': ['Sabar', 'Mengatasi Kesedihan & Anxiety', 'Tawakkal'],
  'syukur': ['Syukur', 'Rezeki & Keberkahan Hidup', 'Qanaah'],
  'ikhlas': ['Ikhlas', 'Riya & Sum\'ah', 'Taqwa'],
  'tawadhu': ['Tawadhu', 'Sombong & Takabur', 'Akhlak'],
  'kejujuran': ['Kejujuran', 'Amanah', 'Dusta & Bohong'],
  'jujur': ['Kejujuran', 'Amanah'],
  'amanah': ['Amanah', 'Kejujuran', 'Kepemimpinan & Amanah'],
  'mati': ['Kematian & Sakaratul Maut', 'Alam Barzakh & Kubur', 'Akhirat'],
  'kiamat': ['Hari Kiamat & Tanda-tandanya', 'Akhirat', 'Hisab & Pertanggungjawaban'],
  'surga': ['Surga & Kenikmatan', 'Akhirat', 'Amal Jariyah'],
  'neraka': ['Neraka & Azab', 'Akhirat', 'Taubat & Istighfar'],
  'taubat': ['Taubat & Istighfar', 'Penyakit Hati & Penyembuhan'],
  'doa': ['Doa & Munajat', 'Doa Mustajab & Waktu Istimewa', 'Zikir & Wirid'],
  'quran': ["Tilawah Al-Qur'an", "Adab dengan Al-Qur'an", 'Tafsir & Tadabur'],
  'media sosial': ['Media Sosial & Menjaga Lisan', 'Ghibah & Fitnah'],
  'teknologi': ['Teknologi & Etika Islam', 'Media Sosial & Menjaga Lisan'],
  'kesehatan': ['Kesehatan dalam Islam', 'Motivasi & Produktivitas Islam'],
}

export function temaToTags(tema: string): string[] {
  const temaLower = tema.toLowerCase()
  const matched = new Set<string>()

  // 1. Match dari DAFTAR_TOPIK langsung
  for (const topik of DAFTAR_TOPIK) {
    const topikLower = topik.toLowerCase()
    const temaWords = temaLower.split(/\s+/).filter(w => w.length > 4)
    const topikWords = topikLower.split(/\s+/).filter(w => w.length > 4)

    if (
      temaLower.includes(topikLower) ||
      topikLower.includes(temaLower) ||
      temaWords.some(w => topikLower.includes(w)) ||
      topikWords.some(w => temaLower.includes(w))
    ) {
      matched.add(topik)
    }
  }

  // 2. Match dari SINONIM_TOPIK
  for (const [sinonim, topiks] of Object.entries(SINONIM_TOPIK)) {
    if (temaLower.includes(sinonim)) {
      topiks.forEach(t => matched.add(t))
    }
  }

  const result = [...matched]
  return result.length > 0 ? result.slice(0, 4) : ['Taqwa', 'Iman kepada Allah']
}
