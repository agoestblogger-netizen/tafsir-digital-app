import { getSupabaseAdmin } from '@/lib/supabase'

// ──────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────

export interface HaditsTerdeteksi {
  raw: string              // text mentah yang ditemukan AI, contoh "HR. Bukhari No. 6490"
  perawi: string           // contoh "bukhari"
  nomor: string            // contoh "6490"
  konteks: string          // 1-2 kalimat sekitar sebutan hadits (untuk fuzzy match)
}

export interface AyatTerdeteksi {
  raw: string              // contoh "QS. Al-Anbiya: 87"
  surah_nama: string       // contoh "Al-Anbiya"
  surah_id?: number        // jika bisa di-resolve
  ayat: string             // contoh "87"
}

export interface HaditsTerverifikasi {
  found: boolean
  metode: 'strict' | 'fuzzy' | null
  data?: {
    arab: string
    terjemah: string
    perawi: string
    nomor: string
    topik_nama?: string
  }
  raw_dari_ai: string      // sebutan asli AI agar bisa diganti di narasi
}

// ──────────────────────────────────────────────────────
// UTILITY 1: Extract Hadits dari Narasi
// ──────────────────────────────────────────────────────

function normalizePerawi(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^ibn\s+/, 'ibnu-')
    .replace(/^abu\s+/, 'abu-')
    .replace(/\s+/g, '-')          // "ibn majah" → "ibn-majah"
    .replace(/^ibn-/, 'ibnu-')      // "ibn-majah" → "ibnu-majah"
}

/**
 * Parse narasi kultum dan extract semua sebutan hadits.
 * Pattern yang dideteksi:
 * - "HR. Bukhari No. 6490"
 * - "HR. Muslim No. 906"
 * - "HR. Tirmidzi No. 2398"
 * - "Hadits riwayat Bukhari nomor 6490"
 * - "diriwayatkan oleh Bukhari No. 6490"
 */
export function extractHaditsDariNarasi(narasi: string): HaditsTerdeteksi[] {
  const hasil: HaditsTerdeteksi[] = []
  
  // Pattern utama: HR. {perawi} No. {nomor} atau variasinya
  const patterns = [
    // Pattern: HR. <perawi multi-kata> No. <nomor>
    /HR\.\s+([A-Za-z][A-Za-z'\-\s]*?)\s+(?:No\.?|nomor)\s*(\d+)/gi,
    
    // Pattern BARU: {perawi} No. {nomor} tanpa HR.
    /\b(Bukhari|Muslim|Tirmidzi|Tirmizi|Abu\s+Dawud|Ibnu?\s+Majah|Ahmad|Nasa['\u2019]?i|Baihaqi|Hakim|Darimi)\s+(?:No\.?|nomor)\s*(\d+)/gi,
    
    // Pattern: Hadits riwayat <perawi> No./nomor <num>
    /Hadits\s+riwayat\s+([A-Za-z][A-Za-z'\-\s]*?)\s+(?:No\.?|nomor)\s*(\d+)/gi,
    
    // Pattern: diriwayatkan oleh <perawi> No./nomor <num>
    /diriwayatkan\s+oleh\s+([A-Za-z][A-Za-z'\-\s]*?)\s+(?:No\.?|nomor)\s*(\d+)/gi,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(narasi)) !== null) {
      const perawi = normalizePerawi(match[1])
      const nomor = match[2].trim()
      
      // Extract konteks: 100 char sebelum + 100 char setelah
      const start = Math.max(0, match.index - 100)
      const end = Math.min(narasi.length, match.index + match[0].length + 100)
      const konteks = narasi.slice(start, end)
      
      // Avoid duplicate (perawi + nomor sama)
      if (!hasil.find(h => h.perawi === perawi && h.nomor === nomor)) {
        hasil.push({
          raw: match[0],
          perawi,
          nomor,
          konteks
        })
      }
    }
  }
  
  return hasil
}

/**
 * Deteksi pola referensi hadits IMPLISIT (tanpa atribusi nomor).
 * Return: array of kalimat utuh yang mengandung referensi implisit.
 */
export function extractKalimatHaditsImplisit(narasi: string): string[] {
  const hasil: string[] = []
  
  // Pola implisit yang menandakan rujukan ke hadits
  const polaImplisit = [
    /Dalam\s+(?:sebuah\s+)?hadi[ts]+(?:\s+ini)?[\s,]/gi,
    /Rasulullah\s+SAW\s+bersabda/gi,
    /Rasulullah\s+(?:saw|ﷺ)\s+bersabda/gi,
    /Nabi\s+(?:Muhammad\s+)?(?:SAW\s+)?(?:pernah\s+)?bersabda/gi,
    /Beliau\s+bersabda/gi,
    /Sabda\s+(?:Rasul|Nabi)/gi,
    /(?:Hadits|Hadis)\s+Nabi\s+mengatakan/gi,
    /Diriwayatkan\s+(?:dalam\s+)?(?:sebuah\s+)?hadi[ts]+/gi,
  ]
  
  // Untuk setiap pola, cari di narasi
  for (const pola of polaImplisit) {
    let match
    while ((match = pola.exec(narasi)) !== null) {
      const matchIdx = match.index
      
      // Cari boundary kalimat
      let startIdx = 0
      for (let i = matchIdx - 1; i >= 0; i--) {
        if (narasi[i] === '.' || narasi[i] === '\n') {
          startIdx = i + 1
          break
        }
      }
      
      let endIdx = narasi.length
      for (let i = matchIdx + match[0].length; i < narasi.length; i++) {
        if (narasi[i] === '.' || narasi[i] === '\n') {
          endIdx = i + 1
          break
        }
      }
      
      const kalimat = narasi.slice(startIdx, endIdx).trim()
      
      // SKIP jika kalimat ini SUDAH mengandung atribusi eksplisit 
      // (HR. xxx No. xxx) — biarkan extractHaditsDariNarasi yang handle
      const hasAtribusi = /HR\..*?(?:No\.?|nomor)\s*\d+/i.test(kalimat) ||
                          /Hadits\s+riwayat.*?(?:No\.?|nomor)\s*\d+/i.test(kalimat) ||
                          /diriwayatkan\s+oleh.*?(?:No\.?|nomor)\s*\d+/i.test(kalimat) ||
                          /\b(Bukhari|Muslim|Tirmidzi|Tirmizi|Abu\s+Dawud|Ibnu?\s+Majah|Ahmad|Nasa.?i|Baihaqi|Hakim|Darimi)\s+(?:No\.?|nomor)\s*\d+/i.test(kalimat)
      if (hasAtribusi) continue
      
      // Avoid duplicate
      if (!hasil.includes(kalimat) && kalimat.length > 0) {
        hasil.push(kalimat)
      }
    }
  }
  
  return hasil
}

// ──────────────────────────────────────────────────────
// UTILITY 2: Extract Ayat dari Narasi
// ──────────────────────────────────────────────────────

/**
 * Parse narasi dan extract sebutan ayat Al-Qur'an.
 * Pattern yang dideteksi:
 * - "QS. Al-Anbiya: 87"
 * - "QS. Al-Baqarah ayat 201"
 * - "QS. An-Nur: 40"
 */
export function extractAyatDariNarasi(narasi: string): AyatTerdeteksi[] {
  const hasil: AyatTerdeteksi[] = []
  
  const patterns = [
    /QS\.\s*([A-Za-z'\-\s]+?)[\s:]+(?:ayat\s+)?(\d+(?:[-–]\d+)?)/gi,
    /Surah\s+([A-Za-z'\-\s]+?)\s+ayat\s+(\d+(?:[-–]\d+)?)/gi,
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(narasi)) !== null) {
      const surah_nama = match[1].trim().replace(/\s+/g, ' ')
      const ayat = match[2].trim()
      
      if (!hasil.find(a => 
        a.surah_nama.toLowerCase() === surah_nama.toLowerCase() && 
        a.ayat === ayat
      )) {
        hasil.push({
          raw: match[0],
          surah_nama,
          ayat
        })
      }
    }
  }
  
  return hasil
}

// ──────────────────────────────────────────────────────
// UTILITY 3: Validasi Hadits ke Database (Strict Match)
// ──────────────────────────────────────────────────────

/**
 * Cek apakah hadits dengan perawi + nomor tersebut ada di hadits_topik_index.
 * Return data lengkap jika ditemukan, null jika tidak.
 */
export async function validasiHaditsStrict(
  perawi: string,
  nomor: string
): Promise<HaditsTerverifikasi['data'] | null> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('hadits_topik_index')
      .select('arab, terjemah, perawi, nomor, topik_nama')
      .ilike('perawi', `%${perawi}%`)
      .eq('nomor', parseInt(nomor))
      .limit(1)
      .maybeSingle()
    
    if (error || !data) return null
    
    return {
      arab: data.arab,
      terjemah: data.terjemah,
      perawi: data.perawi,
      nomor: String(data.nomor),
      topik_nama: data.topik_nama
    }
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────────────
// UTILITY 4: Validasi Hadits via Fuzzy Match
// ──────────────────────────────────────────────────────

/**
 * Jika strict match gagal, cari hadits yang teks-nya mirip dengan konteks AI.
 * Pakai /api/kultum-hadits yang sudah ada (reuse hitungScoreEnhanced).
 */
export async function validasiHaditsFuzzy(
  konteks: string,
  origin?: string
): Promise<HaditsTerverifikasi['data'] | null> {
  try {
    if (!origin) {
      console.warn('[Verifier] Fuzzy validation skipped because request origin is not provided')
      return null
    }
    
    // Reuse endpoint kultum-hadits yang sudah pakai hitungScoreEnhanced
    const res = await fetch(`${origin}/api/kultum-hadits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema: konteks }),
    })
    const json = await res.json()
    
    if (!json.hadits || json.hadits.length === 0) return null
    
    // Ambil yang skornya tertinggi (sudah di-sort di endpoint)
    const top = json.hadits[0]
    
    // Threshold minimum agar tidak ambil yang bias
    if (top.relevansi_score < 50) return null
    
    return {
      arab: top.data?.arab ?? top.arab ?? '',
      terjemah: top.data?.terjemah ?? top.terjemah ?? '',
      perawi: top.data?.perawi ?? top.perawi ?? '',
      nomor: String(top.data?.nomor ?? top.nomor ?? ''),
      topik_nama: top.data?.topik_nama ?? top.judul ?? ''
    }
  } catch (err) {
    console.error('[Verifier] Fuzzy validation error:', err)
    return null
  }
}

// ──────────────────────────────────────────────────────
// UTILITY 5: Verifikasi Single Hadits (Pipeline)
// ──────────────────────────────────────────────────────

/**
 * Pipeline verifikasi: strict match dulu → fallback fuzzy match.
 */
export async function verifikasiHadits(
  detected: HaditsTerdeteksi,
  origin?: string
): Promise<HaditsTerverifikasi> {
  // Step 1: Strict match
  const strict = await validasiHaditsStrict(detected.perawi, detected.nomor)
  if (strict) {
    return {
      found: true,
      metode: 'strict',
      data: strict,
      raw_dari_ai: detected.raw
    }
  }
  
  // Step 2: Fuzzy match
  const fuzzy = await validasiHaditsFuzzy(detected.konteks, origin)
  if (fuzzy) {
    return {
      found: true,
      metode: 'fuzzy',
      data: fuzzy,
      raw_dari_ai: detected.raw
    }
  }
  
  // Step 3: Not found
  return {
    found: false,
    metode: null,
    raw_dari_ai: detected.raw
  }
}

// ──────────────────────────────────────────────────────
// UTILITY 6: Verifikasi Batch (untuk dipakai di route.ts nanti)
// ──────────────────────────────────────────────────────

export async function verifikasiSemuaHadits(
  narasi: string,
  origin?: string
): Promise<HaditsTerverifikasi[]> {
  const detected = extractHaditsDariNarasi(narasi)
  if (detected.length === 0) return []
  
  // Parallel verification
  const results = await Promise.all(
    detected.map(d => verifikasiHadits(d, origin))
  )
  
  return results
}
