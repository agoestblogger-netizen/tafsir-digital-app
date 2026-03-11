export type HijrahMission = {
  id: string;
  title: string;
};

export const hijrahMissions: Record<number, HijrahMission[]> = {
  1: [
    { id: '1a', title: 'Ucapkan Istighfar 100x' },
    { id: '1b', title: 'Tahan amarah walau sedetik' },
    { id: '1c', title: 'Mendoakan orang tua minimal 1x' }
  ],
  2: [
    { id: '2a', title: 'Tidak mengeluh seharian penuh' },
    { id: '2b', title: 'Memaafkan 1 orang yang pernah menyakiti' },
    { id: '2c', title: 'Baca Sayyidul Istighfar 1x' }
  ],
  3: [
    { id: '3a', title: 'Puasa scroll medsos selama 2 jam' },
    { id: '3b', title: 'Tahan diri dari berdebat hari ini' },
    { id: '3c', title: 'Berdzikir Subhanallah 33x' }
  ],
  4: [
    { id: '4a', title: 'Tersenyum pada 3 orang berbeda' },
    { id: '4b', title: 'Jauhi gosip/ghibah seharian' },
    { id: '4c', title: 'Rapikan tempat tidur sendiri' }
  ],
  5: [
    { id: '5a', title: 'Ucapkan terima kasih pada 1 orang' },
    { id: '5b', title: 'Membaca 1 halaman Al-Qur\'an' },
    { id: '5c', title: 'Minum air putih sambil duduk' }
  ],
  6: [
    { id: '6a', title: 'Tidak membandingkan diri dengan orang lain' },
    { id: '6b', title: 'Tidur dalam keadaan berwudhu' },
    { id: '6c', title: 'Sedekah subuh (walau Rp 1.000)' }
  ],
  7: [
    { id: '7a', title: 'Evaluasi diri: Tulis 3 kelemahanmu' },
    { id: '7b', title: 'Bersihkan riwayat chat/foto tak bermanfaat' },
    { id: '7c', title: 'Shalat tepat waktu 5 waktu' }
  ],

// Fase 2: Tahliyah (Pengisian Hati dengan Cahaya)
// Fokus: Membangun empati, kedermawanan, dan ibadah sunnah ringan.

  8: [
    { id: '8a', title: 'Mendoakan sahabat diam-diam' },
    { id: '8b', title: 'Membaca Surat Al-Kahfi (1-10)' },
    { id: '8c', title: 'Menyapa orang yang tidak dikenal' }
  ],
  9: [
    { id: '9a', title: 'Shalat Dhuha minimal 2 rakaat' },
    { id: '9b', title: 'Bantu 1 pekerjaan rumah tanpa diminta' },
    { id: '9c', title: 'Ucapkan Alhamdulillah 100x' }
  ],
  10: [
    { id: '10a', title: 'Berbagi makanan dengan orang lain' },
    { id: '10b', title: 'Membaca 2 halaman Al-Qur\'an' },
    { id: '10c', title: 'Diam ketika marah (jangan bicara)' }
  ],
  11: [
    { id: '11a', title: 'Baca dzikir pagi atau petang' },
    { id: '11b', title: 'Hubungi kerabat untuk silaturahmi' },
    { id: '11c', title: 'Beri komentar positif di medsos' }
  ],
  12: [
    { id: '12a', title: 'Singkirkan duri/sampah dari jalan' },
    { id: '12b', title: 'Shalat rawatib (qabliyah/ba\'diyah) 1x' },
    { id: '12c', title: 'Banyak bersalawat di hari ini' }
  ],
  13: [
    { id: '13a', title: 'Membaca Surat Al-Mulk sebelum tidur' },
    { id: '13b', title: 'Dengarkan kajian Islam 10 menit' },
    { id: '13c', title: 'Sembunyikan 1 amal kebaikanmu' }
  ],
  14: [
    { id: '14a', title: 'Beri hadiah kecil untuk seseorang' },
    { id: '14b', title: 'Membaca 3 halaman Al-Qur\'an' },
    { id: '14c', title: 'Menjaga pandangan dari yang haram' }
  ],

// Fase 3: Istiqomah (Membentuk Kebiasaan Permanen)
// Fokus: Mempertahankan ritme, ibadah malam, dan koneksi langsung ke Allah.

  15: [
    { id: '15a', title: 'Bangun 15 menit sebelum Subuh' },
    { id: '15b', title: 'Shalat Tahajjud minimal 2 rakaat' },
    { id: '15c', title: 'Menangis/merenungi dosa masa lalu' }
  ],
  16: [
    { id: '16a', title: 'Rutinkan Dzikir Pagi dan Petang' },
    { id: '16b', title: 'Puasa Sunnah (Senin/Kamis/Ayyamul Bidh) atau niat puasa' },
    { id: '16c', title: 'Membaca 4 halaman Al-Qur\'an' }
  ],
  17: [
    { id: '17a', title: 'Beri makan hewan jalanan' },
    { id: '17b', title: 'Tidak membicarakan dunia di masjid' },
    { id: '17c', title: 'Berdoa dengan mengangkat tangan' }
  ],
  18: [
    { id: '18a', title: 'Shalat berjamaah di masjid (bagi laki-laki)' },
    { id: '18b', title: 'Khatamkan niat 1 hari 1 juz' },
    { id: '18c', title: 'Ucapkan Laa Ilaha Illallah 100x' }
  ],
  19: [
    { id: '19a', title: 'Menahan diri dari belanja impulsif' },
    { id: '19b', title: 'Baca tafsir 1 ayat Al-Qur\'an' },
    { id: '19c', title: 'Berwudhu setiap kali batal' }
  ],
  20: [
    { id: '20a', title: 'Sedekah dalam jumlah terbesar bulan ini' },
    { id: '20b', title: 'Minta maaf pada orang tua/pasangan' },
    { id: '20c', title: 'Menjaga shalat Isyraq' }
  ],
  21: [
    { id: '21a', title: 'Shalat Witir sebelum tidur' },
    { id: '21b', title: 'Sujud syukur atas nikmat hidayah' },
    { id: '21c', title: 'Berdoa agar diwafatkan Husnul Khatimah' }
  ]
};
