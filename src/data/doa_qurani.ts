export type KategoriDoa = 'rabbana' | 'rabbi' | 'nabi' | 'hajat'

export type TemaHajat =
  | 'rezeki'
  | 'keluarga'
  | 'kesehatan'
  | 'ilmu'
  | 'perlindungan'
  | 'kesedihan'
  | 'taubat'
  | 'keturunan'
  | 'hidayah'
  | 'jodoh'
  | 'anak'
  | 'karir'
  | 'hutang'
  | 'musibah'
  | 'sabar'

export interface DoaQurani {
  id: string
  judul: string
  kategori: KategoriDoa
  nabi?: string                    // jika kategori 'nabi'
  tema_hajat?: TemaHajat[]         // bisa lebih dari 1 tema
  arab: string
  latin: string
  terjemah: string
  surah_id: number
  surah_nama: string
  nomor_ayat: string               // bisa "83" atau "8-9"
  referensi: string                // "QS. Asy-Syu'ara': 83"
  tafsir_ulama: {
    sumber: string                 // "Ibnu Katsir" / "Quraish Shihab" / dll
    teks: string                   // kutipan/ringkasan tafsir
  }[]
  konteks: string                  // kapan/kenapa doa ini dibaca nabi
  keutamaan?: string               // hadits/info keutamaan jika ada
  mustajab?: boolean               // apakah termasuk doa mustajab
  tags?: string[]                  // topik kultum yang relevan
}

export const DOA_QURANI: DoaQurani[] = [

  // ── DOA RABBANA (رَبَّنَا) ─────────────────────────────────
  {
    id: 'rabbana-001',
    judul: 'Doa Kebaikan Dunia dan Akhirat',
    kategori: 'rabbana',
    tema_hajat: ['rezeki', 'perlindungan'],
    arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā 'ażāban-nār",
    terjemah: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.',
    surah_id: 2,
    surah_nama: 'Al-Baqarah',
    nomor_ayat: '201',
    referensi: 'QS. Al-Baqarah: 201',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir menjelaskan bahwa doa ini adalah doa yang paling komprehensif — mencakup semua kebaikan dunia (kesehatan, rezeki, ilmu, keluarga) dan semua kebaikan akhirat (surga dan ridha Allah), sekaligus memohon perlindungan dari api neraka.'
      },
      {
        sumber: 'Quraish Shihab (Al-Misbah)',
        teks: 'Quraish Shihab menyebutkan bahwa Rasulullah ﷺ sangat sering membaca doa ini, bahkan dalam setiap tawaf dan sa\'i. Ini menunjukkan doa ini adalah doa terlengkap yang diajarkan Al-Qur\'an.'
      }
    ],
    konteks: 'Doa ini diucapkan oleh orang-orang beriman yang memohon kebaikan dalam setiap aspek kehidupan. Rasulullah ﷺ memperbanyak membaca doa ini dalam berbagai ibadah.',
    keutamaan: 'HR. Bukhari: Rasulullah ﷺ memperbanyak doa ini sehingga sahabat menghapalnya sebagai doa andalan beliau.',
    mustajab: true,
  },
  {
    id: 'rabbana-002',
    judul: 'Doa Agar Hati Tidak Berpaling Setelah Hidayah',
    kategori: 'rabbana',
    tema_hajat: ['perlindungan', 'ilmu'],
    arab: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ',
    latin: "Rabbanā lā tuzigh qulūbanā ba'da idh hadaytanā wa hab lanā min ladunka raḥmatan innaka antal wahhāb",
    terjemah: 'Ya Tuhan kami, janganlah Engkau jadikan hati kami condong kepada kesesatan sesudah Engkau beri petunjuk kepada kami, dan karuniakanlah kepada kami rahmat dari sisi-Mu; sesungguhnya Engkau Maha Pemberi.',
    surah_id: 3,
    surah_nama: 'Ali Imran',
    nomor_ayat: '8',
    referensi: "QS. Ali 'Imran: 8",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Doa ini mencerminkan kekhawatiran orang-orang beriman akan kesesatan hati. Ibnu Katsir menjelaskan bahwa hati manusia sangat mudah berubah, dan hanya Allah yang dapat menjaga keteguhan iman seseorang.'
      },
      {
        sumber: 'Al-Qurthubi',
        teks: 'Al-Qurthubi menyebutkan bahwa doa ini adalah bentuk tawadhu seorang hamba yang menyadari kelemahannya, bahwa ia tidak dapat menjaga keimanannya sendiri tanpa pertolongan Allah.'
      }
    ],
    konteks: 'Doa orang-orang yang berakal (ulul albab) yang memahami bahwa hidayah adalah anugerah Allah yang harus dijaga dengan doa dan ketaatan.',
    keutamaan: 'Rasulullah ﷺ sangat sering membaca doa ini karena beliau mengetahui betapa mudahnya hati manusia berubah.',
  },
  {
    id: 'rabbana-003',
    judul: 'Doa Memohon Ampunan dan Rahmat',
    kategori: 'rabbana',
    tema_hajat: ['taubat'],
    arab: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    latin: "Rabbanā ẓalamnā anfusanā wa il lam taghfir lanā wa tarḥamnā lanakūnanna minal khāsirīn",
    terjemah: 'Ya Tuhan kami, kami telah menganiaya diri kami sendiri, dan jika Engkau tidak mengampuni kami dan memberi kami rahmat, niscaya kami termasuk orang-orang yang merugi.',
    surah_id: 7,
    surah_nama: "Al-A'raf",
    nomor_ayat: '23',
    referensi: "QS. Al-A'raf: 23",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ini adalah doa Nabi Adam dan Hawa setelah memakan buah terlarang. Ibnu Katsir menyebutkan bahwa doa ini mengandung tiga unsur taubat yang sempurna: pengakuan dosa, permohonan ampunan, dan permohonan rahmat.'
      }
    ],
    konteks: 'Doa yang diucapkan Nabi Adam AS dan Hawa saat bertaubat kepada Allah setelah tergoda iblis di surga. Menjadi contoh taubat yang diajarkan Al-Qur\'an.',
  },
  {
    id: 'rabbana-004',
    judul: 'Doa Memohon Kesabaran dan Kemenangan',
    kategori: 'rabbana',
    tema_hajat: ['kesedihan', 'perlindungan'],
    arab: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    latin: "Rabbanā afrigh 'alaynā ṣabraw wa ṡabbit aqdāmanā wanṣurnā 'alal qawmil kāfirīn",
    terjemah: 'Ya Tuhan kami, tuangkanlah kesabaran atas diri kami, dan kokohkanlah pendirian kami dan tolonglah kami terhadap orang-orang kafir.',
    surah_id: 2,
    surah_nama: 'Al-Baqarah',
    nomor_ayat: '250',
    referensi: 'QS. Al-Baqarah: 250',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Doa pasukan Thalut (Jalut) saat menghadapi musuh yang jauh lebih besar. Ibnu Katsir menjelaskan kata "afrigh" (tuangkanlah) menggambarkan kesabaran yang berlimpah seperti air yang dituangkan, bukan sekadar sedikit kesabaran.'
      }
    ],
    konteks: 'Doa yang dipanjatkan pasukan beriman yang sedikit saat menghadapi musuh yang banyak. Allah mengabulkan doa mereka dan memberi kemenangan.',
  },
  {
    id: 'rabbana-005',
    judul: 'Doa Penerimaan Amal dan Istiqamah',
    kategori: 'rabbana',
    tema_hajat: ['ilmu', 'perlindungan'],
    arab: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
    latin: 'Rabbanā taqabbal minnā innaka antas samī\'ul \'alīm',
    terjemah: 'Ya Tuhan kami, terimalah (amal) dari kami, sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui.',
    surah_id: 2,
    surah_nama: 'Al-Baqarah',
    nomor_ayat: '127',
    referensi: 'QS. Al-Baqarah: 127',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Doa yang dipanjatkan Nabi Ibrahim dan Ismail saat membangun Ka\'bah. Ini mengajarkan bahwa meskipun telah beramal besar, seorang hamba tetap harus berdoa agar amalnya diterima — tanda kerendahan hati yang sejati.'
      }
    ],
    konteks: 'Doa Nabi Ibrahim AS dan Nabi Ismail AS saat selesai membangun Ka\'bah — rumah Allah yang paling mulia. Menunjukkan bahwa orang-orang mulia pun tetap memohon penerimaan amal.',
    mustajab: true,
  },

  // ── DOA RABBI (رَبِّ) ──────────────────────────────────────
  {
    id: 'rabbi-001',
    judul: 'Doa Memohon Ilmu yang Bermanfaat',
    kategori: 'rabbi',
    tema_hajat: ['ilmu'],
    arab: 'رَبِّ زِدْنِي عِلْمًا',
    latin: 'Rabbi zidnī \'ilmā',
    terjemah: 'Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.',
    surah_id: 20,
    surah_nama: 'Thaha',
    nomor_ayat: '114',
    referensi: 'QS. Thaha: 114',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir menjelaskan bahwa Allah memerintahkan Nabi Muhammad ﷺ untuk selalu memohon tambahan ilmu, karena ilmu adalah bekal terpenting seorang hamba. Doa ini adalah doa terpendek dan terpadat dalam Al-Qur\'an untuk memohon ilmu.'
      },
      {
        sumber: 'Quraish Shihab (Al-Misbah)',
        teks: 'Quraish Shihab menekankan bahwa ilmu yang dimaksud adalah ilmu yang bermanfaat — ilmu yang membawa seseorang makin dekat kepada Allah dan makin bermanfaat bagi sesama.'
      }
    ],
    konteks: 'Allah memerintahkan Nabi Muhammad ﷺ untuk selalu berdoa meminta tambahan ilmu — menunjukkan bahwa ilmu adalah kebutuhan yang tidak pernah cukup.',
  },
  {
    id: 'rabbi-002',
    judul: 'Doa Nabi Musa Memohon Kelapangan',
    kategori: 'rabbi',
    nabi: 'Nabi Musa AS',
    tema_hajat: ['kesedihan', 'ilmu'],
    arab: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    latin: "Rabbi asyraḥ lī ṣadrī wa yassir lī amrī waḥlul 'uqdatan min lisānī yafqahū qawlī",
    terjemah: 'Ya Tuhanku, lapangkanlah dadaku, dan mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku, supaya mereka mengerti perkataanku.',
    surah_id: 20,
    surah_nama: 'Thaha',
    nomor_ayat: '25-28',
    referensi: 'QS. Thaha: 25-28',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Doa ini dipanjatkan Nabi Musa AS saat menerima perintah Allah untuk menghadap Fir\'aun. Ibnu Katsir menjelaskan tiga permohonan: kelapangan dada (kemantapan hati), kemudahan urusan, dan kelancaran bicara — tiga hal yang dibutuhkan siapa pun yang mengemban tugas besar.'
      }
    ],
    konteks: 'Nabi Musa AS berdoa ini saat mendapat perintah besar dari Allah — pergi menghadap Fir\'aun yang sangat berkuasa. Doa ini mengajarkan untuk mempersiapkan diri dengan doa sebelum menghadapi tantangan besar.',
  },
  {
    id: 'rabbi-003',
    judul: 'Doa Nabi Musa Memohon Kebaikan',
    kategori: 'rabbi',
    nabi: 'Nabi Musa AS',
    tema_hajat: ['rezeki'],
    arab: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    latin: "Rabbi innī limā anzalta ilayya min khayrin faqīr",
    terjemah: 'Ya Tuhanku, sesungguhnya aku sangat memerlukan kebaikan yang Engkau turunkan kepadaku.',
    surah_id: 28,
    surah_nama: 'Al-Qashash',
    nomor_ayat: '24',
    referensi: 'QS. Al-Qashash: 24',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Doa yang diucapkan Nabi Musa AS saat tiba di Madyan dalam kondisi kelelahan, lapar, dan tidak punya apa-apa. Ibnu Katsir menyebutkan ini adalah doa yang penuh kerendahan hati — bukan meminta hal spesifik, tapi menyerahkan sepenuhnya kepada Allah apa kebaikan yang terbaik.'
      },
      {
        sumber: 'Quraish Shihab (Al-Misbah)',
        teks: 'Quraish Shihab mencatat bahwa tak lama setelah doa ini, Allah memberikan Nabi Musa pekerjaan, tempat tinggal, dan pasangan hidup — bukti bahwa doa yang tulus dan pasrah selalu dijawab Allah dengan cara yang terbaik.'
      }
    ],
    konteks: 'Nabi Musa AS berdoa ini saat dalam kondisi paling sulit — seorang diri di negeri asing, tidak punya harta, tidak punya teman. Doa yang mengajarkan kepasrahan total kepada Allah.',
    mustajab: true,
  },
  {
    id: 'rabbi-004',
    judul: 'Doa Nabi Zakaria Memohon Keturunan',
    kategori: 'rabbi',
    nabi: 'Nabi Zakaria AS',
    tema_hajat: ['keturunan', 'keluarga'],
    arab: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
    latin: "Rabbi hab lī min ladunka żurriyyatan ṭayyibah, innaka samī'ud-du'ā'",
    terjemah: 'Ya Tuhanku, berilah aku dari sisi-Mu seorang anak yang baik. Sesungguhnya Engkau Maha Mendengar doa.',
    surah_id: 3,
    surah_nama: "Ali 'Imran",
    nomor_ayat: '38',
    referensi: "QS. Ali 'Imran: 38",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Nabi Zakaria AS berdoa ini di usia tuanya, saat istri beliau mandul dan harapan punya anak secara medis sudah tidak ada. Allah mengabulkan doa ini dengan kelahiran Nabi Yahya AS — mukjizat yang menunjukkan tidak ada yang mustahil bagi Allah.'
      },
      {
        sumber: 'At-Thabari',
        teks: 'At-Thabari menjelaskan bahwa kata "min ladunka" (dari sisi-Mu) menunjukkan Nabi Zakaria memohon anak sebagai anugerah langsung dari Allah, bukan sekadar melalui sebab-sebab alamiah biasa.'
      }
    ],
    konteks: 'Nabi Zakaria AS berdoa di usia sangat tua dan istrinya mandul. Doa ini mengajarkan untuk tidak pernah berputus asa dari rahmat Allah meski secara logika sudah tampak tidak mungkin.',
    mustajab: true,
  },
  {
    id: 'rabbi-005',
    judul: 'Doa Nabi Ibrahim Memohon Hikmah',
    kategori: 'rabbi',
    nabi: 'Nabi Ibrahim AS',
    tema_hajat: ['ilmu'],
    arab: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',
    latin: "Rabbi hab lī ḥukmaw wa alḥiqnī biṣ-ṣāliḥīn",
    terjemah: 'Ya Tuhanku, berikanlah kepadaku hikmah dan masukkanlah aku ke dalam golongan orang-orang yang saleh.',
    surah_id: 26,
    surah_nama: "Asy-Syu'ara'",
    nomor_ayat: '83',
    referensi: "QS. Asy-Syu'ara': 83",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir menjelaskan "hukm" (hikmah) mencakup kemampuan memahami, menilai, dan memutuskan dengan benar dalam segala urusan dunia dan agama. Nabi Ibrahim memohon dua hal: kecerdasan spiritual dan persahabatan dengan orang-orang shalih.'
      }
    ],
    konteks: 'Doa Nabi Ibrahim AS setelah berdialog dengan ayahnya dan kaumnya tentang keesaan Allah. Menunjukkan bahwa kecerdasan dan pergaulan yang baik harus selalu dimohonkan kepada Allah.',
  },

  // ── DOA PARA NABI ──────────────────────────────────────────
  {
    id: 'nabi-001',
    judul: 'Doa Nabi Yunus — Doa Paling Mustajab',
    kategori: 'nabi',
    nabi: 'Nabi Yunus AS',
    tema_hajat: ['kesedihan', 'taubat', 'perlindungan'],
    arab: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    latin: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn",
    terjemah: 'Tidak ada tuhan selain Engkau, Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim.',
    surah_id: 21,
    surah_nama: "Al-Anbiya'",
    nomor_ayat: '87',
    referensi: "QS. Al-Anbiya': 87",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir menjelaskan doa ini mengandung tiga unsur yang sempurna: tauhid (lā ilāha illā anta), tasbih (subḥānaka), dan pengakuan dosa (innī kuntu minaẓ-ẓālimīn). Inilah kunci terkabulnya doa — mengakui ke-Esaan Allah, menyucikan-Nya, dan merendahkan diri dengan mengakui kesalahan.'
      },
      {
        sumber: 'Quraish Shihab (Al-Misbah)',
        teks: 'Quraish Shihab menegaskan bahwa Rasulullah ﷺ bersabda: "Doa Dzun Nun yang ia berdoa dalam perut ikan, tidak ada seorang muslim pun yang berdoa dengannya untuk sesuatu, kecuali Allah akan mengabulkannya." (HR. Tirmidzi — Hasan Shahih)'
      },
      {
        sumber: 'Al-Qurthubi',
        teks: 'Al-Qurthubi menambahkan bahwa kalimat "minal-ẓālimīn" adalah pengakuan paling tulus seorang hamba. Tidak ada cara lebih cepat doa dikabulkan daripada mengakui kekurangan diri di hadapan Dzat Yang Maha Sempurna.'
      }
    ],
    konteks: 'Doa ini diucapkan Nabi Yunus AS dalam tiga kegelapan — kegelapan malam, kegelapan laut, dan kegelapan dalam perut ikan. Kondisi paling berat yang pernah dialami manusia.',
    keutamaan: 'HR. Tirmidzi (Hasan Shahih): "Tidak ada seorang muslim pun yang berdoa dengan doa Yunus ini kecuali Allah mengabulkannya."',
    mustajab: true,
  },
  {
    id: 'nabi-002',
    judul: 'Doa Nabi Ayyub — Doa Saat Sakit dan Kesulitan',
    kategori: 'nabi',
    nabi: 'Nabi Ayyub AS',
    tema_hajat: ['kesehatan', 'kesedihan'],
    arab: 'أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
    latin: "Annī massaniyaḍ-ḍurru wa anta arḥamar-rāḥimīn",
    terjemah: 'Sesungguhnya aku telah ditimpa penyakit dan Engkau adalah Tuhan Yang Maha Penyayang di antara semua penyayang.',
    surah_id: 21,
    surah_nama: "Al-Anbiya'",
    nomor_ayat: '83',
    referensi: "QS. Al-Anbiya': 83",
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir menjelaskan Nabi Ayyub AS tidak meminta kesembuhan secara langsung — beliau hanya menyebutkan kondisinya dan menyebut sifat Allah yang Maha Penyayang. Ini adalah adab doa yang tertinggi: menyerahkan sepenuhnya kepada Allah tanpa "menentukan" apa yang kita inginkan.'
      }
    ],
    konteks: 'Doa Nabi Ayyub AS setelah 18 tahun menderita penyakit berat. Allah mengabulkan dan menyembuhkan beliau — kisah kesabaran terbesar dalam Al-Qur\'an.',
    mustajab: true,
  },
  {
    id: 'nabi-003',
    judul: 'Doa Nabi Sulaiman — Doa Syukur dan Permohonan',
    kategori: 'nabi',
    nabi: 'Nabi Sulaiman AS',
    tema_hajat: ['rezeki', 'ilmu'],
    arab: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ',
    latin: "Rabbi awzi'nī an asykura ni'matakal-latī an'amta 'alayya wa 'alā wālidayya wa an a'mala ṣāliḥan tarḍāhu wa adkhilnī biraḥmatika fī 'ibādikāṣ-ṣāliḥīn",
    terjemah: 'Ya Tuhanku, ilhamkanlah aku untuk tetap mensyukuri nikmat-Mu yang telah Engkau anugerahkan kepadaku dan kepada kedua orang tuaku, dan agar aku mengerjakan kebajikan yang Engkau ridhai, dan masukanlah aku dengan rahmat-Mu ke dalam golongan hamba-hamba-Mu yang shaleh.',
    surah_id: 27,
    surah_nama: 'An-Naml',
    nomor_ayat: '19',
    referensi: 'QS. An-Naml: 19',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Nabi Sulaiman AS — raja terkaya dan terkuat sepanjang sejarah — memanjatkan doa ini. Ibnu Katsir menjelaskan bahwa doa ini mengandung tiga permohonan mulia: syukur atas nikmat, amal shalih yang diridhai, dan dimasukkan bersama orang-orang shalih.'
      }
    ],
    konteks: 'Doa Nabi Sulaiman AS saat mendengar ucapan semut dan bersyukur atas karunia Allah berupa kemampuan memahami bahasa binatang. Mengajarkan bahwa semakin besar nikmat, semakin besar rasa syukur.',
  },
  {
    id: 'nabi-004',
    judul: 'Doa Nabi Ibrahim — Menjaga Keluarga dari Kemusyrikan',
    kategori: 'nabi',
    nabi: 'Nabi Ibrahim AS',
    tema_hajat: ['keluarga', 'perlindungan'],
    arab: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
    latin: "Rabbij'alnī muqīmaṣ-ṣalāti wa min żurriyyatī rabbanā wa taqabbal du'ā'",
    terjemah: 'Ya Tuhanku, jadikanlah aku dan anak cucuku orang-orang yang tetap mendirikan shalat. Ya Tuhan kami, perkenankanlah doaku.',
    surah_id: 14,
    surah_nama: 'Ibrahim',
    nomor_ayat: '40',
    referensi: 'QS. Ibrahim: 40',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Ibnu Katsir mencatat bahwa Nabi Ibrahim AS berdoa bukan hanya untuk dirinya sendiri, tapi juga untuk keturunannya. Ini menunjukkan betapa pentingnya mendoakan keluarga dan generasi penerus agar tetap dalam ketaatan.'
      }
    ],
    konteks: 'Doa Nabi Ibrahim AS setelah menempatkan istri dan anaknya (Hagar dan Ismail) di lembah Makkah yang tandus. Mengajarkan prioritas utama orang tua: mendoakan keteguhan ibadah anak-anaknya.',
  },

  // ── CONTOH DOA BY HAJAT ────────────────────────────────────
  {
    id: 'hajat-rezeki-001',
    judul: 'Doa Nabi Ibrahim untuk Rezeki Kota Makkah',
    kategori: 'rabbi',
    nabi: 'Nabi Ibrahim AS',
    tema_hajat: ['rezeki', 'keluarga'],
    arab: 'رَبِّ اجْعَلْ هَٰذَا بَلَدًا آمِنًا وَارْزُقْ أَهْلَهُ مِنَ الثَّمَرَاتِ مَنْ آمَنَ مِنْهُم بِاللَّهِ وَالْيَوْمِ الْآخِرِ',
    latin: "Rabbij'al hāżā baladan āminaw warzuq ahlahū minaṡ-ṡamarāti man āmana minhum billāhi wal-yawmil-ākhir",
    terjemah: 'Ya Tuhanku, jadikanlah negeri ini negeri yang aman sentosa, dan berikanlah rezeki berupa buah-buahan kepada penduduknya, yaitu di antara mereka yang beriman kepada Allah dan hari kemudian.',
    surah_id: 2,
    surah_nama: 'Al-Baqarah',
    nomor_ayat: '126',
    referensi: 'QS. Al-Baqarah: 126',
    tafsir_ulama: [
      {
        sumber: 'Ibnu Katsir',
        teks: 'Allah mengabulkan doa Nabi Ibrahim ini — Makkah menjadi kota yang aman dan pusat perdagangan yang makmur meski berada di lembah tandus. Ibnu Katsir menjelaskan bahwa doa untuk kebaikan komunitas/kota juga merupakan ibadah yang agung.'
      }
    ],
    konteks: 'Doa Nabi Ibrahim AS saat menempatkan keluarganya di Makkah yang waktu itu masih lembah gersang. Doa ini dikabulkan Allah dan Makkah menjadi kota paling ramai dan berkah di dunia.',
  },
  {
    "id": "rabbana-016",
    "judul": "Doa untuk mendapatkan petunjuk",
    "kategori": "rabbana",
    "arab": "رَبَّنَا وَآتِنَا مَا وَعَدْتَّنَا عَلَى رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۖ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ",
    "latin": "Rabbana wa aatina ma wa'adhtana 'ala rusulika wala tukhzina yawmal qiyamah innaka la tukhliful mi'ad",
    "terjemah": "Wahai Tuhan kami, berikanlah kepada kami apa yang Engkau janjikan kepada kami melalui para utusan-Mu, dan janganlah Engkau hinakan kami pada hari kiamat. Sesungguhnya Engkau tidak menyalahi janji.",
    "surah_id": 3,
    "surah_nama": "Ali 'Imran",
    "nomor_ayat": "194",
    "referensi": "QS. Ali 'Imran: 194",
    "konteks": "Doa ini digunakan ketika seseorang merasa memerlukan petunjuk dan janji Allah dalam hidupnya.",
    "keutamaan": "Membaca doa ini mengingatkan kita akan janji Allah dan harapan akan pertolongan-Nya.",
    "mustajab": true,
    "tema_hajat": [
      "hidayah",
      "ilmu"
    ],
    "tags": [
      "Doa & Munajat",
      "Tawakkal",
      "Hidayah"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-017",
    "judul": "Doa untuk keselamatan dan perlindungan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا ۖ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    "latin": "Rabbana atmim lana nurana waghfir lana innaka 'ala kulli shay'in qadir",
    "terjemah": "Wahai Tuhan kami, sempurnakanlah untuk kami cahaya kami dan ampunilah kami. Sesungguhnya Engkau Maha Kuasa atas segala sesuatu.",
    "surah_id": 66,
    "surah_nama": "At-Tahrim",
    "nomor_ayat": "8",
    "referensi": "QS. At-Tahrim: 8",
    "konteks": "Digunakan dalam situasi yang memerlukan perlindungan dan bimbingan dari Allah.",
    "keutamaan": "Doa ini sangat mustajab dalam meminta perlindungan dari segala keburukan.",
    "mustajab": true,
    "tema_hajat": [
      "perlindungan"
    ],
    "tags": [
      "Doa & Munajat",
      "Perlindungan",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-018",
    "judul": "Doa untuk memperoleh ampunan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    "latin": "Rabbana innana amanna faghfir lana warhamna wa anta khairu ar-rahimin",
    "terjemah": "Wahai Tuhan kami, sesungguhnya kami telah beriman, maka ampunilah kami dan kasihilah kami, dan Engkaulah sebaik-baik yang mengasihi.",
    "surah_id": 23,
    "surah_nama": "Al-Mu'minun",
    "nomor_ayat": "109",
    "referensi": "QS. Al-Mu'minun: 109",
    "konteks": "Digunakan ketika merasa melakukan kesalahan dan sangat membutuhkan ampunan Allah.",
    "keutamaan": "Membaca doa ini merupakan permohonan yang tulus untuk mendapatkan ampunan dari Allah.",
    "mustajab": true,
    "tema_hajat": [
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Taubat",
      "Sabar"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-019",
    "judul": "Doa untuk mendapatkan rezeki yang baik",
    "kategori": "rabbana",
    "arab": "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    "latin": "Rabbana aatina min ladunka rahmatan wahayyi' lana min amrina rashada",
    "terjemah": "Wahai Tuhan kami, berikanlah kepada kami dari sisi-Mu rahmat dan siapkanlah untuk kami petunjuk dalam urusan kami.",
    "surah_id": 18,
    "surah_nama": "Al-Kahf",
    "nomor_ayat": "10",
    "referensi": "QS. Al-Kahf: 10",
    "konteks": "Doa ini dibaca untuk meminta rezeki yang baik dan petunjuk dalam kehidupan.",
    "keutamaan": "Doa ini dikenal mustajab dalam menarik rezeki dan berkah dari Allah.",
    "mustajab": true,
    "tema_hajat": [
      "rezeki"
    ],
    "tags": [
      "Doa & Munajat",
      "Syukur",
      "Rezeki"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-020",
    "judul": "Doa untuk keteguhan hati",
    "kategori": "rabbana",
    "arab": "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    "latin": "Rabbana afrigh 'alayna sabran wathabbit aqdamana wansurna 'ala al-qawm al-kafirina",
    "terjemah": "Wahai Tuhan kami, curahkanlah kepada kami kesabaran dan teguhkanlah pendirian kami serta bantulah kami terhadap kaum yang kafir.",
    "surah_id": 2,
    "surah_nama": "Al-Baqarah",
    "nomor_ayat": "250",
    "referensi": "QS. Al-Baqarah: 250",
    "konteks": "Digunakan saat menghadapi ujian dan tantangan dalam hidup.",
    "keutamaan": "Doa ini sangat mustajab untuk meminta kesabaran dan kekuatan.",
    "mustajab": true,
    "tema_hajat": [
      "sabar"
    ],
    "tags": [
      "Doa & Munajat",
      "Sabar",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-021",
    "judul": "Doa untuk mendapatkan kebahagiaan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَأَنْتَ خَيْرُ الْغَافِرِينَ",
    "latin": "Rabbana amanna faghfir lana wa anta khairul ghafirin",
    "terjemah": "Wahai Tuhan kami, sesungguhnya kami telah beriman, maka ampunilah kami, dan Engkaulah sebaik-baik yang mengampuni.",
    "surah_id": 7,
    "surah_nama": "Al-A'raf",
    "nomor_ayat": "23",
    "referensi": "QS. Al-A'raf: 23",
    "konteks": "Doa ini dibaca ketika seseorang ingin mendapatkan kebahagiaan dan kedamaian dalam hidup.",
    "keutamaan": "Membaca doa ini dapat mendatangkan kebahagiaan dan ketenangan hati.",
    "mustajab": true,
    "tema_hajat": [
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Syukur",
      "Keluarga"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-022",
    "judul": "Doa untuk keselamatan anak",
    "kategori": "rabbana",
    "arab": "رَبَّنَا اجْعَلْهُمْ قُلُوبَ مُطْمَئِنَّةً إِلَى ذِكْرِكَ",
    "latin": "Rabbana ij'alhum quluban mutma'innah ila dhikrika",
    "terjemah": "Wahai Tuhan kami, jadikanlah hati mereka tenang dengan mengingat-Mu.",
    "surah_id": 13,
    "surah_nama": "Ar-Ra'd",
    "nomor_ayat": "28",
    "referensi": "QS. Ar-Ra'd: 28",
    "konteks": "Digunakan untuk memohon keselamatan dan ketenangan hati bagi anak-anak.",
    "keutamaan": "Doa ini sangat mustajab untuk keselamatan jiwa dan hati anak-anak.",
    "mustajab": true,
    "tema_hajat": [
      "anak",
      "perlindungan"
    ],
    "tags": [
      "Doa & Munajat",
      "Keluarga",
      "Perlindungan"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-023",
    "judul": "Doa untuk kekuatan iman",
    "kategori": "rabbi",
    "arab": "رَبِّ زِدْنِي عِلْمًا",
    "latin": "Rabbi zidni 'ilma",
    "terjemah": "Ya Tuhanku, tambahilah ilmuku.",
    "surah_id": 20,
    "surah_nama": "Taha",
    "nomor_ayat": "114",
    "referensi": "QS. Taha: 114",
    "konteks": "Doa ini sering dibaca oleh mereka yang ingin meningkatkan pengetahuan dan iman.",
    "keutamaan": "Doa ini sangat mustajab untuk mendapatkan ilmu yang bermanfaat.",
    "mustajab": true,
    "tema_hajat": [
      "ilmu"
    ],
    "tags": [
      "Doa & Munajat",
      "Ilmu",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "hajat-024",
    "judul": "Doa untuk mendapatkan jodoh",
    "kategori": "hajat",
    "arab": "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    "latin": "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun",
    "terjemah": "Wahai Tuhan kami, berikanlah kepada kami istri-istri dan keturunan yang menjadi penyejuk hati.",
    "surah_id": 25,
    "surah_nama": "Al-Furqan",
    "nomor_ayat": "74",
    "referensi": "QS. Al-Furqan: 74",
    "konteks": "Doa ini dibaca oleh orang-orang yang mendambakan jodoh dan keturunan yang baik.",
    "keutamaan": "Doa ini dikenal mustajab untuk mendapatkan jodoh yang baik.",
    "mustajab": true,
    "tema_hajat": [
      "jodoh"
    ],
    "tags": [
      "Doa & Munajat",
      "Keluarga",
      "Jodoh"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-025",
    "judul": "Doa Memohon Petunjuk dan Kebijaksanaan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    "latin": "Rabbana atina min ladunka rahmatan wahaiyi' lana min amrina rashada",
    "terjemah": "Ya Tuhan kami, berikanlah kepada kami dari sisi-Mu rahmat dan siapkanlah untuk kami petunjuk dalam urusan kami.",
    "surah_id": 18,
    "surah_nama": "Al-Kahf",
    "nomor_ayat": "10",
    "referensi": "QS. Al-Kahf: 10",
    "konteks": "Doa ini digunakan ketika seseorang merasa bingung dan memerlukan petunjuk dalam mengambil keputusan.",
    "keutamaan": "Membaca doa ini dapat memberikan kebijaksanaan dan petunjuk dari Allah dalam setiap langkah hidup.",
    "mustajab": true,
    "tema_hajat": [
      "ilmu",
      "hidayah"
    ],
    "tags": [
      "Doa & Munajat",
      "Taqwa",
      "Ilmu"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-026",
    "judul": "Doa Memohon Keluarga yang Saleh",
    "kategori": "rabbana",
    "arab": "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    "latin": "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin",
    "terjemah": "Ya Tuhan kami, anugerahkanlah kepada kami istri-istri dan keturunan kami sebagai penyenang hati.",
    "surah_id": 25,
    "surah_nama": "Al-Furqan",
    "nomor_ayat": "74",
    "referensi": "QS. Al-Furqan: 74",
    "konteks": "Doa ini dipanjatkan oleh orang-orang yang ingin agar keluarganya menjadi sumber kebahagiaan dan ketenangan.",
    "keutamaan": "Doa ini sangat baik dibaca untuk mendapatkan keluarga yang saleh dan penuh kasih sayang.",
    "mustajab": true,
    "tema_hajat": [
      "keluarga",
      "jodoh"
    ],
    "tags": [
      "Doa & Munajat",
      "Keluarga",
      "Syukur"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-027",
    "judul": "Doa Memohon Ampunan dan Rahmat",
    "kategori": "rabbana",
    "arab": "رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَى رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ",
    "latin": "Rabbana wa atina ma wa'adtana 'ala rusulika wa la tukhzina yawma al-qiyamah",
    "terjemah": "Ya Tuhan kami, berikanlah kepada kami apa yang telah Engkau janjikan kepada para rasul-Mu dan janganlah Engkau hinakan kami pada hari kiamat.",
    "surah_id": 3,
    "surah_nama": "Ali 'Imran",
    "nomor_ayat": "118",
    "referensi": "QS. Ali 'Imran: 118",
    "konteks": "Digunakan ketika seseorang ingin memohon ampunan dan berharap mendapatkan rahmat Allah di hari kiamat.",
    "keutamaan": "Membaca doa ini dapat mendatangkan harapan akan rahmat dan ampunan Allah.",
    "mustajab": true,
    "tema_hajat": [
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Sabar",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-028",
    "judul": "Doa Memohon Pertolongan dalam Kesulitan",
    "kategori": "rabbi",
    "arab": "رَبِّ انصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ",
    "latin": "Rabbi ansurni 'ala al-qawmil-mufsidin",
    "terjemah": "Tuhanku, tolonglah aku atas kaum yang berbuat kerusakan.",
    "surah_id": 29,
    "surah_nama": "Al-Ankabut",
    "nomor_ayat": "30",
    "referensi": "QS. Al-Ankabut: 30",
    "konteks": "Doa ini dipanjatkan ketika menghadapi orang-orang yang merusak dan mengganggu kebaikan.",
    "keutamaan": "Doa ini dapat menjadi penguat dan penolong bagi yang teraniaya.",
    "mustajab": true,
    "tema_hajat": [
      "musibah",
      "perlindungan"
    ],
    "tags": [
      "Doa & Munajat",
      "Tawakkal",
      "Sabar"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-029",
    "judul": "Doa Memohon Kesehatan dan Keselamatan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا",
    "latin": "Rabbana innana amanna faghfir lana warhamna",
    "terjemah": "Ya Tuhan kami, sesungguhnya kami telah beriman, maka ampunilah kami dan rahmatilah kami.",
    "surah_id": 14,
    "surah_nama": "Ibrahim",
    "nomor_ayat": "40",
    "referensi": "QS. Ibrahim: 40",
    "konteks": "Doa ini digunakan oleh orang-orang yang beriman untuk memohon ampunan dan rahmat dari Allah.",
    "keutamaan": "Doa ini memiliki makna yang dalam dan menjadi pengantar untuk mendapatkan kesehatan dan keselamatan.",
    "mustajab": true,
    "tema_hajat": [
      "kesehatan",
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Syukur",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-030",
    "judul": "Doa Memohon Hidayah",
    "kategori": "rabbana",
    "arab": "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    "latin": "Rabbana amanna faghfir lana warhamna wa anta khayru ar-rahimin",
    "terjemah": "Ya Tuhan kami, kami telah beriman, maka ampunilah kami dan rahmatilah kami, dan Engkau adalah sebaik-baik pemberi rahmat.",
    "surah_id": 3,
    "surah_nama": "Ali 'Imran",
    "nomor_ayat": "53",
    "referensi": "QS. Ali 'Imran: 53",
    "konteks": "Digunakan dalam doa untuk memohon hidayah dan rahmat Allah di tengah kesulitan.",
    "keutamaan": "Doa ini sangat baik untuk dipanjatkan agar diberi hidayah dan rahmat dalam hidup.",
    "mustajab": true,
    "tema_hajat": [
      "hidayah",
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Taqwa",
      "Sabar"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-031",
    "judul": "Doa Memohon Perlindungan dari Kejahatan",
    "kategori": "rabbi",
    "arab": "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ",
    "latin": "Rabbi a'udzu bika min hamazatisy-syaithin",
    "terjemah": "Tuhanku, aku berlindung kepada-Mu dari bisikan-bisikan setan.",
    "surah_id": 23,
    "surah_nama": "Al-Mu'minun",
    "nomor_ayat": "97",
    "referensi": "QS. Al-Mu'minun: 97",
    "konteks": "Doa ini dipanjatkan untuk memohon perlindungan dari gangguan setan.",
    "keutamaan": "Membaca doa ini dapat memberikan perlindungan dari kejahatan dan bisikan setan.",
    "mustajab": true,
    "tema_hajat": [
      "perlindungan"
    ],
    "tags": [
      "Doa & Munajat",
      "Tawakkal",
      "Sabar"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-032",
    "judul": "Doa Memohon Kebahagiaan dan Kebaikan",
    "kategori": "rabbana",
    "arab": "رَبَّنَا وَأَدْخِلْهُمْ جَنَّاتِ عَدْنٍ الَّتِي وَعَدتَّهُمْ",
    "latin": "Rabbana wa adkhilhum jannati 'adnin allati wa 'adtahum",
    "terjemah": "Ya Tuhan kami, masukkanlah mereka ke dalam surga 'Adn yang Engkau janjikan kepada mereka.",
    "surah_id": 32,
    "surah_nama": "As-Sajdah",
    "nomor_ayat": "10",
    "referensi": "QS. As-Sajdah: 10",
    "konteks": "Digunakan dalam doa untuk memohon kebahagiaan dan kebaikan di akhirat.",
    "keutamaan": "Doa ini sangat bermanfaat untuk memohon kebahagiaan dan kebaikan di dunia dan akhirat.",
    "mustajab": true,
    "tema_hajat": [
      "taubat",
      "hidayah"
    ],
    "tags": [
      "Doa & Munajat",
      "Syukur",
      "Tawakkal"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-033",
    "judul": "Doa Memohon Ampunan dan Kesejahteraan",
    "kategori": "rabbi",
    "arab": "رَبِّ زِدْنِي عِلْمًا",
    "latin": "Rabbi zidni 'ilma",
    "terjemah": "Tuhanku, tambahkanlah kepadaku ilmu.",
    "surah_id": 20,
    "surah_nama": "Taha",
    "nomor_ayat": "114",
    "referensi": "QS. Taha: 114",
    "konteks": "Doa ini dipanjatkan ketika seseorang menginginkan pengetahuan yang bermanfaat.",
    "keutamaan": "Membaca doa ini dapat mendatangkan ilmu yang bermanfaat dan meningkatkan pemahaman.",
    "mustajab": true,
    "tema_hajat": [
      "ilmu"
    ],
    "tags": [
      "Doa & Munajat",
      "Ilmu",
      "Taqwa"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-034",
    "judul": "Doa untuk petunjuk dan hidayah",
    "kategori": "rabbana",
    "arab": "رَبَّنَا آمِنَّا بِمَا أَنْزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ",
    "latin": "Rabbana amanna bima anzalta wa attaba'na ar-rasula faktubna ma'a ash-shahidin",
    "terjemah": "Ya Tuhan kami, kami beriman kepada apa yang Engkau turunkan dan kami mengikuti Rasul, maka catatlah kami bersama orang-orang yang bersaksi.",
    "surah_id": 3,
    "surah_nama": "Ali 'Imran",
    "nomor_ayat": "53",
    "referensi": "QS. Ali 'Imran: 53",
    "konteks": "Doa ini dipanjatkan oleh para pengikut Nabi Isa yang ingin mendapatkan petunjuk dan hidayah.",
    "keutamaan": "Membaca doa ini akan mendatangkan petunjuk dan hidayah dari Allah.",
    "mustajab": true,
    "tema_hajat": [
      "hidayah"
    ],
    "tags": [
      "Doa & Munajat",
      "Taqwa",
      "Ilmu"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-035",
    "judul": "Doa untuk pengampunan dan rahmat",
    "kategori": "rabbana",
    "arab": "رَبَّنَا وَآتِهِمْ مَّا أَنتَ مُعَطِّي مَن تَقَى",
    "latin": "Rabbana wa aati him ma anta mu'ti man taqa",
    "terjemah": "Ya Tuhan kami, berikanlah kepada mereka apa yang Engkau berikan kepada orang yang bertakwa.",
    "surah_id": 8,
    "surah_nama": "Al-Anfal",
    "nomor_ayat": "74",
    "referensi": "QS. Al-Anfal: 74",
    "konteks": "Doa ini digunakan untuk meminta ampunan dan rahmat bagi diri sendiri dan orang lain.",
    "keutamaan": "Doa ini memiliki keutamaan dalam meminta ampunan dan keberkahan.",
    "mustajab": true,
    "tema_hajat": [
      "taubat"
    ],
    "tags": [
      "Doa & Munajat",
      "Taqwa",
      "Syukur"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-036",
    "judul": "Doa untuk kesehatan dan perlindungan",
    "kategori": "rabbi",
    "arab": "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    "latin": "Rabbi awzi'ni an ashkura ni'mataka allati an'amta 'alayya",
    "terjemah": "Ya Tuhanku, berilah aku ilham untuk bersyukur atas nikmat-Mu yang telah Engkau berikan kepadaku.",
    "surah_id": 27,
    "surah_nama": "An-Naml",
    "nomor_ayat": "19",
    "referensi": "QS. An-Naml: 19",
    "konteks": "Doa ini digunakan untuk mengingat dan bersyukur atas nikmat kesehatan yang diberikan.",
    "keutamaan": "Membaca doa ini akan mendatangkan kesehatan dan perlindungan dari Allah.",
    "mustajab": true,
    "tema_hajat": [
      "kesehatan",
      "perlindungan"
    ],
    "tags": [
      "Doa & Munajat",
      "Syukur",
      "Sabar"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbana-037",
    "judul": "Doa untuk keluarga yang bahagia",
    "kategori": "rabbana",
    "arab": "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    "latin": "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin",
    "terjemah": "Ya Tuhan kami, anugerahilah kami istri-istri dan anak-anak yang menjadi penyenang hati.",
    "surah_id": 25,
    "surah_nama": "Al-Furqan",
    "nomor_ayat": "74",
    "referensi": "QS. Al-Furqan: 74",
    "konteks": "Doa ini dipanjatkan untuk memohon keluarga yang harmonis dan saling mendukung.",
    "keutamaan": "Doa ini sangat mustajab untuk menciptakan ketentraman dalam keluarga.",
    "mustajab": true,
    "tema_hajat": [
      "keluarga"
    ],
    "tags": [
      "Keluarga",
      "Doa & Munajat",
      "Syukur"
    ],
    "tafsir_ulama": []
  },
  {
    "id": "rabbi-038",
    "judul": "Doa untuk rezeki yang berkah",
    "kategori": "rabbi",
    "arab": "رَبِّ زِدْنِي عِلْمًا",
    "latin": "Rabbi zidni 'ilma",
    "terjemah": "Ya Tuhanku, tambahkanlah kepadaku ilmu.",
    "surah_id": 20,
    "surah_nama": "Taha",
    "nomor_ayat": "114",
    "referensi": "QS. Taha: 114",
    "konteks": "Doa ini digunakan ketika seseorang ingin meningkatkan pengetahuannya demi kebaikan.",
    "keutamaan": "Doa ini sangat mustajab untuk mendapatkan ilmu yang bermanfaat.",
    "mustajab": true,
    "tema_hajat": [
      "ilmu"
    ],
    "tags": [
      "Doa & Munajat",
      "Ilmu",
      "Taqwa"
    ],
    "tafsir_ulama": []
  },
]

// Helper functions
export function getByKategori(kategori: KategoriDoa): DoaQurani[] {
  return DOA_QURANI.filter(d => d.kategori === kategori)
}

export function getByNabi(nabi: string): DoaQurani[] {
  return DOA_QURANI.filter(d => d.nabi === nabi)
}

export function getByHajat(tema: TemaHajat): DoaQurani[] {
  return DOA_QURANI.filter(d => d.tema_hajat?.includes(tema))
}

export function getById(id: string): DoaQurani | null {
  return DOA_QURANI.find(d => d.id === id) ?? null
}

export function getMustajab(): DoaQurani[] {
  return DOA_QURANI.filter(d => d.mustajab === true)
}

export const NABI_LIST = Array.from(new Set(
  DOA_QURANI.filter(d => d.nabi).map(d => d.nabi!)
))

export const HAJAT_INFO: Record<TemaHajat, { label: string; icon: string }> = {
  rezeki:      { label: 'Rezeki & Kemudahan',      icon: '💰' },
  keluarga:    { label: 'Jodoh & Keluarga',         icon: '❤️' },
  kesehatan:   { label: 'Kesehatan & Kesembuhan',   icon: '🩺' },
  ilmu:        { label: 'Ilmu & Hikmah',            icon: '📚' },
  perlindungan:{ label: 'Perlindungan & Keamanan',  icon: '🛡️' },
  kesedihan:   { label: 'Kesedihan & Kesulitan',    icon: '💔' },
  taubat:      { label: 'Taubat & Ampunan',         icon: '🙏' },
  keturunan:   { label: 'Keturunan & Anak Shalih',  icon: '👶' },
  hidayah:     { label: 'Hidayah & Petunjuk',       icon: '🧭' },
  jodoh:       { label: 'Jodoh & Pasangan',         icon: '💍' },
  anak:        { label: 'Anak & Keturunan',         icon: '🧸' },
  karir:       { label: 'Karir & Pekerjaan',        icon: '💼' },
  hutang:      { label: 'Bebas Hutang',             icon: '💸' },
  musibah:     { label: 'Sabar Menghadapi Musibah', icon: '🌧️' },
  sabar:       { label: 'Kesabaran & Ketabahan',    icon: '🧘' },
}
