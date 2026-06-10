"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share2, Star, CheckCircle, RefreshCcw, ArrowLeft, BookOpen, ScrollText, PlayCircle } from 'lucide-react'
import { KultumOutput } from '@/app/api/kultum-generator/route'

interface KultumReferensi {
  id: string
  judul: string
  deskripsi_singkat: string
  type: string
  data?: any
}

interface KultumResultViewProps {
  konten: KultumOutput
  recordId?: string
  isSaved?: boolean
  isFavorite?: boolean
  isUsed?: boolean
  onToggleFavorite?: () => void
  onToggleUsed?: () => void
  referensiDipilih?: KultumReferensi[]
  metricsSection?: React.ReactNode
  format?: string
}

const toStr = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return val.teks ?? val.text ?? val.konten ?? val.isi ?? val.paragraf ?? ''
  }
  return String(val)
}

function stripSanad(terjemah: string): string {
  if (!terjemah) return ''

  let result = terjemah

  // 1. Hapus sanad perawi di AWAL saja
  //    Pola: 'Telah menceritakan ... [Nama] ... dia berkata;'
  //    Hanya potong jika diawali 'Telah/Dan telah menceritakan'
  const awalMatch = result.match(
    /^(?:Dan\s+)?[Tt]elah\s+(?:menceritakan|mengabarkan|memberitahukan)\s+kepada\s+kami[\s\S]*?(?:dia\s+berkata\s*[;:]|ia\s+berkata\s*[;:])/
  )
  if (awalMatch && awalMatch[0].length > 30) {
    const sisa = result.slice(awalMatch[0].length).trim()
    if (sisa.length > 30) result = sisa
  }

  // 2. Hapus sanad jalur KEDUA di tengah/akhir
  //    Muncul setelah matan selesai: 'Dan telah menceritakan kepada kami [X]...'
  result = result
    .replace(/\s*Dan telah\s+(?:menceritakan|mengabarkan|memberitahukan)\s+kepada\s+kami[\s\S]*/i, '')
    .replace(/\s*semakna dengan hadits[\s\S]*/i, '')
    .replace(/\s*dengan makna yang serupa[\s\S]*/i, '')

  return result.trim() || terjemah
}

function stripAyatPlaceholders(text: string): string {
  return text.replace(/\[\[AYAT:\d+:\d+\]\]/g, '').replace(/\s{3,}/g, '\n\n').trim()
}

function parseInterleavedRef(text: string): Array<{ type: 'text' | 'ref'; content: string; refIndex?: number }> {
  const parts: Array<{ type: 'text' | 'ref'; content: string; refIndex?: number }> = []
  const regex = /\[\[REF:(\d+)\]\]/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const txt = text.slice(lastIndex, match.index).trim()
      if (txt) parts.push({ type: 'text', content: txt })
    }
    parts.push({ type: 'ref', content: match[0], refIndex: parseInt(match[1]) })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    const txt = text.slice(lastIndex).trim()
    if (txt) parts.push({ type: 'text', content: txt })
  }
  return parts
}

function hasInterleavedRef(text: string): boolean {
  return /\[\[REF:\d+\]\]/.test(text)
}

function parseInterleaved(text: string): Array<{ type: 'text' | 'ayat'; content: string; surahId?: number; nomorAyat?: number }> {
  const parts: Array<{ type: 'text' | 'ayat'; content: string; surahId?: number; nomorAyat?: number }> = []
  const regex = /\[\[AYAT:(\d+):(\d+)\]\]/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index).trim() })
    }
    parts.push({ type: 'ayat', content: match[0], surahId: parseInt(match[1]), nomorAyat: parseInt(match[2]) })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex).trim() })
  }
  return parts.filter(p => p.content.length > 0)
}

const KATA_PER_MENIT = 140

const hitungKataStr = (val: any): number => {
  if (!val) return 0
  if (typeof val === 'string') {
    return val.trim().split(/\s+/).filter(Boolean).length
  }
  if (typeof val === 'object') {
    let total = 0
    for (const key of Object.keys(val)) {
      const fieldVal = val[key]
      if (typeof fieldVal === 'string') {
        total += fieldVal.trim().split(/\s+/).filter(Boolean).length
      } else if (typeof fieldVal === 'object' && fieldVal !== null) {
        total += hitungKataStr(fieldVal)
      }
    }
    return total
  }
  return 0
}

const hitungKataArray = (arr: any[] | undefined | null): number => {
  if (!arr || !Array.isArray(arr)) return 0
  return arr.reduce((total, item) => total + hitungKataStr(item), 0)
}

const formatDurasi = (kata: number): string => {
  const menit = kata / KATA_PER_MENIT
  if (menit < 1) return `~1 mnt`
  return `~${Math.round(menit)} mnt`
}

export function KultumResultView({
  konten,
  recordId,
  isSaved,
  isFavorite = false,
  isUsed = false,
  onToggleFavorite,
  onToggleUsed,
  referensiDipilih = [],
  metricsSection,
  format: propFormat
}: KultumResultViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [interleavedAyat, setInterleavedAyat] = useState<Record<string, any>>({})

  const cleanText = (text: string | undefined | null) => text?.replace(/"""/g, '').trim() ?? ''
  
  const getBadgeProps = (type: string) => {
    switch (type) {
      case 'ayat_quran_db':
        return {
          label: "Ayat Al-Qur'an",
          classes: "text-blue-400 border-blue-500/30 bg-blue-500/10"
        }
      case 'doa_quran':
        return {
          label: "Doa Al-Qur'an",
          classes: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        }
      case 'hadits':
        return {
          label: "Hadits",
          classes: "text-amber-400 border-amber-500/30 bg-amber-500/10"
        }
      case 'ayat_sains':
        return {
          label: "Ayat Sains",
          classes: "text-teal-400 border-teal-500/30 bg-teal-500/10"
        }
      case 'tokoh_sains':
        return {
          label: "Tokoh Sains",
          classes: "text-purple-400 border-purple-500/30 bg-purple-500/10"
        }
      case 'kisah':
      case 'kaum_lampau':
        return {
          label: "Kisah Al-Qur'an",
          classes: "text-orange-400 border-orange-500/30 bg-orange-500/10"
        }
      default:
        return {
          label: "Referensi",
          classes: "text-white/60 border-white/10 bg-white/5"
        }
    }
  }
  
  const isValidText = (val: any): boolean => {
    if (!val) return false
    if (typeof val === 'string') return val.trim().length > 0
    if (typeof val === 'object') {
      const str = val.teks ?? val.text ?? val.konten ?? val.isi ?? val.paragraf ?? ''
      return typeof str === 'string' && str.trim().length > 0
    }
    return false
  }

  const getSeksiList = (konten: any, format: string) => {
    const bagian = konten?.bagian || {}
    if (format === 'khotbah_jumat') {
      const doaPilihan = Array.isArray(konten?.khotbah_kedua?.doa_quran_penutup) ? konten.khotbah_kedua.doa_quran_penutup : []
      return [
        // Khotbah Pertama
        { id: 'hamdalah',         label: 'Hamdalah & Tasyahud',    kata: 70 }, // hardcoded ritual words
        { id: 'wasiat_1',         label: 'Wasiat Taqwa I',         kata: hitungKataStr(konten?.khotbah_pertama?.wasiat_taqwa) },
        { id: 'ayat_khotbah',     label: 'Ayat & Hadits',          kata: hitungKataArray(konten?.khotbah_pertama?.ayat_quran || konten?.khotbah_pertama?.ayat) },
        { id: 'isi_khotbah_1',    label: 'Isi Khotbah Pertama',    kata: hitungKataStr(konten?.khotbah_pertama?.isi_khotbah || konten?.khotbah_pertama?.isi) },
        { id: 'poin_utama',       label: 'Poin Utama',             kata: hitungKataArray(konten?.khotbah_pertama?.poin_utama) },
        { id: 'penekanan_makna',  label: 'Penekanan Makna',        kata: hitungKataStr(konten?.khotbah_pertama?.penekanan_makna) },
        { id: 'penutup_khotbah1', label: 'Penutup Khotbah 1',      kata: 20 }, // hardcoded ritual words
        // Khotbah Kedua
        { id: 'pembuka_khotbah2', label: 'Khotbah Kedua',          kata: 25 }, // hardcoded ritual words
        { id: 'wasiat_2',         label: 'Wasiat Taqwa II',        kata: hitungKataStr(konten?.khotbah_kedua?.wasiat_taqwa_2) },
        { id: 'isi_khotbah_2',    label: 'Isi Khotbah Kedua',      kata: hitungKataStr(konten?.khotbah_kedua?.isi_khotbah_2 || konten?.khotbah_kedua?.isi) },
        { id: 'ajakan_penutup',   label: 'Ajakan Penutup',         kata: hitungKataStr(konten?.khotbah_kedua?.ajakan_penutup) },
        { id: 'doa_khotbah',      label: 'Doa Penutup & Ritual',   kata: 150 + hitungKataArray(doaPilihan) }, // hardcoded ritual + custom doa
      ].filter(s => s.kata > 0)
    }

    // Default: kultum / ceramah
    return [
      { id: 'doa_pembuka',     label: 'Doa Pembuka',        kata: hitungKataStr(bagian?.doa_pembuka) },
      { id: 'pembuka',         label: 'Pembukaan',           kata: hitungKataStr(bagian?.pembuka) },
      { id: 'ayat_pendukung',  label: 'Ayat Al-Qur\'an',    kata: hitungKataArray(bagian?.ayat_quran || bagian?.ayat_pendukung) },
      { id: 'hadits_pendukung',label: 'Hadits Pendukung',   kata: hitungKataArray(bagian?.hadits_pendukung) },
      { id: 'penjabaran',      label: 'Penjabaran & Tafsir', kata: hitungKataStr(bagian?.penjabaran_tafsir || bagian?.penjabaran) },
      { id: 'penekanan_makna', label: 'Penekanan Makna',     kata: hitungKataStr(bagian?.penekanan_makna) },
      { id: 'poin_utama',      label: 'Poin Utama',          kata: hitungKataArray(bagian?.poin_utama) },
      { id: 'kesimpulan',      label: 'Kesimpulan',          kata: hitungKataStr(bagian?.kesimpulan ?? bagian?.penutup?.kesimpulan) },
      { id: 'doa_penutup',     label: 'Doa Penutup',         kata: hitungKataStr(bagian?.doa_penutup_majelis) + hitungKataArray(bagian?.doa_quran_penutup) },
    ].filter(s => s.kata > 0)
  }

  const format = propFormat || konten.format || ''
  const seksiList = getSeksiList(konten, format)
  const totalKata = seksiList.reduce((sum, s) => sum + s.kata, 0)

  useEffect(() => {
    const updateHeights = () => {
      seksiList.forEach(s => {
        const leftEl = document.getElementById(`row-${s.id}`)
        const rightEl = document.getElementById(`dur-${s.id}`)
        if (leftEl && rightEl) {
          rightEl.style.height = leftEl.offsetHeight + 'px'
        }
      })
    }

    const timer = setTimeout(updateHeights, 300)
    window.addEventListener('resize', updateHeights)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateHeights)
    }
  }, [konten, seksiList])

  useEffect(() => {
    const text = toStr(konten.bagian?.penjabaran_tafsir)
    const regex = /\[\[AYAT:(\d+):(\d+)\]\]/g
    
    // Buat whitelist dari ayat yang sudah ada di konten.bagian.ayat_quran
    const allowedKeys = new Set([
      // Dari konten.bagian.ayat_quran (sudah resolved dengan surah_id)
      ...(konten.bagian?.ayat_quran ?? []).map((a: any) => {
        const surahId = a.surah_id
        const nomorAyat = a.nomor_ayat
        if (surahId && nomorAyat) return `${surahId}:${nomorAyat}`
        return null
      }),
      // Fallback dari referensiDipilih
      ...referensiDipilih
        .filter((r: any) => r.type === 'ayat_quran_db')
        .map((r: any) => {
          const d = r.data ?? r
          const surahId = d.surah_id ?? d.surahId
          const nomorAyat = d.nomor_ayat ?? d.nomorAyat
          if (surahId && nomorAyat) return `${surahId}:${nomorAyat}`
          return null
        }),
    ].filter(Boolean))

    let match
    while ((match = regex.exec(text)) !== null) {
      const surahId = parseInt(match[1])
      const nomorAyat = parseInt(match[2])
      const key = `${surahId}:${nomorAyat}`

      // Hanya fetch jika ada di whitelist referensi yang dipilih
      if (!allowedKeys.has(key)) continue

      fetch(`/api/ayat-by-id?surah_id=${surahId}&nomor_ayat=${nomorAyat}`)
        .then(r => r.json())
        .then(data => setInterleavedAyat(prev => ({ ...prev, [key]: data })))
        .catch(() => {})
    }
  }, [konten])

  const handleCopyAll = () => {
    let fullText = `${toStr(konten.judul)}\n(${toStr(konten.format)} - ${toStr(konten.durasi_estimasi)})\n\n`
    
    // Doa Pembuka
    fullText += `[Doa Pembuka]\n${toStr(konten.bagian?.doa_pembuka?.arab)}\n${toStr(konten.bagian?.doa_pembuka?.latin)}\nArtinya: ${toStr(konten.bagian?.doa_pembuka?.terjemah)}\n\n`
    
    // Pembuka
    fullText += `[Pembukaan]\n${toStr(konten.bagian?.pembuka?.salam)}\n${toStr(konten.bagian?.pembuka?.muqaddimah).replace(/^Assalamu[''\u2019]?alaikum\s*wa\s*rahmatullahi\s*wa\s*barakatuh[.,]?\s*/i, '').replace(/^Assalamu[''\u2019]?alaikum\s+warahmatullahi\s+wabarakatuh[.,]?\s*/i, '')}\n${toStr(konten.bagian?.pembuka?.pengantar_tema)}\n\n`
    
    // Ayat
    ;(konten.bagian?.ayat_quran ?? []).forEach(a => {
      fullText += `[Ayat Al-Qur'an]\n${toStr(a.arab)}\n${toStr(a.latin)}\nArtinya: ${toStr(a.terjemah)}\n(${toStr(a.referensi)})\n\n`
    })

    // Tafsir
    fullText += `[Penjabaran Tafsir]\n${toStr(konten.bagian?.penjabaran_tafsir)}\n\n`

    // Hadits
    ;(konten.bagian?.hadits_pendukung ?? []).forEach(h => {
      fullText += `[Hadits Pendukung]\n${toStr(h.arab)}\n${toStr(h.latin)}\nArtinya: ${toStr(h.terjemah)}\n(${toStr(h.referensi)})\n\n`
    })

    // Penekanan Makna
    fullText += `[Penekanan Makna]\n${toStr(konten.bagian?.penekanan_makna)}\n\n`

    // Poin Utama
    fullText += `[Poin-poin Utama]\n`
    ;(konten.bagian?.poin_utama ?? []).forEach((p, i) => {
      fullText += `${i+1}. ${toStr(p.judul)}\n   ${toStr(p.isi)}\n`
    })
    fullText += '\n'

    // Penutup
    const kesimpulan = toStr(konten.bagian?.kesimpulan || konten.bagian?.penutup?.kesimpulan)
    const ajakan = toStr(konten.bagian?.ajakan_penutup || konten.bagian?.penutup?.ajakan)
    const doaPenutup = toStr(konten.bagian?.doa_penutup_tema || konten.bagian?.penutup?.doa_penutup_konten)
    fullText += `[Penutup]\n${kesimpulan}\n${ajakan}\n${doaPenutup}\n\n`

    // Doa Majelis
    fullText += `[Kaffaratul Majelis]\n${toStr(konten.bagian?.doa_penutup_majelis?.arab)}\n${toStr(konten.bagian?.doa_penutup_majelis?.latin)}\nArtinya: ${toStr(konten.bagian?.doa_penutup_majelis?.terjemah)}\n`

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share && recordId) {
      try {
        await navigator.share({
          title: toStr(konten.judul),
          text: `Baca ${toStr(konten.format)} menarik dengan tema: ${toStr(konten.tema)}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      handleCopyAll()
    }
  }

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Action Bar Float */}
      <div className="sticky top-0 z-50 bg-[var(--dark)]/80 backdrop-blur-xl border-b border-[var(--gold-border)] p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar pr-6">
          <div className="flex gap-2 shrink-0">
            <button onClick={() => router.push('/kultum')} className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)] rounded-xl text-sm font-semibold hover:bg-[var(--dark2)] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button onClick={handleCopyAll} className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-xl text-sm font-semibold text-[var(--gold)] hover:bg-[var(--dark2)] transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} 
              {copied ? 'Tersalin' : 'Salin Semua'}
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-xl text-sm font-semibold text-[var(--text1)] hover:bg-[var(--dark2)] transition-colors">
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
          </div>
          <div className="flex gap-2 shrink-0">
            {isSaved && onToggleFavorite && (
              <button onClick={onToggleFavorite} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${isFavorite ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-[var(--dark3)] border-[var(--gold-border)] text-[var(--text2)]'}`}>
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> Favorit
              </button>
            )}
            {isSaved && onToggleUsed && (
              <button onClick={onToggleUsed} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${isUsed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-[var(--dark3)] border-[var(--gold-border)] text-[var(--text2)]'}`}>
                <CheckCircle className={`w-4 h-4 ${isUsed ? 'fill-current' : ''}`} /> Selesai
              </button>
            )}
            <button onClick={() => router.push('/kultum')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--teal-600)] to-[var(--teal-500)] text-white rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition-transform">
              <RefreshCcw className="w-4 h-4" /> Buat Baru
            </button>
          </div>
          <div className="flex-shrink-0 w-6" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Info */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-full text-xs font-bold text-[var(--gold)] uppercase">
              {toStr(konten.format)}
            </span>
            <span className="px-3 py-1 bg-[var(--teal-900)]/50 border border-[var(--teal-500)]/30 rounded-full text-xs font-bold text-[var(--teal-200)] uppercase">
              {toStr(konten.durasi_estimasi)}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]">
            {toStr(konten.judul)}
          </h1>
          <p className="text-[var(--text2)] font-semibold">Tema: {toStr(konten.tema)}</p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_140px] gap-8 items-start">
          
          {/* Left Column: Content */}
          <div className="space-y-6 max-w-3xl mx-auto lg:mx-0 w-full">
            
            {/* 1. Doa Pembuka Majelis */}
            <div id="row-doa_pembuka">
              <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BookOpen className="w-24 h-24 text-amber-500" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">🤲 Doa Pembuka Majelis</div>
                <div className="relative z-10 space-y-4">
                  <div className="text-2xl md:text-3xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
                    {toStr(konten.bagian?.doa_pembuka?.arab)}
                  </div>
                  <div className="text-sm italic text-right text-[var(--teal-200)]">
                    {toStr(konten.bagian?.doa_pembuka?.latin)}
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
                  <div className="text-[var(--text1)] text-base font-cairo">
                    {toStr(konten.bagian?.doa_pembuka?.terjemah)}
                  </div>
                  <div className="text-xs font-bold text-[var(--gold)] pt-2">
                    Sumber: {toStr(konten.bagian?.doa_pembuka?.sumber)}
                  </div>
                </div>
              </section>
            </div>

            {/* 2. Pembuka */}
            <div id="row-pembuka">
              <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--teal-300)] mb-6">🌟 Pembukaan</div>
                <div className="space-y-4">
                  <p className="text-lg font-bold text-[var(--gold)]">{toStr(konten.bagian?.pembuka?.salam)}</p>
                  <p className="text-[var(--text1)] leading-relaxed whitespace-pre-wrap">{toStr(konten.bagian?.pembuka?.muqaddimah).replace(/Assalamu[''\u2019]?alaikum[\s\S]*?(?:barakatuh|wabarakatuh)[.,\s]*/i, '')}</p>
                  <p className="text-[var(--text1)] leading-relaxed font-semibold text-[var(--teal-100)] whitespace-pre-wrap">{toStr(konten.bagian?.pembuka?.pengantar_tema).replace(/Assalamu[''\u2019]?alaikum[\s\S]*?(?:barakatuh|wabarakatuh)[.,\s]*/i, '')}</p>
                </div>
              </section>
            </div>

            {/* 3. Ayat Al-Qur'an — disembunyikan jika mode interleaved */}
            {!hasInterleavedRef(toStr(konten.bagian?.penjabaran_tafsir)) && <div id="row-ayat_pendukung">
              <section className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 px-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Ayat Al-Qur&apos;an Pendukung
                </div>
                {(konten.bagian?.ayat_quran ?? []).map((ayat, i) => (
                  <div key={i} className="bg-[var(--dark2)] border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/60 transition-colors">
                    <div className="space-y-4">
                      <div className="text-3xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
                        {toStr(ayat.arab)}
                      </div>
                      <div className="text-sm italic text-right text-[var(--teal-200)]">
                        {toStr(ayat.latin)}
                      </div>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
                      <div className="text-[var(--text1)] text-base leading-relaxed">
                        &quot;{toStr(ayat.terjemah)}&quot;
                      </div>
                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dark3)]">
                        <span className="text-xs font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                          {toStr(ayat.referensi)}
                        </span>
                        <span className="text-xs text-[var(--text2)] italic max-w-sm text-right">
                          {toStr(ayat.tafsir_singkat)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>}

            {/* 4. Hadits Pendukung — disembunyikan jika mode interleaved */}
            {!hasInterleavedRef(toStr(konten.bagian?.penjabaran_tafsir)) && (konten.bagian?.hadits_pendukung ?? []).length > 0 && (
              <div id="row-hadits_pendukung">
                <section className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 px-2 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" /> Hadits Pendukung
                  </div>
                  {(konten.bagian?.hadits_pendukung ?? []).map((hadits, i) => (
                    <div key={i} className="bg-[var(--dark2)] border border-emerald-500/30 rounded-2xl p-6">
                      <div className="space-y-4">
                        <div className="text-2xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
                          {toStr(hadits.arab)}
                        </div>
                        <div className="text-sm italic text-right text-[var(--teal-200)]">
                          {toStr(hadits.latin)}
                        </div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
                        <div className="text-[var(--text1)] text-base leading-relaxed">
                          &quot;{stripSanad(toStr(hadits.terjemah))}&quot;
                        </div>
                        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dark3)]">
                          <span className="text-xs font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                            {toStr(hadits.referensi)}
                          </span>
                          <span className="text-xs text-[var(--text2)] italic max-w-sm text-right">
                            {toStr(hadits.syarah)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {/* 5. Penjabaran Tafsir */}
            <div id="row-penjabaran">
              <section className="bg-gradient-to-br from-[var(--dark2)] to-[var(--dark3)] border border-[var(--gold-border)] rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-4 flex items-center gap-2">
                  <ScrollText className="w-4 h-4" /> Penjabaran & Tafsir
                </div>
                <div className="space-y-5">
                  {hasInterleavedRef(toStr(konten.bagian?.penjabaran_tafsir))
                    ? parseInterleavedRef(stripAyatPlaceholders(toStr(konten.bagian?.penjabaran_tafsir))).map((part, i) => {
                        if (part.type === 'text') {
                          const isJembatan = part.content.startsWith('Dan hal ini') || part.content.startsWith('Dari ') || part.content.startsWith('Hal ini') || part.content.startsWith('Sebagaimana')
                          return isJembatan
                            ? (
                              <p key={i} className="text-[var(--text2)] leading-relaxed italic border-l-2 border-[var(--gold-border)] pl-4 whitespace-pre-wrap">
                                {part.content}
                              </p>
                            ) : (
                              <p key={i} className="text-[var(--text1)] leading-relaxed whitespace-pre-wrap">
                                {part.content}
                              </p>
                            )
                        }
                        // Gunakan referensiDipilih (flat array) untuk lookup — filter hanya ayat & hadits sesuai yang dikirim ke build-interleaved
                        const refsForInterleaved = referensiDipilih.filter((r: any) => r.type === 'ayat_quran_db' || r.type === 'hadits')
                        const refItem = refsForInterleaved[part.refIndex ?? 0]
                        const ref = refItem?.data ?? refItem
                        if (!ref) return null
                        const isHadits = refItem?.type === 'hadits' || !!(ref as any).perawi
                        // Normalize field names: ayat pakai teks_arab/teks_latin, hadits pakai arab
                        const arabText = toStr((ref as any).teks_arab ?? (ref as any).arab)
                        const latinText = toStr((ref as any).teks_latin ?? (ref as any).latin)
                        const terjemahText = isHadits
                          ? toStr((ref as any).intisari ?? (ref as any).terjemah ?? (ref as any).matan)
                          : toStr((ref as any).terjemah)
                        const referensiText = isHadits
                          ? `HR. ${(ref as any).perawi ?? ''} No. ${(ref as any).nomor ?? ''}`
                          : `QS. ${(ref as any).surah_nama_latin ?? (ref as any).surah_nama ?? ''}: ${(ref as any).nomor_ayat ?? ''}`
                        return isHadits ? (
                          <div key={i} className="bg-[var(--dark2)] border border-emerald-500/30 rounded-2xl p-5">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Hadits Pendukung</div>
                            <div className="text-xl leading-loose text-right text-[var(--gold-light)] font-amiri mb-2" dir="rtl">{arabText}</div>
                            <div className="text-sm italic text-right text-[var(--teal-200)] mb-3">{latinText}</div>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 mb-3" />
                            <div className="text-[var(--text1)] text-sm leading-relaxed">&quot;{terjemahText}&quot;</div>
                            <div className="mt-3 text-xs font-bold text-[var(--gold)]">{referensiText}</div>
                          </div>
                        ) : (
                          <div key={i} className="bg-[var(--dark2)] border border-blue-500/30 rounded-2xl p-5">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3">Ayat Al-Qur&apos;an</div>
                            <div className="text-2xl leading-loose text-right text-[var(--gold-light)] font-amiri mb-2" dir="rtl">{arabText}</div>
                            <div className="text-sm italic text-right text-[var(--teal-200)] mb-3">{latinText}</div>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 mb-3" />
                            <div className="text-[var(--text1)] text-sm leading-relaxed">&quot;{terjemahText}&quot;</div>
                            <div className="mt-3 text-xs font-bold text-[var(--gold)]">{referensiText}</div>
                          </div>
                        )
                      })
                    : parseInterleaved(stripAyatPlaceholders(toStr(konten.bagian?.penjabaran_tafsir))).map((part, i) => {
                        if (part.type === 'text') {
                          return (
                            <p key={i} className="text-[var(--text1)] leading-relaxed whitespace-pre-wrap">
                              {part.content}
                            </p>
                          )
                        }
                        const key = `${part.surahId}:${part.nomorAyat}`
                        const ayat = interleavedAyat[key]
                        if (!ayat) return (
                          <div key={i} className="h-24 rounded-xl animate-pulse bg-blue-500/10 border border-blue-500/20" />
                        )
                        return (
                          <div key={i} className="bg-[var(--dark2)] border border-blue-500/30 rounded-2xl p-5">
                            <div className="text-2xl leading-loose text-right text-[var(--gold-light)] font-amiri mb-2" dir="rtl">{ayat.teks_arab}</div>
                            <div className="text-sm italic text-right text-[var(--teal-200)] mb-3">{ayat.teks_latin}</div>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 mb-3" />
                            <div className="text-[var(--text1)] text-sm leading-relaxed">&quot;{ayat.terjemah}&quot;</div>
                            <div className="mt-3 text-xs font-bold text-[var(--gold)]">QS. {ayat.surah_nama_latin}: {ayat.nomor_ayat}</div>
                          </div>
                        )
                      })
                  }
                </div>
              </section>
            </div>

            {/* 6. Penekanan Makna */}
            {konten.bagian?.penekanan_makna && (
              <div id="row-penekanan_makna">
                <section className="border-l-4 border-[var(--teal-500)] bg-[var(--dark2)] p-6 rounded-r-2xl">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--teal-300)] mb-4">💬 Penekanan Makna</div>
                  <div className="text-[var(--text1)] leading-relaxed whitespace-pre-wrap font-medium">
                    {toStr(konten.bagian?.penekanan_makna)}
                  </div>
                </section>
              </div>
            )}

            {/* 7. Poin Utama */}
            {(konten.bagian?.poin_utama ?? []).length > 0 && (
              <div id="row-poin_utama">
                <section className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 px-2">💡 Poin-Poin Utama</div>
                  <div className="grid gap-4">
                    {(konten.bagian?.poin_utama ?? []).map((poin, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-[var(--dark2)] border border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-colors">
                        <div className="w-10 h-10 shrink-0 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center font-bold text-lg font-cinzel border border-purple-500/30">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text1)] mb-2">{toStr(poin.judul)}</h3>
                          <p className="text-[var(--text2)] text-sm leading-relaxed">{toStr(poin.isi)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* 8. Penutup */}
            <div id="row-kesimpulan">
              <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">🏁 Kesimpulan & Penutup</div>
                <div className="space-y-4">
                  {(isValidText(konten.bagian?.kesimpulan) || isValidText(konten.bagian?.penutup?.kesimpulan)) && (
                    <p className="text-[var(--text1)] leading-relaxed whitespace-pre-line">
                      {cleanText(toStr(konten.bagian?.kesimpulan || konten.bagian?.penutup?.kesimpulan))}
                    </p>
                  )}
                  {(isValidText(konten.bagian?.ajakan_penutup) || isValidText(konten.bagian?.penutup?.ajakan)) && (
                    <div className="p-4 bg-[var(--teal-900)]/30 border border-[var(--teal-500)]/30 rounded-xl">
                      <p className="text-[var(--teal-100)] font-semibold text-center italic">
                        &quot;{cleanText(toStr(konten.bagian?.ajakan_penutup || konten.bagian?.penutup?.ajakan))}&quot;
                      </p>
                    </div>
                  )}
                  {(isValidText(konten.bagian?.doa_penutup_tema) || isValidText(konten.bagian?.penutup?.doa_penutup_konten)) && (
                    <p className="text-[var(--text1)] leading-relaxed pt-2 text-center">
                      {cleanText(toStr(konten.bagian?.doa_penutup_tema || konten.bagian?.penutup?.doa_penutup_konten))}
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* DOA PENUTUP — dari referensi doa yang dipilih user + doa sapu jagad */}
            <div id="row-doa-penutup" className="mt-6">
              <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">🤲 Doa Penutup</div>
                <div className="space-y-4">
                  {/* Doa dari referensi yang dipilih user (type === 'doa_quran') */}
                  {referensiDipilih
                    ?.filter((r: any) => r.type === 'doa_quran')
                    .map((r: any, i: number) => {
                      const d = r.data ?? r
                      return (
                        <div key={`doa-${i}`} className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="font-cairo text-[10px] uppercase tracking-widest text-white/40 mb-2">
                            {d.judul ?? r.judul}
                          </p>
                          {(d.arab || d.teks_arab) && (
                            <p className="font-amiri text-xl text-right leading-loose" 
                               dir="rtl" style={{ color: '#7acc50' }}>
                              {d.arab ?? d.teks_arab}
                            </p>
                          )}
                          {(d.latin || d.teks_latin) && (
                            <p className="font-cairo text-[12px] italic text-center mt-2"
                               style={{ color: '#7acc50', opacity: 0.7 }}>
                              {d.latin ?? d.teks_latin}
                            </p>
                          )}
                          {d.terjemah && (
                            <p className="font-cairo text-[13px] text-white/70 italic text-center mt-2 leading-relaxed">
                              &quot;{d.terjemah}&quot;
                            </p>
                          )}
                          {(d.referensi ?? d.surah_nama) && (
                            <p className="font-cairo text-[10px] text-white/30 text-right mt-2">
                              {d.referensi ?? `QS. ${d.surah_nama}: ${d.nomor_ayat}`}
                            </p>
                          )}
                        </div>
                      )
                    })
                  }

                  {/* Doa Sapu Jagad (template tetap) */}
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-cairo text-[10px] uppercase tracking-widest text-white/40 mb-2">
                      Doa Sapu Jagad
                    </p>
                    <p className="font-amiri text-xl text-right leading-loose" 
                       dir="rtl" style={{ color: '#C9A84C' }}>
                      رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
                    </p>
                    <p className="font-cairo text-[12px] italic text-center mt-2"
                       style={{ color: '#C9A84C', opacity: 0.7 }}>
                      Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā &apos;ażāban-nār
                    </p>
                    <p className="font-cairo text-[13px] text-white/70 italic text-center mt-2 leading-relaxed">
                      &quot;Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, 
                      dan lindungilah kami dari azab neraka.&quot;
                    </p>
                    <p className="font-cairo text-[10px] text-white/30 text-right mt-2">
                      QS. Al-Baqarah: 201
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* 9. Doa Penutup */}
            {konten.bagian?.doa_penutup_majelis && (
              <div id="row-doa_penutup">
                <section className="bg-[var(--dark3)] border border-[var(--gold-border)] rounded-2xl p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--text2)] mb-6 text-center">🤲 Kaffaratul Majelis (Penutup)</div>
                  <div className="space-y-4 text-center max-w-2xl mx-auto">
                    <div className="text-2xl leading-loose text-[var(--gold-light)] font-amiri" dir="rtl">
                      {toStr(konten.bagian?.doa_penutup_majelis?.arab)}
                    </div>
                    <div className="text-sm italic text-[var(--teal-200)]">
                      {toStr(konten.bagian?.doa_penutup_majelis?.latin)}
                    </div>
                    <div className="text-[var(--text2)] text-sm pt-2">
                      {toStr(konten.bagian?.doa_penutup_majelis?.terjemah)}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text3)] uppercase pt-4">
                      {toStr(konten.bagian?.doa_penutup_majelis?.sumber)}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 10. Referensi Dataset (Jika Ada) */}
            {referensiDipilih && referensiDipilih.length > 0 && (
              <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
                <div className="font-cinzel text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">
                  ✦ Referensi Database Internal
                </div>
                <div className="space-y-3">
                  {referensiDipilih.map((ref) => {
                    const badge = getBadgeProps(ref.type)
                    return (
                      <div key={ref.id} className="p-4 bg-[var(--dark3)] rounded-xl border border-[var(--gold-border)]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-cairo text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h4 className="font-cinzel text-sm font-bold text-[var(--text1)] mb-1">{toStr(ref.judul)}</h4>
                        <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed">{ref.type === 'hadits' ? stripSanad(toStr(ref.deskripsi_singkat)) : toStr(ref.deskripsi_singkat)}</p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {metricsSection}

          </div>

          {/* Right Column: Sticky Duration Panel */}
          <div className="hidden lg:block w-[140px] shrink-0" style={{
            borderLeft: '0.5px solid rgba(255,255,255,0.08)',
            position: 'sticky',
            top: '100px',
            alignSelf: 'start',
          }}>
            {/* Total Duration Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
              textAlign: 'left'
            }}>
              <p className="font-cairo text-[10px] text-white/40 uppercase tracking-wider m-0 mb-1">
                TOTAL EST.
              </p>
              <p className="font-cinzel text-xl font-semibold text-[var(--gold-light)] m-0 leading-none">
                {formatDurasi(totalKata)}
              </p>
              <p className="font-cairo text-[10px] text-white/30 m-0 mt-1">
                {totalKata} kata
              </p>
            </div>

            {/* Individual Section Heights synced via useEffect */}
            {seksiList.map((seksi) => (
              <div key={seksi.id} id={`dur-${seksi.id}`} style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 3,
                    height: 24,
                    borderRadius: 2,
                    background: seksi.kata > 200 ? 'var(--teal-500)' 
                      : seksi.kata > 100 ? 'rgba(255,255,255,0.3)' 
                      : 'rgba(255,255,255,0.15)',
                    flexShrink: 0,
                  }} />
                  <p className="font-cinzel text-xl font-semibold text-[var(--text1)] m-0 leading-none">
                    {formatDurasi(seksi.kata)}
                  </p>
                </div>
                <p className="font-cairo text-[10px] text-white/35 m-0 ml-[9px] mt-1">
                  {seksi.kata} kata
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
