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

export const NABI_LIST = [...new Set(
  DOA_QURANI.filter(d => d.nabi).map(d => d.nabi!)
)]

export const HAJAT_INFO: Record<TemaHajat, { label: string; icon: string }> = {
  rezeki:      { label: 'Rezeki & Kemudahan',      icon: '💰' },
  keluarga:    { label: 'Jodoh & Keluarga',         icon: '❤️' },
  kesehatan:   { label: 'Kesehatan & Kesembuhan',   icon: '🩺' },
  ilmu:        { label: 'Ilmu & Hikmah',            icon: '📚' },
  perlindungan:{ label: 'Perlindungan & Keamanan',  icon: '🛡️' },
  kesedihan:   { label: 'Kesedihan & Kesulitan',    icon: '💔' },
  taubat:      { label: 'Taubat & Ampunan',         icon: '🙏' },
  keturunan:   { label: 'Keturunan & Anak Shalih',  icon: '👶' },
}
