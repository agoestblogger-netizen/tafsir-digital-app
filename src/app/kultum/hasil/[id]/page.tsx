"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KultumResultView } from '@/components/specific/KultumResultView'
import { KhotbahJumatView, KhotbahJumatOutput } from '@/components/specific/KhotbahJumatView'
import { KultumOutput } from '@/app/api/kultum-generator/route'
import { Loader2 } from 'lucide-react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { KultumReferensi } from '@/lib/kultum-references'
import { resolveAyatPlaceholders, resolvePlaceholdersInString, fetchAyatWithFallback } from '@/lib/resolve-ayat-placeholders'
import { BackButton } from '@/components/ui/BackButton'
import { SURAH_NAME_TO_ID } from '@/lib/surah-map'

const extractString = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return val.teks ?? val.text ?? val.konten ?? val.isi ?? 
           val.paragraf ?? JSON.stringify(val)
  }
  return String(val)
}

function normalizeKonten(raw: any, meta?: { format?: string; tema?: string; judul?: string; gaya_bahasa?: string; durasi_menit?: number; referensi_dipilih?: any }) {
  if (!raw) return null

  // Normalisasi jika menggunakan format Kisah Baru
  if (raw.pembuka || raw.ayat_pendukung || raw.penjabaran) {
    raw.bagian = {
      doa_pembuka: {
        arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
        terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.",
        sumber: "HR. Tirmidzi"
      },
      pembuka: {
        salam: "Assalamu'alaikum warahmatullahi wabarakatuh.",
        muqaddimah: raw.pembuka?.teks || "",
        pengantar_tema: ""
      },
      ayat_quran: [],
      penjabaran_tafsir: raw.penjabaran?.teks || "",
      penekanan_makna: raw.penekanan_makna?.teks || "",
      poin_utama: (raw.poin_utama ?? []).map((p: any) => ({
        judul: p.judul ?? "",
        isi: p.teks ?? ""
      })),
      kesimpulan: raw.kesimpulan?.teks || "",
      doa_penutup_majelis: {
        arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        latin: "Subhaanaka Allaahumma wa bihamdika, asyhadu al-laa ilaaha illa Anta, astaghfiruka wa atuubu ilayk",
        terjemah: "Maha Suci Engkau, ya Allah, dan dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan melainkan Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu."
      }
    }
    raw.durasi_estimasi = `${raw.durasi_menit ?? meta?.durasi_menit ?? 10} Menit`
    raw.gaya_bahasa = raw.gaya_bahasa ?? meta?.gaya_bahasa ?? 'Semi-Formal'
    raw.tema = raw.tema ?? meta?.tema ?? ''
  }

  const toArray = (v: any): any[] => {
    if (!v) return []
    if (Array.isArray(v)) return v
    if (typeof v === 'object') return Object.values(v)
    return []
  }

  // Ekstrak teks dari berbagai bentuk item
  const toTeks = (item: any): string => {
    if (!item) return ''
    if (typeof item === 'string') return item
    // Coba semua kemungkinan field teks
    return item.content ?? item.text ?? item.paragraf ?? item.paragraph ??
           item.isi ?? item.teks ?? item.konten ?? item.penjelasan ??
           item.pembukaan ?? item.pengantar ?? item.hadits ?? item.doa ??
           item.penutup ?? item.konsekuensi ?? item.tindakan ??
           item.pengertian ?? item.isi_khotbah ?? item.isi_khotbah_2 ??
           item.wasiat_taqwa ?? item.wasiat_taqwa_2 ?? ''
  }

  const makeBagian = (isiArray: any[], extraMeta?: any) => {
    // Gabungkan semua teks menjadi satu untuk analisis
    const semuaTeks = isiArray.map(toTeks).filter(Boolean)

    // Pisahkan: paragraf pertama = pembuka, terakhir = penutup, tengah = poin utama
    const pembukaTeks = semuaTeks[0] ?? ''
    const penutupTeks = semuaTeks[semuaTeks.length - 1] ?? ''
    const tengahArray = isiArray.slice(1, -1)

    // Gabungkan tengah jadi penjabaran & tafsir (paragraf panjang)
    const penjabaranTeks = tengahArray
      .map(toTeks)
      .filter(Boolean)
      .join('\n\n')

    return {
      doa_pembuka: {
        arab: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلاَ إِلَهَ غَيْرُكَ',
        latin: 'Subhanakallahumma wabihamdika watabarakasmuka wata\'ala jadduka wala ilaha ghairuk',
        terjemah: 'Maha Suci Engkau ya Allah, dengan memuji-Mu, Maha Berkah nama-Mu, Maha Tinggi keagungan-Mu, dan tidak ada Tuhan selain Engkau.',
        sumber: 'Doa Pembuka Majelis — HR. Abu Dawud & At-Tirmidzi'
      },
      pembuka: {
        salam: "Assalamu'alaikum warahmatullahi wabarakatuh",
        muqaddimah: '',
        pengantar_tema: pembukaTeks
      },
      ayat_quran: [], // placeholder — diisi dari resolve [[AYAT]] yang sudah berjalan
      penjabaran_tafsir: penjabaranTeks, // ← ini yang muncul sebagai paragraf panjang
      hadits_pendukung: [],
      penekanan_makna: '',
      poin_utama: [], // kosongkan — konten sudah masuk penjabaran_tafsir
      penutup: {
        kesimpulan: penutupTeks,
        ajakan: '',
        doa_penutup_konten: extraMeta?.doa_penutup ?? ''
      },
      doa_penutup_majelis: {
        arab: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
        latin: "Subhanakallahumma wabihamdika asyhadu allaa ilaaha illaa anta astaghfiruka wa'atuubu ilaik",
        terjemah: 'Maha Suci Engkau ya Allah, dengan memuji-Mu aku bersaksi tidak ada Tuhan selain Engkau, aku memohon ampunan-Mu dan bertaubat kepada-Mu.',
        sumber: 'HR. Tirmidzi No. 3433'
      }
    }
  }

  const makeResult = (judul: string, isiArray: any[], extraMeta?: any) => ({
    judul: judul || meta?.judul || 'Kultum',
    format: meta?.format ?? raw.format ?? 'kultum',
    tema: raw.tema ?? meta?.tema ?? '',
    gaya_bahasa: raw.gaya_bahasa ?? meta?.gaya_bahasa ?? 'Semi-Formal',
    durasi_estimasi: raw.durasi_menit
      ? `${raw.durasi_menit} menit`
      : meta?.durasi_menit ? `${meta.durasi_menit} menit` : '',
    bagian: {
      ...makeBagian(isiArray, extraMeta),
      // Field tambahan dari format baru
      penekanan_makna: raw.penekanan_makna ?? '',
      kesimpulan: raw.kesimpulan ?? '',
      ajakan_penutup: raw.ajakan_penutup ?? '',
      doa_quran_penutup: raw.doa_quran_penutup ?? [],
      doa_sapu_jagad: raw.doa_sapu_jagad ?? 'Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina azabannar',
      penutup: {
        kesimpulan: raw.kesimpulan ?? '',
        ajakan: raw.ajakan_penutup ?? '',
        doa_penutup_konten: raw.doa_penutup ?? ''
      }
    }
  })

  // ── Format 0: sudah normalized ──
  if (raw?.bagian?.doa_pembuka) {
    return {
      ...raw,
      khotbah_pertama: raw.khotbah_pertama ?? raw.bagian?.khotbah_pertama,
      khotbah_kedua: raw.khotbah_kedua ?? raw.bagian?.khotbah_kedua
    }
  }

  // ── Format 1: khotbah_jumat { khotbah_pertama, khotbah_kedua } ──
  if (raw?.khotbah_pertama || raw?.khotbah_kedua) {
    const kp = raw.khotbah_pertama || {}
    const kk = raw.khotbah_kedua || {}

    // Extract all user selected doa descriptors to make sure we only filter selected prayers
    const doaMatches = new Set<string>()
    if (meta?.referensi_dipilih) {
      const rawRefs = meta.referensi_dipilih
      const flatRefs: any[] = []
      if (Array.isArray(rawRefs)) {
        flatRefs.push(...rawRefs)
      } else {
        const obj = rawRefs || {}
        if (obj.doa_quran) flatRefs.push(...obj.doa_quran)
        if (obj.doa) flatRefs.push(...obj.doa)
      }

      flatRefs.forEach((r: any) => {
        const d = r.data ?? r
        const isDoa = r.type === 'doa_quran' || r.type === 'doa' || (!d.teks_arab && d.arab && !d.surah_nama)
        if (isDoa) {
          if (r.id) doaMatches.add(String(r.id).toLowerCase())
          if (d.id) doaMatches.add(String(d.id).toLowerCase())
          
          const refStr = String(d.referensi ?? d.judul ?? '').toLowerCase()
          const match = refStr.match(/(\d+)\s*:\s*(\d+)/)
          if (match) {
            doaMatches.add(`${match[1]}:${match[2]}`)
          }
          if (d.referensi) doaMatches.add(d.referensi.toLowerCase().trim())
          if (d.judul) doaMatches.add(d.judul.toLowerCase().trim())
        }
      })
    }

    const normalizeAyatPendukung = (ayatList: any[]) => {
      if (!Array.isArray(ayatList)) return []
      return ayatList.filter(a => {
        // Buang jika tidak punya teks_arab/arab DAN tidak punya terjemah
        if (!a.teks_arab && !a.arab && !a.terjemah && !a.referensi) return false

        // Check if matching any doa in doaMatches
        const idStr = String(a.id ?? '').toLowerCase()
        if (idStr && doaMatches.has(idStr)) return false

        const refStr = String(a.referensi || a.sumber || '').toLowerCase().trim()
        if (refStr && doaMatches.has(refStr)) return false

        // Parse surah:ayat dari reference
        const match = refStr.match(/(\d+)\s*:\s*(\d+)/)
        if (match && doaMatches.has(`${match[1]}:${match[2]}`)) return false

        // Parse surah:ayat dari placeholder di arab
        const arabStr = String(a.arab || a.teks_arab || '')
        const phMatch = arabStr.match(/\[\[AYAT:(\d+):(\d+)\]\]/)
        if (phMatch && doaMatches.has(`${phMatch[1]}:${phMatch[2]}`)) return false

        return true
      })
    }

    const normalizedKP = {
      wasiat_taqwa: kp.wasiat_taqwa || '',
      ayat_quran: normalizeAyatPendukung(kp.ayat_pendukung || kp.ayat_quran || []).map((a: any) => ({
        arab: a.teks_arab || a.arab || '',
        latin: a.latin || '',
        terjemah: a.terjemah || '',
        referensi: a.sumber || a.referensi || '',
        type: a.type
      })),
      isi_khotbah: kp.isi_utama || kp.isi_khotbah || '',
      poin_utama: (kp.poin_utama || []).map((p: any) => ({
        judul: p.judul || '',
        paragraf: p.paragraf || p.isi || ''
      })),
      penekanan_makna: kp.penutup || kp.penekanan_makna || ''
    }

    const normalizedKK = {
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

    const arr1 = toArray(normalizedKP)
    const arr2 = toArray(normalizedKK)
    const res = makeResult(raw.judul || meta?.judul, [...arr1, ...arr2])
    return {
      ...res,
      khotbah_pertama: normalizedKP,
      khotbah_kedua: normalizedKK
    }
  }

  // ── Format 2: { kultum: { judul, isi: [...] } } ──
  if (raw?.kultum?.isi) {
    return makeResult(raw.kultum.judul ?? raw.judul, toArray(raw.kultum.isi), { doa_penutup: raw.kultum.doa_penutup })
  }

  // ── Format 3: { khotbah: { tema, isi: [...] } } ──
  if (raw?.khotbah?.isi) {
    return makeResult(raw.khotbah.judul ?? raw.judul, toArray(raw.khotbah.isi))
  }

  // ── Format 4: { konten: [...] } array ──
  if (Array.isArray(raw?.konten)) {
    return makeResult(raw.judul, raw.konten)
  }

  // ── Format 6: { isi: [...] } flat — format baru yang konsisten ──
  if (Array.isArray(raw?.isi)) {
    return makeResult(
      raw.judul ?? raw.title,
      raw.isi,
      { doa_penutup: raw.doa_penutup }
    )
  }

  // ── Format 7: object dengan poin_utama_N keys ──
  const poinKeys = Object.keys(raw).filter(k => k.startsWith('poin_utama'))
  if (poinKeys.length > 0) {
    const isiArray = poinKeys.map(k => ({ isi: raw[k] }))
    return makeResult(raw.judul, isiArray)
  }

  // ── Format: { ceramah: { judul, isi: [{section, content}] } } ──
  // atau { tausiyah: {...} } atau key apapun yang nilai-nya punya field isi/content
  const wrapperKeys = ['ceramah', 'tausiyah', 'kajian', 'materi', 'pidato']
  for (const key of wrapperKeys) {
    if (raw?.[key]) {
      const wrapper = raw[key]
      const isiArr = toArray(wrapper.isi ?? wrapper.content ?? wrapper.contents ?? [])
      if (isiArr.length > 0) {
        return makeResult(
          wrapper.judul ?? wrapper.title ?? raw.judul,
          isiArr
        )
      }
    }
  }

  // ── Format: { title, content: [{part, text}] } ──
  if (Array.isArray(raw?.content)) {
    return makeResult(
      raw.title ?? raw.judul,
      raw.content
    )
  }

  console.warn('normalizeKonten: format tidak dikenali', Object.keys(raw))
  return null
}

function hitungKata(text: any): number {
  if (!text) return 0
  const str = extractString(text)
  return str.trim().split(/\s+/).filter(Boolean).length
}

function hitungTotalKata(konten: any): number {
  if (!konten) return 0
  
  const fields = []
  
  if (konten.khotbah_pertama || konten.khotbah_kedua) {
    // Format Khotbah Jumat
    fields.push(
      konten.khotbah_pertama?.wasiat_taqwa ?? '',
      konten.khotbah_pertama?.isi_khotbah ?? '',
      konten.khotbah_pertama?.penekanan_makna ?? '',
      ...(konten.khotbah_pertama?.poin_utama ?? []).map((p: any) => p.paragraf ?? p.isi ?? ''),
      konten.khotbah_kedua?.wasiat_taqwa_2 ?? '',
      konten.khotbah_kedua?.isi_khotbah_2 ?? '',
      konten.khotbah_kedua?.ajakan_penutup ?? '',
    )
  } else {
    // Format Kultum / Tausiyah / Ceramah / dll
    fields.push(
      konten.bagian?.pembuka?.muqaddimah ?? '',
      konten.bagian?.pembuka?.pengantar_tema ?? '',
      konten.bagian?.penjabaran_tafsir ?? '',
      konten.bagian?.penekanan_makna ?? '',
      konten.bagian?.kesimpulan ?? '',
      konten.bagian?.ajakan_penutup ?? '',
      konten.bagian?.penutup?.kesimpulan ?? '',
      ...(konten.bagian?.poin_utama ?? []).map((p: any) => p.isi ?? p.paragraf ?? ''),
    )
  }
  
  return fields.reduce((total, text) => total + hitungKata(text), 0)
}

function estimasiDurasi(jumlahKata: number): number {
  // Standar ceramah Islam Indonesia: ~120 kata/menit
  return Math.round(jumlahKata / 120)
}

export default function KultumHasilPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [konten, setKonten] = useState<KultumOutput | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isUsed, setIsUsed] = useState(false)
  const [referensiDipilih, setReferensiDipilih] = useState<KultumReferensi[]>([])
  
  const isResolved = React.useRef(false)

  // Menggunakan Supabase client
  const supabase = createClient()

  useEffect(() => {
    if (!id || isResolved.current) return

    const fetchData = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('kultum_history')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !data) {
        setError('Kultum tidak ditemukan atau terjadi kesalahan jaringan.')
        setLoading(false)
        return
      }

      console.log('=== FORMAT DEBUG ===')
      console.log('kultum.format:', data?.format)
      console.log('kultum.konten keys:', Object.keys(data?.konten ?? {}))
      console.log('konten raw preview:', JSON.stringify(data?.konten).slice(0, 300))
      console.log('====================')

      console.log('referensi_dipilih raw:', JSON.stringify(data.referensi_dipilih)?.slice(0, 300))
      console.log('referensi_dipilih RAW:', JSON.stringify(data.referensi_dipilih, null, 2))
      console.log('referensi_dipilih type:', typeof data.referensi_dipilih)
      console.log('hadits array:', data.referensi_dipilih?.hadits)
      console.log('hadits length:', data.referensi_dipilih?.hadits?.length)
      console.log('hadits[0] full:', JSON.stringify(data.referensi_dipilih?.hadits?.[0]))

      // 1. Parse & Normalize
      const rawKonten = data.content ?? data.konten ?? data.hasil ?? data.output ?? data.teks ?? data.body
      let rawParsed: any
      try {
        const cleaned = typeof rawKonten === 'string'
          ? rawKonten.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          : JSON.stringify(rawKonten)
        rawParsed = JSON.parse(cleaned)
      } catch {
        rawParsed = { format: data.format || 'kultum', bagian: null, teks_lengkap: rawKonten }
      }

      let referensi = data.referensi_dipilih || {}

      if (Array.isArray(referensi)) {
        referensi = {
          hadits: referensi.filter((r: any) => r.type === 'hadits').map((h: any) => ({
            arab: h.data?.arab ?? h.arab ?? h.data?.matan ?? h.matan ?? '',
            latin: h.data?.latin ?? h.latin ?? '',
            terjemah: h.data?.terjemah ?? h.terjemah ?? h.data?.matan_indo ?? h.matan_indo ?? '',
            referensi: h.judul ?? h.referensi ?? (h.data?.perawi && h.data?.nomor ? `HR. ${h.data.perawi} No. ${h.data.nomor}` : ''),
            perawi: h.data?.perawi ?? h.perawi ?? '',
            nomor: h.data?.nomor ?? h.nomor ?? '',
            syarah: h.data?.topik_nama ?? h.topik_nama ?? h.data?.bab ?? h.bab ?? h.data?.syarah ?? h.syarah ?? ''
          })),
          doa_quran: referensi.filter((r: any) => r.type === 'doa_quran').map((d: any) => ({
            arab: d.data?.arab ?? d.arab ?? '',
            latin: d.data?.latin ?? d.latin ?? '',
            terjemah: d.data?.terjemah ?? d.terjemah ?? '',
            referensi: d.data?.referensi ?? d.referensi ?? d.judul ?? '',
            konteks: d.data?.konteks ?? d.konteks ?? ''
          })),
          kisah: referensi.filter((r: any) => r.type === 'kaum_lampau').map((k: any) => ({
            ...(k.data || k),
            id: k.id,
            judul: k.judul
          })),
          ayat_sains: referensi.filter((r: any) => r.type === 'ayat_sains').map((a: any) => ({
            ...(a.data || a)
          })),
          ayat_quran_db: referensi.filter((r: any) => r.type === 'ayat_quran_db').map((a: any) => ({
            arab: a.data?.teks_arab ?? a.arab ?? a.data?.arab ?? '',
            latin: a.data?.teks_latin ?? a.latin ?? a.data?.latin ?? '',
            terjemah: a.data?.terjemah ?? a.terjemah ?? '',
            referensi: a.judul ?? a.referensi ?? '',
            surah_id: a.data?.surah_id,
            nomor_ayat: a.data?.nomor_ayat,
            surah_nama: a.data?.surah_nama_latin ?? a.data?.surah_nama ?? '',
            is_resolved: true
          }))
        }
      }

      // Inject hadits dari referensi_dipilih ke bagian.hadits_pendukung
      let haditsPendukung = (referensi.hadits ?? []).map((h: any) => ({
        arab: h.arab ?? '',
        latin: '',
        terjemah: h.terjemah ?? h.matan_indo ?? '',
        referensi: h.referensi ?? (h.perawi && h.nomor
          ? `HR. ${h.perawi.charAt(0).toUpperCase() + h.perawi.slice(1)} No. ${h.nomor}`
          : ''),
        syarah: h.topik_nama ?? h.bab ?? ''
      })).filter((h: any) => h.terjemah || h.arab)

      let ayatQuranDb = referensi.ayat_quran_db ?? []

      const normalized = normalizeKonten(rawParsed, {
        format: data.format,
        tema: data.tema,
        judul: data.judul,
        gaya_bahasa: data.gaya_bahasa,
        durasi_menit: data.durasi_menit,
        referensi_dipilih: data.referensi_dipilih
      })

      if (normalized) {
        normalized.bagian.hadits_pendukung = haditsPendukung

        // Inject field tambahan dari raw JSON output AI
        normalized.bagian.penekanan_makna = rawParsed.penekanan_makna
          ?? normalized.bagian.penekanan_makna ?? ''
        normalized.bagian.kesimpulan = rawParsed.kesimpulan
          ?? normalized.bagian.kesimpulan ?? ''
        normalized.bagian.ajakan_penutup = rawParsed.ajakan_penutup
          ?? normalized.bagian.ajakan_penutup ?? ''
        normalized.bagian.penutup = {
          ...normalized.bagian.penutup,
          kesimpulan: rawParsed.kesimpulan ?? normalized.bagian.penutup?.kesimpulan ?? '',
          ajakan: rawParsed.ajakan_penutup ?? normalized.bagian.penutup?.ajakan ?? '',
          doa_penutup_konten: rawParsed.doa_penutup ?? normalized.bagian.penutup?.doa_penutup_konten ?? ''
        }

        // Inject doa dari referensi_dipilih
        const rawDoaList = Array.isArray(referensi) 
          ? referensi.filter((r: any) => r.type === 'doa_quran') 
          : (referensi.doa_quran ?? referensi.doa ?? [])

        const doaDariReferensi = rawDoaList.map((d: any) => ({
          pengantar: d.konteks ?? d.data?.konteks
            ? `Marilah kita berdoa agar ${(d.konteks ?? d.data?.konteks).toLowerCase()}...` 
            : 'Marilah kita berdoa...',
          arab: d.arab ?? d.data?.arab ?? '',
          latin: d.latin ?? d.data?.latin ?? '',
          terjemah: d.terjemah ?? d.data?.terjemah ?? '',
          referensi: d.referensi ?? d.data?.referensi ?? d.judul ?? ''
        })).filter((d: any) => d.arab)

        const existingDoa = normalized.bagian.doa_quran_penutup ?? []
        const allDoa = [...existingDoa, ...doaDariReferensi]

        const uniqueDoa = allDoa.filter(
          (doa: any, index: number, self: any[]) =>
            index === self.findIndex((d: any) => d.arab === doa.arab)
        )

        normalized.bagian.doa_quran_penutup = uniqueDoa

        // Inject ayat dari kisah.ayat_utama ke card Ayat Qur'an Pendukung
        const ayatDariKisah = await Promise.all(
          (referensi.kisah ?? []).flatMap((k: any) =>
            (k.ayat_utama ?? []).map(async (ayat: any) => {
              let arab = ayat.teks_arab ?? ''
              let latin = ''
              let terjemah = ayat.terjemah ?? ''
              
              try {
                const res = await fetch(
                  `https://equran.id/api/v2/surat/${ayat.surah_id}`
                )
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                  throw new Error('Non-JSON response')
                }
                
                const data = await res.json()
                
                // Cari ayat berdasarkan nomorAyat
                const ayatData = data?.data?.ayat?.find(
                  (a: any) => a.nomorAyat === parseInt(ayat.nomor_ayat)
                )
                
                if (ayatData) {
                  arab = ayatData.teksArab ?? arab
                  latin = ayatData.teksLatin ?? ''
                  terjemah = ayatData.teksIndonesia ?? terjemah
                }
              } catch (e) {
                console.warn('fetch ayat gagal, pakai data dari DB:', e)
              }
              
              return {
                arab,
                latin,
                terjemah,
                referensi: `QS. ${ayat.surah_nama}: ${ayat.nomor_ayat}`,
                surah_id: ayat.surah_id,
                nomor_ayat: ayat.nomor_ayat,
                surah_nama: ayat.surah_nama,
                is_resolved: true
              }
            })
          )
        )

        const existingAyat = normalized.bagian.ayat_quran ?? []
        const allAyat = [...existingAyat, ...ayatDariKisah, ...ayatQuranDb]

        if (allAyat.length > 0) {
          normalized.bagian.ayat_quran = allAyat.filter(
            (ayat: any, index: number, self: any[]) =>
              index === self.findIndex(
                (a: any) => (a.surah_id === ayat.surah_id && a.nomor_ayat === ayat.nomor_ayat) ||
                            (a.referensi && a.referensi === ayat.referensi)
              )
          )
        }

        // Fix poin_utama — skip item pertama (pembuka) dan terakhir (penutup)
        if (rawParsed.isi && Array.isArray(rawParsed.isi)) {
          const isiAll = rawParsed.isi
          
          // Item pertama = pembuka, item terakhir = penutup — skip dari poin_utama
          const isiTengah = isiAll.length > 2 ? isiAll.slice(1, -1) : isiAll
          
          normalized.bagian.poin_utama = isiTengah
            .map((item: any) => ({
              judul: item.judul ?? '',
              isi: item.paragraf ?? item.text ?? item.isi ?? ''
            }))
            .filter((p: any) => p.isi?.trim())

          // Item pertama jadi pengantar_tema di pembuka
          if (isiAll[0] && normalized.bagian.pembuka) {
            normalized.bagian.pembuka.pengantar_tema =
              isiAll[0].paragraf ?? isiAll[0].text ?? isiAll[0].isi ?? ''
          }

          // Item terakhir jadi kesimpulan di penutup (jika belum ada dari rawParsed)
          if (!rawParsed.kesimpulan && isiAll[isiAll.length - 1] && normalized.bagian.penutup) {
            normalized.bagian.penutup.kesimpulan =
              isiAll[isiAll.length - 1].paragraf ??
              isiAll[isiAll.length - 1].text ?? ''
          }
        }
      }

      if (!normalized) {
        setError('Format data tidak didukung.')
        setLoading(false)
        return
      }

      // 2. Metadata
      setIsFavorite(data.is_favorit)
      setIsUsed(data.sudah_digunakan)
      // Normalize referensi_dipilih to always be a flat array for state/components
      const flatReferensi = Array.isArray(data.referensi_dipilih)
        ? data.referensi_dipilih
        : (() => {
            const obj = data.referensi_dipilih || {}
            const list: any[] = []
            if (obj.hadits) {
              list.push(...obj.hadits.map((h: any) => ({
                id: h.id ?? `hadits-${h.nomor}`,
                type: 'hadits',
                judul: h.referensi || `HR. ${h.perawi} No. ${h.nomor}`,
                deskripsi_singkat: h.terjemah,
                data: h
              })))
            }
            if (obj.doa_quran) {
              list.push(...obj.doa_quran.map((d: any) => ({
                id: d.id ?? `doa-${d.judul}`,
                type: 'doa_quran',
                judul: d.judul || 'Doa',
                deskripsi_singkat: d.terjemah,
                data: d
              })))
            }
            if (obj.ayat_sains) {
              list.push(...obj.ayat_sains.map((a: any) => ({
                id: a.id ?? `ayat-sains-${a.surah_id}-${a.nomor_ayat}`,
                type: 'ayat_sains',
                judul: a.judul || 'Ayat Sains',
                deskripsi_singkat: a.terjemah,
                data: a
              })))
            }
            if (obj.kisah) {
              list.push(...obj.kisah.map((k: any) => ({
                id: k.id ?? k.slug,
                type: 'kaum_lampau',
                judul: k.nama || k.judul,
                deskripsi_singkat: k.ringkasan,
                data: k
              })))
            }
            if (obj.tokoh_sains) {
              list.push(...obj.tokoh_sains.map((t: any) => ({
                id: t.id ?? `tokoh-${t.nama}`,
                type: 'tokoh_sains',
                judul: t.nama || 'Tokoh Sains',
                deskripsi_singkat: t.deskripsi_singkat,
                data: t
              })))
            }
            return list
          })()

      setReferensiDipilih(flatReferensi)
      isResolved.current = true

      // 3. Resolve Placeholders
      if (normalized.bagian) {
        console.log('Resolving placeholders from all fields...')
        
        // Save ayat dari kisah sebelum resolve
        const ayatDariKisahBackup = [...(normalized.bagian.ayat_quran ?? [])]

        // Tambahkan field khotbah Jumat
        const khotbahPertamaAyat = (normalized?.khotbah_pertama?.ayat_quran ?? [])
          .map((a: any) => a.arab ?? '')

        // Kumpulkan semua teks yang perlu di-resolve
        const allFieldsToResolve = [
          normalized.bagian.pembuka?.pengantar_tema ?? '',
          normalized.bagian.penjabaran_tafsir ?? '',
          normalized.bagian.penekanan_makna ?? '',
          normalized.bagian.penutup?.kesimpulan ?? '',
          ...(normalized.bagian.poin_utama ?? []).map((p: any) => p.isi ?? ''),
          // Khotbah Jumat fields
          normalized.khotbah_pertama?.wasiat_taqwa ?? '',
          normalized.khotbah_pertama?.isi_khotbah ?? '',
          normalized.khotbah_pertama?.penekanan_makna ?? '',
          ...(normalized.khotbah_pertama?.poin_utama ?? []).map((p: any) => p.paragraf ?? ''),
          normalized.khotbah_kedua?.wasiat_taqwa_2 ?? '',
          normalized.khotbah_kedua?.isi_khotbah_2 ?? '',
          normalized.khotbah_kedua?.ajakan_penutup ?? '',
          ...(normalized.khotbah_kedua?.doa_quran_penutup ?? []).map((d: any) => d.arab ?? ''),
          ...khotbahPertamaAyat,
        ]

        const allTeks = allFieldsToResolve.join(' ')

        // Ekstrak semua placeholder unik
        const matches = [...new Set(
          allTeks.match(/\[\[AYAT:(\d+):(\d+)\]\]/g) ?? []
        )]

        // Fetch data tiap ayat dan kumpulkan untuk card
        const ayatCards: any[] = []
        for (const ph of matches) {
          const m = ph.match(/\[\[AYAT:(\d+):(\d+)\]\]/)
          if (!m) continue
          const [_, surah, ayat] = m
          try {
            const res = await fetch(`https://equran.id/api/v2/surat/${surah}`)
            
            // Cek apakah response adalah JSON
            const contentType = res.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('API returned non-JSON response')
            }
            
            const json = await res.json()
            const ayatData = json.data?.ayat?.find((a: any) => a.nomorAyat === Number(ayat))
            if (ayatData) {
              ayatCards.push({
                arab: ayatData.teksArab,
                latin: ayatData.teksLatin,
                terjemah: ayatData.teksIndonesia,
                sumber: `QS. ${json.data?.namaLatin}: ${ayat}`,
                tafsir: '',
                is_resolved: true
              })
            }
          } catch (e) {
            console.warn('fetch placeholder ayat gagal:', e)
          }
        }

        // Setelah resolve selesai
        const normalizedResolve = ayatCards.map((a: any) => ({
          ...a,
          referensi: a.referensi ?? a.sumber ?? '',
        }))

        // Helper: normalize nama surah → lookup id
        const resolveSurahId = (surahName: string): number | null => {
          // Bersihkan: lowercase, hapus "QS.", hapus apostrophe, trim spasi, ganti spasi/underscore dengan strip (-)
          const clean = surahName
            .toLowerCase()
            .replace(/^qs\.?\s*/i, '')
            .replace(/[':]/g, '')
            .replace(/[\s_]+/g, '-')
            .trim()
          
          return SURAH_NAME_TO_ID[clean] ?? null
        }

        // PRIORITAS A: hasil resolve duluan
        // Build set dari hasil resolve dulu (key = surah:ayat)
        const buildKey = (a: any) => {
          let surahId = a.surah_id
          const nomorAyat = String(a.nomor_ayat ?? '').trim()
          
          // Jika surah_id tidak ada, parse dari referensi
          if (!surahId && a.referensi) {
            const match = a.referensi.match(/^(.+?)\s*:\s*(\d+)/i)
            if (match) {
              surahId = resolveSurahId(match[1])
              // Override nomor_ayat dari parsing jika belum ada
              if (!nomorAyat) {
                return `${surahId ?? 'unknown'}-${match[2]}`
              }
            }
          }
          
          if (surahId && nomorAyat) {
            return `${surahId}-${nomorAyat}`
          }
          
          // Fallback terakhir: pakai referensi sebagai key
          return `ref:${(a.referensi ?? '').toLowerCase().trim()}`
        }

        const seenKeys = new Set<string>()
        const finalAyat: any[] = []

        // 1. Masukkan SEMUA hasil resolve dulu (prioritas tinggi)
        for (const ayat of normalizedResolve) {
          const key = buildKey(ayat)
          if (!seenKeys.has(key)) {
            seenKeys.add(key)
            finalAyat.push(ayat)
          }
        }

        // 2. Masukkan ayat dari kisah HANYA jika key-nya belum ada di hasil resolve
        for (const ayat of ayatDariKisahBackup) {
          const key = buildKey(ayat)
          if (!seenKeys.has(key)) {
            seenKeys.add(key)
            finalAyat.push(ayat)
          }
        }

        normalized.bagian.ayat_quran = finalAyat

        // Resolve placeholder di ayat_quran khotbah Jumat
        if (normalized?.khotbah_pertama?.ayat_quran) {
          const resolvedAyatKhotbah = await Promise.all(
            (normalized.khotbah_pertama.ayat_quran ?? []).map(async (ayat: any) => {
              if (!ayat.arab?.startsWith('[[AYAT:')) return ayat
              
              // Parse placeholder
              const match = ayat.arab.match(/\[\[AYAT:(\d+):(\d+)\]\]/)
              if (!match) return ayat
              
              const surahId = parseInt(match[1])
              const ayatNum = parseInt(match[2])
              
              try {
                // Fetch dari API Quran
                const res = await fetch(
                  `https://equran.id/api/v2/surat/${surahId}`
                )
                
                // Cek apakah response adalah JSON
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                  throw new Error('API returned non-JSON response')
                }
                
                const data = await res.json()
                const ayatData = data?.data?.ayat?.find(
                  (a: any) => a.nomorAyat === ayatNum
                )
                
                if (ayatData) {
                  return {
                    ...ayat,
                    arab: ayatData.teksArab ?? ayat.arab,
                    latin: ayatData.teksLatin ?? ayat.latin,
                    terjemah: ayatData.teksIndonesia ?? ayat.terjemah,
                    is_resolved: true
                  }
                }
              } catch (e) {
                console.error('Resolve ayat khotbah error:', e)
              }
              return ayat
            })
          )
          normalized.khotbah_pertama.ayat_quran = resolvedAyatKhotbah
        }

        // Override ayat_quran khotbah dengan ayat dari kisah jika ada
        if (referensi.kisah?.length > 0) {
          const ayatDariKisah = await Promise.all(
            referensi.kisah.flatMap((k: any) =>
              (k.ayat_utama ?? []).map(async (ayat: any) => {
                let arab = ayat.teks_arab ?? ''
                let latin = ''
                let terjemah = ayat.terjemah ?? ''
                
                try {
                  const res = await fetch(
                    `https://equran.id/api/v2/surat/${ayat.surah_id}`
                  )
                  
                  // Cek apakah response adalah JSON
                  const contentType = res.headers.get('content-type')
                  if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('API returned non-JSON response')
                  }
                  
                  const data = await res.json()
                  
                  // Cari ayat berdasarkan nomorAyat
                  const ayatData = data?.data?.ayat?.find(
                    (a: any) => a.nomorAyat === parseInt(ayat.nomor_ayat)
                  )
                  
                  if (ayatData) {
                    arab = ayatData.teksArab ?? arab
                    latin = ayatData.teksLatin ?? ''
                    terjemah = ayatData.teksIndonesia ?? terjemah
                  }
                } catch (e) {
                  // Fallback: gunakan teks_arab dari DB (meskipun tidak lengkap)
                  console.warn('fetch ayat gagal, pakai data dari DB:', e)
                  arab = ayat.teks_arab ?? ''
                }
                
                return {
                  arab,
                  latin,
                  terjemah,
                  referensi: `QS. ${ayat.surah_nama}: ${ayat.nomor_ayat}`,
                  surah_id: ayat.surah_id,
                  nomor_ayat: ayat.nomor_ayat,
                  is_resolved: true
                }
              })
            )
          )
          
          if (ayatDariKisah.length > 0 && normalized?.khotbah_pertama) {
            normalized.khotbah_pertama.ayat_quran = ayatDariKisah
          }
        }

        // Fix 2 — Resolve poin_utama — ganti placeholder dengan teks bersih (tanpa Arab)
        const resolvedPoin = (normalized.bagian.poin_utama ?? []).map((p: any) => {
          const rawIsi = p.isi ?? p.teks ?? p.paragraf ?? ''
          const str = extractString(rawIsi)
          return {
            ...p,
            isi: str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, (_: any, s: any, a: any) => 
              `(QS. ${s}: ${a})`
            )
          }
        })
        normalized.bagian.poin_utama = resolvedPoin

        // Bersihkan placeholder dari field lain agar tidak mengganggu narasi
        if (normalized.bagian.pembuka?.pengantar_tema) {
          const str = extractString(normalized.bagian.pembuka.pengantar_tema)
          normalized.bagian.pembuka.pengantar_tema = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
        }
        if (normalized.bagian.penjabaran_tafsir) {
          const str = extractString(normalized.bagian.penjabaran_tafsir)
          normalized.bagian.penjabaran_tafsir = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
        }
        if (normalized.bagian.penekanan_makna) {
          const str = extractString(normalized.bagian.penekanan_makna)
          normalized.bagian.penekanan_makna = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
        }
        if (normalized.bagian.penutup?.kesimpulan) {
          const str = extractString(normalized.bagian.penutup.kesimpulan)
          normalized.bagian.penutup.kesimpulan = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
        }

        // Bersihkan placeholder dari field Khotbah Jumat agar tidak mengganggu narasi
        if (normalized.khotbah_pertama) {
          if (normalized.khotbah_pertama.wasiat_taqwa) {
            const str = extractString(normalized.khotbah_pertama.wasiat_taqwa)
            normalized.khotbah_pertama.wasiat_taqwa = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_pertama.isi_khotbah) {
            const str = extractString(normalized.khotbah_pertama.isi_khotbah)
            normalized.khotbah_pertama.isi_khotbah = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_pertama.penekanan_makna) {
            const str = extractString(normalized.khotbah_pertama.penekanan_makna)
            normalized.khotbah_pertama.penekanan_makna = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_pertama.poin_utama) {
            normalized.khotbah_pertama.poin_utama = normalized.khotbah_pertama.poin_utama.map((p: any) => {
              const rawPara = p.paragraf ?? p.isi ?? ''
              const str = extractString(rawPara)
              return {
                ...p,
                paragraf: str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, (_: any, s: any, a: any) => `(QS. ${s}: ${a})`)
              }
            })
          }
        }
        if (normalized.khotbah_kedua) {
          if (normalized.khotbah_kedua.wasiat_taqwa_2) {
            const str = extractString(normalized.khotbah_kedua.wasiat_taqwa_2)
            normalized.khotbah_kedua.wasiat_taqwa_2 = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_kedua.isi_khotbah_2) {
            const str = extractString(normalized.khotbah_kedua.isi_khotbah_2)
            normalized.khotbah_kedua.isi_khotbah_2 = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_kedua.ajakan_penutup) {
            const str = extractString(normalized.khotbah_kedua.ajakan_penutup)
            normalized.khotbah_kedua.ajakan_penutup = str.replace(/\[\[AYAT:(\d+):(\d+)\]\]/g, '')
          }
          if (normalized.khotbah_kedua.doa_quran_penutup) {
            for (let d of normalized.khotbah_kedua.doa_quran_penutup) {
              const m = d.arab?.match(/\[\[AYAT:(\d+):(\d+)\]\]/)
              if (m) {
                const [_, surah, ayat] = m
                try {
                  const res = await fetch(`https://equran.id/api/v2/surat/${surah}`)
                  
                  // Cek apakah response adalah JSON
                  const contentType = res.headers.get('content-type')
                  if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('API returned non-JSON response')
                  }
                  
                  const json = await res.json()
                  const ayatData = json.data?.ayat?.find((a: any) => a.nomorAyat === Number(ayat))
                  if (ayatData) {
                    d.arab = ayatData.teksArab
                    d.latin = d.latin || ayatData.teksLatin
                    d.terjemah = d.terjemah || ayatData.teksIndonesia
                    d.referensi = d.referensi || `QS. ${json.data?.namaLatin}: ${ayat}`
                  }
                } catch (e) {
                  console.warn('fetch closing prayer ayat gagal:', e)
                }
              }
            }
          }
        }
      }

      // 4. Final State
      // ayat_quran selalu dari referensi user (ayatQuranDb) — tidak dari output AI
      if (normalized.bagian && ayatQuranDb.length > 0) {
        normalized.bagian.ayat_quran = ayatQuranDb
      }
      // Inject penjabaran interleaved jika ada (via sessionStorage + URL flag)
      const searchParams = new URLSearchParams(window.location.search)
      const isInterleaved = searchParams.get('interleaved') === '1'
      if (isInterleaved) {
        const interleavedStr = sessionStorage.getItem('kultum_penjabaran_interleaved')
        if (interleavedStr && normalized.bagian) {
          normalized.bagian.penjabaran_tafsir = interleavedStr
          sessionStorage.removeItem('kultum_penjabaran_interleaved')
          console.log('[id] interleaved injected, length:', interleavedStr.length)
        } else {
          console.warn('[id] interleaved=1 tapi sessionStorage kosong')
        }
      }
      console.log('Resolve done, updating view')
      setKonten({ ...normalized })
      setLoading(false)
    }

    fetchData()
  }, [id, supabase])

  const toggleFavorite = async () => {
    const newValue = !isFavorite
    setIsFavorite(newValue)
    await supabase.from('kultum_history').update({ is_favorit: newValue }).eq('id', id)
  }

  const toggleUsed = async () => {
    const newValue = !isUsed
    setIsUsed(newValue)
    await supabase.from('kultum_history').update({ sudah_digunakan: newValue }).eq('id', id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <Loader2 className="w-12 h-12 text-[var(--gold)] animate-spin" />
      </div>
    )
  }

  if (error || !konten) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-cairo text-center px-4">
        <h2 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)] mb-4">Waduh!</h2>
        <p className="font-cairo text-sm text-[var(--text2)] mb-6">{error}</p>
        <BackButton label="Kembali ke Generator" overrideUrl="/kultum" />
      </div>
    )
  }

  const totalKata = hitungTotalKata(konten)
  const estimasi = estimasiDurasi(totalKata)
  const durasiUser = konten.durasi_estimasi ?? ''
  const targetMenit = parseInt((durasiUser || '0').replace(/[^0-9]/g, '')) || 0
  const selisih = Math.abs(estimasi - targetMenit)

  const metricsSection = (
    <div className="flex items-center justify-center gap-6 py-4 border-t border-[var(--gold-border)]/20 text-center">
      <div className="space-y-1">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text3)] font-cinzel">Jumlah Kata</div>
        <div className="text-lg font-bold text-[var(--gold)] font-cairo">
          {totalKata.toLocaleString('id-ID')} kata
        </div>
      </div>
      <div className="w-px h-8 bg-[var(--gold-border)]" />
      <div className="space-y-1">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text3)] font-cinzel">Estimasi Durasi</div>
        <div className="text-lg font-bold text-[var(--gold)] font-cairo">
          ~{estimasi} menit
        </div>
      </div>
      {targetMenit > 0 && (
        <>
          <div className="w-px h-8 bg-[var(--gold-border)]" />
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text3)] font-cinzel">Target</div>
            <div className={`text-lg font-bold font-cairo ${
              selisih <= 3
                ? 'text-[var(--teal-300)]'
                : selisih <= 7
                ? 'text-amber-400'
                : 'text-[var(--rose)]'
            }`}>
              {durasiUser}
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (konten.format === 'khotbah_jumat') {
    return (
      <ErrorBoundary>
        <KhotbahJumatView 
          konten={konten as unknown as KhotbahJumatOutput} 
          recordId={id}
          isSaved={true}
          isFavorite={isFavorite}
          isUsed={isUsed}
          onToggleFavorite={toggleFavorite}
          onToggleUsed={toggleUsed}
          referensiDipilih={referensiDipilih}
          metricsSection={metricsSection}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <KultumResultView 
        konten={konten} 
        recordId={id}
        isSaved={true}
        isFavorite={isFavorite}
        isUsed={isUsed}
        onToggleFavorite={toggleFavorite}
        onToggleUsed={toggleUsed}
        referensiDipilih={referensiDipilih}
        metricsSection={metricsSection}
      />
    </ErrorBoundary>
  )
}
