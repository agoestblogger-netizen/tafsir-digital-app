"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share2, Star, CheckCircle, RefreshCcw, ArrowLeft, BookOpen, ScrollText, PlayCircle } from 'lucide-react'
import { KultumOutput } from '@/app/api/kultum-generator/route'

interface KultumResultViewProps {
  konten: KultumOutput
  recordId?: string
  isSaved?: boolean
  isFavorite?: boolean
  isUsed?: boolean
  onToggleFavorite?: () => void
  onToggleUsed?: () => void
}

export function KultumResultView({
  konten, recordId, isSaved, isFavorite = false, isUsed = false, onToggleFavorite, onToggleUsed
}: KultumResultViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const cleanText = (text: string | undefined | null) => text?.replace(/"""/g, '').trim() ?? ''
  
  const isValidText = (text?: string) =>
    !!text && text.trim() !== '' && text.trim() !== '"""' && text.trim() !== '"'

  const handleCopyAll = () => {
    // Construct full text to copy
    let fullText = `${konten.judul}\n(${konten.format} - ${konten.durasi_estimasi})\n\n`
    
    // Doa Pembuka
    fullText += `[Doa Pembuka]\n${konten.bagian.doa_pembuka?.arab}\n${konten.bagian.doa_pembuka?.latin}\nArtinya: ${konten.bagian.doa_pembuka?.terjemah}\n\n`
    
    // Pembuka
    fullText += `[Pembukaan]\n${konten.bagian.pembuka?.salam}\n${konten.bagian.pembuka?.muqaddimah}\n${konten.bagian.pembuka?.pengantar_tema}\n\n`
    
    // Ayat
    ;(konten.bagian.ayat_quran ?? []).forEach(a => {
      fullText += `[Ayat Al-Qur'an]\n${a.arab}\n${a.latin}\nArtinya: ${a.terjemah}\n(${a.referensi})\n\n`
    })

    // Tafsir
    fullText += `[Penjabaran Tafsir]\n${konten.bagian.penjabaran_tafsir}\n\n`

    // Hadits
    ;(konten.bagian.hadits_pendukung ?? []).forEach(h => {
      fullText += `[Hadits Pendukung]\n${h.arab}\n${h.latin}\nArtinya: ${h.terjemah}\n(${h.referensi})\n\n`
    })

    // Penekanan Makna
    fullText += `[Penekanan Makna]\n${konten.bagian.penekanan_makna}\n\n`

    // Poin Utama
    fullText += `[Poin-poin Utama]\n`
    ;(konten.bagian.poin_utama ?? []).forEach((p, i) => {
      fullText += `${i+1}. ${p.judul}\n   ${p.isi}\n`
    })
    fullText += '\n'

    // Penutup
    const kesimpulan = konten.bagian.kesimpulan || konten.bagian.penutup?.kesimpulan || ''
    const ajakan = konten.bagian.ajakan_penutup || konten.bagian.penutup?.ajakan || ''
    const doaPenutup = konten.bagian.doa_penutup_tema || konten.bagian.penutup?.doa_penutup_konten || ''
    fullText += `[Penutup]\n${kesimpulan}\n${ajakan}\n${doaPenutup}\n\n`

    // Doa Majelis
    fullText += `[Kaffaratul Majelis]\n${konten.bagian.doa_penutup_majelis?.arab}\n${konten.bagian.doa_penutup_majelis?.latin}\nArtinya: ${konten.bagian.doa_penutup_majelis?.terjemah}\n`

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share && recordId) {
      try {
        await navigator.share({
          title: konten.judul,
          text: `Baca ${konten.format} menarik dengan tema: ${konten.tema}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      handleCopyAll()
    }
  }

  console.log('Konten bagian:', JSON.stringify(konten.bagian, null, 2))

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Info */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-full text-xs font-bold text-[var(--gold)] uppercase">
              {konten.format}
            </span>
            <span className="px-3 py-1 bg-[var(--teal-900)]/50 border border-[var(--teal-500)]/30 rounded-full text-xs font-bold text-[var(--teal-200)] uppercase">
              {konten.durasi_estimasi}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]">
            {konten.judul}
          </h1>
          <p className="text-[var(--text2)] font-semibold">Tema: {konten.tema}</p>
        </div>

        {/* 1. Doa Pembuka Majelis */}
        <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen className="w-24 h-24 text-amber-500" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-6">🤲 Doa Pembuka Majelis</div>
          <div className="relative z-10 space-y-4">
            <div className="text-2xl md:text-3xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
              {konten.bagian.doa_pembuka?.arab}
            </div>
            <div className="text-sm italic text-right text-[var(--teal-200)]">
              {konten.bagian.doa_pembuka?.latin}
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
            <div className="text-[var(--text1)] text-base font-cairo">
              {konten.bagian.doa_pembuka?.terjemah}
            </div>
            <div className="text-xs font-bold text-amber-500/70 pt-2">
              Sumber: {konten.bagian.doa_pembuka?.sumber}
            </div>
          </div>
        </section>

        {/* 2. Pembuka */}
        <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--teal-300)] mb-6">🌟 Pembukaan</div>
          <div className="space-y-4">
            <p className="text-lg font-bold text-[var(--gold)]">{konten.bagian.pembuka?.salam}</p>
            <p className="text-[var(--text1)] leading-relaxed">{konten.bagian.pembuka?.muqaddimah}</p>
            <p className="text-[var(--text1)] leading-relaxed font-semibold text-[var(--teal-100)]">{konten.bagian.pembuka?.pengantar_tema}</p>
          </div>
        </section>

        {/* 3. Ayat Al-Qur'an */}
        <section className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 px-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Ayat Al-Qur&apos;an Pendukung
          </div>
          {(konten.bagian.ayat_quran ?? []).map((ayat, i) => (
            <div key={i} className="bg-[var(--dark2)] border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/60 transition-colors">
              <div className="space-y-4">
                <div className="text-3xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
                  {ayat.arab}
                </div>
                <div className="text-sm italic text-right text-[var(--teal-200)]">
                  {ayat.latin}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
                <div className="text-[var(--text1)] text-base leading-relaxed">
                  &quot;{ayat.terjemah}&quot;
                </div>
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dark3)]">
                  <span className="text-xs font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                    {ayat.referensi}
                  </span>
                  <span className="text-xs text-[var(--text2)] italic max-w-sm text-right">
                    {ayat.tafsir_singkat}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 4. Penjabaran Tafsir */}
        <section className="bg-gradient-to-br from-[var(--dark2)] to-[var(--dark3)] border border-[var(--gold-border)] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-4 flex items-center gap-2">
            <ScrollText className="w-4 h-4" /> Penjabaran & Tafsir
          </div>
          <div className="text-[var(--text1)] leading-relaxed space-y-4 whitespace-pre-wrap">
            {konten.bagian.penjabaran_tafsir}
          </div>
        </section>

        {/* 5. Hadits Pendukung */}
        {(konten.bagian.hadits_pendukung ?? []).length > 0 && (
          <section className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 px-2 flex items-center gap-2">
              <ScrollText className="w-4 h-4" /> Hadits Pendukung
            </div>
            {(konten.bagian.hadits_pendukung ?? []).map((hadits, i) => (
              <div key={i} className="bg-[var(--dark2)] border border-emerald-500/30 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="text-2xl leading-loose text-right text-[var(--gold-light)] font-amiri" dir="rtl">
                    {hadits.arab}
                  </div>
                  <div className="text-sm italic text-right text-[var(--teal-200)]">
                    {hadits.latin}
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--gold-border)] to-transparent opacity-50 my-4" />
                  <div className="text-[var(--text1)] text-base leading-relaxed">
                    &quot;{hadits.terjemah}&quot;
                  </div>
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--dark3)]">
                    <span className="text-xs font-bold bg-[var(--dark)] px-3 py-1 rounded-full text-[var(--gold)] border border-[var(--gold-border)]">
                      {hadits.referensi}
                    </span>
                    <span className="text-xs text-[var(--text2)] italic max-w-sm text-right">
                      {hadits.syarah}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 6. Penekanan Makna */}
        {konten.bagian.penekanan_makna && (
          <section className="border-l-4 border-[var(--teal-500)] bg-[var(--dark2)] p-6 rounded-r-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--teal-300)] mb-4">💬 Penekanan Makna</div>
            <div className="text-[var(--text1)] leading-relaxed whitespace-pre-wrap font-medium">
              {konten.bagian.penekanan_makna}
            </div>
          </section>
        )}

        {/* 7. Poin Utama */}
        {(konten.bagian.poin_utama ?? []).length > 0 && (
          <section className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 px-2">💡 Poin-Poin Utama</div>
            <div className="grid gap-4">
              {(konten.bagian.poin_utama ?? []).map((poin, i) => (
                <div key={i} className="flex gap-4 p-5 bg-[var(--dark2)] border border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-colors">
                  <div className="w-10 h-10 shrink-0 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center font-bold text-lg font-cinzel border border-purple-500/30">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text1)] mb-2">{poin.judul}</h3>
                    <p className="text-[var(--text2)] text-sm leading-relaxed">{poin.isi}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Penutup */}
        <section className="bg-[var(--dark2)] border border-[var(--gold-border)] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">🏁 Kesimpulan & Penutup</div>
          <div className="space-y-4">
            {(isValidText(konten.bagian.kesimpulan) || isValidText(konten.bagian.penutup?.kesimpulan)) && (
              <p className="text-[var(--text1)] leading-relaxed whitespace-pre-line">
                {cleanText(konten.bagian.kesimpulan || konten.bagian.penutup?.kesimpulan)}
              </p>
            )}
            {(isValidText(konten.bagian.ajakan_penutup) || isValidText(konten.bagian.penutup?.ajakan)) && (
              <div className="p-4 bg-[var(--teal-900)]/30 border border-[var(--teal-500)]/30 rounded-xl">
                <p className="text-[var(--teal-100)] font-semibold text-center italic">
                  &quot;{cleanText(konten.bagian.ajakan_penutup || konten.bagian.penutup?.ajakan)}&quot;
                </p>
              </div>
            )}
            {(isValidText(konten.bagian.doa_penutup_tema) || isValidText(konten.bagian.penutup?.doa_penutup_konten)) && (
              <p className="text-[var(--text1)] leading-relaxed pt-2 text-center">
                {cleanText(konten.bagian.doa_penutup_tema || konten.bagian.penutup?.doa_penutup_konten)}
              </p>
            )}
          </div>
        </section>

        {/* 9. Doa Penutup Majelis */}
        {konten.bagian.doa_penutup_majelis && (
          <section className="bg-[var(--dark3)] border border-[var(--gold-border)] rounded-2xl p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text2)] mb-6 text-center">🤲 Kaffaratul Majelis (Penutup)</div>
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <div className="text-2xl leading-loose text-[var(--gold-light)] font-amiri" dir="rtl">
                {konten.bagian.doa_penutup_majelis?.arab}
              </div>
              <div className="text-sm italic text-[var(--teal-200)]">
                {konten.bagian.doa_penutup_majelis?.latin}
              </div>
              <div className="text-[var(--text2)] text-sm pt-2">
                {konten.bagian.doa_penutup_majelis?.terjemah}
              </div>
              <div className="text-[10px] font-bold text-[var(--text3)] uppercase pt-4">
                {konten.bagian.doa_penutup_majelis?.sumber}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
