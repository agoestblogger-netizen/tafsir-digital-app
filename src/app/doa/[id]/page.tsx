"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Quote, Sparkles, Copy, Share2, PlayCircle, Image as ImageIcon, ExternalLink, Bookmark } from 'lucide-react'
import { getById, getByHajat } from '@/data/doa_qurani'
import { BackButton } from '@/components/ui/BackButton'

export default function DoaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const doa = getById(id)
  const [copied, setCopied] = useState(false)

  if (!doa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl text-[var(--gold)] mb-4">Doa tidak ditemukan</h1>
        <BackButton label="Kembali ke Beranda Doa" />
      </div>
    )
  }

  const handleCopy = () => {
    const textToCopy = `${doa.judul}\n\n${doa.arab}\n\n${doa.latin}\n\nArtinya: "${doa.terjemah}"\n\n(${doa.referensi})`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doa.judul,
          text: `Baca Doa Al-Qur'an: ${doa.judul}\n\n${doa.terjemah}\n\n(${doa.referensi})`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share error:', err)
      }
    } else {
      handleCopy()
    }
  }

  // Get related doas based on the first tema_hajat (if any)
  const relatedDoas = doa.tema_hajat && doa.tema_hajat.length > 0
    ? getByHajat(doa.tema_hajat[0]).filter(d => d.id !== doa.id).slice(0, 3)
    : []

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--teal-900)]/40 to-transparent -z-10 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation */}
        <BackButton />

        {/* Main Content Card */}
        <main className="glass-card p-6 md:p-8 lg:p-10 rounded-[2rem] border-[var(--gold-border)] relative overflow-hidden">
          {/* Subtle Arabesque Watermark */}
          <div className="absolute top-0 right-0 w-full h-full arabesque-bg opacity-[0.03] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-8">
            
            {/* 1. Header: judul + badge */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-cairo px-3 py-1 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-full text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                  {doa.kategori}
                </span>
                {doa.mustajab && (
                  <span className="font-cairo px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-xs font-bold text-rose-300 flex items-center gap-1 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> Mustajab
                  </span>
                )}
                {doa.tema_hajat?.map(tema => (
                  <span key={tema} className="font-cairo px-3 py-1 bg-[var(--teal-900)]/50 border border-[var(--teal-500)]/30 rounded-full text-xs font-bold text-[var(--teal-200)] uppercase tracking-widest">
                    {tema}
                  </span>
                ))}
              </div>
              <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)]">
                {doa.judul}
              </h1>
            </header>

            {/* 2. Teks Arab */}
            <div className="font-amiri text-2xl md:text-3xl leading-loose text-right text-[var(--gold-light)]" style={{ direction: 'rtl' }}>
              {doa.arab}
            </div>

            {/* 3. Transliterasi Latin */}
            <div className="font-cairo text-sm text-right italic text-[var(--teal-200)] leading-relaxed">
              {doa.latin}
            </div>

            {/* 4. Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50"></div>

            {/* 5. Terjemahan */}
            <div className="font-cairo text-base text-[var(--text1)] leading-relaxed font-medium">
              &quot;{doa.terjemah}&quot;
            </div>

            {/* 10. Action bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-xl text-sm font-semibold text-[var(--text1)] hover:bg-[var(--dark2)] hover:border-[var(--gold)]/50 transition-all"
              >
                {copied ? <Bookmark className="w-4 h-4 text-[var(--teal-200)]" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-xl text-sm font-semibold text-[var(--text1)] hover:bg-[var(--dark2)] hover:border-[var(--gold)]/50 transition-all"
              >
                <Share2 className="w-4 h-4" /> Bagikan
              </button>
              
              {/* Placeholders for future features */}
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)]/50 border border-[var(--gold-border)]/50 rounded-xl text-sm font-semibold text-[var(--text2)] opacity-50 cursor-not-allowed" title="Segera hadir">
                <PlayCircle className="w-4 h-4" /> Audio
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dark3)]/50 border border-[var(--gold-border)]/50 rounded-xl text-sm font-semibold text-[var(--text2)] opacity-50 cursor-not-allowed" title="Segera hadir">
                <ImageIcon className="w-4 h-4" /> Poster
              </button>
            </div>

            {/* 9. Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[var(--dark2)] border border-[var(--gold-border)]">
              <div className="space-y-1">
                <p className="font-cinzel text-xs text-[var(--text3)] uppercase tracking-widest">Surah</p>
                <p className="font-cairo text-sm font-bold text-[var(--text1)]">{doa.surah_nama}</p>
              </div>
              <div className="space-y-1">
                <p className="font-cinzel text-xs text-[var(--text3)] uppercase tracking-widest">Ayat</p>
                <p className="font-cairo text-sm font-bold text-[var(--text1)]">{doa.nomor_ayat}</p>
              </div>
              {doa.nabi && (
                <div className="space-y-1 col-span-2 md:col-span-2">
                  <p className="font-cinzel text-xs text-[var(--text3)] uppercase tracking-widest">Nabi yang Berdoa</p>
                  <p className="font-cairo text-sm font-bold text-[var(--gold)]">{doa.nabi}</p>
                </div>
              )}
            </div>

            {/* 11. Link ke Al-Qur'an */}
            <div className="flex justify-center pt-2">
              <Link 
                href={`/surah/${doa.surah_id}#ayat-${doa.nomor_ayat.split('-')[0]}`}
                className="font-cairo inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--teal-600)] to-[var(--teal-500)] text-white text-base font-bold shadow-[0_4px_16px_rgba(13,79,60,0.4)] hover:-translate-y-0.5 transition-transform"
              >
                Buka Ayat di Al-Qur&apos;an <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </main>

        {/* 6. Section Konteks */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--gold)] mb-2">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Konteks & Sejarah Doa</h2>
          </div>
          <div className="glass-card p-5 md:p-6 rounded-2xl border-l-4 border-l-[var(--gold)]">
            <p className="font-cairo text-base leading-relaxed text-[var(--text1)]">
              {doa.konteks}
            </p>
          </div>
        </section>

        {/* 7. Section Tafsir Ulama */}
        {doa.tafsir_ulama.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-[var(--teal-200)] mb-2">
              <Quote className="w-5 h-5" />
              <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Tafsir & Penjelasan Ulama</h2>
            </div>
            <div className="space-y-4">
              {doa.tafsir_ulama.map((tafsir, idx) => (
                <div key={idx} className="glass-card p-5 md:p-6 rounded-2xl border-[var(--gold-border)] relative">
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-[var(--dark3)] opacity-50 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-3">{tafsir.sumber}</h3>
                    <p className="font-cairo text-base leading-relaxed text-[var(--text1)] italic">
                      &quot;{tafsir.teks}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Keutamaan */}
        {doa.keutamaan && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Keutamaan Doa</h2>
            </div>
            <div className="glass-card p-5 md:p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5">
              <p className="font-cairo text-base leading-relaxed text-[var(--text1)]">
                {doa.keutamaan}
              </p>
            </div>
          </section>
        )}

        {/* 12. Doa Terkait */}
        {relatedDoas.length > 0 && (
          <section className="pt-8 mt-8 border-t border-[var(--gold-border)]">
            <h2 className="font-cinzel text-xl font-bold text-[var(--text1)] mb-6">Doa Terkait ({doa.tema_hajat?.[0]})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedDoas.map(related => (
                <Link key={related.id} href={`/doa/${related.id}`} className="block group">
                  <div className="glass-card p-5 rounded-2xl border-[var(--gold-border)] hover:border-[var(--teal-500)] transition-colors h-full flex flex-col">
                    <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-2 group-hover:text-[var(--teal-200)] transition-colors line-clamp-1">
                      {related.judul}
                    </h3>
                    <p className="font-cairo text-sm text-[var(--text2)] line-clamp-2 mb-4 flex-1">
                      {related.terjemah}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--dark3)]">
                      <span className="font-cairo text-xs uppercase tracking-widest text-[var(--text3)]">{related.referensi}</span>
                      <ArrowLeft className="w-4 h-4 text-[var(--teal-200)] rotate-180 group-hover:translate-x-1 transition-transform" />
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
