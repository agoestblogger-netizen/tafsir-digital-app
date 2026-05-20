"use client"

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, BookOpen, Filter, ArrowRight } from 'lucide-react'
import { KategoriDoa, getByKategori, DOA_QURANI, NABI_LIST } from '@/data/doa_qurani'

const KATEGORI_TITLE: Record<string, string> = {
  rabbana: 'Doa Rabbana',
  rabbi: 'Doa Rabbi',
  nabi: 'Doa Para Nabi',
  semua: 'Semua Doa Al-Qur\'an'
}

export default function KategoriDoaPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNabi, setSelectedNabi] = useState<string>('Semua')

  // Validasi slug
  const isValidSlug = ['rabbana', 'rabbi', 'nabi', 'semua'].includes(slug)

  const doaList = useMemo(() => {
    if (!isValidSlug) return []
    let list = slug === 'semua' ? DOA_QURANI : getByKategori(slug as KategoriDoa)
    
    // Filter by Nabi if category is 'nabi'
    if (slug === 'nabi' && selectedNabi !== 'Semua') {
      list = list.filter(d => d.nabi === selectedNabi)
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      list = list.filter(d => 
        d.judul.toLowerCase().includes(q) || 
        d.terjemah.toLowerCase().includes(q) ||
        d.latin.toLowerCase().includes(q) ||
        d.arab.includes(q)
      )
    }
    
    return list
  }, [slug, isValidSlug, searchQuery, selectedNabi])

  if (!isValidSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl text-[var(--gold)] mb-4">Kategori tidak ditemukan</h1>
        <button onClick={() => router.push('/doa')} className="text-[var(--teal-200)] flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda Doa
        </button>
      </div>
    )
  }

  const title = KATEGORI_TITLE[slug]

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--gold-border)]">
        <div className="arabesque-bg opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <button onClick={() => router.push('/doa')} className="font-cairo flex items-center gap-2 text-[var(--text2)] hover:text-[var(--gold-light)] mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-[var(--gold)]" />
            <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--gold-light)]">
              {title}
            </h1>
          </div>
          <p className="font-cairo text-sm text-[var(--text2)] mb-8 max-w-2xl">
            {slug === 'semua' 
              ? 'Kumpulan seluruh doa yang terdapat di dalam Al-Qur\'an.' 
              : `Menampilkan ${doaList.length} doa dalam kategori ini.`}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--text2)]" />
            </div>
            <input
              type="text"
              placeholder="Cari judul, terjemahan, atau lafadz doa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-cairo block w-full pl-11 pr-4 py-3 bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl text-[var(--text1)] placeholder-[var(--text2)] focus:ring-2 focus:ring-[var(--teal-500)] focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Filter per Nabi */}
        {slug === 'nabi' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 snap-x hide-scrollbar mb-4 pr-6">
            <div className="flex items-center gap-2 text-[var(--text2)] mr-2 flex-shrink-0">
              <Filter className="w-4 h-4" /> <span className="font-cairo text-xs uppercase tracking-widest font-bold">Filter Nabi:</span>
            </div>
            <button
              onClick={() => setSelectedNabi('Semua')}
              className={`font-cairo flex-shrink-0 snap-start px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${
                selectedNabi === 'Semua' 
                  ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-light)]' 
                  : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'
              }`}
            >
              Semua
            </button>
            {NABI_LIST.map(nabi => (
              <button
                key={nabi}
                onClick={() => setSelectedNabi(nabi)}
                className={`font-cairo flex-shrink-0 snap-start px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all border ${
                  selectedNabi === nabi 
                    ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-light)]' 
                    : 'bg-[var(--dark2)] border-[var(--gold-border)] text-[var(--text2)] hover:border-[var(--gold)]/50'
                }`}
              >
                {nabi}
              </button>
            ))}
            {/* Spacer agar chip terakhir tidak terpotong */}
            <div className="flex-shrink-0 w-6" />
          </div>
        )}

        {/* List Doa */}
        {doaList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {doaList.map(doa => (
              <Link key={doa.id} href={`/doa/${doa.id}`} className="block group">
                <div className="glass-card p-5 md:p-6 rounded-3xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(201,163,90,0.1)] hover:border-[var(--gold-light)]/50 relative overflow-hidden">
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {doa.mustajab && (
                      <span className="font-cairo px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded-full text-[10px] uppercase tracking-widest font-bold text-rose-300">
                        Mustajab
                      </span>
                    )}
                    {doa.nabi && (
                      <span className="font-cairo px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] uppercase tracking-widest font-bold text-amber-300">
                        {doa.nabi}
                      </span>
                    )}
                  </div>

                  <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-4 group-hover:text-[var(--gold-light)] transition-colors">
                    {doa.judul}
                  </h3>

                  <div className="font-amiri text-2xl md:text-3xl leading-loose text-right text-[var(--gold-light)] mb-4" dir="rtl">
                    {doa.arab}
                  </div>

                  <div className="font-cairo text-sm italic text-right text-[var(--teal-200)] mb-4">
                    {doa.latin}
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent my-4"></div>

                  <p className="font-cairo text-base leading-relaxed text-[var(--text1)] line-clamp-2 text-opacity-90">
                    {doa.terjemah}
                  </p>

                  <div className="mt-5 pt-4 border-t border-[var(--dark3)] flex flex-wrap items-center justify-between gap-4">
                    <span className="font-cairo text-xs uppercase tracking-widest font-bold bg-[var(--dark3)] px-3 py-1 rounded-lg text-[var(--text3)] border border-[var(--gold-border)]">
                      {doa.referensi}
                    </span>
                    <button className="font-cairo text-sm font-semibold text-[var(--teal-200)] group-hover:text-[var(--teal-100)] flex items-center gap-1 transition-colors">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl">
            <Search className="w-12 h-12 text-[var(--text2)] mx-auto mb-4 opacity-50" />
            <h3 className="font-cinzel text-xl font-bold text-[var(--text1)] mb-2">Tidak ada doa ditemukan</h3>
            <p className="font-cairo text-sm text-[var(--text2)]">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </div>
  )
}
