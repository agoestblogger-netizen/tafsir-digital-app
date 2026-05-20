export function ekstrakIntiHadits(teks: string): string {
  if (!teks) return ''

  // Jika teks mengandung karakter Arab (pemeriksaan sederhana)
  const isArabic = /[\u0600-\u06FF]/.test(teks)

  if (isArabic) {
    // Keywords Arab untuk memotong sanad
    const cutKeywordsArabic = [
      'قال رسول الله', 'قَالَ رَسُولُ اللَّهِ',
      'صلى الله عليه وسلم', 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
      'يقول :', 'يَقُولُ :',
      'عن Nabi', 'عَنِ النَّبِيِّ',
    ]

    for (const kw of cutKeywordsArabic) {
      const idx = teks.indexOf(kw)
      if (idx !== -1) {
        let after = teks.slice(idx + kw.length).trim()
        // Hapus titik dua atau spasi di awal
        after = after.replace(/^[:\s،]+/, '')
        if (after.length > 10) {
          return bersihkanSisaSanad(after)
        }
      }
    }
    return bersihkanSisaSanad(teks) // fallback jika tidak ketemu keyword
  }

  // Step 1: Potong setelah kata kunci sabda + skip semua tanda kutip pembuka
  const cutKeywords = [
    'bersabda: "', 'bersabda:"', "bersabda: '", "bersabda:'",
    'berkata: "', 'berkata:"',
    'bersabda, "', 'bersabda,"',
    'beliau bersabda', 'Nabi bersabda', 'Rasulullah bersabda',
    'ia bersabda', 'dia bersabda',
    'bersabda;', 'bersabda :', 'bersabda:',
    'beliau berkata:', 'beliau berkata;',
    'Rasulullah ﷺ bersabda', 'Nabi ﷺ bersabda',
    'shallallahu \'alaihi wasallam bersabda',
    'alaihissalam berkata',
    'berkata kepada kami',
    'bahwasanya beliau berkata',
    'bahwa beliau bersabda',
    'beliau mengatakan',
    'sabdanya:', 'sabda beliau:',
    'dia berkata;', 'dia berkata:',
  ]
  for (const kw of cutKeywords) {
    const idx = teks.toLowerCase().indexOf(kw.toLowerCase())
    if (idx !== -1) {
      let after = teks.slice(idx + kw.length).trim()
      after = after.replace(/^["""':\s]+/, '')
      after = after.replace(/["""'.]+$/, '').trim()
      if (after.length > 15) {
        const final = after.length > 1000 ? after.slice(0, 1000) + '...' : after
        return bersihkanSisaSanad(final)
      }
    }
  }

  // Step 2: Cari kutipan terpanjang yang BUKAN sanad
  const sanadWordsStep2 = ['menceritakan', 'mengabarkan', 'meriwayatkan', 'memberitakan', 'berkata,']
  const allMatches = [...teks.matchAll(/["""']([\s\S]*?)["""']/g)]
  if (allMatches.length > 0) {
    const longest = allMatches
      .map(m => m[1]?.trim() || '')
      .filter(s =>
        s.length > 20 &&
        !sanadWordsStep2.some(w => s.toLowerCase().startsWith(w.toLowerCase()))
      )
      .sort((a, b) => b.length - a.length)[0]
    if (longest) {
      const final = longest.length > 1000 ? longest.slice(0, 1000) + '...' : longest
      return bersihkanSisaSanad(final)
    }
  }

  // Step 3: Hapus kalimat sanad
  const sanadWords2 = ['menceritakan', 'mengabarkan', 'meriwayatkan', 'memberitakan', 'telah berkata']
  const nonSanad = teks.split(/(?<=[.!?])\s+/)
    .filter(s =>
      s.length > 10 &&
      !sanadWords2.some(w => s.toLowerCase().includes(w))
    )
  if (nonSanad.length > 0) {
    const result = nonSanad.join(' ').trim()
    const final = result.length > 1000 ? result.slice(0, 1000) + '...' : result
    return bersihkanSisaSanad(final)
  }

  // Step 4: Jika semua gagal, cari kalimat yang dimulai dengan kata sabda langsung
  const directKeywords = ['Wahai ', 'Sesungguhnya ', 'Barangsiapa ', 'Tidaklah ', 
                          'Janganlah ', 'Hendaklah ', 'Siapa ', 'Setiap ']
  for (const kw of directKeywords) {
    const idx = teks.indexOf(kw)
    if (idx !== -1 && idx > 50) { // pastikan bukan di awal sanad
      const result = teks.slice(idx).trim()
      if (result.length > 20) {
        const final = result.length > 1000 ? result.slice(0, 1000) + '...' : result
        return bersihkanSisaSanad(final)
      }
    }
  }

  // Final fallback — ambil 500 karakter terakhir (biasanya matan ada di akhir)
  const fallback = teks.length > 200 ? teks.slice(-500) : teks
  return bersihkanSisaSanad(fallback)
}

function bersihkanSisaSanad(teks: string): string {
  let hasil = teks

  // Hapus pola [Nama bin Nama] dari sanad
  hasil = hasil.replace(/\[[^\]]+\]/g, '').trim()

  // Hapus "dari [nama] dari [nama]..." di awal
  hasil = hasil.replace(/^(dari\s+\S+\s+)+(dia berkata|ia berkata|berkata)[;:,]\s*/i, '')

  // Hapus "bah] dari..." sisa bracket yang terpotong
  hasil = hasil.replace(/^[a-z]+\]\s+(dari\s+\S+\s*)*/i, '')

  // Hapus kata penghubung sanad di awal
  hasil = hasil.replace(/^(bahwa|bahwasanya|ia berkata|dia berkata|beliau berkata)[;:,\s]+/i, '')

  // Hapus kalimat redaksi penulis seperti "Penulis menuturkan:", "Ia berkata:"
  hasil = hasil.replace(/Penulis menuturkan[;:,][^""]*/gi, '')
  hasil = hasil.replace(/Ia mengatakan[;:,][^""]*/gi, '')
  hasil = hasil.replace(/Dalam hal ini ada hadits serupa dari[^.]+\./gi, '')
  hasil = hasil.replace(/^[;:\s]+/, '') // hapus titik koma/titik dua di awal

  // Hapus teks dalam kurung yang panjang (komentar redaksi)
  hasil = hasil.replace(/\([^)]{50,}\)/g, '')

  // Hapus "atau dengan redaksi ..." dalam tanda kutip
  hasil = hasil.replace(/atau dengan redaksi\s*[-–]?\s*[^"“”]*/gi, '')

  // Hapus sanad yang muncul setelah kutipan pertama selesai
  // Pattern: setelah tanda kutip penutup, ada "Telah menceritakan..."
  const kutipanAkhir = hasil.search(/["“”]\s*(Telah|telah|Ia|ia|Beliau|beliau)\s+menceritakan/)
  if (kutipanAkhir !== -1) {
    hasil = hasil.slice(0, kutipanAkhir + 1).trim()
  }

  // Hapus "dari dari" (kata berulang sisa sanad)
  hasil = hasil.replace(/\bdari\s+dari\b/gi, '')

  // Hapus kutipan pembuka/penutup yang tersisa di awal/akhir beserta spasi
  hasil = hasil.replace(/^[\s"“”'’]+|[\s"“”'’]+$/g, '')

  // Step 5: Jika matan masih mengandung sisa sanad setelah semua pembersihan,
  // ambil hanya kalimat pertama yang bermakna (sebelum sanad muncul lagi)
  const sanadMarkers = [
    'berkata, telah',
    'telah menceritakan kepadaku',
    'telah mengabarkan kepadaku',
    'menceritakan kepada mereka',
    'dan telah menceritakan'
  ]

  for (const marker of sanadMarkers) {
    const idx = hasil.toLowerCase().indexOf(marker.toLowerCase())
    if (idx > 30) { // ada konten bermakna sebelumnya
      hasil = hasil.slice(0, idx).trim()
      // Bersihkan tanda kutip di akhir
      hasil = hasil.replace(/[\s"“”'’]+$/, '').trim()
      break
    }
  }

  // Bersihkan spasi berlebih
  hasil = hasil.replace(/\s+/g, ' ').trim()

  return hasil
}

// Alias untuk backward compatibility
export const ekstrakInti = ekstrakIntiHadits;
