export type KategoriSains =
  | 'Kosmologi'
  | 'Biologi & Embriologi'
  | 'Oseanografi'
  | 'Fisika & Astrofisika'
  | 'Kedokteran & Neurosains'
  | 'Zoologi'
  | 'Geologi'

export interface VideoYoutube {
  judul: string
  url: string
  channel: string
  bahasa: 'Indonesia' | 'English' | 'Arab'
}

export interface AyatSains {
  id: number
  surah_id: number
  surah_nama: string
  surah_nama_latin: string
  nomor_ayat: string
  teks_arab: string
  terjemahan: string
  topik_sains: string
  kategori: KategoriSains
  penjelasan: string
  videos: VideoYoutube[]
}

export const AYAT_SAINS: AyatSains[] = [
  {
    id: 1, surah_id: 21, surah_nama: 'الْأَنبِيَاء', surah_nama_latin: "Al-Anbiya'", nomor_ayat: '30',
    teks_arab: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
    terjemahan: 'Dan apakah orang-orang kafir tidak mengetahui bahwa langit dan bumi keduanya dahulunya menyatu, kemudian Kami pisahkan antara keduanya; dan Kami jadikan segala sesuatu yang hidup berasal dari air?',
    topik_sains: 'Teori Big Bang & Asal Kehidupan dari Air', kategori: 'Kosmologi',
    penjelasan: 'Ayat ini menggambarkan bahwa langit dan bumi awalnya merupakan satu kesatuan (ratqan), kemudian dipisahkan (fataqnāhumā). Hal ini selaras dengan Teori Big Bang yang menyatakan alam semesta berawal dari satu titik singularitas 13,8 miliar tahun lalu. NASA mengkonfirmasi ini melalui satelit COBE (1989) dan WMAP (2001).\n\nKata "ratqan" berarti sesuatu yang tertutup rapat, sementara "fataqnāhumā" berarti memisahkan secara paksa — deskripsi yang sangat akurat untuk Big Bang.\n\nAyat ini juga menyebutkan bahwa segala yang hidup berasal dari air — fakta yang kini terbukti: semua sel hidup mengandung 70-90% air.',
    videos: [
      { judul: 'Teori Big Bang dalam Al-Quran | Mukjizat Ilmiah', url: 'https://www.youtube.com/results?search_query=big+bang+dalam+alquran+mukjizat+ilmiah', channel: 'Yufid.TV', bahasa: 'Indonesia' },
      { judul: 'The Quran and the Big Bang | Dr. Zakir Naik', url: 'https://www.youtube.com/results?search_query=quran+big+bang+theory+scientific+miracle', channel: 'Dr Zakir Naik', bahasa: 'English' }
    ]
  },
  {
    id: 2, surah_id: 51, surah_nama: 'الذَّارِيَات', surah_nama_latin: 'Az-Zariyat', nomor_ayat: '47',
    teks_arab: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',
    terjemahan: 'Dan langit itu Kami bangun dengan kekuasaan (Kami), dan Kami benar-benar meluaskannya.',
    topik_sains: 'Ekspansi Alam Semesta', kategori: 'Kosmologi',
    penjelasan: 'Kata "mūsiʻūn" berarti "Kami terus memperluas". Ini deskripsi tepat ekspansi alam semesta yang pertama ditemukan Edwin Hubble (1929). Pada 1998, Perlmutter, Schmidt, dan Riess (Nobel Fisika 2011) membuktikan bahwa ekspansi alam semesta bahkan semakin dipercepat oleh "energi gelap".\n\nAl-Qur\'an menyebutkan fakta ini 14 abad sebelum ditemukan sains modern.',
    videos: [
      { judul: 'Ekspansi Alam Semesta dalam Al-Quran | Mukjizat Ilmiah', url: 'https://www.youtube.com/results?search_query=ekspansi+alam+semesta+Al-Quran+mukjizat', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 3, surah_id: 23, surah_nama: 'الْمُؤْمِنُون', surah_nama_latin: "Al-Mu'minun", nomor_ayat: '12-14',
    teks_arab: 'وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ ثُمَّ جَعَلْنَاهُ نُطْفَةً فِي قَرَارٍ مَّكِينٍ ثُمَّ خَلَقْنَا النُّطْفَةَ عَلَقَةً فَخَلَقْنَا الْعَلَقَةَ مُضْغَةً',
    terjemahan: 'Dan sungguh, Kami telah menciptakan manusia dari saripati tanah. Kemudian Kami menjadikannya air mani dalam tempat yang kokoh. Kemudian air mani itu Kami jadikan segumpal darah, lalu segumpal darah itu Kami jadikan segumpal daging...',
    topik_sains: 'Tahapan Perkembangan Embrio Manusia', kategori: 'Biologi & Embriologi',
    penjelasan: 'Ayat ini menggambarkan tahap perkembangan janin: nutfah (zigot), alaqah (embrio menempel), mudghah (segumpal daging), tulang, dan pembungkusan. Urutan ini persis sesuai embriologi modern.\n\nProf. Keith Moore (University of Toronto) menyatakan: "Saya tidak menemukan kontradiksi apapun antara deskripsi Al-Qur\'an dengan embriologi modern."\n\nKata "alaqah" memiliki tiga makna: sesuatu yang menggantung, segumpal darah, dan lintah — ketiganya akurat secara ilmiah.',
    videos: [
      { judul: 'Embryology in the Quran | Prof. Keith Moore', url: 'https://www.youtube.com/results?search_query=quran+human+embryology+keith+moore+scientific+miracle', channel: 'One Islam Productions', bahasa: 'English' },
      { judul: 'Tahapan Janin dalam Al-Quran | Mukjizat Ilmiah', url: 'https://www.youtube.com/results?search_query=embriologi+Al-Quran+Keith+Moore+mukjizat', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 4, surah_id: 39, surah_nama: 'الزُّمَر', surah_nama_latin: 'Az-Zumar', nomor_ayat: '6',
    teks_arab: 'يَخْلُقُكُمْ فِي بُطُونِ أُمَّهَاتِكُمْ خَلْقًا مِّن بَعْدِ خَلْقٍ فِي ظُلُمَاتٍ ثَلَاثٍ',
    terjemahan: 'Dia menciptakan kamu dalam perut ibumu, kejadian demi kejadian, dalam tiga kegelapan.',
    topik_sains: 'Tiga Lapisan Pelindung Janin', kategori: 'Biologi & Embriologi',
    penjelasan: 'Frasa "tiga kegelapan" merujuk pada tiga lapisan pelindung janin: dinding perut ibu, dinding rahim, dan selaput ketuban (amnion). Ketiganya berfungsi sebagai pelindung dan sumber nutrisi.\n\nIlmu anatomi modern baru mengidentifikasi ketiga lapisan ini di abad ke-20 menggunakan ultrasonografi. Al-Qur\'an menyebutnya 14 abad sebelumnya.',
    videos: [
      { judul: 'Tiga Kegelapan dalam Rahim | Mukjizat Al-Quran', url: 'https://www.youtube.com/results?search_query=tiga+kegelapan+rahim+Al-Quran+mukjizat+ilmiah', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 5, surah_id: 76, surah_nama: 'الْإِنسَان', surah_nama_latin: 'Al-Insan', nomor_ayat: '2',
    teks_arab: 'إِنَّا خَلَقْنَا الْإِنسَانَ مِن نُّطْفَةٍ أَمْشَاجٍ',
    terjemahan: 'Sesungguhnya Kami telah menciptakan manusia dari setetes air mani yang bercampur.',
    topik_sains: 'Pembuahan: Percampuran Gamet', kategori: 'Biologi & Embriologi',
    penjelasan: 'Kata "amshāj" berarti campuran — merujuk pada percampuran sel sperma dan ovum yang menghasilkan zigot. Fakta bahwa manusia berasal dari percampuran dua gamet baru dibuktikan di abad ke-19.\n\nAyat ini juga menyebutkan manusia dijadikan "mendengar dan melihat" — sistem pendengaran dan penglihatan memang yang pertama berkembang sempurna pada janin.',
    videos: [
      { judul: 'Nutfah Amshaj: Pembuahan dalam Al-Quran', url: 'https://www.youtube.com/results?search_query=nutfah+amshaj+pembuahan+Al-Quran+mukjizat', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 6, surah_id: 24, surah_nama: 'النُّور', surah_nama_latin: 'An-Nur', nomor_ayat: '40',
    teks_arab: 'أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُّجِّيٍّ يَغْشَاهُ مَوْجٌ مِّن فَوْقِهِ مَوْجٌ مِّن فَوْقِهِ سَحَابٌ',
    terjemahan: 'Atau seperti kegelapan di lautan yang dalam, yang diliputi oleh ombak, yang di atasnya ada ombak, di atasnya lagi awan; kegelapan yang berlapis-lapis.',
    topik_sains: 'Kegelapan Laut Dalam & Gelombang Internal', kategori: 'Oseanografi',
    penjelasan: 'Ayat ini menggambarkan dua lapisan ombak — permukaan dan internal. Gelombang internal di lautan baru ditemukan di abad ke-20 menggunakan sonar. Di bawah 200 meter tidak ada cahaya matahari — kegelapan total.\n\nAyat ini secara akurat menggambarkan lapisan: awan → ombak permukaan → ombak internal → kegelapan.',
    videos: [
      { judul: 'Kegelapan Lautan & Gelombang Internal | Al-Quran', url: 'https://www.youtube.com/results?search_query=kegelapan+lautan+dalam+Al-Quran+gelombang+internal', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 7, surah_id: 55, surah_nama: 'الرَّحْمَٰن', surah_nama_latin: 'Ar-Rahman', nomor_ayat: '19-21',
    teks_arab: 'مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ بَيْنَهُمَا بَرْزَخٌ لَّا يَبْغِيَانِ',
    terjemahan: 'Dia membiarkan dua lautan mengalir yang keduanya kemudian bertemu. Di antara keduanya ada batas yang tidak dilampaui masing-masing.',
    topik_sains: 'Batas Pertemuan Dua Lautan (Halocline)', kategori: 'Oseanografi',
    penjelasan: 'Fenomena pertemuan dua lautan dengan batas yang tidak saling mencampur (halocline) pertama ditemukan Jacques Cousteau di Selat Gibraltar. Kedua lautan memiliki suhu, kadar garam, dan kepadatan berbeda.\n\nProf. Cousteau kemudian mengetahui Al-Qur\'an telah menggambarkan fenomena ini 1.400 tahun sebelumnya.',
    videos: [
      { judul: 'Dua Lautan Bertemu: Jacques Cousteau & Al-Quran', url: 'https://www.youtube.com/results?search_query=dua+lautan+bertemu+jacques+cousteau+Al-Quran+mukjizat', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 8, surah_id: 25, surah_nama: 'الْفُرْقَان', surah_nama_latin: 'Al-Furqan', nomor_ayat: '53',
    teks_arab: 'وَهُوَ الَّذِي مَرَجَ الْبَحْرَيْنِ هَٰذَا عَذْبٌ فُرَاتٌ وَهَٰذَا مِلْحٌ أُجَاجٌ وَجَعَلَ بَيْنَهُمَا بَرْزَخًا',
    terjemahan: 'Dan Dialah yang membiarkan dua laut mengalir (berdampingan); yang ini tawar dan segar dan yang lain sangat asin lagi pahit; dan Dia jadikan antara keduanya dinding dan batas.',
    topik_sains: 'Batas Air Tawar-Asin & Sungai Bawah Laut', kategori: 'Oseanografi',
    penjelasan: 'Ayat ini menyebut pertemuan air tawar dan air asin yang memiliki batas. Fenomena ini ditemukan di muara sungai: air tawar dan laut bertemu tapi tidak langsung bercampur karena perbedaan densitas.\n\nPada 1990-an ilmuwan menemukan "sungai bawah laut" — aliran air tawar bawah tanah yang mengalir di bawah lautan asin tanpa bercampur.',
    videos: [
      { judul: 'Sungai Bawah Laut & Batas Air Tawar-Asin | Al-Quran', url: 'https://www.youtube.com/results?search_query=sungai+bawah+laut+air+tawar+asin+Al-Quran', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 9, surah_id: 57, surah_nama: 'الْحَدِيد', surah_nama_latin: 'Al-Hadid', nomor_ayat: '25',
    teks_arab: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ',
    terjemahan: 'Dan Kami turunkan besi yang padanya terdapat kekuatan yang hebat dan berbagai manfaat bagi manusia.',
    topik_sains: 'Asal Usul Besi dari Luar Angkasa', kategori: 'Fisika & Astrofisika',
    penjelasan: 'Kata "anzalnā" (Kami turunkan) mengisyaratkan asal-usul kosmik besi. Sains modern membuktikan besi tidak terbentuk di Bumi — ia terbentuk di inti bintang raksasa yang meledak (supernova) dan tersebar ke galaksi.\n\nKandungan isotop besi-60 di bebatuan kuno Bumi membuktikan besi berasal dari meteorit dan supernova — NASA menyebutnya "stellar nucleosynthesis".',
    videos: [
      { judul: 'Besi Diturunkan dari Luar Angkasa | Al-Quran & Sains', url: 'https://www.youtube.com/results?search_query=besi+diturunkan+luar+angkasa+Al-Quran+supernova', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 10, surah_id: 75, surah_nama: 'الْقِيَامَة', surah_nama_latin: 'Al-Qiyamah', nomor_ayat: '3-4',
    teks_arab: 'أَيَحْسَبُ الْإِنسَانُ أَلَّن نَّجْمَعَ عِظَامَهُ بَلَىٰ قَادِرِينَ عَلَىٰ أَن نُّسَوِّيَ بَنَانَهُ',
    terjemahan: 'Apakah manusia mengira bahwa Kami tidak akan mengumpulkan tulang-belulangnya? Bahkan, Kami mampu menyusun jari-jarinya dengan sempurna.',
    topik_sains: 'Keunikan Sidik Jari Manusia', kategori: 'Kedokteran & Neurosains',
    penjelasan: 'Di abad ke-7, konsep sidik jari sama sekali tidak dikenal. Al-Qur\'an secara khusus menyebut "ujung jari-jari" (banānah) sebagai sesuatu yang istimewa.\n\nBaru pada 1880, Sir Francis Galton membuktikan sidik jari setiap manusia unik — tidak ada dua orang yang identik, termasuk kembar. Ini menjadi dasar ilmu forensik dan biometrik modern.',
    videos: [
      { judul: 'Fingerprint in the Quran | 1400 Years Before Science', url: 'https://www.youtube.com/results?search_query=sidik+jari+alquran+mukjizat+ilmiah+forensik', channel: 'Quran Weekly', bahasa: 'English' },
      { judul: 'Sidik Jari dalam Al-Quran | 1400 Tahun Sebelum Sains', url: 'https://www.youtube.com/results?search_query=sidik+jari+Al-Quran+mukjizat+ilmiah', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 11, surah_id: 16, surah_nama: 'النَّحْل', surah_nama_latin: 'An-Nahl', nomor_ayat: '68-69',
    teks_arab: 'وَأَوْحَىٰ رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا وَمِنَ الشَّجَرِ وَمِمَّا يَعْرِشُونَ',
    terjemahan: 'Dan Tuhanmu mewahyukan kepada lebah: Buatlah sarang di bukit-bukit, di pohon-pohon, dan di tempat-tempat yang dibikin manusia.',
    topik_sains: 'Arsitektur Sarang Lebah & Komunikasi', kategori: 'Zoologi',
    penjelasan: 'Lebah yang bekerja adalah betina — Al-Qur\'an menggunakan kata kerja feminin untuk lebah pekerja, baru dibuktikan abad ke-19. Sarang lebah berbentuk heksagonal adalah struktur paling efisien secara matematika.\n\nPada 1973, Karl von Frisch memenangkan Nobel karena menemukan "tarian lebah" sebagai sistem komunikasi. Sistem ini diisyaratkan kata "awḥā" (mengkomunikasikan).',
    videos: [
      { judul: 'Mukjizat Lebah dalam Al-Quran | Karl von Frisch', url: 'https://www.youtube.com/results?search_query=mukjizat+lebah+Al-Quran+tarian+lebah+karl+frisch', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 12, surah_id: 86, surah_nama: 'الطَّارِق', surah_nama_latin: 'Ath-Thariq', nomor_ayat: '12',
    teks_arab: 'وَالْأَرْضِ ذَاتِ الصَّدْعِ',
    terjemahan: 'Dan bumi yang mempunyai retakan.',
    topik_sains: 'Lempeng Tektonik & Retakan Bumi', kategori: 'Geologi',
    penjelasan: 'Kata "al-ṣad\'i" berarti retakan. Teori lempeng tektonik baru dikembangkan Alfred Wegener (1912) dan diterima ilmiah pada 1960-an. Bumi memiliki ~15 lempeng tektonik utama yang terus bergerak.\n\nTotal panjang retakan (fault lines) di seluruh permukaan bumi mencapai ratusan ribu kilometer — sebuah deskripsi yang sangat akurat.',
    videos: [
      { judul: 'Retakan Bumi & Lempeng Tektonik dalam Al-Quran', url: 'https://www.youtube.com/results?search_query=lempeng+tektonik+retakan+bumi+Al-Quran+mukjizat', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 13, surah_id: 21, surah_nama: 'الْأَنبِيَاء', surah_nama_latin: "Al-Anbiya'", nomor_ayat: '33',
    teks_arab: 'وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ كُلٌّ فِي فَلَكٍ يَسْبَحُونَ',
    terjemahan: 'Dan Dialah yang telah menciptakan malam dan siang, matahari dan bulan. Masing-masing beredar pada garis edarnya.',
    topik_sains: 'Orbit Tata Surya & Gerakan Spiral Matahari', kategori: 'Fisika & Astrofisika',
    penjelasan: 'Kata "yasbaḥūn" berarti berenang/bergerak berputar — bukan sekadar lurus. Matahari sendiri bergerak dalam orbit spiral mengelilingi pusat galaksi dengan kecepatan ~220 km/detik.\n\nFakta Matahari juga bergerak (bukan diam) baru diketahui abad ke-20. Al-Qur\'an menggunakan plural "yasbaḥūn" — semua benda langit bergerak.',
    videos: [
      { judul: 'Orbit Matahari & Benda Langit dalam Al-Quran', url: 'https://www.youtube.com/results?search_query=orbit+matahari+benda+langit+Al-Quran+mukjizat+ilmiah', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 14, surah_id: 96, surah_nama: 'الْعَلَق', surah_nama_latin: "Al-'Alaq", nomor_ayat: '15-16',
    teks_arab: 'كَلَّا لَئِن لَّمْ يَنتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ',
    terjemahan: 'Ketahuilah, sungguh jika dia tidak berhenti, niscaya Kami tarik ubun-ubunnya, (yaitu) ubun-ubun orang yang mendustakan lagi durhaka.',
    topik_sains: 'Fungsi Lobus Frontal Otak', kategori: 'Kedokteran & Neurosains',
    penjelasan: 'Al-Qur\'an menyebut "nāṣiyah" (ubun-ubun/bagian depan kepala) sebagai pusat kebohongan dan kejahatan. Neurosains modern membuktikan korteks prefrontal (lobus frontal) adalah pusat pengambilan keputusan, kontrol impuls, dan perilaku sosial.\n\nKerusakan lobus frontal menyebabkan seseorang cenderung berbohong dan bertindak agresif — sesuai deskripsi Al-Qur\'an.',
    videos: [
      { judul: 'Ubun-ubun & Lobus Frontal Otak dalam Al-Quran', url: 'https://www.youtube.com/results?search_query=ubun+ubun+lobus+frontal+Al-Quran+neurosains', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  },
  {
    id: 15, surah_id: 4, surah_nama: 'النِّسَاء', surah_nama_latin: "An-Nisa'", nomor_ayat: '56',
    teks_arab: 'كُلَّمَا نَضِجَتْ جُلُودُهُم بَدَّلْنَاهُمْ جُلُودًا غَيْرَهَا لِيَذُوقُوا الْعَذَابَ',
    terjemahan: 'Setiap kali kulit mereka hangus, Kami ganti kulit mereka dengan kulit yang lain, agar mereka merasakan azab.',
    topik_sains: 'Reseptor Rasa Sakit pada Kulit', kategori: 'Kedokteran & Neurosains',
    penjelasan: 'Ayat ini mengisyaratkan bahwa rasa sakit akibat api terletak pada kulit. Neurosains modern membuktikan reseptor nyeri (nociceptor) terkonsentrasi di lapisan kulit, bukan organ dalam.\n\nLuka bakar derajat tiga tidak terasa sakit karena reseptornya sudah mati. Al-Qur\'an menggambarkan penggantian kulit diperlukan agar azab tetap terasa — deskripsi yang akurat secara ilmiah.',
    videos: [
      { judul: 'Reseptor Rasa Sakit pada Kulit dalam Al-Quran', url: 'https://www.youtube.com/results?search_query=reseptor+kulit+rasa+sakit+Al-Quran+mukjizat+neurosains', channel: 'Yufid.TV', bahasa: 'Indonesia' }
    ]
  }
]

export function getSainsForAyat(surahId: number, nomorAyat: number): AyatSains | null {
  return AYAT_SAINS.find(s => {
    if (s.surah_id !== surahId) return false
    if (s.nomor_ayat.includes('-')) {
      const [start, end] = s.nomor_ayat.split('-').map(Number)
      return nomorAyat >= start && nomorAyat <= end
    }
    return s.nomor_ayat === String(nomorAyat)
  }) ?? null
}

export function hasSains(surahId: number): boolean {
  return AYAT_SAINS.some(s => s.surah_id === surahId)
}

export function getByKategori(kategori: KategoriSains): AyatSains[] {
  return AYAT_SAINS.filter(s => s.kategori === kategori)
}
