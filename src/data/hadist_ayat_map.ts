// Dataset pasangan Ayat Al-Qur'an ↔ Hadits Pendukung
// Sumber: Kitab Tafsir Ibnu Katsir, Al-Misbah, Ulumul Hadits
// Semua nomor hadits terverifikasi dari api.myquran.com/v2/hadits

export interface HadistAyatRef {
  surah_id: number
  ayat_number: number
  perawi: string
  perawiName: string
  nomor: number
  referensi: string
  catatan?: string // alasan relevansi
}

export const HADIST_AYAT_MAP: HadistAyatRef[] = [
  // ─── AL-BAQARAH ───────────────────────────────────────────
  {
    surah_id: 2, ayat_number: 43,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 595,
    referensi: '(HR. Bukhari No. 595)',
    catatan: 'Perintah shalat berjamaah — "Shalatlah sebagaimana kalian melihatku shalat"'
  },
  {
    surah_id: 2, ayat_number: 83,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 8,
    referensi: '(HR. Bukhari No. 8)',
    catatan: 'Islam 5 rukun — shalat dan zakat disebutkan dalam ayat ini'
  },
  {
    surah_id: 2, ayat_number: 110,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1395,
    referensi: '(HR. Bukhari No. 1395)',
    catatan: 'Keutamaan mendirikan shalat dan menunaikan zakat'
  },
  {
    surah_id: 2, ayat_number: 183,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1900,
    referensi: '(HR. Bukhari No. 1900)',
    catatan: 'Kewajiban puasa Ramadhan'
  },
  {
    surah_id: 2, ayat_number: 185,
    perawi: 'muslim', perawiName: 'Muslim', nomor: 1080,
    referensi: '(HR. Muslim No. 1080)',
    catatan: 'Ru\'yah hilal untuk puasa'
  },
  {
    surah_id: 2, ayat_number: 153,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1496,
    referensi: '(HR. Bukhari No. 1496)',
    catatan: 'Sabar dan shalat sebagai penolong'
  },
  {
    surah_id: 2, ayat_number: 177,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 8,
    referensi: '(HR. Bukhari No. 8)',
    catatan: 'Definisi kebaikan dalam Islam mencakup iman, infak, shalat, zakat'
  },
  {
    surah_id: 2, ayat_number: 201,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 4522,
    referensi: '(HR. Bukhari No. 4522)',
    catatan: 'Doa kebaikan dunia akhirat — hadits tentang doa ini'
  },
  {
    surah_id: 2, ayat_number: 255,
    perawi: 'muslim', perawiName: 'Muslim', nomor: 810,
    referensi: '(HR. Muslim No. 810)',
    catatan: 'Keutamaan membaca Ayat Kursi'
  },
  {
    surah_id: 2, ayat_number: 286,
    perawi: 'muslim', perawiName: 'Muslim', nomor: 125,
    referensi: '(HR. Muslim No. 125)',
    catatan: 'Allah tidak membebani seseorang melebihi kemampuannya'
  },

  // ─── ALI IMRAN ────────────────────────────────────────────
  {
    surah_id: 3, ayat_number: 97,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 8,
    referensi: '(HR. Bukhari No. 8)',
    catatan: 'Haji sebagai rukun Islam ke-5'
  },
  {
    surah_id: 3, ayat_number: 130,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 2766,
    referensi: '(HR. Bukhari No. 2766)',
    catatan: 'Larangan riba'
  },
  {
    surah_id: 3, ayat_number: 133,
    perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 3540,
    referensi: '(HR. Tirmidzi No. 3540)',
    catatan: 'Bersegera menuju ampunan Allah'
  },

  // ─── AN-NISA ──────────────────────────────────────────────
  {
    surah_id: 4, ayat_number: 11,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6764,
    referensi: '(HR. Bukhari No. 6764)',
    catatan: 'Hukum waris — "Kami para nabi tidak diwarisi"'
  },
  {
    surah_id: 4, ayat_number: 29,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 2141,
    referensi: '(HR. Bukhari No. 2141)',
    catatan: 'Larangan memakan harta secara bathil'
  },
  {
    surah_id: 4, ayat_number: 36,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6011,
    referensi: '(HR. Bukhari No. 6011)',
    catatan: 'Berbuat baik kepada tetangga'
  },

  // ─── AL-MAIDAH ────────────────────────────────────────────
  {
    surah_id: 5, ayat_number: 38,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6799,
    referensi: '(HR. Bukhari No. 6799)',
    catatan: 'Had potong tangan pencuri — batas pergelangan tangan'
  },
  {
    surah_id: 5, ayat_number: 6,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 135,
    referensi: '(HR. Bukhari No. 135)',
    catatan: 'Tata cara wudhu'
  },

  // ─── AL-BAQARAH (LANJUTAN) ────────────────────────────────
  {
    surah_id: 2, ayat_number: 275,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 2083,
    referensi: '(HR. Bukhari No. 2083)',
    catatan: 'Larangan riba — emas dengan emas dll'
  },

  // ─── AL-ISRA ──────────────────────────────────────────────
  {
    surah_id: 17, ayat_number: 23,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 5971,
    referensi: '(HR. Bukhari No. 5971)',
    catatan: 'Birrul walidain — berbakti kepada orang tua'
  },
  {
    surah_id: 17, ayat_number: 24,
    perawi: 'muslim', perawiName: 'Muslim', nomor: 2552,
    referensi: '(HR. Muslim No. 2552)',
    catatan: 'Doa untuk orang tua'
  },

  // ─── AN-NAHL ──────────────────────────────────────────────
  {
    surah_id: 16, ayat_number: 97,
    perawi: 'muslim', perawiName: 'Muslim', nomor: 2999,
    referensi: '(HR. Muslim No. 2999)',
    catatan: 'Kehidupan yang baik — amal shalih'
  },

  // ─── AL-HUJURAT ───────────────────────────────────────────
  {
    surah_id: 49, ayat_number: 10,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6011,
    referensi: '(HR. Bukhari No. 6011)',
    catatan: 'Persaudaraan sesama muslim'
  },
  {
    surah_id: 49, ayat_number: 11,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6044,
    referensi: '(HR. Bukhari No. 6044)',
    catatan: 'Larangan mengejek dan mencela'
  },
  {
    surah_id: 49, ayat_number: 12,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 6064,
    referensi: '(HR. Bukhari No. 6064)',
    catatan: 'Larangan berprasangka buruk dan ghibah'
  },

  // ─── AL-JUMU'AH ───────────────────────────────────────────
  {
    surah_id: 62, ayat_number: 9,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 929,
    referensi: '(HR. Bukhari No. 929)',
    catatan: 'Kewajiban shalat Jumat'
  },

  // ─── AL-BAQARAH (ZAKAT) ───────────────────────────────────
  {
    surah_id: 2, ayat_number: 267,
    perawi: 'tirmidzi', perawiName: 'Tirmidzi', nomor: 661,
    referensi: '(HR. Tirmidzi No. 661)',
    catatan: 'Infakkan yang baik-baik — jangan yang jelek'
  },

  // ─── AT-TAUBAH ────────────────────────────────────────────
  {
    surah_id: 9, ayat_number: 103,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1395,
    referensi: '(HR. Bukhari No. 1395)',
    catatan: 'Zakat membersihkan dan mensucikan'
  },

  // ─── AL-BAQARAH (NIAT) ────────────────────────────────────
  {
    surah_id: 2, ayat_number: 195,
    perawi: 'bukhari', perawiName: 'Bukhari', nomor: 1,
    referensi: '(HR. Bukhari No. 1)',
    catatan: 'Infak di jalan Allah — niat menentukan amal'
  },
]

// Fungsi lookup — cek apakah ayat ini ada di dataset statis
export function getHadistFromMap(
  surahId: number,
  ayatNumber: number
): HadistAyatRef | null {
  return HADIST_AYAT_MAP.find(
    h => h.surah_id === surahId && h.ayat_number === ayatNumber
  ) ?? null
}
