"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Mic, FileText, Settings, ArrowRight, History, PlayCircle, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FORMAT_OPTIONS = [
  { id: 'tausiyah', label: 'Tausiyah', durasi: '2-5 menit', icon: '💬' },
  { id: 'kultum', label: 'Kultum', durasi: '5-15 menit', icon: '🎤' },
  {
    id: 'khotbah',
    label: 'Khotbah',
    durasi: '20-30 menit',
    icon: '📢',
    subOptions: [
      { id: 'khotbah_jumat', label: "Khotbah Jum'at", icon: '🕌' },
      { id: 'khotbah_lainnya', label: 'Khotbah Lainnya', icon: '📣' },
    ]
  },
  { id: 'ceramah', label: 'Ceramah', durasi: '30-60 menit', icon: '🎓' },
]
const GAYA_BAHASA = ['Formal', 'Semi-Formal', 'Santai', 'Bilingual']
const TEMA_PRESET: Record<string, string[]> = {
  Akhlak: ['Sabar dalam Ujian', 'Keutamaan Kejujuran', 'Ikhlas Beramal', 'Tawadhu'],
  Ibadah: ['Keutamaan Shalat Berjamaah', 'Rahasia Puasa Ramadhan', 'Zakat sebagai Pembersih Jiwa'],
  Keluarga: ['Birrul Walidain', 'Mendidik Anak Islami', 'Membangun Rumah Tangga Sakinah'],
  Sosial: ['Ukhuwah Islamiyah', 'Tolong-menolong dalam Kebaikan', 'Menjaga Persatuan Umat'],
  Motivasi: ['Tawakkal kepada Allah', 'Rezeki dan Ikhtiar', 'Semangat Menuntut Ilmu'],
  Momen: ['Keutamaan Bulan Ramadhan', 'Hikmah Idul Fitri', 'Makna Idul Adha & Kurban'],
  Sains: ['Mukjizat Ilmiah Al-Qur\'an', 'Islam dan Ilmu Pengetahuan', 'Alam Semesta dalam Al-Qur\'an'],
  'Kisah Al-Qur\'an': [
    'Kisah Nabi Yunus dan Paus — Sabar dalam Kegelapan',
    'Kisah Kaum Ad dan Angin Azab — Bahaya Kesombongan',
    'Kisah Nabi Ibrahim dan Api — Keimanan yang Tak Tergoyahkan',
    'Kisah Ashabul Kahfi — Pemuda yang Memilih Iman',
    'Kisah Kaum Tsamud dan Unta — Melanggar Batas Allah',
    "Kisah Nabi Musa dan Fir'aun — Kebenaran vs Kekuasaan",
    'Kisah Nabi Yusuf — Sabar, Ikhlas, dan Kemuliaan',
    'Kisah Nabi Ayyub — Bersyukur dalam Ujian Berat',
    'Kisah Nabi Sulaiman — Kekuasaan yang Bersyukur',
    'Kisah Dzulqarnain — Pemimpin yang Adil dan Bijaksana',
  ],
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

export default function KultumGeneratorPage() {
  const router = useRouter()
  
  const [format, setFormat] = useState('Kultum')
  const [subFormat, setSubFormat] = useState('khotbah_jumat')
  const [kategoriTema, setKategoriTema] = useState('Akhlak')
  const [temaPreset, setTemaPreset] = useState('')
  const [temaCustom, setTemaCustom] = useState('')
  const [gayaBahasa, setGayaBahasa] = useState('Semi-Formal')
  const [durasi, setDurasi] = useState(10)
  
  useEffect(() => {
    // Reset subFormat saat format berubah
    setSubFormat('')
    // Reset durasi ke default sesuai format
    const defaults: Record<string, number> = { tausiyah: 5, kultum: 10, khotbah: 25, ceramah: 45 }
    setDurasi(defaults[format.toLowerCase()] ?? 10)
  }, [format])
  
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')

  const [userId, setUserId] = useState<string | null>(null)
  const [recentHistory, setRecentHistory] = useState<KultumHistory[]>([])

  const formatLabel = (() => {
    if (format.toLowerCase() === 'khotbah' && subFormat === 'khotbah_jumat') return "Khotbah Jum'at"
    if (format.toLowerCase() === 'khotbah') return 'Khotbah'
    return ({
      tausiyah: 'Tausiyah',
      kultum: 'Kultum',
      ceramah: 'Ceramah',
    } as Record<string, string>)[format.toLowerCase()] ?? 'Kultum'
  })()

  const loadingSteps = [
    { icon: '📖', text: `Menganalisa tema ${formatLabel}...`, delay: 0 },
    { icon: '🔍', text: 'Mencari ayat Al-Qur\'an yang relevan...', delay: 2000 },
    { icon: '📜', text: 'Mencari hadits pendukung...', delay: 5000 },
    { icon: '✍️', text: `Menyusun struktur ${formatLabel}...`, delay: 10000 },
    { icon: '✨', text: `Menyempurnakan ${formatLabel}...`, delay: 20000 },
  ]

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

  const handleGenerate = async () => {
    const temaFinal = temaCustom.trim() || temaPreset
    if (!temaFinal) {
      setError('Pilih tema dari daftar atau ketik tema Anda sendiri')
      return
    }

    setError('')
    setLoading(true)
    setLoadingStep(0)

    // Start loading steps animation
    const stepTimers = loadingSteps.map((step, i) =>
      setTimeout(() => setLoadingStep(i), step.delay)
    )

    try {
      const res = await fetch('/api/kultum-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          sub_format: format === 'Khotbah' ? subFormat : undefined,
          tema: temaFinal,
          kategori_tema: kategoriTema,
          gaya_bahasa: gayaBahasa,
          durasi_menit: durasi,
          user_id: userId,
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Gagal generate kultum')

      // Jika ada ID (tersimpan), redirect ke halaman hasil
      if (data.id) {
        router.push(`/kultum/hasil/${data.id}`)
      } else {
        // Jika tidak login, simpan di sessionStorage dan tampilkan inline preview
        sessionStorage.setItem('kultum_result', JSON.stringify(data.konten))
        router.push('/kultum/hasil/preview')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem')
    } finally {
      stepTimers.forEach(clearTimeout)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 font-cairo">
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
          {loading && (
            <div className="absolute inset-0 z-50 bg-[var(--dark)]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-md bg-[var(--dark2)] border border-[var(--gold-border)] rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-[var(--dark3)] border-t-[var(--gold)] rounded-full animate-spin"></div>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-[var(--gold-light)] text-center mb-6">Menyusun {formatLabel}...</h3>
                
                <div className="space-y-4">
                  {loadingSteps.map((step, idx) => {
                    const isPast = loadingStep > idx
                    const isCurrent = loadingStep === idx
                    return (
                      <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${isPast ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isPast ? 'bg-[var(--teal-500)]/20 text-[var(--teal-300)]' : isCurrent ? 'bg-[var(--gold)]/20 text-[var(--gold)] animate-pulse' : 'bg-[var(--dark3)] text-[var(--text3)]'}`}>
                          {isPast ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        <span className={`font-cairo text-sm font-medium ${isCurrent ? 'text-[var(--text1)]' : 'text-[var(--text2)]'}`}>
                          {step.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

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
                    onClick={() => setFormat(f.label)}
                    className={`font-cairo p-3 rounded-xl border text-sm font-bold transition-all ${format === f.label ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-light)] shadow-[0_0_15px_rgba(201,163,90,0.2)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'}`}
                  >
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <span className="text-xl">{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                    <div className="font-cairo text-[10px] text-[var(--text3)] font-normal">{f.durasi}</div>
                  </button>
                ))}
              </div>

              {format === 'Khotbah' && (
                <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {FORMAT_OPTIONS.find(f => f.id === 'khotbah')?.subOptions?.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSubFormat(sub.id)}
                      className={`font-cairo p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${subFormat === sub.id ? 'bg-[var(--teal-500)]/20 border-[var(--teal-500)] text-[var(--teal-200)]' : 'bg-[var(--dark3)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'}`}
                    >
                      <span className="text-lg">{sub.icon}</span>
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
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

            {/* Kategori Tema */}
            <div>
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-4">
                <FileText className="w-4 h-4" /> Kategori Tema
              </label>
              <div className="flex overflow-x-auto pb-2 gap-2 pr-6 hide-scrollbar">
                {Object.keys(TEMA_PRESET).map(kat => (
                  <button
                    key={kat}
                    onClick={() => { setKategoriTema(kat); setTemaPreset(''); setTemaCustom('') }}
                    className={`font-cairo px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${kategoriTema === kat ? 'bg-[var(--teal-500)]/20 border-[var(--teal-500)] text-[var(--teal-200)]' : 'bg-[var(--dark3)] border-transparent text-[var(--text2)] hover:bg-[var(--dark2)] hover:border-[var(--gold-border)]'}`}
                  >
                    {kat}
                  </button>
                ))}
                <div className="flex-shrink-0 w-6" />
              </div>
            </div>

            {/* Tema Selection */}
            <div className="space-y-4">
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4" /> Topik Bahasan
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {TEMA_PRESET[kategoriTema].map(tema => (
                  <button
                    key={tema}
                    onClick={() => { setTemaPreset(tema); setTemaCustom('') }}
                    className={`font-cairo p-3 text-left rounded-xl text-sm font-bold border transition-all ${temaPreset === tema && !temaCustom ? 'bg-gradient-to-r from-[var(--dark2)] to-[var(--dark3)] border-[var(--gold-light)] text-[var(--gold-light)]' : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text1)] hover:border-[var(--gold)]/50'}`}
                  >
                    {tema}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--gold-border)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="font-cinzel px-3 bg-[var(--dark2)] text-xs font-bold text-[var(--text3)] uppercase tracking-widest rounded-full">Atau Tulis Tema Sendiri</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Misal: Pentingnya menjaga lisan di era sosial media..."
                  value={temaCustom}
                  onChange={(e) => { setTemaCustom(e.target.value); setTemaPreset('') }}
                  className="font-cairo w-full bg-[var(--dark3)] border border-[var(--gold-border)] rounded-xl px-4 py-3 text-sm text-[var(--text1)] placeholder-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50"
                />
              </div>
            </div>

            {/* Gaya Bahasa */}
            <div>
              <label className="font-cinzel flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-4">
                <Settings className="w-4 h-4" /> Gaya Bahasa
              </label>
              <div className="flex flex-wrap gap-3">
                {GAYA_BAHASA.map(gaya => (
                  <button
                    key={gaya}
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
                disabled={loading}
                className="font-cairo w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)] text-[var(--dark)] font-bold text-lg hover:shadow-[0_0_20px_rgba(201,163,90,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" /> Generate {formatLabel} Sekarang
              </button>
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
                        {hist.format}
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
    </div>
  )
}
