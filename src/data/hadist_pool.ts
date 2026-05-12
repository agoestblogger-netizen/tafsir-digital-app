// Pool hadits terverifikasi — semua nomor sudah dicek di API
// Dikelompokkan per tema untuk memudahkan pemilihan kontekstual

export type TemaSurah =
  | 'iman_taqwa'
  | 'amal_ibadah'
  | 'akhlak_mulia'
  | 'ilmu_hikmah'
  | 'rezeki_harta'
  | 'keluarga_sosial'
  | 'sabar_syukur'
  | 'tobat_ampunan'
  | 'akhirat_surga'
  | 'umum';

export interface HadistVerified {
  perawi: string;
  perawiName: string;
  nomor: number;
  referensi: string;
}

export const HADIST_POOL: Record<TemaSurah, HadistVerified[]> = {
  iman_taqwa: [
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1,    referensi: '(HR. Bukhari No. 1)' },
    { perawi: 'muslim',  perawiName: 'Muslim',  nomor: 8,    referensi: '(HR. Muslim No. 8)' },
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 8,    referensi: '(HR. Bukhari No. 8)' },
  ],
  amal_ibadah: [
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 2,    referensi: '(HR. Bukhari No. 2)' },
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 7,    referensi: '(HR. Bukhari No. 7)' },
    { perawi: 'muslim',  perawiName: 'Muslim',  nomor: 1,    referensi: '(HR. Muslim No. 1)' },
  ],
  akhlak_mulia: [
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6,    referensi: '(HR. Bukhari No. 6)' },
    { perawi: 'muslim',  perawiName: 'Muslim',  nomor: 2553, referensi: '(HR. Muslim No. 2553)' },
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 5,    referensi: '(HR. Bukhari No. 5)' },
  ],
  ilmu_hikmah: [
    { perawi: 'bukhari',    perawiName: 'Bukhari',    nomor: 71,  referensi: '(HR. Bukhari No. 71)' },
    { perawi: 'muslim',     perawiName: 'Muslim',     nomor: 2699, referensi: '(HR. Muslim No. 2699)' },
    { perawi: 'ibnu-majah', perawiName: 'Ibnu Majah', nomor: 224, referensi: '(HR. Ibnu Majah No. 224)' },
  ],
  rezeki_harta: [
    { perawi: 'bukhari',  perawiName: 'Bukhari',  nomor: 1468, referensi: '(HR. Bukhari No. 1468)' },
    { perawi: 'muslim',   perawiName: 'Muslim',   nomor: 1010, referensi: '(HR. Muslim No. 1010)' },
    { perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 2417, referensi: '(HR. Tirmidzi No. 2417)' },
  ],
  keluarga_sosial: [
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 5971, referensi: '(HR. Bukhari No. 5971)' },
    { perawi: 'muslim',  perawiName: 'Muslim',  nomor: 2548, referensi: '(HR. Muslim No. 2548)' },
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6011, referensi: '(HR. Bukhari No. 6011)' },
  ],
  sabar_syukur: [
    { perawi: 'muslim',   perawiName: 'Muslim',   nomor: 2999, referensi: '(HR. Muslim No. 2999)' },
    { perawi: 'bukhari',  perawiName: 'Bukhari',  nomor: 1496, referensi: '(HR. Bukhari No. 1496)' },
    { perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 2516, referensi: '(HR. Tirmidzi No. 2516)' },
  ],
  tobat_ampunan: [
    { perawi: 'bukhari',  perawiName: 'Bukhari',  nomor: 6307, referensi: '(HR. Bukhari No. 6307)' },
    { perawi: 'muslim',   perawiName: 'Muslim',   nomor: 2747, referensi: '(HR. Muslim No. 2747)' },
    { perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 3540, referensi: '(HR. Tirmidzi No. 3540)' },
  ],
  akhirat_surga: [
    { perawi: 'bukhari',  perawiName: 'Bukhari',  nomor: 6502, referensi: '(HR. Bukhari No. 6502)' },
    { perawi: 'muslim',   perawiName: 'Muslim',   nomor: 2816, referensi: '(HR. Muslim No. 2816)' },
    { perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 2604, referensi: '(HR. Tirmidzi No. 2604)' },
  ],
  umum: [
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1,    referensi: '(HR. Bukhari No. 1)' },
    { perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6,    referensi: '(HR. Bukhari No. 6)' },
    { perawi: 'muslim',  perawiName: 'Muslim',  nomor: 2553, referensi: '(HR. Muslim No. 2553)' },
  ],
};

// Flat list semua pool untuk fallback iterasi
export const ALL_POOL_FLAT: HadistVerified[] = Object.values(HADIST_POOL).flat();

/** Deteksi tema dari gabungan teks ayat + tafsir + nama surah */
export function detectTema(text: string): TemaSurah {
  const lower = text.toLowerCase();

  if (/iman|taqwa|tauhid|beriman|kafir|musyrik/.test(lower))          return 'iman_taqwa';
  if (/shalat|puasa|zakat|haji|ibadah|amal|sujud|rukuk/.test(lower))  return 'amal_ibadah';
  if (/akhlak|adab|jujur|amanah|mulia|bohong/.test(lower))            return 'akhlak_mulia';
  if (/ilmu|hikmah|belajar|mengajar|ulama|pandai/.test(lower))        return 'ilmu_hikmah';
  if (/rezeki|harta|kaya|miskin|sedekah|infak|nafkah/.test(lower))    return 'rezeki_harta';
  if (/keluarga|suami|istri|anak|orang.?tua|tetangga/.test(lower))    return 'keluarga_sosial';
  if (/sabar|syukur|cobaan|ujian|musibah|bersyukur/.test(lower))      return 'sabar_syukur';
  if (/tobat|taubat|ampun|dosa|maghfirah|istighfar/.test(lower))      return 'tobat_ampunan';
  if (/akhirat|surga|neraka|kiamat|mati|kubur/.test(lower))           return 'akhirat_surga';

  return 'umum';
}

/**
 * Pilih hadits dari pool secara deterministik (tidak random) menggunakan
 * surahId + ayatNumber sebagai indeks, sehingga ayat yang sama
 * selalu mendapat hadits yang sama.
 */
export function pickHadistFromPool(
  tema: TemaSurah,
  surahId: number,
  ayatNumber: number
): HadistVerified {
  const pool = HADIST_POOL[tema];
  const index = (surahId + ayatNumber) % pool.length;
  return { ...pool[index] }; // return salinan agar tidak mutate konstanta
}
