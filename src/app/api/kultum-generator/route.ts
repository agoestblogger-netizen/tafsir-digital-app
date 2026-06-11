import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60 // Vercel: perpanjang timeout ke 60 detik
export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { AYAT_SAINS } from '@/data/sains_ayat'
import { referensiToPromptContext, KultumReferensi as KultumReferensiOld } from '@/lib/kultum-references'
import { fetchReferensiUntukTema, buildReferensiPrompt } from '@/lib/kultum-referensi'
import { 
  extractHaditsDariNarasi,
  extractKalimatHaditsImplisit,
  verifikasiHadits,
  type HaditsTerverifikasi 
} from '@/lib/kultum-verifikasi'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 120000 // 120 detik timeout built-in
})

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
    doa_quran_penutup?: Array<{
      pengantar?: string
      arab: string
      latin: string
      terjemah: string
      referensi: string
    }>
    doa_sapu_jagad?: string
    doa_penutup_majelis: {
      arab: string
      latin: string
      terjemah: string
      sumber: string
    }
  }
  teks_lengkap?: string
}

const FORMAT_DURASI: Record<string, string> = {
  tausiyah: '2-5 menit',
  kultum: '5-15 menit',
  khotbah: '25-35 menit',
  khotbah_jumat: '25-35 menit',
  ceramah: '30-60 menit',
}

interface VerifikasiResult {
  referensi_terverifikasi: {
    hadits: Array<{
      arab: string
      terjemah: string
      perawi: string
      nomor: string
      topik_nama?: string
      metode: 'strict' | 'fuzzy'
      raw_dari_ai: string
    }>
  }
  narasi_replaced: Array<{
    original: string
    replaced: string
    reason: 'not_found' | 'verified_strict' | 'verified_fuzzy'
    kalimat_dihapus?: string  // BARU
  }>
  narasi_bersih: string
}

/**
 * Extract kalimat utuh yang mengandung teks tertentu.
 * Kalimat = string antara dua titik (.) atau awal/akhir paragraf.
 */
function extractKalimatMengandung(
  narasi: string, 
  target: string
): string | null {
  const targetIdx = narasi.indexOf(target)
  if (targetIdx === -1) return null
  
  // Cari boundary kalimat ke belakang (titik atau awal teks)
  // Cari titik terakhir sebelum target
  let startIdx = 0
  for (let i = targetIdx - 1; i >= 0; i--) {
    const char = narasi[i]
    if (char === '.' || char === '\n') {
      startIdx = i + 1
      break
    }
  }
  
  // Cari boundary kalimat ke depan (titik atau akhir teks)
  let endIdx = narasi.length
  for (let i = targetIdx + target.length; i < narasi.length; i++) {
    const char = narasi[i]
    if (char === '.' || char === '\n') {
      endIdx = i + 1  // include the period
      break
    }
  }
  
  return narasi.slice(startIdx, endIdx).trim()
}

async function jalankanVerifikasiHadits(
  narasiLengkap: string,
  origin: string
): Promise<VerifikasiResult> {
  const detected = extractHaditsDariNarasi(narasiLengkap)
  const detectedImplisit = extractKalimatHaditsImplisit(narasiLengkap)
  
  if (detected.length === 0 && detectedImplisit.length === 0) {
    return {
      referensi_terverifikasi: { hadits: [] },
      narasi_replaced: [],
      narasi_bersih: narasiLengkap
    }
  }
  
  const results = await Promise.all(
    detected.map(d => verifikasiHadits(d, origin))
  )
  
  let narasiBersih = narasiLengkap
  const haditsTerverifikasi: VerifikasiResult['referensi_terverifikasi']['hadits'] = []
  const replaced: VerifikasiResult['narasi_replaced'] = []
  
  // 1. Proses Hadits Eksplisit
  for (const r of results) {
    if (r.found && r.data && r.metode) {
      // VERIFIED — keep sebutan asli di narasi (atribusi benar)
      haditsTerverifikasi.push({
        arab: r.data.arab,
        terjemah: r.data.terjemah,
        perawi: r.data.perawi,
        nomor: r.data.nomor,
        topik_nama: r.data.topik_nama,
        metode: r.metode,
        raw_dari_ai: r.raw_dari_ai
      })
      replaced.push({
        original: r.raw_dari_ai,
        replaced: r.raw_dari_ai,
        reason: r.metode === 'strict' ? 'verified_strict' : 'verified_fuzzy'
      })
    } else {
      // NOT FOUND — HAPUS SELURUH KALIMAT yang mengandung atribusi ini
      const kalimatYangDihapus = extractKalimatMengandung(
        narasiBersih, 
        r.raw_dari_ai
      )
      
      if (kalimatYangDihapus) {
        narasiBersih = narasiBersih.replace(kalimatYangDihapus, '').trim()
        // Rapikan double space yang muncul setelah hapus
        narasiBersih = narasiBersih.replace(/\s{2,}/g, ' ')
      }
      
      replaced.push({
        original: r.raw_dari_ai,
        replaced: '[HAPUS - hadits tidak terverifikasi]',
        reason: 'not_found',
        kalimat_dihapus: kalimatYangDihapus ?? ''
      })
    }
  }

  // 2. Proses Hadits Implisit
  const implisitDiNarasiBersih = extractKalimatHaditsImplisit(narasiBersih)
  for (const kalimat of implisitDiNarasiBersih) {
    narasiBersih = narasiBersih.replace(kalimat, '').trim()
    narasiBersih = narasiBersih.replace(/\s{2,}/g, ' ')
    
    replaced.push({
      original: kalimat,
      replaced: '[HAPUS - hadits implisit]',
      reason: 'not_found',
      kalimat_dihapus: kalimat
    })
  }

  // Cleanup orphaned quotes/dashes/spaces/punctuation at the start of any paragraph
  narasiBersih = narasiBersih
    .split('\n')
    .map(p => p.trim().replace(/^['"\s\-–—,;.:?!]+/, '').trim())
    .join('\n')
  
  return {
    referensi_terverifikasi: { hadits: haditsTerverifikasi },
    narasi_replaced: replaced,
    narasi_bersih: narasiBersih
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== GENERATOR REQUEST ===')
    console.log('body keys:', Object.keys(body))
    console.log('referensi_dipilih count:', body.referensi_dipilih?.length ?? 0)
    console.log('referensi_dipilih[0]:', JSON.stringify(body.referensi_dipilih?.[0])?.slice(0, 200) ?? 'none')
    console.log('========================')
    
    const { format, sub_format, tema, judul_override, kategori_tema, gaya_bahasa, user_id, durasi_menit, referensiDipilih, referensi_dipilih, semantic_expanded, kisah_id, karakter, is_interleaved } = body
    const origin = request.nextUrl.origin

    console.log('=== GENERATOR FORMAT DEBUG ===')
    console.log('format received:', format)
    console.log('isKhotbahJumat:', format === 'khotbah_jumat')
    console.log('==============================')



    if (!format || !tema) {
      return NextResponse.json({ error: 'Format dan tema wajib diisi' }, { status: 400 })
    }

    const targetDurasi = durasi_menit || parseInt(FORMAT_DURASI[format.toLowerCase()]?.split('-')[0] || '10')

    const isKisahMode = (kategori_tema === 'kisah_alquran' || kategori_tema === 'Kisah Al-Qur\'an') && kisah_id

    const targetKata = Math.round(targetDurasi * 140)
    const targetKataMin = Math.round(targetKata * 0.9)
    const targetKataMax = Math.round(targetKata * 1.1)

    let kisahData: any = null
    let queryError: any = null
    if (isKisahMode) {
      const supabase = getSupabaseAdmin()
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kisah_id)
      const queryField = isUuid ? 'id' : 'slug'

      const { data, error } = await supabase
        .from('kaum_lampau')
        .select(`
          id,
          slug,
          nama,
          nama_arab,
          ringkasan,
          latar_belakang,
          kondisi_kaum,
          kisah_lengkap,
          azab_atau_kejadian,
          pelajaran,
          tipe_kisah,
          referensi,
          ayat_utama
        `)
        .eq(queryField, kisah_id)
        .single()

      console.log('kisahData:', data)
      console.log('kisahError:', error)
      queryError = error

      if (error || !data) {
        return NextResponse.json(
          { error: `Kisah dengan id/slug '${kisah_id}' tidak ditemukan di database` },
          { status: 404 }
        )
      }
      kisahData = data
    }

    // Format referensi untuk prompt
    const formatReferensiUntukPrompt = (refs: any[]): string => {
      if (!refs || refs.length === 0) return '-'
      
      return refs.map((r, i) => {
        const d = r.data ?? r  // data bisa di r.data atau langsung di r
        
        if (r.type === 'ayat_quran_db' || d.teks_arab || d.nomor_ayat) {
          return `[AYAT ${i+1} - WAJIB MUNCUL VERBATIM]
Arab: ${d.teks_arab ?? ''}
Latin: ${d.teks_latin ?? ''}
Terjemah: "${d.terjemah ?? ''}"
Sumber: QS. ${d.surah_nama_latin ?? d.surah_nama ?? ''}: ${d.nomor_ayat ?? ''}`
        }
        
        if (r.type === 'hadits' || d.matan || d.perawi) {
          const noHadits = d.nomor ?? d.no_hadits ?? d.nomor_hadits ?? d.id ?? ''
          return `[HADITS ${i+1} - WAJIB DISEBUT]
Arab: ${d.arab ?? d.matan ?? ''}
Terjemah: "${d.terjemah ?? ''}"
Perawi: ${d.perawi ?? ''}
Nomor Hadits: ${noHadits}
Atribusi Wajib: HR. ${d.perawi ?? ''} No. ${noHadits}`
        }
        
        if (r.type === 'doa_quran' || d.kategori === 'nabi' || d.kategori === 'rabbana') {
          return `[DOA ${i+1} - WAJIB DISEBUT DAN DIBACAKAN]
Nama: ${d.judul ?? r.judul ?? ''}
Arab: ${d.arab ?? ''}
Latin: ${d.latin ?? ''}
Terjemah: "${d.terjemah ?? ''}"
Konteks: ${d.konteks ?? ''}
Sumber: ${d.referensi ?? ''}`
        }
        
        return `[REFERENSI ${i+1}]: ${r.judul ?? JSON.stringify(d).slice(0, 100)}`
      }).join('\n\n')
    }

    const refAktif = referensi_dipilih ?? referensiDipilih ?? []
    console.log('referensi_dipilih full:', JSON.stringify(refAktif, null, 2).slice(0, 1000))

    // Mode interleaved: generator hanya butuh DOA — ayat & hadits sudah dibahas di penjabaran_tafsir (build-interleaved)
    const modeInterleaved = is_interleaved === true && !isKisahMode
    const refUntukGenerator = modeInterleaved
      ? refAktif.filter((r: any) => r.type === 'doa_quran')
      : refAktif
    const referensiFormatted = formatReferensiUntukPrompt(refUntukGenerator)
    
    // Deteksi multi-tema berdasarkan topik_nama referensi
    const topikList: string[] = refAktif
      .map((r: any) => (r.data?.topik_nama ?? r.data?.topik_utama ?? '') as string)
      .filter(Boolean)

    const topikUnik: string[] = Array.from(new Set(topikList))
    const isMultiTema = topikUnik.length >= 2 && !topikUnik.every((t: string) => 
      (topikUnik[0] as string).toLowerCase().includes(t.toLowerCase()) || 
      t.toLowerCase().includes((topikUnik[0] as string).toLowerCase())
    )
    const temaGroups = topikUnik.slice(0, 3) // max 3 tema

    // Jika multi-tema, generate judul gabungan
    // Judul ditentukan oleh AI berdasarkan analisa referensi, bukan hardcode dari topik_nama
    let judulMultiTema = judul_override ?? ''
    // Tidak hardcode judul — AI akan generate judul yang inline dengan isi referensi

    console.log('isMultiTema:', isMultiTema, '| topikUnik:', topikUnik)

    const judulInstruction = judul_override
      ? `\n\nJUDUL ${format.toUpperCase()} YANG HARUS DIGUNAKAN: "${judul_override}"\nGunakan judul ini persis untuk field "judul" di output JSON.`
      : isMultiTema
        ? `\n\nINSTRUKSI JUDUL MULTI-TEMA:\nJANGAN gunakan label topik mentah sebagai judul.\nBaca semua referensi di bawah, pahami pesan utama masing-masing, lalu tentukan judul yang:\n- Jika referensi BERKAITAN: buat 1 judul unified yang mencerminkan pesan gabungan\n- Jika referensi TIDAK BERKAITAN: buat judul format '[Tema A] dan [Tema B]' — nama tema dari isi referensi, bukan label bucket\nJudul harus spesifik dan inline dengan konten referensi yang diberikan.`
      : `\n\nINSTRUKSI JUDUL:\nJANGAN gunakan label topik mentah sebagai judul.\nBaca referensi di bawah, pahami pesan utamanya, lalu buat judul yang spesifik dan inline dengan isi referensi tersebut.`

    const instruksiMultiTema = isMultiTema ? `
INSTRUKSI REFERENSI MULTI-TOPIK:
Kultum ini menggunakan referensi dari beberapa topik yang berbeda. Semua referensi sudah dijalin secara mengalir di field penjabaran_tafsir (narasi interleaved).
- JANGAN buat poin terpisah per tema
- JANGAN gunakan kalimat 'Tema berikutnya yang akan kita bahas adalah...' atau 'Beralih ke tema kedua...'
- Perlakukan semua referensi sebagai satu kesatuan narasi yang koheren — temukan benang merah atau sampaikan sebagai hikmah yang saling melengkapi
- Pastikan semua referensi muncul dalam narasi penjabaran_tafsir
` : ''
    
    // Separate references for dynamic prompt blueprint mapping
    const ayatList = refAktif.filter((r: any) => {
      const d = r.data ?? r
      return r.type === 'ayat_quran_db' || d.teks_arab || d.nomor_ayat
    })
    const haditsList = refAktif.filter((r: any) => {
      const d = r.data ?? r
      return r.type === 'hadits' || d.matan || d.perawi
    })
    
    let isiStructurePrompt = ''
    if (isMultiTema) {
      isiStructurePrompt = `[
    {
      "judul": "Judul pembuka yang menarik dan menggambarkan esensi tema",
      "paragraf": "Paragraf pembukaan: hamdalah, shalawat, lalu pengantar tema yang mengalir dan menyentuh hati. JANGAN tulis salam pembuka (Assalamu'alaikum) karena salam sudah ada di field terpisah. DILARANG KERAS menyebut daftar tema, poin, atau dalil yang akan dibahas — cukup antar jamaah masuk ke suasana tema secara naratif dan mengajak merenung. DILARANG KERAS menyebut nama surah, nomor ayat, kutipan ayat, nama perawi, nomor hadits, atau kutipan hadits APAPUN di pembuka — termasuk menyebutnya sebagai bagian narasi (contoh terlarang: 'Dalam QS. X: Y, Allah berfirman...' atau 'Rasulullah bersabda...'). Semua dalil akan dibahas di bagian penjabaran, BUKAN di pembuka. Pembuka murni membangun suasana tema secara emosional dan reflektif tanpa menyentuh dalil spesifik. Minimal 3 kalimat."
    },
    {
      "judul": "Judul penutup yang menginspirasi",
      "paragraf": "Kesimpulan penutup kultum yang menyentuh hati, merangkum hikmah dari tema, memotivasi jamaah untuk beramal shalih, dan ditutup dengan ajakan introspeksi. Minimal 4 kalimat. DILARANG KERAS menyebut atau mengutip ayat/hadits baru yang tidak ada di daftar referensi."
    }
  ]`
    } else if (refAktif.length > 0) {
      isiStructurePrompt = `[
    {
      "judul": "Judul pembuka yang menarik dan menggambarkan esensi tema",
      "paragraf": "Paragraf pembukaan: hamdalah, shalawat, lalu pengantar tema yang mengalir dan menyentuh hati. JANGAN tulis salam pembuka (Assalamu'alaikum) karena salam sudah ada di field terpisah. DILARANG KERAS menyebut daftar dalil, poin, atau referensi yang akan dibahas — cukup antar jamaah masuk ke suasana tema secara naratif, dengan pertanyaan retoris atau kisah singkat yang relevan, mengajak jamaah merenung. DILARANG KERAS menyebut nama surah, nomor ayat, kutipan ayat, nama perawi, nomor hadits, atau kutipan hadits APAPUN di pembuka — termasuk menyebutnya sebagai bagian narasi (contoh terlarang: 'Dalam QS. X: Y, Allah berfirman...' atau 'Rasulullah bersabda...'). Semua dalil akan dibahas di bagian penjabaran, BUKAN di pembuka. Pembuka murni membangun suasana tema secara emosional dan reflektif tanpa menyentuh dalil spesifik. Minimal 3 kalimat."
    },
    {
      "judul": "Judul penutup yang menginspirasi",
      "paragraf": "Kesimpulan penutup kultum yang menyentuh hati, merangkum hikmah dari tema dan referensi yang sudah dibahas, memotivasi jamaah untuk beramal shalih, dan ditutup dengan ajakan introspeksi. Minimal 4 kalimat. DILARANG KERAS menyebut atau mengutip ayat/hadits baru yang tidak ada di daftar referensi — hanya boleh merujuk ulang dalil yang sudah disebutkan sebelumnya."
    }
  ]`
    } else {
      // Default structure (no ref)
      isiStructurePrompt = `[
    {
      "judul": "Judul pembuka yang menarik dan menggambarkan esensi tema",
      "paragraf": "Paragraf pembukaan: hamdalah, shalawat, lalu pengantar tema yang mengalir dan menyentuh hati. JANGAN tulis salam pembuka (Assalamu'alaikum) karena salam sudah ada di field terpisah. DILARANG KERAS menyebut daftar poin yang akan dibahas — cukup antar jamaah masuk ke suasana tema secara naratif dan mengajak merenung. DILARANG KERAS menyebut nama surah, nomor ayat, kutipan ayat, nama perawi, nomor hadits, atau kutipan hadits APAPUN di pembuka — termasuk menyebutnya sebagai bagian narasi (contoh terlarang: 'Dalam QS. X: Y, Allah berfirman...' atau 'Rasulullah bersabda...'). Semua dalil akan dibahas di bagian penjabaran, BUKAN di pembuka. Pembuka murni membangun suasana tema secara emosional dan reflektif tanpa menyentuh dalil spesifik. Minimal 3 kalimat."
    },
    {
      "judul": "Judul penutup yang menginspirasi",
      "paragraf": "Kesimpulan penutup kultum yang menyentuh hati, merangkum hikmah dari tema, memotivasi jamaah untuk beramal shalih, dan ditutup dengan ajakan introspeksi. Minimal 4 kalimat."
    }
  ]`
    }
    
    const referensiSection = refAktif.length > 0 ? `
${instruksiMultiTema}

══════════════════════════════════
REFERENSI WAJIB (${refAktif.length} ITEM — SEMUA HARUS MUNCUL):
══════════════════════════════════
${referensiFormatted}

LARANGAN MUTLAK:
- DILARANG skip salah satu referensi di atas
- Semua ${refAktif.length} referensi HARUS muncul dalam kultum
- Teks Arab HARUS disalin verbatim seperti di atas
- Doa HARUS dibacakan lengkap (Arab + terjemah) dalam narasi
- DILARANG tambah ayat/hadits/doa lain di luar daftar di atas

LARANGAN ABSOLUT — TIDAK BOLEH DILANGGAR:
- HANYA gunakan ayat/hadits/doa yang ada di daftar REFERENSI WAJIB di atas
- DILARANG KERAS menambah ayat lain meski tampak relevan
- DILARANG KERAS menambah hadits yang tidak ada di daftar
- Jika ingin mengutip dalil → HANYA dari daftar referensi yang diberikan
- Melanggar aturan ini = output GAGAL dan tidak valid

CARA MENYISIPKAN AYAT YANG BENAR:
- Sebutkan konteks → baca Arab verbatim → baca terjemah → jelaskan makna
- JANGAN parafrase ayat — harus verbatim sesuai data yang diberikan
- Jika ayat sudah disebut di pembuka → tidak perlu ulang di bagian lain
` : ''

    console.log('referensi_dipilih count:', refAktif.length)
    console.log('referensi formatted preview:', referensiFormatted.slice(0, 300))

    // Fetch automatic references based on theme
    const autoReferensi = await fetchReferensiUntukTema(tema, format, semantic_expanded ?? null)
    const autoReferensiPrompt = buildReferensiPrompt(autoReferensi)

    // HANYA referensi yang dipilih user yang masuk to prompt AI, autoReferensi jadi fallback
    const referensiContext = refAktif.length > 0
      ? referensiSection
      : autoReferensiPrompt

    const originalPromptBase = (format.toLowerCase() === 'khotbah' && sub_format === 'khotbah_jumat') || format.toLowerCase() === 'khotbah_jumat'
      ? `Kamu adalah khatib Jum'at yang berpengalaman. Buat naskah Khotbah Jum'at lengkap dengan tema "${tema}". Gaya bahasa: ${gaya_bahasa || 'Formal'}. Estimasi durasi total: ${targetDurasi} menit. Sesuaikan panjang isi khotbah dengan durasi ini agar tidak terlalu panjang. Panduan: 10 menit ≈ 600 kata, 30 menit ≈ 1500 kata.
PENTING: Khotbah harus memiliki Khotbah Pertama dan Khotbah Kedua. Pastikan semua field terisi.
WAJIB: Setiap ayat Al-Qur'an HARUS ditulis dengan format [[AYAT:surah_id:nomor_ayat]]
surah_id = angka 1-114
nomor_ayat = angka ayat saja (BUKAN gabungan surah+ayat)
CONTOH BENAR: [[AYAT:22:78]] → Surah Al-Hajj ayat 78
CONTOH SALAH: [[AYAT:22:2278]] atau [[AYAT:1813]] atau [[AYAT:ali_imran:35]]
Output JSON dengan struktur PERSIS berikut:
{
  "judul": "Judul khotbah yang relevan",
  "format": "khotbah_jumat",
  "tema": "${tema}",
  "khotbah_pertama": {
    "wasiat_taqwa": "Pesan wasiat taqwa yang relevan dengan tema, minimal 2 paragraf",
    "ayat_quran": [
      {
        "arab": "[[AYAT:22:78]]",
        "latin": "Teks latin",
        "terjemah": "Teks terjemahan",
        "referensi": "Referensi ayat"
      }
    ],
    "isi_khotbah": "Isi khotbah pertama yang lengkap and mendalam, minimal 3 paragraf besar",
    "poin_utama": [
      {
        "judul": "Judul poin spesifik 1 (bukan 'Poin 1')",
        "paragraf": "Penjelasan mendalam poin 1, minimal 3 kalimat. Kaitkan dengan ayat/kisah dari referensi."
      },
      {
        "judul": "Judul poin spesifik 2",
        "paragraf": "Penjelasan mendalam poin 2, minimal 3 kalimat."
      },
      {
        "judul": "Judul poin spesifik 3",
        "paragraf": "Penjelasan mendalam poin 3, minimal 3 kalimat."
      }
    ],
    "penekanan_makna": "Satu paragraf penekanan inti pesan khotbah — kalimat kuat yang merangkum esensi tema"
  },
  "khotbah_kedua": {
    "wasiat_taqwa_2": "Wasiat taqwa ringkas di khotbah kedua (1 paragraf)",
    "isi_khotbah_2": "Kesimpulan dan pesan ringkas di khotbah kedua (2 paragraf)",
    "ajakan_penutup": "Satu kalimat ajakan kuat dan inspiratif untuk jamaah — pesan utama yang dibawa pulang",
    "doa_quran_penutup": [
      {
        "arab": "[[AYAT:surah_id:nomor_ayat]] atau teks arab doa",
        "latin": "transliterasi",
        "terjemah": "terjemahan",
        "referensi": "QS. Surah: Ayat atau sumber doa"
      }
    ]
  }
}

${referensiContext}

ATURAN BAHASA YANG WAJIB DIIKUTI:
- Ketika merujuk kepada Nabi Muhammad SAW, WAJIB gunakan kata "Beliau" bukan "Dia" atau "Ia"
- Contoh BENAR: "Beliau bersabda...", "Beliau mengajarkan...", "Beliau mencontohkan..."
- Contoh SALAH: "Dia bersabda...", "Ia mengajarkan...", "Dia mencontohkan..."

ATURAN KETAT TENTANG HADITS (WAJIB DIPATUHI):

1. Setiap kali menyebut sabda Nabi atau hadits, WAJIB menyertakan 
   atribusi LENGKAP dalam format:
   "HR. {Perawi} No. {nomor}"
   Contoh: "HR. Bukhari No. 6406", "HR. Muslim No. 906"

2. DILARANG KERAS menyebut sabda Nabi/hadits tanpa atribusi 
   nomor riwayat yang spesifik. Frasa berikut DILARANG:
   - "Rasulullah SAW bersabda" (tanpa HR. xxx No. xxx)
   - "Nabi pernah bersabda" (tanpa atribusi)
   - "Dalam sebuah hadits disebutkan" (tanpa atribusi)
   - "Hadits Nabi mengatakan" (tanpa atribusi)

3. Jika TIDAK YAKIN tentang nomor atau perawi hadits, 
   JANGAN sebut hadits sama sekali. Lebih baik:
   - Fokus pada ayat Al-Qur'an (yang ada di referensi)
   - Pakai pelajaran/ibrah dari kisah (yang ada di referensi)
   - Berikan refleksi/aplikasi praktis
   DARIPADA mengarang hadits yang tidak jelas sumbernya.

4. Jika SUDAH ADA [HADITS SHAHIH] atau [HADITS X - WAJIB DISEBUT] di referensi yang diberikan, 
   GUNAKAN itu sebagai sumber utama. Sebut Atribusi Wajib (misal: "HR. Bukhari No. X") persis seperti yang diberikan di referensi.

5. PENTING: Hadits palsu/dhaif lebih berbahaya daripada tidak ada 
   hadits. Lebih baik khotbah tanpa hadits daripada hadits yang 
   diragukan keasliannya.

6. DILARANG KERAS menyebut nama perawi DAN nomor hadits dalam format
   APAPUN jika tidak ada [HADITS SHAHIH] di referensi yang diberikan.
   Format yang dilarang (jika tidak ada referensi hadits):
   - "HR. Bukhari No. 2231"
   - "Bukhari No. 2231" (tanpa HR.)
   - "Hadits Bukhari nomor 2231"
   - "Shahih Bukhari, hadits ke-2231"
   Jika tidak ada referensi hadits → SAMA SEKALI tidak boleh menyebut
   nama perawi (Bukhari, Muslim, Tirmidzi, dll) beserta nomor apapun.

WAJIB isi semua section berikut dengan LENGKAP (jangan kosongkan):
- khotbah_pertama.isi_khotbah: isi khotbah mendalam, MINIMAL 500 kata
- khotbah_kedua.isi_khotbah_2: ringkas 3-4 paragraf ajakan amal dan istighfar, MINIMAL 200 kata
- khotbah_kedua.ajakan_penutup: WAJIB diisi — kalimat kuat 1-2 kalimat
- khotbah_kedua.doa_quran_penutup: WAJIB berisi minimal 1 doa yang relevan dengan tema, lebih diutamakan dari referensi [DOA AL-QURAN] jika ada

PANDUAN PANJANG KHOTBAH (WAJIB DIPATUHI):
- Khotbah 20 menit = minimal 2.100 kata total
- Khotbah 25 menit = minimal 2.600 kata total
- Khotbah 30 menit = minimal 3.000 kata total
Target khotbah ini: sekitar ${targetDurasi * 130} kata. JANGAN persingkat — lebih panjang lebih baik.
Respond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.`
      : `Kamu adalah ustadz/ulama yang berpengalaman membuat kultum dan khotbah Islam.

LANGKAH 0 — WAJIB DILAKUKAN SEBELUM MENULIS APAPUN:
1. Baca semua referensi (ayat/hadits/doa) yang diberikan di bawah secara UTUH
2. Untuk setiap referensi, pahami: (a) konteks lengkapnya, (b) siapa yang terlibat, (c) pesan utama yang ingin disampaikan
3. Tentukan apakah referensi-referensi tersebut BERKAITAN satu sama lain atau TIDAK
4. Baru tentukan judul dan struktur kultum berdasarkan hasil analisa — BUKAN dari label tema
5. Tema '${tema}' hanya sebagai konteks pencarian referensi, BUKAN penentu narasi

Buat ${format} ${kategori_tema ? `(kategori: ${kategori_tema})` : ''}.
Gaya bahasa: ${gaya_bahasa || 'Semi-Formal'}.
Gaya bahasa: ${gaya_bahasa || 'Semi-Formal'}.

PANDUAN PANJANG KONTEN (WAJIB DIPATUHI):
Kecepatan bicara ceramah: 120 kata/menit
Target kata berdasarkan durasi:
- 5 menit   = minimal 550 kata
- 10 menit  = minimal 1.100 kata
- 15 menit  = minimal 1.600 kata
- 20 menit  = minimal 2.100 kata
- 30 menit  = minimal 3.000 kata
- 45 menit  = minimal 4.200 kata
- 60 menit  = minimal 5.500 kata

Target durasi kultum ini: ${targetDurasi} menit = minimal ${Math.round(targetDurasi * 120)} kata

${referensiContext}

ATURAN AYAT AL-QUR'AN:
- Gunakan placeholder [[AYAT:surah_id:nomor_ayat]] — sistem akan render card ayat otomatis
- surah_id = angka 1-114, nomor_ayat = angka ayat saja
- CONTOH BENAR: [[AYAT:17:23]], [[AYAT:2:153]]
- CONTOH SALAH: [[AYAT:17:2317]], [[AYAT:al_isra:23]]

CARA MENYISIPKAN AYAT AL-QUR'AN (WAJIB DIPATUHI):
- Di dalam field penjabaran_tafsir: WAJIB sisipkan placeholder [[AYAT:surah_id:nomor_ayat]] tepat setelah kalimat yang menyebut ayat tersebut. Contoh: "Allah berfirman tentang kesabaran [[AYAT:2:153]] dan ayat ini mengajarkan kita..."
- HANYA gunakan surah_id dan nomor_ayat dari referensi yang diberikan — JANGAN tambah placeholder ayat lain di luar referensi yang ada.
- JANGAN PERNAH MENULIS HURUF/TEKS ARAB DI DALAM PARAGRAF ATAU NARASI APAPUN. Teks Arab akan di-render otomatis oleh sistem via placeholder.
- Di field lain (pembuka, penekanan_makna, kesimpulan): HANYA boleh merujuk ulang ayat yang sudah ada di daftar referensi — DILARANG KERAS menyebut atau mengutip ayat baru yang tidak ada di daftar referensi.
- WAJIB: setiap ayat yang disebut di penjabaran_tafsir HARUS punya placeholder [[AYAT:X:Y]] yang sesuai.

${isMultiTema ? `CATATAN REFERENSI MULTI-TOPIK:
Kultum ini menggunakan referensi dari beberapa topik berbeda. Semua referensi sudah dijalin sebagai satu narasi mengalir di field penjabaran_tafsir.
- JANGAN buat poin terpisah per tema — tulis sebagai satu kesatuan narasi koheren
- JANGAN gunakan kalimat "Tema berikutnya yang akan kita bahas adalah..." atau "Beralih ke tema kedua..."
- Temukan benang merah antar referensi, atau sampaikan sebagai hikmah yang saling melengkapi dalam satu kultum\n\n` : ''}Output JSON dengan struktur PERSIS berikut (WAJIB ikuti nama field):
{
  "judul": "Judul ${format} yang menarik dan spesifik",
  "format": "${format.toLowerCase()}",
  "tema": "${tema}",
  "durasi_menit": ${targetDurasi},
  "gaya_bahasa": "${gaya_bahasa || 'Semi-Formal'}",
  "isi": ${isiStructurePrompt},
  "penekanan_makna": "Satu paragraf penekanan inti pesan — kalimat kuat yang merangkum esensi tema, bukan ringkasan biasa",
  "kesimpulan": "Tulis 1 paragraf naratif yang mengalir (3-5 kalimat): rangkum hikmah utama dari tema yang sudah dibahas, tutup dengan ajakan amal yang menyentuh hati. Boleh menyatukan pelajaran dari semua referensi secara koheren. DILARANG menyebut ayat/hadits baru yang tidak ada di daftar referensi. DILARANG format daftar 'Pertama... Kedua... Ketiga...'.",
  "ajakan_penutup": "Satu kalimat ajakan kuat dan inspiratif yang menjadi pesan utama kultum ini — akan ditampilkan sebagai quote highlight",
  "doa_quran_penutup": [
    {
      "pengantar": "Marilah kita berdoa agar [konteks doa sesuai tema]...",
      "arab": "teks Arab doa dari referensi",
      "latin": "teks latin",
      "terjemah": "terjemahan",
      "referensi": "QS. X: Y"
    }
  ],
  "doa_sapu_jagad": "Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina azabannar",
  "doa_penutup": "Teks doa penutup kultum dalam bahasa Indonesia/latin saja (setelah doa sapu jagad)"
}

ATURAN BAHASA YANG WAJIB DIIKUTI:
- Ketika merujuk kepada Nabi Muhammad SAW, WAJIB gunakan kata "Beliau" bukan "Dia" atau "Ia"
- Contoh BENAR: "Beliau bersabda...", "Beliau mengajarkan...", "Beliau mencontohkan..."
- Contoh SALAH: "Dia bersabda...", "Ia mengajarkan...", "Dia mencontohkan..."

${modeInterleaved ? `INSTRUKSI MODE INTERLEAVED:
Naskah inti (penjabaran ayat & hadits) sudah dibuat terpisah di field penjabaran_tafsir oleh sistem lain.
TUGASMU HANYA: pembuka tematik + kesimpulan tematik + doa penutup dari referensi yang diberikan.
DILARANG KERAS menyebut, mengutip, atau membahas ayat/hadits apapun di field pembuka maupun kesimpulan.
JANGAN menulis "HR.", "Rasulullah bersabda", nomor hadits, nama perawi, atau kutipan dalil apapun.
Pembuka & kesimpulan harus murni tematik, naratif, dan motivasional — tanpa dalil.

6. STRUKTUR ARRAY "isi": SELALU tepat 2 item — [Pembukaan, Penutup]. JANGAN tambahkan poin tengah apapun.` : `ATURAN KETAT TENTANG HADITS (WAJIB DIPATUHI):

1. Setiap kali menyebut sabda Nabi atau hadits, WAJIB menyertakan
   atribusi LENGKAP dalam format:
   "HR. {Perawi} No. {nomor}"
   Contoh: "HR. Bukhari No. 6406", "HR. Muslim No. 906"

2. DILARANG KERAS menyebut sabda Nabi/hadits tanpa atribusi
   nomor riwayat yang spesifik. Frasa berikut DILARANG:
   - "Rasulullah SAW bersabda" (tanpa HR. xxx No. xxx)
   - "Nabi pernah bersabda" (tanpa atribusi)
   - "Dalam sebuah hadits disebutkan" (tanpa atribusi)
   - "Hadits Nabi mengatakan" (tanpa atribusi)

3. Jika TIDAK YAKIN tentang nomor atau perawi hadits,
   JANGAN sebut hadits sama sekali. Lebih baik:
   - Fokus pada ayat Al-Qur'an (yang ada di referensi)
   - Pakai pelajaran/ibrah dari kisah (yang ada di referensi)
   - Berikan refleksi/aplikasi praktis
   DARIPADA mengarang hadits yang tidak jelas sumbernya.

4. Jika SUDAH ADA [HADITS SHAHIH] atau [HADITS X - WAJIB DISEBUT] di referensi yang diberikan,
   GUNAKAN itu sebagai sumber utama. Sebut Atribusi Wajib (misal: "HR. Bukhari No. X") persis seperti yang diberikan di referensi.

5. PENTING: Hadits palsu/dhaif lebih berbahaya daripada tidak ada
   hadits. Lebih baik kultum tanpa hadits daripada hadits yang
   diragukan keasliannya.

6. STRUKTUR ARRAY "isi": SELALU tepat 2 item — [Pembukaan, Penutup]. Narasi inti dan penjabaran referensi sudah ada di field "penjabaran_tafsir". JANGAN tambahkan poin tengah apapun.

7. DILARANG KERAS menyebut nama perawi DAN nomor hadits dalam format
   APAPUN jika tidak ada [HADITS SHAHIH] di referensi yang diberikan.
   Format yang dilarang (jika tidak ada referensi hadits):
   - "HR. Bukhari No. 2231"
   - "Bukhari No. 2231" (tanpa HR.)
   - "Hadits Bukhari nomor 2231"
   - "Shahih Bukhari, hadits ke-2231"
   Jika tidak ada referensi hadits → SAMA SEKALI tidak boleh menyebut
   nama perawi (Bukhari, Muslim, Tirmidzi, dll) beserta nomor apapun.

8. DILARANG KERAS MENULISKAN/MENYALIN RANTAI SANAD NARRATOR LENGKAP ke dalam paragraf/narasi (seperti: "Telah menceritakan kepada kami [Nama] dari [Nama]... berkata: '...'"). Pembicara ceramah/kultum tidak membaca silsilah perawi panjang ini secara lisan.
   - Cara mengutip yang BENAR: Cukup buat kalimat pembuka halus, contoh: "Dalam hadits riwayat [Perawi] nomor [Nomor], diriwayatkan dari [Sahabat] bahwa Rasulullah SAW bersabda..." atau "...bahwa Beliau bersabda..." kemudian langsung sambung ke inti sabda/matan hadits tersebut.
   - Cara mengutip yang SALAH (Jangan lakukan ini): "Dalam hadits riwayat Tirmidzi nomor 1099, disebutkan: 'Telah menceritakan kepada kami Muhammad bin Basyar, telah menceritakan kepada kami Abdurrahman...'"
`}

ATURAN WAJIB:
- Array "isi" SELALU tepat 2 item: [Pembukaan, Penutup] — tidak bergantung durasi. JANGAN tambah item lain.
- Durasi ceramah dikontrol oleh panjang narasi "penjabaran_tafsir" dan kedalaman tiap paragraf, bukan jumlah poin.
- Field "pengantar_tema" (paragraf pertama) minimal 100 kata
${is_interleaved ? `INSTRUKSI PENJABARAN INTERLEAVED (WAJIB):
Field "penjabaran_tafsir" harus ditulis sebagai satu narasi mengalir yang menyisipkan referensi secara alami. Struktur wajib:
1. Narasi pembuka (2-3 kalimat) sebelum referensi pertama
2. Setelah setiap referensi, tulis NARASI JEMBATAN yang menghubungkan ke referensi berikutnya. Contoh jembatan: "Dan hal ini diperkuat oleh sabda Rasulullah SAW yang diriwayatkan Imam Bukhari..." atau "Allah SWT juga menegaskan hal ini dalam firman-Nya..." atau "Dari sinilah kita memahami mengapa Nabi SAW juga mengajarkan..."
3. Gunakan marker [[REF:0]], [[REF:1]], [[REF:2]] dst untuk menandai posisi card referensi — sistem akan render card otomatis di posisi tersebut
4. Narasi penutup (2-3 kalimat) setelah referensi terakhir yang merangkum semua referensi
CONTOH FORMAT:
"Dalam kehidupan sehari-hari... [[REF:0]] Ayat ini mengajarkan bahwa... Dan hal ini diperkuat oleh hadits Nabi SAW... [[REF:1]] Dari sabda beliau ini kita memahami... Ketiga dalil ini menyatu dalam satu pesan..."` : ''}
- Field "penjabaran_tafsir" (paragraf tengah) minimal 200 kata
- Field "kesimpulan" minimal 100 kata
- Setiap item "isi" WAJIB punya "judul" yang spesifik (dan paragraf panjang sesuai target, KECUALI poin_utama/tengah yang harus RINGKAS 2-3 kalimat)
- Field "penekanan_makna", "kesimpulan", "ajakan_penutup" WAJIB diisi — jangan kosongkan
- "ajakan_penutup" maksimal 2 kalimat, kuat dan menginspirasi
- JANGAN persingkat konten — lebih panjang lebih baik selama masih relevan dengan tema
- JANGAN tambahkan field lain di luar struktur di atas
- Respond ONLY with valid JSON. No markdown, no code fences, no explanation.`

    let promptBase = ''
    if (isKisahMode) {
      const ayatUtama = kisahData.ayat_utama ?? []
      promptBase = `
Kamu adalah ustaz/penulis kultum Islam yang ahli bercerita.
Tugasmu adalah membuat naskah ${format} KHUSUS tentang kisah berikut.
PENTING: Gunakan HANYA informasi di bawah ini sebagai sumber materi.
Jangan tambahkan kisah lain atau informasi yang tidak ada di sini.

══════════════════════════════════
DATA KISAH: ${kisahData.nama}
══════════════════════════════════

JUDUL ARAB: ${kisahData.nama_arab ?? ''}
RINGKASAN: ${kisahData.ringkasan ?? ''}

LATAR BELAKANG:
${kisahData.latar_belakang ?? '-'}

KONDISI KAUM/TOKOH:
${kisahData.kondisi_kaum ?? '-'}

KISAH LENGKAP:
${kisahData.kisah_lengkap ?? '-'}

AZAB / KEJADIAN LUAR BIASA:
${kisahData.azab_atau_kejadian ?? '-'}

PELAJARAN & HIKMAH:
${kisahData.pelajaran ?? '-'}

AYAT AL-QUR'AN DARI DATABASE:
${ayatUtama.map((a: any) => 
  `• ${a.teks_arab}\n  "${a.terjemah}"\n  (${a.surah_nama}: ${a.nomor_ayat})`
).join('\n\n')}

SUMBER TAFSIR: ${kisahData.referensi ?? ''}

══════════════════════════════════
INSTRUKSI FORMAT & GAYA:
══════════════════════════════════
- Format: ${format}
- Durasi: ${targetDurasi} menit
- Gaya bahasa: ${gaya_bahasa || 'Semi-Formal'}
- Judul kultum: "Kisah ${kisahData.nama}: [tambahkan tagline yang relevan]"
- TARGET PANJANG KONTEN: ${targetKataMin}–${targetKataMax} kata (WAJIB dipenuhi). Jangan terlalu singkat.
  * Bagian penjabaran/narasi kisah lengkap harus minimal ${Math.round(targetKata * 0.5)} kata. Ceritakan dengan detail yang hidup, dialog imajinatif, dan alur naratif yang menarik.
  * Setiap poin utama (max 3 poin) masing-masing minimal harus berisi 80 kata.
  * Gunakan gaya ceramah lisan yang mengalir untuk dibacakan di hadapan jamaah.

STRUKTUR OUTPUT YANG BENAR:
1. pembuka → salam + 2-3 kalimat pengantar kisah (BUKAN ringkasan panjang)
2. ayat_pendukung → WAJIB isi dari ayat_utama yang diberikan di atas
3. penjabaran → narasi kisah lengkap dan mengalir (latar belakang + kondisi + kisah + azab)
4. penekanan_makna → 1 paragraf hikmah utama yang BELUM disebut di penjabaran
5. poin_utama → MAX 3 poin, masing-masing BERBEDA dari penjabaran, fokus pada aplikasi praktis sehari-hari
6. kesimpulan → penutup + doa, TIDAK mengulang poin-poin di atas

INSTRUKSI AYAT (WAJIB DIIKUTI):
Kamu HARUS menyisipkan ayat berikut secara verbatim dalam narasi kultum.
Format penyisipan ayat di JSON output harus dalam field khusus "ayat_pendukung", BUKAN hanya disebut dalam teks penjabaran.
Ayat yang WAJIB disertakan dalam output:
${ayatUtama.map((a: any, i: number) => `
AYAT ${i+1}:
teks_arab: "${a.teks_arab}"
latin: (tulis transliterasi latin dari teks arab ini)
terjemah: "${a.terjemah}"
sumber: "${a.surah_nama}: ${a.nomor_ayat}"
`).join('\n')}

Tempatkan ayat ini di bagian yang paling relevan dalam narasi.

LARANGAN DUPLIKASI (WAJIB):
- DILARANG menulis konten yang sama di dua tempat berbeda
- DILARANG meringkas ulang di bagian "poin_utama" jika sudah ada di bagian "penjabaran"
- DILARANG mengulang latar belakang kisah di bagian kesimpulan
- Setiap section harus punya konten UNIK yang tidak ada di section lain
- Semua fakta HARUS bersumber dari data yang diberikan di atas

ATURAN AYAT AL-QUR'AN:
- Gunakan placeholder [[AYAT:surah_id:nomor_ayat]] di dalam teks penjabaran — sistem akan render card ayat otomatis
- surah_id = angka 1-114, nomor_ayat = angka ayat saja
- CONTOH BENAR: [[AYAT:44:37]], [[AYAT:50:14]]

CARA MENYISIPKAN AYAT & TEKS ARAB YANG BENAR (WAJIB DIPATUHI):
- Sebutkan referensi dalam narasi/paragraf/penjabaran/penekanan_makna: "Allah berfirman dalam QS. An-Nisa: 1 yang artinya '...'"
- JANGAN PERNAH MENULIS HURUF/TEKS ARAB DI DALAM PARAGRAF ATAU NARASI APAPUN. Teks Arab dan terjemah card akan di-render otomatis oleh sistem.
- Dalam field teks/paragraf/penjabaran/penekanan_makna/kesimpulan: cukup sebutkan "QS. Surah: ayat" dan artinya saja secara tekstual tanpa menulis huruf Arab.

Respond ONLY with valid JSON. No markdown, no code fences, no explanation.
`
    } else {
      promptBase = originalPromptBase
    }

    if (karakter) {
      let karakterText = ''
      if (karakter === 'sains') {
        karakterText = "\n\nATURAN KARAKTER KULTUM:\n- Buat kultum yang menghubungkan Al-Qur'an dengan fakta ilmiah sains modern.\n"
      } else if (karakter === 'kisah') {
        karakterText = '\n\nATURAN KARAKTER KULTUM:\n- Buat kultum yang mengambil pelajaran dari kisah umat dan nabi terdahulu.\n'
      } else {
        karakterText = '\n\nATURAN KARAKTER KULTUM:\n- Buat kultum dengan tema akhlak dan ibadah sehari-hari.\n'
      }
      promptBase += karakterText
    }

    if (isKisahMode) {
      const error = queryError
      const ayatData = kisahData?.ayat_utama
      const systemPrompt = promptBase
      console.log('=== KISAH MODE DEBUG ===')
      console.log('kisah_id received:', kisah_id)
      console.log('kisahData:', JSON.stringify(kisahData, null, 2))
      console.log('kisahError:', error)
      console.log('ayatData count:', ayatData?.length)
      console.log('systemPrompt preview:', systemPrompt?.slice(0, 500))
      console.log('========================')
    }

    let finalJudulInstruction = judulInstruction
    if (isKisahMode && kisahData) {
      const judulKultum = `Kisah ${kisahData.nama}`
      finalJudulInstruction = `\n\nJUDUL ${format.toUpperCase()} YANG HARUS DIGUNAKAN: "${judulKultum}"\nGunakan judul ini persis untuk field "judul" di output JSON.`
    }

    const warningPenekanan = refAktif.length > 0
      ? `\n\n══════════════════════════════════
PENTING & WAJIB (SEKALI LAGI):
- Kamu HARUS menyertakan, merujuk, dan membahas SEMUA ${refAktif.length} referensi (baik ayat Al-Qur'an maupun hadits) yang ada di daftar REFERENSI WAJIB di atas ke dalam isi naskah kultum/khotbah. DILARANG melewatkan/skip satu pun!
- Ketika merujuk hadits di dalam paragraf isi, gunakan Atribusi Wajib yang ditentukan (misalnya: "HR. Bukhari No. 1930") secara eksak agar terdeteksi oleh verifikator.
- Ketika merujuk ayat Al-Qur'an di dalam paragraf isi, cukup sebutkan nama surah dan nomor ayatnya (misalnya: "QS. Luqman: 13") serta artinya saja, JANGAN tulis huruf Arab-nya.
- DILARANG keras berhalusinasi membuat atau mengarang nomor/atribusi hadits lain di luar daftar REFERENSI WAJIB di atas!
══════════════════════════════════`
      : ''

    let messages: any[] = []
    const isKhotbahJumat = format === 'khotbah_jumat'

    if (isKhotbahJumat) {
      const laranganReferensi = refAktif.length > 0 ? `
LARANGAN ABSOLUT:
- HANYA gunakan ${refAktif.length} referensi yang diberikan
- DILARANG tambah ayat/hadits lain di luar daftar
- Melanggar = output GAGAL
` : `
LARANGAN: Gunakan maksimal 3 ayat yang paling relevan dengan tema.
Jangan tambah ayat yang tidak perlu.
`

      const systemPromptKhotbah = `Kamu adalah khatib Jum'at berpengalaman yang menyusun naskah khotbah sesuai pakem syar'i.

${laranganReferensi}

LARANGAN KHUSUS DOA PILIHAN:
- DILARANG MASUKKAN DOA (type/kategori doa, doa para nabi, doa rabbana, doa harian, dll.) ke array ayat_pendukung di khotbah pertama/kedua.
- Array ayat_pendukung HANYA boleh berisi ayat Al-Qur'an umum/bukan doa pilihan. Doa pilihan akan dirender secara terpisah oleh sistem dari referensi doa yang dipilih user.

CARA MENYISIPKAN AYAT YANG BENAR:
- Sebutkan referensi dalam narasi: "Allah berfirman dalam QS. An-Nisa: 1 yang artinya '...'"
- JANGAN PERNAH MENULIS HURUF/TEKS ARAB DI DALAM PARAGRAF ATAU NARASI APAPUN. Teks Arab dan terjemah card akan di-render otomatis oleh sistem.
- Dalam field teks/paragraf/isi/wasiat_taqwa/isi_ringkas: cukup sebutkan "QS. Surah: ayat" dan artinya saja tanpa menulis huruf Arab.

PAKEM WAJIB KHOTBAH JUM'AT:
Khotbah terdiri dari DUA khotbah terpisah dengan jeda duduk di antaranya.

KHOTBAH PERTAMA berisi:
1. Wasiat taqwa kepada jamaah (mengajak jamaah meningkatkan taqwa)
2. Ayat Al-Qur'an yang relevan dengan tema
3. Isi/materi khotbah utama (panjang, mendalam, minimal 400 kata)
4. Hadits pendukung jika ada
5. Penutup khotbah pertama sebelum khatib duduk

KHOTBAH KEDUA berisi:
1. Wasiat taqwa ringkas (1 paragraf)
2. Isi ringkas (kesimpulan dari khotbah pertama)
3. Doa khusus untuk kaum muslimin

PENTING:
- Bagian doa tetap (Khutbatul Hajah, Syahadat, Shalawat, Shalawat Ibrahimiyah, Doa Penutup) TIDAK perlu di-generate — sudah hardcoded di sistem
- AI hanya generate: wasiat_taqwa, isi_utama, isi_ringkas, doa_umat
- Gunakan Bahasa Indonesia yang fasih, khusyuk, dan menginspirasi.`

      const userMessageKhotbah = `Buatkan naskah Khotbah Jum'at tentang tema: "${tema ?? kisahData?.nama}"
Durasi total: ${targetDurasi} menit | Gaya: ${gaya_bahasa || 'Formal'}

${kisahData ? `KISAH UTAMA DARI REFERENSI:\n${kisahData.kisah_lengkap ?? kisahData.ringkasan}\n\nLatar Belakang: ${kisahData.latar_belakang ?? ''}\nKondisi Kaum: ${kisahData.kondisi_kaum ?? ''}\nAzab/Kejadian: ${kisahData.azab_atau_kejadian ?? ''}\nPelajaran: ${kisahData.pelajaran ?? ''}` : ''}

${referensiContext}

Output HARUS berupa JSON valid dengan struktur PERSIS seperti ini:
{
  "judul": "judul khotbah yang menarik",
  "khotbah_pertama": {
    "wasiat_taqwa": "teks wasiat taqwa pembuka (2-3 paragraf, mengajak jamaah bertaqwa)",
    "isi_utama": "teks isi khotbah pertama yang panjang and mendalam (minimal 400 kata)",
    "ayat_pendukung": [
      {
        "teks_arab": "[[AYAT:23:8]]",
        "terjemah": "terjemahan ayat",
        "sumber": "QS. Al-Mu'minun: 8"
      }
    ],
    "hadits_pendukung": [
      {
        "matan": "teks hadits pendukung",
        "terjemah": "terjemah hadits",
        "sumber": "HR. Perawi No. Nomor"
      }
    ],
    "penutup": "kalimat penutup khotbah pertama sebelum duduk"
  },
  "khotbah_kedua": {
    "wasiat_taqwa_ringkas": "wasiat taqwa singkat (1 paragraf)",
    "isi_ringkas": "ringkasan dan penekanan dari khotbah pertama (100-150 kata)",
    "doa_umat": {
      "arab": "teks Arab dengan harakat lengkap",
      "latin": "transliterasi latin",
      "terjemah": "terjemah bahasa Indonesia"
    }
  }
}

WAJIB: Output hanya JSON, tidak ada teks lain di luar JSON.
WAJIB: khotbah_pertama.isi_utama minimal 400 kata.
WAJIB: ayat_pendukung tidak boleh kosong. Gunakan format [[AYAT:surah_id:nomor_ayat]] (GANTI surah_id dan nomor_ayat dengan angka asli dari referensi yang Anda gunakan, contoh: [[AYAT:23:8]]) untuk teks_arab.`

      messages = [
        { role: 'system', content: systemPromptKhotbah },
        { role: 'user', content: userMessageKhotbah + warningPenekanan }
      ]
    } else if (isKisahMode && kisahData) {
      const userMessageKisah = `Buatkan kultum kisah ${kisahData.nama} dengan ketentuan:
- Format: ${format}
- Durasi: ${targetDurasi} menit
- Gaya: ${gaya_bahasa || 'Semi-Formal'}
- TARGET PANJANG: ${targetKataMin}–${targetKataMax} kata (WAJIB dipenuhi)
  Ini setara ceramah ${targetDurasi} menit. Jangan terlalu singkat.

Untuk mencapai target kata:
- Bagian penjabaran/narasi kisah harus minimal ${Math.round(targetKata * 0.5)} kata
- Ceritakan kisah dengan detail, dialog imajinatif, dan deskripsi yang hidup
- Poin utama masing-masing minimal 80 kata
- Jangan ringkas — ini untuk dibacakan, bukan dibaca dalam hati

Output HARUS berupa JSON valid dengan struktur:
{
  "judul": "Kisah ${kisahData.nama}: [tagline]",
  "pembuka": { "teks": "..." },
  "ayat_pendukung": [
    {
      "teks_arab": "...",  // salin verbatim dari data yang diberikan
      "latin": "...",
      "terjemah": "...",
      "sumber": "..."
    }
  ],
  "penjabaran": { "teks": "..." },
  "penekanan_makna": { "teks": "..." },
  "poin_utama": [
    { "judul": "...", "teks": "..." }
  ],
  "kesimpulan": { "teks": "..." }
}

WAJIB: field ayat_pendukung tidak boleh kosong.
WAJIB: tidak ada duplikasi konten antar section.`

      messages = [
        {
          role: 'system',
          content: promptBase + finalJudulInstruction
        },
        {
          role: 'user',
          content: userMessageKisah + warningPenekanan
        }
      ]
    } else {
      messages = [
        {
          role: 'system',
          content: `Kamu adalah ustadz/ulama yang berpengalaman membuat kultum dan khotbah Islam.`
        },
        {
          role: 'user',
          content: promptBase + finalJudulInstruction + warningPenekanan
        }
      ]
    }

    console.log('messages[0] role:', messages[0].role)
    console.log('messages[0] content length:', messages[0].content.length)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        try {
          const maxTokens = Math.min(16000, Math.max(2000, targetDurasi * 400))
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            response_format: { type: 'json_object' },
            stream: true,
            max_tokens: maxTokens,
          })

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              controller.enqueue(encoder.encode(content))
            }
          }

          if (user_id && fullContent) {
            try {
              let konten = JSON.parse(fullContent)

              // Normalisasi Khotbah Jumat
              if (format === 'khotbah_jumat' || konten.khotbah_pertama || konten.khotbah_kedua) {
                const kp = konten.khotbah_pertama || {}
                const kk = konten.khotbah_kedua || {}
                konten = {
                  judul: konten.judul || tema || 'Khotbah Jum\'at',
                  format: 'khotbah_jumat',
                  tema: tema || '',
                  khotbah_pertama: {
                    wasiat_taqwa: kp.wasiat_taqwa || '',
                    ayat_quran: (kp.ayat_pendukung || kp.ayat_quran || []).map((a: any) => ({
                      arab: a.teks_arab || a.arab || '',
                      latin: a.latin || '',
                      terjemah: a.terjemah || '',
                      referensi: a.sumber || a.referensi || ''
                    })),
                    isi_khotbah: kp.isi_utama || kp.isi_khotbah || '',
                    poin_utama: (kp.poin_utama || []).map((p: any) => ({
                      judul: p.judul || '',
                      paragraf: p.paragraf || p.isi || ''
                    })),
                    penekanan_makna: kp.penutup || kp.penekanan_makna || ''
                  },
                  khotbah_kedua: {
                    wasiat_taqwa_2: kk.wasiat_taqwa_ringkas || kk.wasiat_taqwa_2 || '',
                    isi_khotbah_2: kk.isi_ringkas || kk.isi_khotbah_2 || '',
                    ajakan_penutup: kk.ajakan_penutup || '',
                    doa_umat: kk.doa_umat || kk.doa_quran_penutup || '',
                    doa_quran_penutup: Array.isArray(kk.doa_umat)
                      ? kk.doa_umat.map((d: any) => ({
                          arab: d.arab || d.teks_arab || '',
                          latin: d.latin || '',
                          terjemah: d.terjemah || '',
                          referensi: d.referensi || d.sumber || ''
                        }))
                      : typeof kk.doa_umat === 'string'
                        ? [{
                            arab: kk.doa_umat,
                            latin: '',
                            terjemah: '',
                            referensi: 'Doa Khotbah'
                          }]
                        : Array.isArray(kk.doa_quran_penutup)
                          ? kk.doa_quran_penutup
                          : []
                  }
                }
              }

              console.log('konten keys:', Object.keys(konten))

              // Normalisasi jika menggunakan format Kisah Baru
              if (konten.pembuka || konten.ayat_pendukung || konten.penjabaran) {
                konten = {
                  ...konten,
                  bagian: {
                    doa_pembuka: {
                      arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                      latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                      terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.",
                      sumber: "HR. Tirmidzi"
                    },
                    pembuka: {
                      salam: "Assalamu'alaikum warahmatullahi wabarakatuh.",
                      muqaddimah: konten.pembuka?.teks || "",
                      pengantar_tema: ""
                    },
                    ayat_quran: (konten.ayat_pendukung ?? []).map((a: any) => ({
                      arab: a.teks_arab ?? "",
                      latin: a.latin ?? "",
                      terjemah: a.terjemah ?? "",
                      referensi: a.sumber ?? "",
                      tafsir_singkat: ""
                    })),
                    penjabaran_tafsir: konten.penjabaran?.teks || "",
                    penekanan_makna: konten.penekanan_makna?.teks || "",
                    poin_utama: (konten.poin_utama ?? []).map((p: any) => ({
                      judul: p.judul ?? "",
                      isi: p.teks ?? ""
                    })),
                    kesimpulan: konten.kesimpulan?.teks || "",
                    doa_penutup_majelis: {
                      arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                      latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
                      terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu."
                    }
                  },
                  durasi_estimasi: `${konten.durasi_menit ?? targetDurasi} Menit`
                }
              }

              // Kumpulkan SEMUA narasi yang mungkin mengandung sebutan hadits
              const narasiGabungan = [
                ...(konten.isi ?? []).map((i: any) => i.paragraf ?? ''),
                konten.penekanan_makna ?? '',
                konten.kesimpulan ?? '',
                konten.ajakan_penutup ?? '',
                konten.khotbah_pertama?.wasiat_taqwa ?? '',
                konten.khotbah_pertama?.isi_khotbah ?? '',
                konten.khotbah_kedua?.wasiat_taqwa_2 ?? '',
                konten.khotbah_kedua?.isi_khotbah_2 ?? ''
              ].join('\n\n')
              
              // Jalankan verifikasi
              const hasilVerifikasi = await jalankanVerifikasiHadits(narasiGabungan, origin)
              
              // SEMENTARA log hasil verifikasi
              console.log('=== HASIL VERIFIKASI ===')
              console.log('Total hadits terdeteksi:', extractHaditsDariNarasi(narasiGabungan).length)
              console.log('Verifikasi sukses:', hasilVerifikasi.referensi_terverifikasi.hadits.length)
              console.log('Replaced:', hasilVerifikasi.narasi_replaced)
              
              // Jika ada narasi yang di-replace, update konten asli
              if (hasilVerifikasi.narasi_replaced.some(r => r.reason === 'not_found')) {
                // Apply replacement ke setiap field konten
                const applyReplacement = (text: string): string => {
                  let result = text
                  for (const rep of hasilVerifikasi.narasi_replaced) {
                    if (rep.reason === 'not_found' && rep.kalimat_dihapus) {
                      // HAPUS seluruh kalimat
                      result = result.replace(rep.kalimat_dihapus, '')
                    }
                  }
                  // Rapikan double space dan double titik
                  result = result.replace(/\s{2,}/g, ' ').replace(/\.\s*\./g, '.').trim()
                  return result
                }

                konten.isi = (konten.isi ?? []).map((i: any) => ({
                  ...i,
                  paragraf: applyReplacement(i.paragraf ?? '')
                }))
                konten.kesimpulan = applyReplacement(konten.kesimpulan ?? '')
                konten.penekanan_makna = applyReplacement(konten.penekanan_makna ?? '')
                konten.ajakan_penutup = applyReplacement(konten.ajakan_penutup ?? '')

                if (konten.khotbah_pertama) {
                  konten.khotbah_pertama.wasiat_taqwa = applyReplacement(konten.khotbah_pertama.wasiat_taqwa ?? '')
                  konten.khotbah_pertama.isi_khotbah = applyReplacement(konten.khotbah_pertama.isi_khotbah ?? '')
                }
                if (konten.khotbah_kedua) {
                  konten.khotbah_kedua.wasiat_taqwa_2 = applyReplacement(konten.khotbah_kedua.wasiat_taqwa_2 ?? '')
                  konten.khotbah_kedua.isi_khotbah_2 = applyReplacement(konten.khotbah_kedua.isi_khotbah_2 ?? '')
                }
              }

              // Post-cleanup: hilangkan judul poin yang menyebut "hadits" 
              // jika paragrafnya tidak mengandung atribusi HR. xxx No. xxx
              konten.isi = (konten.isi ?? []).map((item: any) => {
                const judulMengandungHadits = /hadi[ts]+/i.test(item.judul ?? '')
                const hasAtribusi = /HR\..*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /Hadits\s+riwayat.*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /diriwayatkan\s+oleh.*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /\b(Bukhari|Muslim|Tirmidzi|Tirmizi|Abu\s+Dawud|Ibnu?\s+Majah|Ahmad|Nasa.?i|Baihaqi|Hakim|Darimi)\s+(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '')
                
                if (judulMengandungHadits && !hasAtribusi) {
                  // Judul menyesatkan — ganti jadi netral
                  return {
                    ...item,
                    judul: 'Refleksi dan Pelajaran'  // judul default netral
                  }
                }
                return item
              })

              const supabase = getSupabaseAdmin()
              const { data, error } = await supabase
                .from('kultum_history')
                .insert({
                  user_id,
                  judul: konten.judul,
                  format: sub_format === 'khotbah_jumat' ? 'khotbah_jumat' : format,
                  tema,
                  kategori_tema: kategori_tema || null,
                  durasi_menit: targetDurasi,
                  gaya_bahasa: gaya_bahasa || 'Semi-Formal',
                  konten: konten as unknown as Record<string, unknown>,
                  referensi_dipilih: refAktif,
                  referensi_terverifikasi: hasilVerifikasi.referensi_terverifikasi,
                  narasi_replaced: hasilVerifikasi.narasi_replaced,
                })
                .select('id')
                .single()

              if (error) {
                console.error('[Kultum] Supabase insert error:', error.message, error.details)
              }

              if (!error && data) {
                controller.enqueue(encoder.encode(`\n---ID---${data.id}`))
              }
            } catch (e) {
              console.error('[Kultum] Error saving to history:', e)
            }
          }
        } catch (err) {
          console.error('[Kultum] Stream error:', err)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
  durasi_menit: number = 25,
  referensiDipilih: KultumReferensiOld[] = [],
  semanticExpanded?: Record<string, unknown> | null
) {
  try {
    // Fetch automatic references based on theme
    const autoReferensi = await fetchReferensiUntukTema(
      tema,
      'khotbah',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      semanticExpanded as any ?? null
    )
    const autoReferensiPrompt = buildReferensiPrompt(autoReferensi)

    // HANYA referensi yang dipilih user yang masuk ke prompt AI, autoReferensi jadi fallback
    const referensiContext = referensiDipilih && referensiDipilih.length > 0
      ? referensiToPromptContext(referensiDipilih, tema)
      : autoReferensiPrompt

    const laranganReferensi = referensiDipilih && referensiDipilih.length > 0 ? `
LARANGAN ABSOLUT:
- HANYA gunakan ${referensiDipilih.length} referensi yang diberikan
- DILARANG tambah ayat/hadits lain di luar daftar
- Melanggar = output GAGAL
` : `
LARANGAN: Gunakan maksimal 3 ayat yang paling relevan dengan tema.
Jangan tambah ayat yang tidak perlu.
`

    const prompt = `Kamu adalah khatib Jum'at yang berpengalaman.
Buat naskah Khotbah Jum'at lengkap dengan tema "${tema}".
Gaya bahasa: ${gaya_bahasa || 'Formal'}.
Estimasi durasi total: ${durasi_menit} menit. Sesuaikan panjang isi khotbah dengan durasi ini agar tidak terlalu panjang.
Panduan: 10 menit ≈ 600 kata, 30 menit ≈ 1500 kata.

${laranganReferensi}

CARA MENYISIPKAN AYAT YANG BENAR:
- Sebutkan referensi dalam narasi: "Allah berfirman dalam QS. An-Nisa: 1..."
- Teks Arab dan terjemah akan di-render otomatis oleh sistem
- JANGAN tulis teks Arab dalam field narasi/paragraf
- Field ayat_pendukung sudah ada untuk menampilkan Arab — gunakan itu
- Dalam field teks/paragraf/isi: cukup sebutkan "QS. Surah: ayat" tanpa Arab

ATURAN PENGGUNAAN REFERENSI (WAJIB DIPATUHI):

1. REFERENSI HADITS:
   - HANYA sebut hadits yang ada di [HADITS SHAHIH] dalam referensi
   - Format wajib: HR. {Perawi} No. {nomor}
   - DILARANG mengarang hadits tanpa atribusi lengkap
   - Jika tidak ada referensi hadits → fokus pada ayat & kisah

2. REFERENSI AYAT:
   - Jika ada [SEJARAH AL-QURAN] → HANYA gunakan ayat dari 
     daftar "AYAT YANG BOLEH DIGUNAKAN" yang diberikan
   - DILARANG menambah ayat lain meskipun valid
   - Jika tidak ada referensi ayat → JANGAN tambah ayat lain dari pengetahuan AI

3. REFERENSI DOA:
   - Jika ada [DOA AL-QURAN] → gunakan sebagai doa penutup 
     sebelum kaffaratul majelis
   - Selalu akhiri dengan doa sapu jagad (Rabbana atina...)

Output JSON dengan struktur PERSIS berikut:
{
  "judul": "Judul khotbah yang relevan dan spesifik",
  "format": "khotbah_jumat",
  "tema": "${tema}",
  "khotbah_pertama": {
    "wasiat_taqwa": "Teks wasiat taqwa yang relevan dengan tema, minimal 2 paragraf yang substantif",
    "ayat_quran": [
      {
        "arab": "[[AYAT:surah_id:nomor_ayat]]",
        "latin": "transliterasi Latin",
        "terjemah": "terjemahan Indonesia",
        "referensi": "QS. Nama Surah: Nomor Ayat"
      }
    ],
    "isi_khotbah": "Isi khotbah pertama yang substantif sesuai tema. WAJIB mengandung: (1) penjelasan makna ayat yang disebutkan, (2) kisah/ibrah dari referensi jika ada, (3) aplikasi dalam kehidupan. Minimal 4-6 paragraf panjang.",
    "poin_utama": [
      {
        "judul": "Judul poin spesifik 1",
        "paragraf": "Penjelasan mendalam poin 1, minimal 3 kalimat. Kaitkan dengan ayat/kisah dari referensi."
      },
      {
        "judul": "Judul poin spesifik 2", 
        "paragraf": "Penjelasan mendalam poin 2, minimal 3 kalimat."
      },
      {
        "judul": "Judul poin spesifik 3",
        "paragraf": "Penjelasan mendalam poin 3, minimal 3 kalimat."
      }
    ],
    "penekanan_makna": "Satu paragraf penekanan inti pesan khotbah — kalimat kuat yang merangkum esensi tema"
  },
  "khotbah_kedua": {
    "wasiat_taqwa_2": "Wasiat taqwa singkat yang relevan dengan tema, 1-2 paragraf",
    "isi_khotbah_2": "Ringkasan dan penekanan pelajaran dari khotbah pertama dalam 2-3 paragraf. Ajak jamaah mengamalkan secara konkret.",
    "ajakan_penutup": "Satu kalimat ajakan kuat dan inspiratif untuk jamaah",
    "doa_quran_penutup": [
      {
        "arab": "[[AYAT:surah_id:nomor_ayat]] atau teks arab doa",
        "latin": "transliterasi",
        "terjemah": "terjemahan",
        "referensi": "QS. Surah: Ayat atau sumber doa"
      }
    ]
  }
}

${referensiContext}
PENTING: Setiap kali menyebut ayat Al-Qur'an, tulis placeholder [[AYAT:surah_id:nomor_ayat]] di field "arab". JANGAN tulis teks Arab secara manual.
surah_id = angka 1-114
nomor_ayat = angka ayat saja (BUKAN gabungan surah+ayat)
CONTOH BENAR: [[AYAT:22:78]] → Surah Al-Hajj ayat 78
CONTOH SALAH: [[AYAT:22:2278]] atau [[AYAT:1813]]

ATURAN BAHASA YANG WAJIB DIIKUTI:
- Ketika merujuk kepada Nabi Muhammad SAW, WAJIB gunakan kata "Beliau" bukan "Dia" atau "Ia"
- Contoh BENAR: "Beliau bersabda...", "Beliau mengajarkan...", "Beliau mencontohkan..."
- Contoh SALAH: "Dia bersabda...", "Ia mengajarkan...", "Dia mencontohkan..."

ATURAN KETAT TENTANG HADITS (WAJIB DIPATUHI):

1. Setiap kali menyebut sabda Nabi atau hadits, WAJIB menyertakan 
   atribusi LENGKAP dalam format:
   "HR. {Perawi} No. {nomor}"
   Contoh: "HR. Bukhari No. 6406", "HR. Muslim No. 906"

2. DILARANG KERAS menyebut sabda Nabi/hadits tanpa atribusi 
   nomor riwayat yang spesifik. Frasa berikut DILARANG:
   - "Rasulullah SAW bersabda" (tanpa HR. xxx No. xxx)
   - "Nabi pernah bersabda" (tanpa atribusi)
   - "Dalam sebuah hadits disebutkan" (tanpa atribusi)
   - "Hadits Nabi mengatakan" (tanpa atribusi)

3. Jika TIDAK YAKIN tentang nomor atau perawi hadits, 
   JANGAN sebut hadits sama sekali. Lebih baik:
   - Fokus pada ayat Al-Qur'an (yang ada di referensi)
   - Pakai pelajaran/ibrah dari kisah (yang ada di referensi)
   - Berikan refleksi/aplikasi praktis
   DARIPADA mengarang hadits yang tidak jelas sumbernya.

4. Jika SUDAH ADA [HADITS SHAHIH] atau [HADITS X - WAJIB DISEBUT] di referensi yang diberikan, 
   GUNAKAN itu sebagai sumber utama. Sebut Atribusi Wajib (misal: "HR. Bukhari No. X") persis seperti yang diberikan di referensi.

5. PENTING: Hadits palsu/dhaif lebih berbahaya daripada tidak ada 
   hadits. Lebih baik khotbah tanpa hadits daripada hadits yang 
   diragukan keasliannya.

6. JUDUL POIN UTAMA tidak boleh mengandung kata "hadits" / "hadis" 
   kecuali AI yakin akan menyertakan atribusi lengkap (HR. xxx No. xxx) 
   di dalam paragrafnya. Jika ragu, gunakan judul yang lebih netral 
   seperti:
   - "Refleksi tentang [topik]"
   - "Pelajaran dari [konteks]"
   - "Makna [konsep]"
   - "Aplikasi dalam Kehidupan"

7. DILARANG KERAS menyebut nama perawi DAN nomor hadits dalam format
   APAPUN jika tidak ada [HADITS SHAHIH] di referensi yang diberikan.
   Format yang dilarang (jika tidak ada referensi hadits):
   - "HR. Bukhari No. 2231"
   - "Bukhari No. 2231" (tanpa HR.)
   - "Hadits Bukhari nomor 2231"
   - "Shahih Bukhari, hadits ke-2231"
   Jika tidak ada referensi hadits → SAMA SEKALI tidak boleh menyebut
   nama perawi (Bukhari, Muslim, Tirmidzi, dll) beserta nomor apapun.

ATURAN WAJIB untuk isi materi:
- isi_khotbah dan poin_utama WAJIB menggunakan referensi dari [REFERENSI] yang diberikan di bawah
- Jika ada [SEJARAH AL-QURAN] → kisahkan detail dalam isi_khotbah
- Jika ada [HADITS SHAHIH] → kutip dalam poin_utama dengan atribusi
- Jika ada [DOA AL-QURAN] → masukkan ke doa_quran_penutup
- Jumlah poin_utama sesuai durasi: 10 menit = 2-3 poin, 25 menit = 3-4 poin, 45 menit = 4-5 poin
- penekanan_makna WAJIB diisi — jangan kosongkan
- JANGAN tambah field lain di luar struktur di atas
- Respond ONLY with valid JSON

- Isi khotbah harus relevan dengan tema: ${tema}
- Output HANYA JSON, tanpa markdown
Respond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 118000) // 118 detik

    let responseText = ''
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
      }, {
        signal: controller.signal
      })
      responseText = completion.choices[0].message.content || '{}'
    } catch (e: any) {
      if (e.name === 'AbortError' || e.message?.includes('abort')) throw new Error('Request was aborted')
      throw e
    } finally {
      clearTimeout(timeoutId)
    }

    let konten: any
    try {
      const raw = typeof responseText === 'string' ? responseText : JSON.stringify(responseText)
      const cleaned = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      konten = JSON.parse(cleaned)

      // Set authentic doa_pembuka_majelis
      konten.doa_pembuka_majelis = {
        arab: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلاَ إِلَهَ غَيْرُكَ',
        latin: 'Subhanakallahumma wabihamdika watabarakasmuka wata\'ala jadduka wala ilaha ghairuk',
        terjemah: 'Maha Suci Engkau ya Allah, dengan memuji-Mu, Maha Berkah nama-Mu, Maha Tinggi keagungan-Mu, dan tidak ada Tuhan selain Engkau.',
        sumber: 'Doa Pembuka Majelis — HR. Abu Dawud & At-Tirmidzi'
      }
    } catch (e) {
      console.error('[Khotbah] Parse error:', e, 'Raw:', responseText)
      throw new Error('Gagal parse response AI')
    }

    // Save to Supabase
    let savedId: string | null = null
    if (user_id) {
      // Kumpulkan SEMUA narasi yang mungkin mengandung sebutan hadits di Khotbah Jumat
      const narasiGabungan = [
        konten.khotbah_pertama?.wasiat_taqwa ?? '',
        konten.khotbah_pertama?.isi_khotbah ?? '',
        konten.khotbah_pertama?.penekanan_makna ?? '',
        ...(konten.khotbah_pertama?.poin_utama ?? []).map((p: any) => p.paragraf ?? ''),
        konten.khotbah_kedua?.wasiat_taqwa_2 ?? '',
        konten.khotbah_kedua?.isi_khotbah_2 ?? '',
        konten.khotbah_kedua?.ajakan_penutup ?? '',
        ...(konten.khotbah_kedua?.doa_quran_penutup ?? []).map((d: any) => d.terjemah ?? '')
      ].join('\n\n')
      
      // Jalankan verifikasi
      const hasilVerifikasi = await jalankanVerifikasiHadits(narasiGabungan, origin)
      
      // SEMENTARA log hasil verifikasi
      console.log('=== HASIL VERIFIKASI KHOTBAH ===')
      console.log('Total hadits terdeteksi:', extractHaditsDariNarasi(narasiGabungan).length)
      console.log('Verifikasi sukses:', hasilVerifikasi.referensi_terverifikasi.hadits.length)
      console.log('Replaced:', hasilVerifikasi.narasi_replaced)
      
      // Jika ada narasi yang di-replace, update konten asli
      if (hasilVerifikasi.narasi_replaced.some(r => r.reason === 'not_found')) {
        const applyReplacement = (text: string): string => {
          let result = text
          for (const rep of hasilVerifikasi.narasi_replaced) {
            if (rep.reason === 'not_found' && rep.kalimat_dihapus) {
              // HAPUS seluruh kalimat
              result = result.replace(rep.kalimat_dihapus, '')
            }
          }
          // Rapikan double space dan double titik
          result = result.replace(/\s{2,}/g, ' ').replace(/\.\s*\./g, '.').trim()
          return result
        }

        if (konten.khotbah_pertama) {
          konten.khotbah_pertama.wasiat_taqwa = applyReplacement(konten.khotbah_pertama.wasiat_taqwa ?? '')
          konten.khotbah_pertama.isi_khotbah = applyReplacement(konten.khotbah_pertama.isi_khotbah ?? '')
          if (konten.khotbah_pertama.penekanan_makna) {
            konten.khotbah_pertama.penekanan_makna = applyReplacement(konten.khotbah_pertama.penekanan_makna)
          }
          if (konten.khotbah_pertama.poin_utama) {
            konten.khotbah_pertama.poin_utama = konten.khotbah_pertama.poin_utama.map((p: any) => ({
              ...p,
              paragraf: applyReplacement(p.paragraf ?? '')
            }))
          }
        }
        
        if (konten.khotbah_kedua) {
          konten.khotbah_kedua.wasiat_taqwa_2 = applyReplacement(konten.khotbah_kedua.wasiat_taqwa_2 ?? '')
          konten.khotbah_kedua.isi_khotbah_2 = applyReplacement(konten.khotbah_kedua.isi_khotbah_2 ?? '')
          if (konten.khotbah_kedua.ajakan_penutup) {
            konten.khotbah_kedua.ajakan_penutup = applyReplacement(konten.khotbah_kedua.ajakan_penutup)
          }
          if (konten.khotbah_kedua.doa_quran_penutup) {
            konten.khotbah_kedua.doa_quran_penutup = konten.khotbah_kedua.doa_quran_penutup.map((d: any) => ({
              ...d,
              terjemah: applyReplacement(d.terjemah ?? '')
            }))
          }
        }
      }

      // Post-cleanup: hilangkan judul poin yang menyebut "hadits" 
      // jika paragrafnya tidak mengandung atribusi HR. xxx No. xxx
      if ((konten as any).isi) {
        (konten as any).isi = ((konten as any).isi ?? []).map((item: any) => {
          const judulMengandungHadits = /hadi[ts]+/i.test(item.judul ?? '')
          const hasAtribusi = /HR\..*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /Hadits\s+riwayat.*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /diriwayatkan\s+oleh.*?(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '') ||
                          /\b(Bukhari|Muslim|Tirmidzi|Tirmizi|Abu\s+Dawud|Ibnu?\s+Majah|Ahmad|Nasa.?i|Baihaqi|Hakim|Darimi)\s+(?:No\.?|nomor)\s*\d+/i.test(item.paragraf ?? '')
          
          if (judulMengandungHadits && !hasAtribusi) {
            // Judul menyesatkan — ganti jadi netral
            return {
              ...item,
              judul: 'Refleksi dan Pelajaran'  // judul default netral
            }
          }
          return item
        })
      }

      const supabase = getSupabaseAdmin()
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
          referensi_dipilih: referensiDipilih,
          referensi_terverifikasi: hasilVerifikasi.referensi_terverifikasi,
          narasi_replaced: hasilVerifikasi.narasi_replaced,
        })
        .select('id')
        .single()

      if (error) {
        console.error('[Khotbah Jumat] Supabase insert error:', error.message, error.details)
      }

      if (!error && data) savedId = data.id
    }

    return NextResponse.json({ success: true, id: savedId, konten, is_jumat: true })
  } catch (err: any) {
    console.error('=== GENERATOR ERROR ===')
    console.error('message:', err.message)
    console.error('stack:', err.stack?.slice(0, 500))
    console.error('======================')
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

