'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMustajab, HAJAT_INFO, TemaHajat, DOA_QURANI, NABI_LIST } from '@/data/doa_qurani'
import { ArrowRight, BookOpen, Search, Heart, Sparkles, Shield, User, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react'
import { useRestoreScroll } from '@/hooks/useScrollRestore'
import { createClient } from '@/lib/supabase/client'

// Icon mapping for categories
const CATEGORY_CARDS = [
  { id: 'rabbana', title: 'Doa Rabbana', icon: <BookOpen className="w-6 h-6" />, desc: 'Kumpulan doa yang diawali dengan Rabbana', count: DOA_QURANI.filter(d => d.kategori === 'rabbana').length, color: 'from-amber-500/20 to-amber-700/20', borderColor: 'border-amber-500/30' },
  { id: 'rabbi', title: 'Doa Rabbi', icon: <Heart className="w-6 h-6" />, desc: 'Kumpulan doa yang diawali dengan Rabbi', count: DOA_QURANI.filter(d => d.kategori === 'rabbi').length, color: 'from-emerald-500/20 to-emerald-700/20', borderColor: 'border-emerald-500/30' },
  { id: 'nabi', title: 'Doa Para Nabi', icon: <User className="w-6 h-6" />, desc: 'Doa-doa spesifik yang dipanjatkan para Nabi', count: DOA_QURANI.filter(d => d.kategori === 'nabi').length, color: 'from-blue-500/20 to-blue-700/20', borderColor: 'border-blue-500/30' },
  { id: 'semua', title: 'Semua Doa', icon: <Sparkles className="w-6 h-6" />, desc: 'Jelajahi seluruh koleksi doa dalam Al-Qur&apos;an', count: DOA_QURANI.length, color: 'from-purple-500/20 to-purple-700/20', borderColor: 'border-purple-500/30' },
]

function derajatBadge(derajat: string | null) {
  if (!derajat) return null
  const d = derajat.toLowerCase()
  let cls = ''
  if (d.includes('shahih') && d.includes('hasan')) cls = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
  else if (d.includes('shahih')) cls = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
  else if (d.includes('hasan')) cls = 'bg-blue-500/15 border-blue-500/30 text-blue-300'
  else cls = 'bg-[var(--gold)]/10 border-[var(--gold-border)] text-[var(--gold-light)]'
  return (
    <span className={`font-cairo text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-semibold ${cls}`}>
      {derajat}
    </span>
  )
}

function DoaMasterCard({ doa }: { doa: any }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="glass-card rounded-2xl border border-[var(--gold-border)]/40 p-5 flex flex-col gap-3 transition-all hover:border-[var(--gold)]/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className="font-cinzel text-sm font-bold text-[var(--gold-light)] leading-snug flex-1">
          {doa.judul}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {doa.waktu_baca && (
            <span className="font-cairo text-[10px] px-2 py-0.5 rounded-full border border-[var(--gold-border)]/40 text-[var(--text3)] bg-[var(--dark3)]">
              🕐 {doa.waktu_baca}
            </span>
          )}
          {derajatBadge(doa.derajat)}
        </div>
      </div>

      {/* Arab */}
      {doa.arab && (
        <p className="font-amiri text-2xl leading-loose text-[var(--gold-light)] text-right" dir="rtl">
          {doa.arab}
        </p>
      )}

      {/* Latin */}
      {doa.latin && (
        <p className="font-cairo text-sm italic text-[var(--teal-200)] leading-relaxed">
          {doa.latin}
        </p>
      )}

      {/* Terjemah */}
      {doa.terjemah && (
        <p className="font-cairo text-sm text-[var(--text1)] leading-relaxed">
          &ldquo;{doa.terjemah}&rdquo;
        </p>
      )}

      {/* Referensi & Sumber */}
      {(doa.referensi || doa.sumber_kitab) && (
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-[var(--gold-border)]/20">
          {doa.referensi && (
            <span className="font-cairo text-xs text-[var(--text3)]">📚 {doa.referensi}</span>
          )}
          {doa.sumber_kitab && (
            <span className="font-cairo text-xs text-[var(--text3)]">— {doa.sumber_kitab}</span>
          )}
        </div>
      )}

      {/* Keutamaan (collapsible) */}
      {doa.keutamaan && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(p => !p)}
            className="font-cairo text-xs flex items-center gap-1.5 text-[var(--teal-200)] hover:text-[var(--teal-100)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            ℹ️ {expanded ? 'Sembunyikan keutamaan' : 'Lihat keutamaan'}
          </button>
          {expanded && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-[var(--dark3)]/60 border border-[var(--gold-border)]/20">
              <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed">{doa.keutamaan}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DoaPage() {
  useRestoreScroll()
  const mustajabList = getMustajab()
  const doaHariIni = mustajabList[0]

  const [doaMaster, setDoaMaster] = useState<any[]>([])
  const [loadingDoaMaster, setLoadingDoaMaster] = useState(false)

  useEffect(() => {
    const fetchDoaMaster = async () => {
      setLoadingDoaMaster(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('doa_master')
          .select('id, judul, arab, latin, terjemah, referensi, sumber_kitab, keutamaan, waktu_baca, derajat, tema_kultum')
          .order('id')
        if (!error && data) setDoaMaster(data)
      } catch (err) {
        console.error('[DoaMaster] fetch error:', err)
      } finally {
        setLoadingDoaMaster(false)
      }
    }
    fetchDoaMaster()
  }, [])

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--gold-light)] mb-4">
            Doa dari Al-Qur&apos;an
          </h1>
          
          <div className="max-w-2xl mx-auto glass-card p-6 md:p-8 rounded-3xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[var(--dark)] border border-[var(--gold)] px-4 py-1 rounded-full font-cinzel text-xs uppercase tracking-widest font-bold text-[var(--gold-light)]">
              QS. Ghafir : 60
            </div>
            <p className="font-amiri text-2xl md:text-3xl leading-loose text-[var(--gold-light)] mb-4 mt-2" dir="rtl">
              وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ
            </p>
            <p className="font-cairo text-sm italic text-[var(--teal-200)] text-right mb-2">
              Wa qāla rabbukumud&apos;ūnī astajib lakum
            </p>
            <p className="font-cairo text-base leading-relaxed text-[var(--text1)] font-medium">
              &quot;Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.&quot;
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{DOA_QURANI.length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Total Doa</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{NABI_LIST.length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Doa Nabi</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{Object.keys(HAJAT_INFO).length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Kategori Hajat</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
        
        {/* Doa Pilihan Hari Ini */}
        {doaHariIni && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Doa Pilihan Hari Ini</h2>
            </div>
            
            <Link href={`/doa/${doaHariIni.id}`} className="block group">
              <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,163,90,0.15)] hover:border-[var(--gold-light)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-10 group-hover:bg-rose-500/20 transition-all duration-500"></div>
                
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-cairo text-xs uppercase tracking-widest px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full font-semibold text-rose-300">
                        Mustajab
                      </span>
                      {doaHariIni.nabi && (
                        <span className="font-cairo text-xs uppercase tracking-widest px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full font-semibold text-amber-300">
                          {doaHariIni.nabi}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-2 group-hover:text-[var(--gold-light)] transition-colors">
                      {doaHariIni.judul}
                    </h3>
                    
                    <div className="font-amiri text-2xl md:text-3xl leading-loose text-[var(--gold-light)] my-6" dir="rtl">
                      {doaHariIni.arab}
                    </div>
                    
                    <p className="font-cairo text-base leading-relaxed text-[var(--text1)] line-clamp-2">
                      {doaHariIni.terjemah}
                    </p>
                    
                    <div className="pt-4 mt-4 border-t border-[var(--gold-border)] flex items-center justify-between">
                      <span className="font-cairo text-xs text-[var(--text3)] font-bold">{doaHariIni.referensi}</span>
                      <span className="font-cairo text-sm font-semibold flex items-center gap-1 text-[var(--teal-200)] group-hover:translate-x-1 transition-transform">
                        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 4 Kategori Utama */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-[var(--teal-200)]" />
            <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Kategori Doa</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORY_CARDS.map(cat => (
              <Link key={cat.id} href={`/doa/kategori/${cat.id}`} className="block group">
                <div className={`h-full glass-card p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden ${cat.borderColor} bg-gradient-to-br ${cat.color} bg-opacity-10 backdrop-blur-xl`}>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--dark2)] border border-[var(--gold-border)] flex items-center justify-center text-[var(--gold-light)] mb-4 shadow-inner group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-2">{cat.title}</h3>
                  <p className="font-cairo text-sm text-[var(--text2)] mb-4">{cat.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-cairo text-xs uppercase tracking-widest font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                      {cat.count} Doa
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--teal-200)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cari berdasarkan Hajat */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--gold)]" />
              <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Cari Berdasarkan Hajat</h2>
            </div>
            <Link href="/doa/hajat" className="font-cairo text-sm font-semibold text-[var(--teal-200)] hover:text-[var(--teal-100)] flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto pb-4 gap-3 snap-x hide-scrollbar pr-6">
            {Object.entries(HAJAT_INFO).map(([key, info]) => (
              <Link 
                key={key} 
                href={`/doa/hajat/${key}`}
                className="flex-shrink-0 snap-start"
              >
                <div className="glass-card px-5 py-3 rounded-2xl border-[var(--gold-border)] hover:border-[var(--gold-light)] hover:bg-[var(--dark3)] transition-all flex items-center gap-3 min-w-max">
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-cairo text-sm font-semibold whitespace-nowrap text-[var(--text1)]">{info.label}</span>
                </div>
              </Link>
            ))}
            {/* Spacer agar chip terakhir tidak terpotong */}
            <div className="flex-shrink-0 w-6" />
          </div>
        </section>

        {/* ===== SECTION: Doa Hisnul Muslim ===== */}
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">📖 Doa Hisnul Muslim (Shahih)</h2>
          </div>
          <p className="font-cairo text-sm text-[var(--text2)] mb-6">
            Kumpulan doa shahih dari kitab Hisnul Muslim karya Sa&apos;id Al-Qahtani
          </p>

          {loadingDoaMaster ? (
            /* Skeleton loader */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl border border-[var(--gold-border)]/30 p-5 flex flex-col gap-3 animate-pulse">
                  <div className="h-4 bg-[var(--dark3)] rounded w-2/3" />
                  <div className="h-10 bg-[var(--dark3)] rounded w-full" />
                  <div className="h-3 bg-[var(--dark3)] rounded w-1/2" />
                  <div className="h-3 bg-[var(--dark3)] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : doaMaster.length === 0 ? (
            <div className="glass-card rounded-2xl border border-dashed border-[var(--gold-border)]/30 p-10 text-center">
              <p className="font-cairo text-sm text-[var(--text3)] italic">
                🌙 Segera hadir — koleksi doa sedang dikurasi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doaMaster.map(doa => (
                <DoaMasterCard key={doa.id} doa={doa} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
