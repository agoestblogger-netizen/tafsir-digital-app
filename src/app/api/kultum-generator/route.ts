import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { AYAT_SAINS } from '@/data/sains_ayat'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function cariAyatSains(tema: string): typeof AYAT_SAINS[0] | null {
  const temaLower = tema.toLowerCase()
  return AYAT_SAINS.find(ayat => {
    const topikLower = ayat.topik_sains.toLowerCase()
    const penjelasanLower = ayat.penjelasan.toLowerCase()
    const keywords = temaLower.split(' ').filter(w => w.length > 3)
    return keywords.some(kw =>
      topikLower.includes(kw) ||
      penjelasanLower.includes(kw) ||
      ayat.surah_nama_latin.toLowerCase().includes(kw)
    )
  }) ?? null
}

const SURAH_TEMA_MAP: Record<string, { surah_id: number; surah_nama: string; keywords: string[] }> = {
  'an-naml':     { surah_id: 27,  surah_nama: 'An-Naml',     keywords: ['semut', 'naml', 'binatang', 'koloni', 'ratu'] },
  'an-nahl':     { surah_id: 16,  surah_nama: 'An-Nahl',     keywords: ['lebah', 'nahl', 'madu', 'hewan', 'ilham'] },
  'al-ankabut':  { surah_id: 29,  surah_nama: 'Al-Ankabut',  keywords: ['laba-laba', 'ankabut', 'rumah', 'lemah', 'jaring'] },
  'al-fil':      { surah_id: 105, surah_nama: 'Al-Fil',      keywords: ['gajah', 'fil', 'abraha', 'burung', 'ababil', 'sombong'] },
  'al-baqarah':  { surah_id: 2,   surah_nama: 'Al-Baqarah',  keywords: ['sapi', 'baqarah', 'lembu'] },
  'al-fajr':     { surah_id: 89,  surah_nama: 'Al-Fajr',     keywords: ['fajar', 'subuh', 'hari akhir', 'balasan', 'amal'] },
  'al-insyirah': { surah_id: 94,  surah_nama: 'Al-Insyirah', keywords: ['lapang', 'kelapangan', 'dada', 'sulit', 'mudah', 'kesulitan', 'sabar'] },
  'al-ikhlas':   { surah_id: 112, surah_nama: 'Al-Ikhlas',   keywords: ['ikhlas', 'tauhid', 'esa', 'ahad', 'murni'] },
  'al-asr':      { surah_id: 103, surah_nama: 'Al-Asr',      keywords: ['waktu', 'asr', 'masa', 'merugi', 'amal shalih'] },
  'al-hujurat':  { surah_id: 49,  surah_nama: 'Al-Hujurat',  keywords: ['ukhuwah', 'persaudaraan', 'ghibah', 'prasangka', 'adab'] },
  'al-kahfi':    { surah_id: 18,  surah_nama: 'Al-Kahfi',    keywords: ['pemuda', 'kahfi', 'gua', 'iman', 'dajjal', 'fitnah'] },
  'luqman':      { surah_id: 31,  surah_nama: 'Luqman',      keywords: ['hikmah', 'nasihat', 'orang tua', 'anak', 'pendidikan'] },
  'al-mulk':     { surah_id: 67,  surah_nama: 'Al-Mulk',     keywords: ['kekuasaan', 'mulk', 'mati', 'kubur', 'langit'] },
  'yusuf':       { surah_id: 12,  surah_nama: 'Yusuf',       keywords: ['nabi yusuf', 'sabar', 'fitnah', 'kepemimpinan', 'mimpi'] },
  'maryam':      { surah_id: 19,  surah_nama: 'Maryam',      keywords: ['maryam', 'nabi isa', 'wanita', 'kesucian', 'mukjizat'] },
  'ar-rahman':   { surah_id: 55,  surah_nama: 'Ar-Rahman',   keywords: ['rahman', 'nikmat', 'syukur', 'bersyukur', 'alam'] },
  'al-waqiah':   { surah_id: 56,  surah_nama: 'Al-Waqiah',   keywords: ['rezeki', 'waqiah', 'kiamat', 'surga', 'neraka', 'harta'] },
  'al-jumuah':   { surah_id: 62,  surah_nama: 'Al-Jumuah',   keywords: ['jumat', 'shalat jumat', 'perdagangan', 'dunia'] },
  'at-taubah':   { surah_id: 9,   surah_nama: 'At-Taubah',   keywords: ['taubat', 'tobat', 'ampun', 'kembali', 'istighfar'] },
}

function cariSurahByTema(tema: string): { surah_id: number; surah_nama: string } | null {
  const temaLower = tema.toLowerCase()
  for (const [, surah] of Object.entries(SURAH_TEMA_MAP)) {
    if (surah.keywords.some(kw => temaLower.includes(kw))) {
      return { surah_id: surah.surah_id, surah_nama: surah.surah_nama }
    }
  }
  return null
}

// Struktur output kultum
export interface KultumOutput {
  judul: string
  format: string
  tema: string
  gaya_bahasa: string
  durasi_estimasi: string
  durasi_per_bagian?: {
    pembukaan: number
    isi_utama: number
    penutup: number
    khotbah_pertama?: number
    duduk_antara?: number
    khotbah_kedua?: number
  }
  bagian: {
    doa_pembuka: {
      arab: string
      latin: string
      terjemah: string
      sumber: string
    }
    pembuka: {
      salam: string
      muqaddimah: string
      pengantar_tema: string
    }
    ayat_quran: {
      arab: string
      latin: string
      terjemah: string
      referensi: string
      tafsir_singkat: string
    }[]
    penjabaran_tafsir: string
    hadits_pendukung: {
      arab: string
      latin: string
      terjemah: string
      referensi: string
      syarah: string
    }[]
    penekanan_makna: string
    poin_utama: {
      judul: string
      isi: string
    }[]
    penutup?: {
      kesimpulan: string
      ajakan: string
      doa_penutup_konten: string
    }
    kesimpulan?: string
    ajakan_penutup?: string
    doa_penutup_tema?: string
    doa_penutup_majelis: {
      arab: string
      latin: string
      terjemah: string
      sumber: string
    }
  }
}

const FORMAT_DURASI: Record<string, string> = {
  tausiyah: '2-5 menit',
  kultum: '5-15 menit',
  khotbah: '25-35 menit',
  ceramah: '30-60 menit',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, sub_format, tema, kategori_tema, gaya_bahasa, user_id, durasi_menit } = body

    if (!format || !tema) {
      return NextResponse.json(
        { error: 'Format dan tema wajib diisi' },
        { status: 400 }
      )
    }

    const targetDurasi = durasi_menit || parseInt(FORMAT_DURASI[format.toLowerCase()]?.split('-')[0] || '10')

    if (sub_format === 'khotbah_jumat') {
      return await generateKhotbahJumat(tema, kategori_tema, gaya_bahasa, user_id, targetDurasi)
    }

    const surahMatch = cariSurahByTema(tema)
    const ayatSains = cariAyatSains(tema)

    const ayatContext = surahMatch ? `
PENTING: Tema ini berkaitan langsung dengan Surah ${surahMatch.surah_nama}.
WAJIB gunakan ayat dari Surah ${surahMatch.surah_nama} (Surah ID: ${surahMatch.surah_id}) sebagai ayat utama.
Pilih ayat yang paling relevan dengan tema "${tema}" dari surah ini.
${ayatSains ? `\nTambahan konteks sains: ${ayatSains.topik_sains} — ${ayatSains.penjelasan.split('\n\n')[0]}` : ''}
` : ayatSains ? `
PENTING: Tema ini berkaitan dengan mukjizat ilmiah Al-Qur'an.
Gunakan ayat ${ayatSains.surah_nama_latin} ayat ${ayatSains.nomor_ayat} sebagai ayat utama.
Topik sains: ${ayatSains.topik_sains}
Penjelasan: ${ayatSains.penjelasan.split('\n\n')[0]}
Sertakan penjelasan ilmiah ini dalam bagian penjabaran_tafsir.
` : ''

    const khotbahInstructions = format.toLowerCase() === 'khotbah' ? `
FORMAT KHUSUS KHOTBAH:
- Bagian "kesimpulan" WAJIB diisi dengan minimal 3 paragraf
- Bagian "ajakan_penutup" WAJIB berisi kalimat motivasi yang kuat
- Bagian "doa_penutup_tema" WAJIB berisi doa penutup bahasa Indonesia
- Khotbah harus lebih panjang dan lebih formal dari kultum biasa
` : ''

    const prompt = `Kamu adalah ustadz/ulama yang berpengalaman membuat kultum dan khotbah Islam.
Buat ${format} dengan tema "${tema}" ${kategori_tema ? `(kategori: ${kategori_tema})` : ''}.
Gaya bahasa: ${gaya_bahasa || 'Semi-Formal'}.
Estimasi durasi: ${targetDurasi} menit. Sesuaikan panjang konten dengan durasi ini.
Panduan: 5 menit ≈ 500 kata, 10 menit ≈ 1000 kata, 30 menit ≈ 3000 kata
Wajib sertakan estimasi pembagian durasi per bagian dalam response JSON di field "durasi_per_bagian" (angka dalam menit, total harus = ${targetDurasi} menit).

WAJIB output dalam format JSON berikut PERSIS:
{
  "judul": "Judul yang menarik dan relevan",
  "format": "${format}",
  "tema": "${tema}",
  "gaya_bahasa": "${gaya_bahasa || 'Semi-Formal'}",
  "durasi_estimasi": "${targetDurasi} menit",
  "durasi_per_bagian": {
    "pembukaan": 2,
    "isi_utama": 6,
    "penutup": 2
  },
  "bagian": {
    "doa_pembuka": {
      "arab": "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ وَبِهِ نَسْتَعِيْنُ عَلٰى أُمُوْرِ الدُّنْيَا وَالدِّيْنِ وَالصَّلاَةُ وَالسَّلاَمُ عَلٰى أَشْرَفِ الْأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَعَلٰى اٰلِهِ وَصَحْبِهِ أَجْمَعِيْنَ",
      "latin": "Alhamdulillahi rabbil 'aalamiin, wa bihii nasta'iinu 'alaa umuurid dunyaa wad diin, wash shalaatu was salaamu 'alaa asyrafil ambiyaa'i wal mursaliin, wa 'alaa aalihii wa shahbihii ajma'iin",
      "terjemah": "Segala puji bagi Allah Tuhan semesta alam, dengan-Nya kami memohon pertolongan atas urusan dunia dan agama, shalawat dan salam atas semulia-mulia para nabi dan rasul, beserta keluarga dan seluruh sahabatnya.",
      "sumber": "Doa Pembuka Majelis Ilmu — HR. Tirmidzi & Abu Dawud"
    },
    "pembuka": {
      "salam": "Assalamu'alaikum warahmatullahi wabarakatuh...",
      "muqaddimah": "Paragraf hamdalah dan shalawat dalam bahasa Indonesia",
      "pengantar_tema": "Paragraf pengantar yang menarik menuju tema"
    },
    "ayat_quran": [
      {
        "arab": "teks Arab ayat",
        "latin": "transliterasi Latin",
        "terjemah": "terjemahan Indonesia",
        "referensi": "QS. Nama Surah: Nomor Ayat",
        "tafsir_singkat": "penjelasan singkat ayat (2-3 kalimat)"
      }
    ],
    "penjabaran_tafsir": "Paragraf penjabaran tafsir yang mendalam (3-4 paragraf)",
    "hadits_pendukung": [
      {
        "arab": "teks Arab hadits",
        "latin": "transliterasi Latin",
        "terjemah": "terjemahan Indonesia",
        "referensi": "HR. Perawi No. Nomor",
        "syarah": "penjelasan hadits (2-3 kalimat)"
      }
    ],
    "penekanan_makna": "Paragraf penekanan pesan utama (2-3 paragraf)",
    "poin_utama": [
      {"judul": "Poin 1", "isi": "Penjelasan poin 1"},
      {"judul": "Poin 2", "isi": "Penjelasan poin 2"},
      {"judul": "Poin 3", "isi": "Penjelasan poin 3"}
    ],
    "kesimpulan": "Tulis 2-3 paragraf kesimpulan yang merangkum isi kultum dengan baik",
    "ajakan_penutup": "Tulis kalimat ajakan motivasi yang kuat untuk jamaah",
    "doa_penutup_tema": "Tulis doa penutup bahasa Indonesia yang relevan dengan tema",
    "doa_penutup_majelis": {
      "arab": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
      "latin": "Subhanakallahumma wabihamdika asyhadu alla ilaha illa anta astaghfiruka wa atubu ilaik",
      "terjemah": "Maha Suci Engkau ya Allah dan dengan memuji-Mu, aku bersaksi bahwa tidak ada tuhan selain Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.",
      "sumber": "Kaffaratul Majelis (HR. Tirmidzi, Abu Dawud)"
    }
  }
}
${ayatContext}
${khotbahInstructions}
ATURAN PENTING:
- Semua ayat Al-Qur'an harus dengan referensi surah dan nomor yang akurat
- Semua hadits harus dengan referensi perawi dan nomor yang dapat diverifikasi
- Gaya bahasa harus konsisten sesuai pilihan: ${gaya_bahasa}
- Output HANYA JSON, tanpa markdown backticks
- Minimal 2 ayat Al-Qur'an dan 1 hadits
- WAJIB: Field "kesimpulan", "ajakan_penutup", dan "doa_penutup_tema" TIDAK BOLEH kosong. Setiap field harus berisi teks yang bermakna, minimal 1 kalimat.
- LARANGAN: Jangan gunakan """ (triple quote) sebagai value field. Jika tidak ada konten untuk field tertentu, isi dengan string kosong "" bukan """. Setiap field penutup WAJIB diisi dengan teks nyata dalam bahasa Indonesia.`

    // Generate dengan timeout 45 detik
    const aiCall = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), 45000)
    )

    const completion = await Promise.race([aiCall, timeoutPromise]) as Awaited<typeof aiCall>
    const responseText = completion.choices[0].message.content || '{}'

    let konten: KultumOutput
    try {
      konten = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: 'Gagal parse response AI' },
        { status: 500 }
      )
    }

    if (!konten.bagian) {
      konten.bagian = {} as KultumOutput['bagian']
    }

    // Cek apakah field ada di root konten (bukan di bagian) — AI kadang taruh di luar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootKonten = konten as any
    if (!konten.bagian.kesimpulan && rootKonten.kesimpulan) {
      konten.bagian.kesimpulan = rootKonten.kesimpulan
    }
    if (!konten.bagian.ajakan_penutup && rootKonten.ajakan_penutup) {
      konten.bagian.ajakan_penutup = rootKonten.ajakan_penutup
    }
    if (!konten.bagian.doa_penutup_tema && rootKonten.doa_penutup_tema) {
      konten.bagian.doa_penutup_tema = rootKonten.doa_penutup_tema
    }

    // Normalisasi: jika AI masih pakai format lama (nested penutup)
    if (konten.bagian?.penutup && typeof konten.bagian.penutup === 'object') {
      konten.bagian.kesimpulan = konten.bagian.kesimpulan || konten.bagian.penutup.kesimpulan || ''
      konten.bagian.ajakan_penutup = konten.bagian.ajakan_penutup || konten.bagian.penutup.ajakan || ''
      konten.bagian.doa_penutup_tema = konten.bagian.doa_penutup_tema || konten.bagian.penutup.doa_penutup_konten || ''
    }

    // Normalisasi durasi per bagian
    if (!konten.durasi_per_bagian || typeof konten.durasi_per_bagian !== 'object') {
      konten.durasi_per_bagian = { pembukaan: 0, isi_utama: 0, penutup: 0 };
    }
    const dpb = konten.durasi_per_bagian as Record<string, number>;
    
    // Fallback pembagian durasi
    const fallbackPembukaan = Math.max(1, Math.round(targetDurasi * 0.2));
    const fallbackPenutup = Math.max(1, Math.round(targetDurasi * 0.2));
    const fallbackIsiUtama = Math.max(1, targetDurasi - fallbackPembukaan - fallbackPenutup);

    if (typeof dpb.pembukaan !== 'number') dpb.pembukaan = fallbackPembukaan;
    if (typeof dpb.isi_utama !== 'number') dpb.isi_utama = fallbackIsiUtama;
    if (typeof dpb.penutup !== 'number') dpb.penutup = fallbackPenutup;

    // Ensure total sum equals targetDurasi
    const currentTotal = dpb.pembukaan + dpb.isi_utama + dpb.penutup;
    if (currentTotal !== targetDurasi) {
      dpb.isi_utama = Math.max(1, targetDurasi - dpb.pembukaan - dpb.penutup);
    }

    // Bersihkan dari karakter """
    const clean = (s: unknown) => typeof s === 'string' ? s.replace(/"""/g, '').trim() : ''
    
    konten.bagian.kesimpulan = clean(konten.bagian.kesimpulan)
    konten.bagian.ajakan_penutup = clean(konten.bagian.ajakan_penutup)
    konten.bagian.doa_penutup_tema = clean(konten.bagian.doa_penutup_tema)

    // Simpan ke Supabase jika ada user_id
    let savedId: string | null = null
    if (user_id) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('kultum_history')
        .insert({
          user_id,
          judul: konten.judul,
          format,
          tema,
          kategori_tema: kategori_tema || null,
          durasi_menit: targetDurasi,
          gaya_bahasa: gaya_bahasa || 'Semi-Formal',
          konten: konten as unknown as Record<string, unknown>,
        })
        .select('id')
        .single()

      if (!error && data) savedId = data.id
    }

    return NextResponse.json({
      success: true,
      id: savedId,
      konten,
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('[Kultum] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function generateKhotbahJumat(
  tema: string,
  kategori_tema: string,
  gaya_bahasa: string,
  user_id?: string,
  durasi_menit: number = 25
) {
  try {
    const prompt = `Kamu adalah khatib Jum'at yang berpengalaman.
Buat naskah Khotbah Jum'at lengkap dengan tema "${tema}".
Gaya bahasa: ${gaya_bahasa || 'Formal'}.
Estimasi durasi total: ${durasi_menit} menit. Sesuaikan panjang isi khotbah dengan durasi ini.
Panduan: 10 menit ≈ 1000 kata, 30 menit ≈ 3000 kata.
Wajib sertakan estimasi pembagian durasi per bagian dalam response JSON di field "durasi_per_bagian" (angka dalam menit: khotbah_pertama, duduk_antara, khotbah_kedua, total harus = ${durasi_menit} menit).

Output JSON dengan struktur PERSIS berikut:
{
  "judul": "Judul khotbah yang relevan",
  "format": "khotbah_jumat",
  "tema": "${tema}",
  "durasi_estimasi": "${durasi_menit} menit",
  "durasi_per_bagian": {
    "khotbah_pertama": 15,
    "duduk_antara": 2,
    "khotbah_kedua": 8
  },

  "persiapan_khatib": {
    "catatan": "Panduan singkat untuk khatib sebelum naik mimbar",
    "salam_naik_mimbar": "Assalamu'alaikum warahmatullahi wabarakatuh"
  },

  "khotbah_pertama": {
    "pembuka_hamdalah": {
      "arab": "إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِيْنُهُ وَنَسْتَغْفِرُهُ وَنَعُوذُ بِاللَّهِ مِنْ شُرُوْرِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ",
      "latin": "Innal hamda lillah, nahmaduhu wanasta'iinuhu wanastaghfiruh, wana'uudzu billahi min syuruuri anfusinaa, wamin sayyiaati a'maalinaa, man yahdihillaahu falaa mudhilla lah, wa man yudhlil falaa haadiya lah",
      "terjemah": "Sesungguhnya segala puji hanya milik Allah, kami memuji-Nya, memohon pertolongan dan ampunan kepada-Nya, kami berlindung kepada Allah dari kejahatan diri dan keburukan amal kami. Barangsiapa diberi hidayah Allah tak ada yang bisa menyesatkannya, dan barangsiapa disesatkan-Nya tak ada yang bisa memberinya petunjuk."
    },
    "syahadat": {
      "arab": "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ",
      "latin": "Asyhadu allaa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna muhammadan 'abduhu wa rasuuluh",
      "terjemah": "Aku bersaksi bahwa tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya."
    },
    "shalawat": {
      "arab": "اَللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِيْنَ",
      "latin": "Allahumma shalli wasallim wabarik 'alaa sayyidinaa muhammadin wa 'alaa aalihii wa ash-haabihii ajma'iin",
      "terjemah": "Ya Allah, limpahkanlah shalawat, salam, dan keberkahan kepada junjungan kami Nabi Muhammad beserta keluarga dan seluruh sahabatnya."
    },
    "wasiat_taqwa": "Teks wasiat taqwa dalam bahasa Indonesia yang relevan dengan tema",
    "ayat_quran": [
      {
        "arab": "teks Arab ayat utama yang relevan dengan tema",
        "latin": "transliterasi Latin",
        "terjemah": "terjemahan Indonesia",
        "referensi": "QS. Nama Surah: Nomor Ayat"
      }
    ],
    "isi_khotbah": "Isi khotbah pertama 4-5 paragraf yang mendalam sesuai tema",
    "penutup_khotbah_pertama": {
      "arab": "أَقُوْلُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ الْعَظِيْمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُوْرُ الرَّحِيْمُ",
      "latin": "Aquulu qawlii haadzaa wa astaghfirullaahal 'azhiim lii walakum wali saa'iril muslimiina wal muslimaat, fastaghfiruuh innahuu huwal ghafuurur rahiim",
      "terjemah": "Demikianlah yang dapat saya sampaikan, dan saya memohon ampunan kepada Allah Yang Maha Agung untuk saya, untuk kalian, dan untuk seluruh kaum muslimin dan muslimat. Mohonlah ampunan kepada-Nya, sesungguhnya Dia Maha Pengampun lagi Maha Penyayang."
    }
  },

  "duduk_antara_dua_khotbah": {
    "catatan": "Khatib duduk sejenak ± 1-2 menit. Jamaah dianjurkan membaca istighfar dan shalawat dalam hati.",
    "doa_duduk": {
      "arab": "اللَّهُمَّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ وَعَافِنِيْ",
      "latin": "Allaahummaghfir lii warhamnii wajburnii warfa'nii warzuqnii wahdinii wa 'aafinii",
      "terjemah": "Ya Allah ampunilah aku, rahmatilah aku, perbaikilah keadaanku, angkatlah derajatku, berilah aku rezeki, tunjukkanlah aku, dan sehatkanlah aku.",
      "sumber": "HR. Abu Dawud, Ibnu Majah — dibaca khatib saat duduk antara dua khotbah"
    }
  },

  "khotbah_kedua": {
    "pembuka": {
      "arab": "اَلْحَمْدُ لِلَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُوْلِ اللَّهِ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ",
      "latin": "Alhamdulillah wash shalaatu was salaamu 'alaa rasuulillaah. Asyhadu allaa ilaaha illallaahu wahdahu laa syariikalah wa asyhadu anna muhammadan 'abduhu wa rasuuluh",
      "terjemah": "Segala puji bagi Allah, shalawat dan salam atas Rasulullah. Aku bersaksi tidak ada tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya."
    },
    "wasiat_taqwa_2": "Wasiat taqwa singkat untuk khotbah kedua",
    "isi_khotbah_2": "Ringkasan dan penekanan isi khotbah pertama dalam 2-3 paragraf",
    "shalawat_ibrahim": {
      "arab": "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا. اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
      "latin": "Innallaaha wa malaa'ikatahu yushalluna 'alan nabiyy. Yaa ayyuhalladzina amanuu shalluu 'alayhi wa sallimuu tasliimaa. Allahumma shalli 'alaa muhammadin wa 'alaa aali muhammadin kamaa shallayta 'alaa ibraahiima wa 'alaa aali ibraahiim, wa baarik 'alaa muhammadin wa 'alaa aali muhammadin kamaa baarakta 'alaa ibraahiima wa 'alaa aali ibraahiima fil 'aalamiina innaka hamiidun majiid",
      "terjemah": "Sesungguhnya Allah dan para malaikat-Nya bershalawat atas Nabi. Wahai orang-orang yang beriman, bershalawatlah atas Nabi dan ucapkanlah salam penghormatan kepadanya. Ya Allah, limpahkanlah shalawat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau telah melimpahkan shalawat kepada Ibrahim dan keluarga Ibrahim...",
      "sumber": "QS. Al-Ahzab: 56 + Shalawat Ibrahimiyah"
    },
    "doa_kaum_muslimin": {
      "arab": "اَللَّهُمَّ اغْفِرْ لِلْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ إِنَّكَ سَمِيْعٌ قَرِيْبٌ مُجِيْبُ الدَّعَوَاتِ. اَللَّهُمَّ أَرِنَا الْحَقَّ حَقًّا وَارْزُقْنَا اتِّبَاعَهُ وَأَرِنَا الْبَاطِلَ بَاطِلًا وَارْزُقْنَا اجْتِنَابَهُ",
      "latin": "Allaahummaghfir lil muslimiina wal muslimaat wal mu'miniina wal mu'minaat al-ahyaa'i minhum wal amwaat, innaka samii'un qariibun mujiibud da'awaat. Allahumma arinaal haqqa haqqan warzuqnat tibaa'ahu wa arinaal baathila baathilan warzuqnaj tinaabah",
      "terjemah": "Ya Allah, ampunilah kaum muslimin dan muslimat, mukminin dan mukminat, yang masih hidup maupun yang sudah wafat. Sesungguhnya Engkau Maha Mendengar, Maha Dekat, Maha Mengabulkan doa. Ya Allah, tunjukkanlah kepada kami kebenaran sebagai kebenaran dan berilah kami kemampuan untuk mengikutinya, dan tunjukkanlah kepada kami kebatilan sebagai kebatilan dan berilah kami kemampuan untuk menjauhinya.",
      "sumber": "Doa khotbah kedua — bersumber dari Kemenag RI & ulama Indonesia"
    },
    "doa_penutup_khotbah": {
      "arab": "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. وَأَدْخِلْنَا الْجَنَّةَ مَعَ الْأَبْرَارِ يَا عَزِيزُ يَا غَفَّارُ يَا رَبَّ الْعَالَمِيْنَ",
      "latin": "Rabbanaa aatinaa fid dunyaa hasanatan wa fil aakhirati hasanatan wa qinaa 'adzaaban naar. Wa adkhilnal jannata ma'al abroor, yaa 'aziizu yaa ghaffaar yaa rabbal 'aalamiin",
      "terjemah": "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka. Masukkan kami ke dalam surga bersama orang-orang yang baik, wahai Dzat Yang Maha Mulia, Maha Pengampun, Tuhan semesta alam.",
      "sumber": "QS. Al-Baqarah: 201 + doa penutup khotbah yang lazim"
    },
    "penutup_khotbah": {
      "arab": "اُذْكُرُوا اللَّهَ الْعَظِيْمَ يَذْكُرْكُمْ وَاشْكُرُوْهُ عَلَى نِعَمِهِ يَزِدْكُمْ وَلَذِكْرُ اللَّهِ أَكْبَرُ وَاللَّهُ يَعْلَمُ مَا تَصْنَعُوْنَ",
      "latin": "Udzkurullahal 'azhiima yadzkurkum wasykuruhu 'alaa ni'amihii yazidkum wala dzikrullaahi akbar, wallaahu ya'lamu maa tashna'uun",
      "terjemah": "Ingatlah Allah Yang Maha Agung niscaya Dia akan mengingatmu, syukurilah nikmat-Nya niscaya Dia akan menambahkannya, dan dzikrullah adalah yang terbesar, Allah mengetahui apa yang kalian kerjakan.",
      "catatan_khatib": "Setelah membaca ini, khatib turun dari mimbar. Muadzin segera mengumandangkan iqamat untuk shalat Jum'at dua rakaat."
    }
  },

  "catatan_pelaksanaan": [
    "Khatib naik mimbar saat adzan dikumandangkan, langsung mengucap salam",
    "Khotbah pertama: berdiri, bacakan susunan di atas, akhiri dengan istighfar",
    "Duduk sejenak ± 1 menit antara dua khotbah",
    "Khotbah kedua: lebih singkat dari khotbah pertama",
    "Akhiri dengan doa penutup, lalu turun mimbar",
    "Muadzin iqamat, laksanakan shalat Jum'at 2 rakaat berjamaah"
  ]
}

ATURAN:
- Semua teks Arab harus benar dan sesuai referensi ulama
- Isi khotbah harus relevan dengan tema: ${tema}
- Output HANYA JSON, tanpa markdown`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 5000,
    })

    const responseText = completion.choices[0].message.content || '{}'
    const konten = JSON.parse(responseText)

    // Normalisasi durasi per bagian
    if (!konten.durasi_per_bagian || typeof konten.durasi_per_bagian !== 'object') {
      konten.durasi_per_bagian = { khotbah_pertama: 0, duduk_antara: 0, khotbah_kedua: 0 };
    }
    const dpb = konten.durasi_per_bagian as Record<string, number>;
    
    // Fallback pembagian durasi untuk Khotbah Jumat:
    // khotbah_pertama: ~65%, duduk_antara: ~10% (1-2 menit), khotbah_kedua: ~25%
    const fallbackDudukAntara = Math.max(1, Math.round(durasi_menit * 0.1));
    const fallbackKhotbahKedua = Math.max(1, Math.round(durasi_menit * 0.25));
    const fallbackKhotbahPertama = Math.max(1, durasi_menit - fallbackDudukAntara - fallbackKhotbahKedua);

    if (typeof dpb.khotbah_pertama !== 'number') dpb.khotbah_pertama = fallbackKhotbahPertama;
    if (typeof dpb.duduk_antara !== 'number') dpb.duduk_antara = fallbackDudukAntara;
    if (typeof dpb.khotbah_kedua !== 'number') dpb.khotbah_kedua = fallbackKhotbahKedua;

    // Ensure total sum equals durasi_menit
    const currentTotal = dpb.khotbah_pertama + dpb.duduk_antara + dpb.khotbah_kedua;
    if (currentTotal !== durasi_menit) {
      dpb.khotbah_pertama = Math.max(1, durasi_menit - dpb.duduk_antara - dpb.khotbah_kedua);
    }

    // Save to Supabase
    let savedId: string | null = null
    if (user_id) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('kultum_history')
        .insert({
          user_id,
          judul: konten.judul,
          format: 'khotbah_jumat',
          tema,
          kategori_tema: kategori_tema || null,
          durasi_menit,
          gaya_bahasa: gaya_bahasa || 'Formal',
          konten: konten as unknown as Record<string, unknown>,
        })
        .select('id')
        .single()

      if (!error && data) savedId = data.id
    }

    return NextResponse.json({ success: true, id: savedId, konten, is_jumat: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('[Khotbah Jumat] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

