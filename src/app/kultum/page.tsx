"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Mic, FileText, Settings, ArrowRight, History, PlayCircle, Clock, CheckCircle, Loader2, BookOpen, Heart, HelpCircle, User, Compass, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { cariSemuaReferensi, type KultumReferensi } from '@/lib/kultum-references'
import { KisahConfig as KisahKaumLampau, KISAH_LIST as kisahList } from '@/data/kaum_lampau_list'

const FORMAT_OPTIONS = [
  { id: 'tausiyah', label: 'Tausiyah', durasi: '2-5 menit', icon: '💬' },
  { id: 'kultum', label: 'Kultum', durasi: '5-15 menit', icon: '🎤' },
  { id: 'khotbah_jumat', label: "Khotbah Jum'at", durasi: '20-30 menit', icon: '🕌' },
  { id: 'ceramah', label: 'Ceramah', durasi: '30-60 menit', icon: '🎓' },
]
const GAYA_BAHASA = ['Formal', 'Semi-Formal', 'Santai', 'Bilingual']
const TOPIK_POPULER = [
  'Sabar & Syukur', 'Birrul Walidain', 'Rezeki & Kerja',
  'Taubat & Ampunan', 'Shalat', 'Pernikahan & Rumah Tangga',
  'Mendidik Anak', 'Ukhuwah & Persaudaraan', 'Ikhlas & Niat',
  'Akhirat & Kiamat', 'Ilmu & Pendidikan', 'Zakat & Sedekah'
]

const arabColorMap: Record<string, string> = {
  kaum_diazab: '#e05a5a',
  kisah_nabi: '#4a9eda',
  kisah_pilihan: '#7acc50',
  sirah_nabawiyah: '#9a85e0',
}
const bgColorMap: Record<string, string> = {
  kaum_diazab: '#1a0808',
  kisah_nabi: '#0d2035',
  kisah_pilihan: '#1a2a0d',
  sirah_nabawiyah: '#1a1535',
}
const labelMap: Record<string, string> = {
  kaum_diazab: 'Kaum Diazab',
  kisah_nabi: 'Kisah Nabi',
  kisah_pilihan: 'Kisah Pilihan',
  sirah_nabawiyah: 'Sirah Nabawiyah',
}
const filterKategoriMap: Record<string, string> = {
  'Semua': '',
  'Kisah Nabi': 'kisah_nabi',
  'Kaum Diazab': 'kaum_diazab',
  'Kisah Pilihan': 'kisah_pilihan',
  'Sirah Nabawiyah': 'sirah_nabawiyah',
}


type KultumHistory = {
  id: string
  judul: string
  format: string
  tema: string
  is_favorit: boolean
  sudah_digunakan: boolean
  created_at: string
}

function KultumGeneratorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [format, setFormat] = useState('kultum')
  const [karakterKultum, setKarakterKultum] = useState<'umum' | 'sains' | 'kisah'>('umum')
  const [groupVisibleCounts, setGroupVisibleCounts] = useState<Record<string, number>>({
    ayat: 8,
    hadits: 8,
    sains: 8,
    kisah: 8,
    doa: 8
  })
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({
    ayat: true,
    hadits: true,
    sains: false,
    kisah: false,
    doa: false
  })
  
  // Kisah Al-Qur'an specific states
  const [isKisahMode, setIsKisahMode] = useState(false)
  const [showKisahDropdown, setShowKisahDropdown] = useState(false)
  const [selectedKisah, setSelectedKisah] = useState<KisahKaumLampau | null>(null)
  const [kisahSearch, setKisahSearch] = useState('')
  const [kisahFilterTab, setKisahFilterTab] = useState<string>('Semua')

  const [topikBahasan, setTopikBahasan] = useState('')
  const [gayaBahasa, setGayaBahasa] = useState('Semi-Formal')
  const [durasi, setDurasi] = useState(10)
  
  const [judulList, setJudulList] = useState<string[]>([])
  const [selectedJudul, setSelectedJudul] = useState<string>('')
  const [isLoadingJudul, setIsLoadingJudul] = useState(false)

  const [semanticExpanded, setSemanticExpanded] = useState<any>(null)
  
  const referensiCache = React.useRef<Map<string, { refs: KultumReferensi[], expandData: any }>>(new Map())

  const [referensiSuggested, setReferensiSuggested] = useState<KultumReferensi[]>([])
  const [referensiReady, setReferensiReady] = useState(false)
  const [loadingReferensi, setLoadingReferensi] = useState(false)
  const [referensiDipilih, setReferensiDipilih] = useState<KultumReferensi[]>([])
  const [expandedRef, setExpandedRef] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(8)
  const [filterTipe, setFilterTipe] = useState<string>('semua')
  const LOAD_MORE_INCREMENT = 8

  const handleToggleExpand = (id: string) => {
    setExpandedRef(prev => {
      const next = prev === id ? null : id
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(`ref-card-${id}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 120)
      }
      return next
    })
  }

  const openKisahDropdown = () => {
    setKisahSearch('')
    setKisahFilterTab('Semua')
    setShowKisahDropdown(true)
  }

  useEffect(() => {
    console.log('total kisah:', kisahList.length)
  }, [])

  const getFilteredKisah = () => {
    return kisahList.filter(k => {
      const matchSearch = kisahSearch === '' || 
        k.nama.toLowerCase().includes(kisahSearch.toLowerCase())
      const matchKategori = kisahFilterTab === 'Semua' || 
        k.kategori === filterKategoriMap[kisahFilterTab]
      return matchSearch && matchKategori
    })
  }

  useEffect(() => {
    const kisahId = searchParams.get('kisah_id')
    if (kisahId) {
      const found = kisahList.find(k => k.slug === kisahId)
      if (found) {
        setIsKisahMode(true)
        setSelectedKisah(found)
      }
    }
  }, [searchParams])

  useEffect(() => {
    // Reset durasi ke default sesuai format
    const defaults: Record<string, number> = { tausiyah: 5, kultum: 10, khotbah_jumat: 25, ceramah: 45 }
    setDurasi(defaults[format.toLowerCase()] ?? 10)
  }, [format])
  
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')

  const [userId, setUserId] = useState<string | null>(null)
  const [recentHistory, setRecentHistory] = useState<KultumHistory[]>([])

  const formatLabel = (() => {
    return ({
      tausiyah: 'Tausiyah',
      kultum: 'Kultum',
      khotbah_jumat: "Khotbah Jum'at",
      ceramah: 'Ceramah',
    } as Record<string, string>)[format.toLowerCase()] ?? 'Kultum'
  })()

  const loadingSteps = [
    { icon: '🔍', title: 'Membaca Referensi', text: 'Membaca referensi yang dipilih...' },
    { icon: '🧩', title: 'Menganalisa Makna', text: 'Menganalisa makna dan konteks...' },
    { icon: '✍️', title: 'Menyusun Struktur', text: `Menyusun struktur ${formatLabel.toLowerCase()}...` },
    { icon: '📖', title: 'Menulis Naskah', text: `Menulis naskah ${formatLabel.toLowerCase()}...` },
    { icon: '✨', title: 'Finalisasi', text: 'Menyelesaikan dan memverifikasi...' },
  ]
  // Step durations: 3s, 3s, 8s, 8s, sampai API selesai
  const STEP_DELAYS = [0, 3000, 6000, 14000, 22000]

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        // Fetch recent history
        supabase
          .from('kultum_history')
          .select('id, judul, format, tema, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
          .then(({ data }) => {
            if (data) setRecentHistory((data ?? []) as KultumHistory[])
          })
      }
    })
  }, [])

  const fetchReferensi = async (topik: string) => {
    if (referensiCache.current.has(topik)) {
      const cached = referensiCache.current.get(topik)!
      setSemanticExpanded(cached.expandData)
      setReferensiSuggested(cached.refs)
      setReferensiDipilih([])
      setJudulList([])
      setSelectedJudul('')
      setReferensiReady(true)
      return
    }

    setLoadingReferensi(true)
    setReferensiReady(false)
    setReferensiSuggested([])
    setReferensiDipilih([])
    setJudulList([])
    setSelectedJudul('')
    
    try {
      const expandRes = await fetch('/api/semantic-expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: topik })
      })
      const expandData = await expandRes.json()
      setSemanticExpanded(expandData)
      
      const keywords = expandData?.keywords ?? []
      const refs = await cariSemuaReferensi(topik, keywords, {}, expandData)
      
      // Fetch semantic search references concurrently (only if topic is not in TOPIK_STANDAR)
      const TOPIK_STANDAR = ['Sabar & Syukur', 'Birrul Walidain', 'Rezeki & Kerja', 'Taubat & Ampunan', 'Shalat', 'Pernikahan & Rumah Tangga', 'Mendidik Anak', 'Ukhuwah & Persaudaraan', 'Ikhlas & Niat', 'Akhirat & Kiamat', 'Ilmu & Pendidikan', 'Zakat & Sedekah', 'Keluarga', 'Thaharah & Kebersihan', 'Jihad & Dakwah', 'Fikih Wanita']
      
      const isTopikStandar = TOPIK_STANDAR.some(t => t.toLowerCase() === topik.toLowerCase())
      
      let semanticRefs: any[] = []
      if (!isTopikStandar) {
        try {
          const semSearchRes = await fetch('/api/semantic-search-referensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: topik })
          })
          if (semSearchRes.ok) {
            const semSearchData = await semSearchRes.json()
            const rawSemRefs = [
              ...(semSearchData.ayat ?? []),
              ...(semSearchData.hadits ?? [])
            ]
            semanticRefs = rawSemRefs.map((r: any) => ({
              ...r,
              isSemanticSearch: true
            }))
          }
        } catch (semErr) {
          console.error('Error fetching semantic search references:', semErr)
        }
      } else {
        console.log(`[Semantic Search] skipped fetch because topic "${topik}" is in TOPIK_STANDAR`)
      }

      const mergedRefs = [...refs, ...semanticRefs]
      
      const referensiUnik = mergedRefs.filter((ref, index, self) =>
        index === self.findIndex(r => 
          (r.id && r.id === ref.id) || 
          ((r.data as any)?.nama_doa && (r.data as any)?.nama_doa === (ref.data as any)?.nama_doa)
        )
      )
      
      referensiCache.current.set(topik, { refs: referensiUnik, expandData })
      
      setReferensiSuggested(referensiUnik)
      setReferensiReady(true)
    } catch (err) {
      console.error('Error fetching references:', err)
    } finally {
      setLoadingReferensi(false)
    }
  }

  // Watcher untuk input free text Topik Bahasan -> fetchReferensi
  useEffect(() => {
    setVisibleCount(8)
    setFilterTipe('semua')

    if (!topikBahasan || topikBahasan.length < 3) {
      setReferensiSuggested([])
      setReferensiDipilih([])
      setJudulList([])
      setSelectedJudul('')
      setReferensiReady(false)
      return
    }
    const timer = setTimeout(() => fetchReferensi(topikBahasan), 1200)
    return () => clearTimeout(timer)
  }, [topikBahasan])

  // Watcher untuk Judul yang muncul setelah minimal 1 referensi dipilih
  useEffect(() => {
    if (referensiDipilih.length === 0) {
      setJudulList([])
      setSelectedJudul('')
      return
    }
    fetchJudulDariReferensi(referensiDipilih)
  }, [referensiDipilih]) // eslint-disable-next-line react-hooks/exhaustive-deps

  async function fetchJudulDariReferensi(referensi: any[]) {
    setIsLoadingJudul(true)
    try {
      const res = await fetch('/api/suggest-judul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topik: topikBahasan,
          referensi: referensi.slice(0, 5) // max 5 referensi untuk context
        })
      })
      const data = await res.json()
      setJudulList(data.judul ?? [])
    } catch (err) {
      console.error('Error fetching judul:', err)
      setJudulList([])
    } finally {
      setIsLoadingJudul(false)
    }
  }

  const handleGenerate = async () => {
    const temaFinal = isKisahMode
      ? (selectedKisah?.nama ?? '')
      : (selectedJudul || topikBahasan)

    if (!temaFinal) {
      setError(isKisahMode ? 'Pilih kisah Al-Qur\'an terlebih dahulu' : 'Pilih topik dan salah satu rekomendasi judul terlebih dahulu')
      return
    }

    setError('')
    setLoading(true)
    setLoadingStep(0)

    // Timer-based step progression (bukan berdasarkan API response)
    const stepTimers: ReturnType<typeof setTimeout>[] = []
    STEP_DELAYS.forEach((delay, i) => {
      if (i === 0) return // step 0 langsung dari setLoadingStep(0)
      stepTimers.push(setTimeout(() => setLoadingStep(i), delay))
    })

    // Saat build payload — gunakan referensiDipilih langsung (sudah flat array):
    const payload = {
      format,
      durasi, 
      gaya: gayaBahasa,
      judul: selectedJudul,
      topik: topikBahasan,
      kisah_id: selectedKisah?.slug ?? null,
      referensi_dipilih: referensiDipilih, // ← flat array langsung, bukan flatten lagi
    }

    console.log('PAYLOAD referensi_dipilih count:', referensiDipilih.length)
    console.log('PAYLOAD referensi_dipilih[0]:', JSON.stringify(referensiDipilih[0])?.slice(0, 100))

    try {
      console.log('format akan dikirim:', format)
      console.log('selectedKisah.id:', (selectedKisah as any)?.id || selectedKisah?.slug)
      const res = await fetch('/api/kultum-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          tema: temaFinal,
          judul_override: isKisahMode ? (selectedKisah?.nama ?? '') : selectedJudul,
          kategori_tema: isKisahMode ? 'kisah_alquran' : 'Umum',
          gaya_bahasa: gayaBahasa,
          durasi_menit: durasi,
          user_id: userId,
          referensi_dipilih: isKisahMode ? [] : referensiDipilih,
          semantic_expanded: isKisahMode ? null : semanticExpanded,
          kisah_id: isKisahMode ? (selectedKisah?.slug ?? null) : null,
          judul: isKisahMode ? (selectedKisah?.nama ?? null) : null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Gagal generate kultum (Status: ${res.status})`)
      }

      // Membaca response sebagai stream SSE
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let resultText = ''
      let finalId: string | null = null

      if (!reader) {
        throw new Error('Gagal inisialisasi reader stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        resultText += chunk
        
        // Cek apakah ada marker ID di akhir stream
        const idMarker = '---ID---'
        const markerIndex = resultText.indexOf(idMarker)
        if (markerIndex !== -1) {
          finalId = resultText.slice(markerIndex + idMarker.length).trim()
          resultText = resultText.slice(0, markerIndex)
        }
      }

      // Jika ada ID (tersimpan), redirect ke halaman hasil
      if (finalId) {
        router.push(`/kultum/hasil/${finalId}`)
      } else {
        // Jika tidak login, simpan di sessionStorage dan tampilkan inline preview
        try {
          const parsed = JSON.parse(resultText.trim())
          sessionStorage.setItem('kultum_result', JSON.stringify(parsed))
        } catch {
          // Jika gagal parse JSON, simpan text mentah
          sessionStorage.setItem('kultum_result', resultText.trim())
        }
        sessionStorage.setItem('kultum_referensi_dipilih', JSON.stringify(referensiDipilih))
        router.push('/kultum/hasil/preview')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      stepTimers.forEach(clearTimeout)
      setLoading(false)
    }
  }

  const referensiFiltered = filterTipe === 'semua'
    ? referensiSuggested
    : referensiSuggested.filter(r => r.type === filterTipe)

  const referensiTampil = referensiFiltered.slice(0, visibleCount)
  const sisanya = referensiFiltered.length - visibleCount
  const adaLagi = visibleCount < referensiFiltered.length
  const sudahDiperluas = visibleCount > 8

  return (
    <div className="min-h-screen pb-24 font-cairo">

      {/* ===== FULLSCREEN LOADING OVERLAY ===== */}
      {loading && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,13,18,0.97)', backdropFilter: 'blur(12px)' }}
        >
          {/* Radial forest glow in background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(10,107,79,0.18) 0%, transparent 70%)'
            }}
          />

          <div
            className="relative w-full max-w-lg rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(10,21,32,0.97)',
              border: '1px solid rgba(201,163,90,0.30)',
            }}
          >
            {/* Title */}
            <div className="text-center mb-7">
              <h2 className="font-cinzel text-xl font-bold tracking-widest" style={{ color: 'var(--gold-light)' }}>
                Menyusun {formatLabel}
              </h2>
              <p className="font-cairo text-xs mt-1" style={{ color: 'var(--text2)' }}>
                AI sedang bekerja — mohon tunggu sebentar
              </p>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-2 rounded-full mb-8 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--forest-green, #0A6B4F), var(--gold-light, #E8C46A))',
                  boxShadow: '0 0 12px rgba(201,163,90,0.5)',
                }}
              />
            </div>

            {/* Steps list */}
            <div className="space-y-3">
              {loadingSteps.map((step, idx) => {
                const isPast = loadingStep > idx
                const isCurrent = loadingStep === idx
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-500"
                    style={{
                      opacity: isPast ? 0.75 : isCurrent ? 1 : 0.28,
                      background: isCurrent ? 'rgba(201,163,90,0.07)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(201,163,90,0.25)' : '1px solid transparent',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300 ${isCurrent ? 'animate-pulse' : ''}`}
                      style={{
                        background: isPast
                          ? 'rgba(10,107,79,0.20)'
                          : isCurrent
                          ? 'rgba(201,163,90,0.18)'
                          : 'rgba(14,30,42,0.8)',
                        border: isPast
                          ? '1px solid rgba(10,107,79,0.40)'
                          : isCurrent
                          ? '1px solid rgba(201,163,90,0.50)'
                          : '1px solid transparent',
                        color: isPast ? '#4DC99A' : isCurrent ? 'var(--gold-light)' : 'var(--text3)',
                      }}
                    >
                      {isPast ? '✓' : step.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-cinzel text-xs font-bold uppercase tracking-wider truncate"
                        style={{ color: isPast ? 'var(--teal-300, #1aaa78)' : isCurrent ? 'var(--gold-light)' : 'var(--text3)' }}
                      >
                        {step.title}
                      </p>
                      <p className="font-cairo text-sm truncate" style={{ color: 'var(--text2)' }}>
                        {step.text}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="font-cairo text-[10px] uppercase tracking-widest font-bold shrink-0 hidden sm:block">
                      {isPast && <span style={{ color: '#4DC99A' }}>Selesai</span>}
                      {isCurrent && <span className="animate-pulse" style={{ color: 'var(--gold)' }}>Memproses</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--gold-border)]">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="font-cairo inline-flex items-center gap-2 px-3 py-1 bg-[var(--gold)]/10 border border-[var(--gold-border)] rounded-full text-xs font-bold text-[var(--gold-light)] mb-2">
            <Sparkles className="w-4 h-4" /> Powered by AI
          </div>
          <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)] mb-4">
            Kultum & Khotbah Generator
          </h1>
          <p className="font-cairo text-base text-[var(--text2)] max-w-2xl mx-auto">
            Buat materi kultum yang berkualitas dan terstruktur dengan ayat Al-Qur&apos;an serta hadits shahih secara instan.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Form Generator */}
        <section className="glass-card p-6 md:p-8 rounded-[2rem] border-[var(--gold-border)] relative overflow-hidden">


          <div className="space-y-8">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-semibold flex items-center gap-2">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            {/* Format Selection */}
            <div>
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-4">
                <Mic className="w-4 h-4" /> Format Penyampaian
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FORMAT_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`font-cairo p-3 rounded-xl border text-sm font-bold transition-all ${format === f.id ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-light)] shadow-[0_0_15px_rgba(201,163,90,0.2)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'}`}
                  >
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <span className="text-xl">{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                    <div className="font-cairo text-[10px] text-[var(--text3)] font-normal">{f.durasi}</div>
                  </button>
                ))}
              </div>
            </div>

{/* ⏱️ Durasi */}
<div className="mb-6">
  <p className="font-cinzel text-xs uppercase tracking-widest font-bold text-[var(--text2)] mb-3">⏱️ Durasi Target</p>
  <div className="flex items-center gap-3 flex-wrap">
    <input
      type="number"
      min={2}
      max={120}
      value={durasi}
      onChange={e => setDurasi(Number(e.target.value))}
      className="font-cairo w-20 text-center rounded-xl border border-[var(--gold-border)] bg-[var(--dark3)] text-[var(--text1)] p-2 text-base font-bold focus:outline-none focus:border-[var(--gold)]"
    />
    <span className="font-cairo text-[var(--text2)] text-sm">menit</span>
    <div className="flex gap-2 flex-wrap">
      {[5, 10, 15, 30, 45, 60].map(m => (
        <button
          key={m}
          type="button"
          onClick={() => setDurasi(m)}
          className={`font-cairo px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            durasi === m
              ? 'bg-[var(--teal-600)] border-[var(--teal-300)] text-white'
              : 'border-[var(--gold-border)] text-[var(--text3)] hover:border-[var(--gold)]'
          }`}
        >
          {m}m
        </button>
      ))}
    </div>
  </div>
</div>

            {/* Karakter Kultum */}
            <div className="space-y-3 mb-6">
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                🎭 Karakter Kultum
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'umum' as const, icon: '📖', label: 'Umum', desc: 'Ayat, hadits & doa sehari-hari', contoh: 'Sabar, Sholat, Rezeki' },
                  { id: 'sains' as const, icon: '🔬', label: 'Perspektif Sains', desc: 'Mukjizat ilmiah Al-Quran', contoh: 'Gerhana, Lebah, Air' },
                  { id: 'kisah' as const, icon: '📜', label: 'Kisah Kaum Lampau', desc: 'Pelajaran dari kisah nabi terdahulu', contoh: 'Nabi Yunus, Ashabul Kahfi' },
                ].map(k => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      setKarakterKultum(k.id)
                      if (k.id === 'kisah') {
                        setIsKisahMode(true)
                        openKisahDropdown()
                      } else {
                        setIsKisahMode(false)
                        setSelectedKisah(null)
                      }
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      karakterKultum === k.id
                        ? 'border-[var(--gold)] bg-[var(--gold)]/8'
                        : 'border-white/15 bg-[var(--dark2)]/30 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl mb-1">{k.icon}</span>
                    <span className="font-cinzel text-xs font-bold text-[var(--gold)] uppercase tracking-wide leading-tight mb-1">{k.label}</span>
                    <span className="font-cairo text-[10px] text-[var(--text3)] leading-tight">{k.desc}</span>
                    <span className="font-cairo text-[9px] text-[var(--text3)]/60 mt-1 italic">{k.contoh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topik Bahasan */}
            <div className="space-y-4">
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4" /> Topik Bahasan
              </label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(karakterKultum === 'sains' 
                  ? ['Gerhana Bulan', 'Lebah & Madu', 'Air & Kehidupan', 'Bintang & Galaksi', 'Embrio Manusia', 'Angin & Hujan']
                  : karakterKultum === 'kisah'
                  ? ['Nabi Yunus AS', 'Ashabul Kahfi', 'Nabi Musa & Firaun', 'Nabi Ibrahim AS', 'Kaum Luth', 'Nabi Yusuf AS']
                  : TOPIK_POPULER
                ).map(topik => (
                  <button
                    key={topik}
                    onClick={() => {
                      setIsKisahMode(false)
                      setTopikBahasan(topik)
                    }}
                    className={`font-cairo px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      topikBahasan === topik && !isKisahMode
                        ? 'bg-[#C9A84C] text-[var(--dark)] border-[#C9A84C] font-semibold' 
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {topik}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <input
                  value={isKisahMode ? '' : topikBahasan}
                  onChange={e => {
                    setIsKisahMode(false)
                    setTopikBahasan(e.target.value)
                  }}
                  disabled={isKisahMode}
                  placeholder="Atau ketik topik lain..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-cairo text-sm text-white placeholder-white/30 focus:border-[#C9A84C]/50 outline-none disabled:opacity-40"
                />

              </div>
            </div>

            {/* Referensi Terkait (hanya tampil jika bukan mode kisah) */}
            {!isKisahMode && (
              <div className="pt-4">
                {!topikBahasan || topikBahasan.length < 3 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-[var(--gold-border)]/50 text-center bg-[var(--dark3)]/30">
                    <p className="font-cairo text-sm text-[var(--text3)] italic flex items-center justify-center gap-2">
                      <span>✨ Ketik atau pilih topik bahasan untuk melihat referensi database</span>
                    </p>
                  </div>
                ) : loadingReferensi ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 glass-card rounded-2xl border border-[var(--gold-border)]/30">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
                    <p className="font-cairo text-sm text-[var(--text2)] font-bold">
                      Mencari referensi terbaik dari database...
                    </p>
                  </div>
                ) : referensiReady ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div id="referensi-list-top" className="flex items-center justify-between">
                      <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                        📚 Referensi Terkait ({referensiSuggested.length})
                      </label>
                      {referensiSuggested.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (referensiDipilih.length === referensiSuggested.length) {
                              setReferensiDipilih([])
                            } else {
                              setReferensiDipilih([...referensiSuggested])
                            }
                          }}
                          className="font-cairo text-xs font-bold text-[var(--teal-200)] hover:text-[var(--teal-100)] transition-colors"
                        >
                          {referensiDipilih.length === referensiSuggested.length ? 'Kosongkan Semua' : 'Pilih Semua'}
                        </button>
                      )}
                    </div>
                    
                    {referensiSuggested.length === 0 ? (
                      <p className="font-cairo text-xs text-[var(--text3)] italic p-4 text-center border border-dashed border-[var(--gold-border)]/20 rounded-xl">
                        Tidak ditemukan referensi khusus dari database untuk topik ini. AI akan menggunakan basis pengetahuan umumnya.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {/* Disclaimer */}
                        {referensiSuggested.length > 0 && (
                          <div
                            className="mb-1 px-4 py-3 rounded-md font-cairo text-sm font-medium shadow-sm"
                            style={{
                              background: 'rgba(201,163,90,0.10)',
                              borderLeft: '3px solid rgba(201,163,90,0.70)',
                              color: 'var(--text1)',
                            }}
                          >
                            ⚠️ Referensi ditampilkan berdasarkan kemiripan makna dan tema secara semantik. Tidak semua referensi dijamin sesuai dengan topik yang dicari — silakan pilih yang paling relevan sesuai kebutuhan kultum Anda.
                          </div>
                        )}

                        {[
                          {
                            id: 'ayat',
                            title: "Ayat Al-Qur'an",
                            isWajib: true,
                            icon: "📖",
                            filterFn: (r: KultumReferensi) => r.type === 'ayat_quran_db'
                          },
                          {
                            id: 'hadits',
                            title: "Hadits",
                            isWajib: true,
                            icon: "💬",
                            filterFn: (r: KultumReferensi) => r.type === 'hadits'
                          },
                          {
                            id: 'sains',
                            title: "Ayat & Tokoh Sains",
                            isWajib: false,
                            icon: "🔬",
                            filterFn: (r: KultumReferensi) => r.type === 'ayat_sains' || r.type === 'tokoh_sains'
                          },
                          {
                            id: 'kisah',
                            title: "Kisah Kaum Lampau",
                            isWajib: false,
                            icon: "📜",
                            filterFn: (r: KultumReferensi) => r.type === 'kaum_lampau'
                          },
                          {
                            id: 'doa',
                            title: "Doa Penutup",
                            isWajib: false,
                            icon: "🤲",
                            filterFn: (r: KultumReferensi) => r.type === 'doa_quran'
                          }
                        ].map((g) => {
                          const groupItems = referensiSuggested.filter(g.filterFn)
                          if (groupItems.length === 0) return null

                          const isExpanded = groupExpanded[g.id]
                          const visibleCount = groupVisibleCounts[g.id] || 8
                          const shownItems = groupItems.slice(0, visibleCount)
                          const hasMore = groupItems.length > visibleCount
                          const canCollapse = !hasMore && groupItems.length > 8

                          return (
                            <div key={g.id} className="border border-[var(--gold-border)]/15 rounded-2xl overflow-hidden bg-[var(--dark2)]/30">
                              {/* Header Accordion */}
                              <button
                                type="button"
                                onClick={() => setGroupExpanded(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                                className="w-full flex items-center justify-between p-4 bg-[var(--dark3)]/60 hover:bg-[var(--dark3)] transition-all text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl shrink-0">{g.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-cinzel text-xs font-bold text-white tracking-wide uppercase">
                                        {g.title}
                                      </span>
                                      <span className={`text-[9px] font-bold px-2 py-0.25 rounded-full border uppercase tracking-wider ${
                                        g.isWajib 
                                          ? 'text-[var(--gold)] border-[var(--gold-border)]/50 bg-[var(--gold)]/10' 
                                          : 'text-[var(--text3)] border-white/10 bg-white/5'
                                      }`}>
                                        {g.isWajib ? 'WAJIB' : 'OPSIONAL'}
                                      </span>
                                    </div>
                                    <span className="font-cairo text-[11px] text-[var(--text3)]">
                                      {groupItems.length} referensi ditemukan
                                    </span>
                                  </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-[var(--text3)] transition-transform duration-300 ${isExpanded ? 'transform rotate-180 text-[var(--gold)]' : ''}`} />
                              </button>

                              {/* Content area */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 flex flex-col gap-4 border-t border-[var(--gold-border)]/10">
                                      {shownItems.map((ref, idx) => {
                                        const isSelected = referensiDipilih.some(r => r.id === ref.id)
                                        const isSemantic = !!(ref as any).isSemanticSearch
                                        let badgeLabel = isSemantic ? '🔎 RELEVAN SEMANTIK' : 'REFERENSI'
                                        let badgeColor = isSemantic 
                                          ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5'
                                          : 'text-[var(--gold-light)] border-[var(--gold-border)]/30 bg-[var(--gold)]/5'
                                        
                                        if (!isSemantic) {
                                          if (ref.type === 'ayat_sains' || ref.type === 'ayat_quran_db') {
                                            badgeLabel = "AYAT AL-QUR'AN"
                                            badgeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/5'
                                          } else if (ref.type === 'hadits') {
                                            badgeLabel = 'HADITS SHAHIH'
                                            badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                                          } else if (ref.type === 'doa_quran') {
                                            badgeLabel = "DOA AL-QUR'AN"
                                            badgeColor = 'text-purple-400 border-purple-500/30 bg-purple-500/5'
                                          } else if (ref.type === 'kaum_lampau') {
                                            badgeLabel = 'KISAH KAUM LAMPAU'
                                            badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/5'
                                          }
                                        } else {
                                          let prefix = ''
                                          if (ref.type === 'ayat_quran_db') prefix = 'AYAT - '
                                          else if (ref.type === 'hadits') prefix = 'HADITS - '
                                          badgeLabel = `${prefix}RELEVAN SEMANTIK`
                                          badgeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                                        }

                                        const d = ref.data as any

                                        return (
                                          <div
                                            key={`${ref.id ?? d?.nama_doa ?? ref.judul}-${idx}`}
                                            id={`ref-card-${ref.id}`}
                                            className={`p-4 rounded-xl border transition-all flex flex-col ${
                                              isSelected
                                                ? 'bg-[var(--dark2)] border-[var(--gold)] shadow-[0_0_12px_rgba(201,163,90,0.1)]'
                                                : 'bg-[var(--dark2)]/50 border-[var(--gold-border)]/30 hover:border-[var(--gold)]/30'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              {/* Checkbox & Title area */}
                                              <div className="flex items-start gap-3 text-left flex-1 min-w-0">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (isSelected) {
                                                      setReferensiDipilih(referensiDipilih.filter(r => r.id !== ref.id))
                                                    } else {
                                                      setReferensiDipilih([...referensiDipilih, ref])
                                                    }
                                                  }}
                                                  className="pt-1 focus:outline-none shrink-0 cursor-pointer"
                                                >
                                                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                                    isSelected 
                                                      ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--dark)]' 
                                                      : 'border-[var(--gold-border)]/60'
                                                  }`}>
                                                    {isSelected && (
                                                      <svg className="w-3 h-3 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                      </svg>
                                                    )}
                                                  </div>
                                                </button>

                                                <div
                                                  onClick={() => handleToggleExpand(ref.id)}
                                                  className="flex-1 cursor-pointer select-none min-w-0"
                                                >
                                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`font-cairo text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${badgeColor}`}>
                                                      {badgeLabel}
                                                    </span>
                                                    <span className="font-cairo text-[9px] text-[var(--text3)]">
                                                      Relevansi: {ref.relevansi_score}%
                                                    </span>
                                                  </div>
                                                  <h4 className="font-cairo text-sm font-bold text-[var(--text1)] leading-snug">{ref.judul}</h4>
                                                  
                                                  {ref.deskripsi_singkat && (
                                                    <div className="mt-2">
                                                      <p className="font-cairo text-[9px] uppercase tracking-widest text-white/35 mb-0.5 font-bold">
                                                        Makna & Konteks
                                                      </p>
                                                      <p className="font-cairo text-xs text-white/60 leading-relaxed line-clamp-2">
                                                        {ref.deskripsi_singkat}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => handleToggleExpand(ref.id)}
                                                className="p-1 text-[var(--text3)] hover:text-[var(--gold)] transition-colors shrink-0 cursor-pointer"
                                              >
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedRef === ref.id ? 'transform rotate-180 text-[var(--gold)]' : ''}`} />
                                              </button>
                                            </div>

                                            <AnimatePresence initial={false}>
                                              {expandedRef === ref.id && (
                                                <motion.div
                                                  initial={{ opacity: 0, height: 0 }}
                                                  animate={{ opacity: 1, height: 'auto' }}
                                                  exit={{ opacity: 0, height: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="mt-3 pt-3 border-t border-[var(--gold-border)]/20 space-y-3">
                                                    {ref.type === 'ayat_quran_db' && (
                                                      <>
                                                        {d.teks_arab && (
                                                          <p className="font-amiri text-lg text-right leading-loose mb-2"
                                                             dir="rtl" style={{ color: '#4a9eda' }}>
                                                            {d.teks_arab}
                                                          </p>
                                                        )}
                                                        {d.teks_latin && (
                                                          <p className="font-cairo text-[11px] italic text-center mb-2"
                                                             style={{ color: '#4a9eda', opacity: 0.7 }}>
                                                            {d.teks_latin}
                                                          </p>
                                                        )}
                                                        {d.terjemah && (
                                                          <p className="text-xs text-[var(--text1)] leading-relaxed text-justify mb-2">
                                                            "{d.terjemah}"
                                                          </p>
                                                        )}
                                                        {d.konteks && (
                                                          <div className="mb-2">
                                                            <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                              Makna & Konteks
                                                            </p>
                                                            <p className="font-cairo text-xs text-white/75 leading-relaxed">
                                                              {d.konteks}
                                                            </p>
                                                          </div>
                                                        )}
                                                        {d.tags?.length > 0 && (
                                                          <div className="flex flex-wrap gap-1 mb-2">
                                                            {d.tags.map((tag: string, i: number) => (
                                                              <span key={i} className="font-cairo text-[9px] px-2 py-0.5 rounded-full
                                                                           bg-white/5 border border-white/10 text-white/50">
                                                                {tag}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </>
                                                    )}

                                                    {ref.type === 'ayat_sains' && (
                                                      <div className="space-y-2">
                                                        {d.teks_arab && (
                                                          <div className="font-amiri text-lg text-center leading-loose text-[var(--gold-light)]" dir="rtl">
                                                            {d.teks_arab}
                                                          </div>
                                                        )}
                                                        {d.terjemahan && (
                                                          <p className="font-cairo text-xs text-center leading-relaxed text-[var(--text1)] italic">
                                                            "{d.terjemahan}"
                                                          </p>
                                                        )}
                                                        {d.penjelasan && (
                                                          <div className="bg-[var(--dark3)]/40 p-3 rounded-xl border border-[var(--gold-border)]/20">
                                                            <span className="font-cinzel text-[9px] font-bold text-[var(--gold)] uppercase tracking-wider block mb-1">🔬 Penjelasan Sains</span>
                                                            <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed">{d.penjelasan}</p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}

                                                    {ref.type === 'doa_quran' && (
                                                      <>
                                                        {d.arab && (
                                                          <p className="font-amiri text-lg text-right leading-loose mb-2"
                                                             dir="rtl" style={{ color: '#7acc50' }}>
                                                            {d.arab}
                                                          </p>
                                                        )}
                                                        {d.latin && (
                                                          <p className="font-cairo text-[11px] italic text-center mb-2"
                                                             style={{ color: '#7acc50', opacity: 0.7 }}>
                                                            {d.latin}
                                                          </p>
                                                        )}
                                                        {d.terjemah && (
                                                          <p className="font-cairo text-xs text-white/75 italic leading-relaxed mb-2">
                                                            "{d.terjemah}"
                                                          </p>
                                                        )}
                                                        {d.konteks && (
                                                          <div className="mb-2">
                                                            <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                              Konteks Doa
                                                            </p>
                                                            <p className="font-cairo text-xs text-white/75 leading-relaxed">
                                                              {d.konteks}
                                                            </p>
                                                          </div>
                                                        )}
                                                        {d.keutamaan && (
                                                          <div className="mb-2 p-2.5 rounded-lg bg-white/3 border border-white/8">
                                                            <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                              Keutamaan
                                                            </p>
                                                            <p className="font-cairo text-xs text-white/65 leading-relaxed italic">
                                                              {d.keutamaan}
                                                            </p>
                                                          </div>
                                                        )}
                                                        {d.tafsir_ulama?.length > 0 && (
                                                          <div className="border-t border-white/8 pt-2.5 mt-2.5">
                                                            <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-1.5">
                                                              Penjelasan Ulama
                                                            </p>
                                                            {d.tafsir_ulama.slice(0, 1).map((t: any, idx: number) => (
                                                              <div key={idx}>
                                                                <p className="font-cairo text-xs text-white/60 italic leading-relaxed">
                                                                  "{t.teks?.slice(0, 200)}..."
                                                                </p>
                                                                <p className="font-cairo text-[9px] text-white/35 mt-0.5">
                                                                  — {t.sumber}
                                                                </p>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </>
                                                    )}

                                                    {ref.type === 'hadits' && (
                                                      <>
                                                        {d.arab && (
                                                          <p className="font-amiri text-lg text-right leading-loose mb-2"
                                                             dir="rtl" style={{ color: '#C9A84C' }}>
                                                            {d.arab}
                                                          </p>
                                                        )}
                                                        {d.terjemah && (
                                                          <p className="font-cairo text-xs text-white/75 italic leading-relaxed mb-2">
                                                            "{d.terjemah}"
                                                          </p>
                                                        )}
                                                        {d.perawi && (
                                                          <p className="font-cairo text-[10px] text-white/35 mb-2">
                                                            HR. {d.perawi} {d.number ? `No. ${d.number}` : ''}
                                                          </p>
                                                        )}
                                                        {(() => {
                                                          const konteks = d.konteks_hadits
                                                          if (!konteks) return null
                                                          return (
                                                            <div className="space-y-2">
                                                              {konteks.ringkasan && (
                                                                <div>
                                                                  <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                                    Ringkasan
                                                                  </p>
                                                                  <p className="font-cairo text-xs text-white/75 leading-relaxed">
                                                                    {konteks.ringkasan}
                                                                  </p>
                                                                </div>
                                                              )}
                                                              {konteks.pelajaran && (
                                                                <div>
                                                                  <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                                    Pelajaran
                                                                  </p>
                                                                  <p className="font-cairo text-xs text-white/75 leading-relaxed">
                                                                    {konteks.pelajaran}
                                                                  </p>
                                                                </div>
                                                              )}
                                                              {konteks.aplikasi && (
                                                                <div className="p-2.5 rounded-lg bg-white/3 border border-white/8">
                                                                  <p className="font-cairo text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                                                    Aplikasi dalam Kehidupan
                                                                  </p>
                                                                  <p className="font-cairo text-xs text-white/65 leading-relaxed">
                                                                    {konteks.aplikasi}
                                                                  </p>
                                                                </div>
                                                              )}
                                                            </div>
                                                          )
                                                        })()}
                                                        {d.tags?.length > 0 && (
                                                          <div className="flex flex-wrap gap-1">
                                                            {d.tags.map((tag: string, idx: number) => (
                                                              <span key={idx} className="font-cairo text-[9px] px-2 py-0.5 rounded-full
                                                                           bg-white/5 border border-white/10 text-white/50">
                                                                {tag}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </>
                                                    )}

                                                    {ref.type === 'kaum_lampau' && (
                                                      <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2 text-[9px] text-[var(--text2)] bg-[var(--dark3)]/35 p-2.5 rounded-xl border border-[var(--gold-border)]/20">
                                                          {d.periode && <div><span className="font-bold text-[var(--gold)]">Periode:</span> {d.periode}</div>}
                                                          {d.lokasi && <div><span className="font-bold text-[var(--gold)]">Lokasi:</span> {d.lokasi}</div>}
                                                          {d.nabi_diutus && <div className="col-span-2"><span className="font-bold text-[var(--gold)]">Nabi Diutus:</span> {d.nabi_diutus}</div>}
                                                        </div>
                                                        {d.pelajaran && (
                                                          <div className="bg-[var(--dark3)]/40 p-3 rounded-xl border border-[var(--gold-border)]/20">
                                                            <span className="font-cinzel text-[9px] font-bold text-[var(--gold)] uppercase tracking-wider block mb-1">📖 Pelajaran / Hikmah</span>
                                                            <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed">{d.pelajaran}</p>
                                                          </div>
                                                        )}
                                                        {d.kisah_lengkap && (
                                                          <div className="bg-[var(--dark3)]/40 p-3 rounded-xl border border-[var(--gold-border)]/20">
                                                            <span className="font-cinzel text-[9px] font-bold text-[var(--gold)] uppercase tracking-wider block mb-1">📜 Ringkasan Kisah</span>
                                                            <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed text-justify line-clamp-6">{d.kisah_lengkap}</p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        )
                                      })}

                                      {/* Per-group Pagination buttons */}
                                      <div className="flex flex-col items-center gap-1.5 mt-1 border-t border-[var(--gold-border)]/10 pt-3">
                                        <p className="font-cairo text-[10px] text-[var(--text3)]">
                                          Menampilkan{' '}
                                          <span className="text-[var(--text2)] font-semibold">{Math.min(visibleCount, groupItems.length)}</span>
                                          {' '}dari{' '}
                                          <span className="text-[var(--text2)] font-semibold">{groupItems.length}</span>
                                          {' '}referensi
                                        </p>

                                        {hasMore && (
                                          <button
                                            type="button"
                                            onClick={() => setGroupVisibleCounts(prev => ({ ...prev, [g.id]: prev[g.id] + 8 }))}
                                            className="w-full py-1.5 rounded-lg font-cairo text-xs
                                                       border border-[var(--gold-border)]/30 text-[var(--gold)]
                                                       hover:bg-[var(--gold)]/5 transition-all
                                                       flex items-center justify-center gap-1.5"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            Lihat {Math.min(8, groupItems.length - visibleCount)} referensi berikutnya
                                          </button>
                                        )}

                                        {canCollapse && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setGroupVisibleCounts(prev => ({ ...prev, [g.id]: 8 }))
                                            }}
                                            className="w-full py-1.5 rounded-lg font-cairo text-xs
                                                       border border-[var(--gold-border)]/30 text-[var(--gold)]
                                                       hover:bg-[var(--gold)]/5 transition-all
                                                       flex items-center justify-center gap-1.5"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                            Tampilkan lebih sedikit
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Rekomendasi Judul (hanya tampil jika ada referensi terpilih dan bukan mode kisah) */}
            {!isKisahMode && referensiDipilih.length > 0 && (
              <div className="pt-6 border-t border-[var(--gold-border)]/30">
                <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-3">
                  ✨ Rekomendasi Judul {formatLabel}
                </label>
                {isLoadingJudul ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-[var(--gold)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-cairo font-bold">Menyusun judul dari referensi terpilih...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {judulList.map((judul, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedJudul(judul)}
                        className={`text-left px-4 py-3 rounded-xl border font-cairo text-sm transition-colors flex items-center gap-3 ${
                          selectedJudul === judul
                            ? 'bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C] shadow-[0_0_15px_rgba(201,163,90,0.15)]'
                            : 'border-[var(--gold-border)]/50 bg-[var(--dark3)] text-[var(--text2)] hover:border-[var(--gold)]/30 hover:bg-[var(--dark2)]'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-[var(--dark2)] border border-[var(--gold-border)]/30 flex items-center justify-center text-xs font-bold text-[#C9A84C] shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 font-semibold">{judul}</span>
                        {selectedJudul === judul && (
                          <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Kisah Al-Qur'an Selected Summary / Picker */}
            {isKisahMode && (
              <div className="space-y-4 mb-2 animate-in fade-in duration-300 pt-4">
                <div className="flex items-center justify-between">
                  <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                    📖 Kisah Al-Qur'an Terpilih
                  </label>
                  <button 
                    onClick={() => { setIsKisahMode(false); setSelectedKisah(null); }}
                    className="font-cairo text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    Batal Mode Kisah
                  </button>
                </div>
                {selectedKisah ? (
                  <div 
                    className="p-4 rounded-xl border flex items-start gap-4 transition-all"
                    style={{ 
                      background: arabColorMap[selectedKisah.kategori] + '11',
                      borderColor: arabColorMap[selectedKisah.kategori] + '40'
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-cairo text-sm text-white font-semibold">
                          {selectedKisah.nama}
                        </p>
                        {selectedKisah.nama_arab && (
                          <p className="font-amiri text-base text-right leading-none" dir="rtl"
                             style={{ color: arabColorMap[selectedKisah.kategori] }}>
                            {selectedKisah.nama_arab}
                          </p>
                        )}
                      </div>
                      {selectedKisah.ringkasan && (
                        <p className="font-cairo text-[12px] text-white/50 mt-1.5 leading-relaxed line-clamp-3">
                          {selectedKisah.ringkasan}
                        </p>
                      )}
                      {selectedKisah.surah_utama && selectedKisah.surah_utama.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="font-cairo text-[10px] text-white/30">Rujukan:</span>
                          {selectedKisah.surah_utama.map((s, idx) => (
                            <span key={idx} className="font-cairo text-[10px] text-[var(--teal-200)] bg-[var(--teal-950)]/30 border border-[var(--teal-900)]/30 px-2 py-0.5 rounded-md">
                              QS. {s.surah_nama}: {s.ayat_range}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => openKisahDropdown()}
                      className="font-cairo text-[11px] text-[var(--gold-light)] hover:text-white bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 px-3 py-1.5 rounded-lg border border-[var(--gold)]/30 transition-colors flex-shrink-0"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openKisahDropdown()}
                    className="w-full p-6 rounded-2xl border border-dashed border-[#C9A84C]/40 text-center bg-[#C9A84C]/5 hover:bg-[#C9A84C]/10 transition-all group"
                  >
                    <span className="font-cairo text-sm text-[#C9A84C] font-semibold flex items-center justify-center gap-2">
                      ✨ Klik untuk memilih Kisah Al-Qur'an dari database
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Gaya Bahasa */}
            <div>
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-4">
                <Settings className="w-4 h-4" /> Gaya Bahasa
              </label>
              <div className="flex flex-wrap gap-3">
                {GAYA_BAHASA.map(gaya => (
                  <button
                    key={gaya}
                    type="button"
                    onClick={() => setGayaBahasa(gaya)}
                    className={`font-cairo px-4 py-2 rounded-xl text-sm font-bold transition-all border ${gayaBahasa === gaya ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--gold-light)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'}`}
                  >
                    {gaya}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={
                  loading || 
                  (isKisahMode 
                    ? !selectedKisah 
                    : (!selectedJudul || referensiDipilih.length === 0))
                }
                className="font-cairo w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)] text-[var(--dark)] font-bold text-lg hover:shadow-[0_0_20px_rgba(201,163,90,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" /> Generate {formatLabel} Sekarang
              </button>
              
              {!isKisahMode && !selectedJudul && referensiDipilih.length > 0 && !isLoadingJudul && (
                <p className="font-cairo text-center text-xs text-[var(--text3)] mt-2">
                  ⬆️ Pilih rekomendasi judul terlebih dahulu
                </p>
              )}
              {!isKisahMode && referensiDipilih.length === 0 && referensiReady && (
                <p className="font-cairo text-center text-xs text-[var(--text3)] mt-2">
                  ✅ Pilih minimal 1 referensi untuk memunculkan judul
                </p>
              )}

              {!userId && (
                <p className="font-cairo text-center text-xs text-[var(--text3)] mt-3">
                  Anda belum login. Kultum tidak akan tersimpan ke riwayat.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recent History */}
        {recentHistory.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-[var(--text1)]">
                <History className="w-5 h-5 text-[var(--teal-300)]" />
                <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Riwayat Terakhir</h2>
              </div>
              <Link href="/kultum/history" className="font-cairo text-sm font-semibold text-[var(--teal-200)] hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentHistory.map(hist => (
                <Link key={hist.id} href={`/kultum/hasil/${hist.id}`} className="block group">
                  <div className="glass-card p-5 rounded-2xl border-[var(--gold-border)] hover:border-[var(--teal-500)] transition-colors h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-cairo px-2 py-1 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-md text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                        {({
                          tausiyah: 'Tausiyah',
                          kultum: 'Kultum',
                          khotbah_jumat: "Khotbah Jum'at",
                          ceramah: 'Ceramah'
                        } as Record<string, string>)[hist.format.toLowerCase()] ?? hist.format}
                      </span>
                    </div>
                    <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-4 group-hover:text-[var(--teal-200)] transition-colors line-clamp-2">
                      {hist.judul}
                    </h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-[var(--text3)] pt-3 border-t border-[var(--dark3)]">
                      <div className="font-cairo flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(hist.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                      <PlayCircle className="w-4 h-4 text-[var(--teal-200)] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Kisah Dropdown Overlay */}
      {showKisahDropdown && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setShowKisahDropdown(false)} />
          
          <div className="relative z-10 w-full sm:max-w-xl mx-auto bg-[#0d0d0d] 
                          border border-white/10 rounded-t-2xl sm:rounded-2xl 
                          flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
              <p className="font-cinzel text-sm text-[#C9A84C] font-semibold mb-3">
                Pilih Kisah Al-Qur'an
              </p>

              {/* Search */}
              <input
                type="text"
                value={kisahSearch}
                onChange={e => setKisahSearch(e.target.value)}
                placeholder="Cari kisah..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 
                           font-cairo text-sm text-white placeholder-white/30 outline-none
                           focus:border-[#C9A84C]/50 mb-3"
              />
              
              {/* Filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['Semua', 'Kisah Nabi', 'Kaum Diazab', 'Kisah Pilihan', 'Sirah Nabawiyah'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setKisahFilterTab(tab)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full font-cairo text-[11px] 
                               transition-colors ${kisahFilterTab === tab 
                                 ? 'bg-[#C9A84C] text-black font-semibold' 
                                 : 'bg-white/5 text-white/50 hover:text-white/80'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List kisah */}
            <div className="overflow-y-auto flex-1 px-1 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                {getFilteredKisah().map(kisah => (
                  <button
                    key={kisah.slug}
                    type="button"
                    onClick={() => {
                      setSelectedKisah(kisah)
                      setShowKisahDropdown(false)
                    }}
                    className={`text-left p-3 rounded-xl transition-colors border
                               ${selectedKisah?.slug === kisah.slug 
                                 ? 'border-[#C9A84C]/60 bg-[#C9A84C]/10' 
                                 : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
                    style={{ background: bgColorMap[kisah.kategori] }}
                  >
                    {/* Header strip kategori */}
                    <div className="text-[9px] uppercase tracking-widest font-bold mb-2"
                         style={{ color: arabColorMap[kisah.kategori] }}>
                      {labelMap[kisah.kategori]}
                    </div>
                    
                    {/* Judul arab */}
                    {kisah.nama_arab && (
                      <p className="font-amiri text-sm text-right leading-relaxed mb-1"
                         dir="rtl"
                         style={{ color: arabColorMap[kisah.kategori] }}>
                        {kisah.nama_arab}
                      </p>
                    )}
                    
                    {/* Judul Indonesia */}
                    <p className="font-cairo text-[12px] text-white font-medium leading-snug">
                      {kisah.nama}
                    </p>
                    
                    {/* Surah referensi */}
                    {kisah.surah_utama && kisah.surah_utama.length > 0 && (
                      <p className="font-cairo text-[10px] text-white/35 mt-1.5 italic">
                        QS. {kisah.surah_utama[0].surah_nama}: {kisah.surah_utama[0].ayat_range}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer count */}
            <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
              <p className="font-cairo text-[11px] text-white/30 text-center">
                {getFilteredKisah().length} kisah tersedia
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Outer wrapper: Suspense boundary required for useSearchParams ─
export default function KultumGeneratorPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-[var(--gold)] font-cairo bg-[var(--dark)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)] mr-2" />
        Mempersiapkan Kultum Generator...
      </div>
    }>
      <KultumGeneratorInner />
    </React.Suspense>
  )
}
