"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share2, Star, CheckCircle, RefreshCcw, ArrowLeft, BookOpen, ScrollText } from 'lucide-react'

// Interface based on generateKhotbahJumat output
export interface KhotbahJumatOutput {
  judul: string;
  format: string;
  tema: string;
  durasi_estimasi?: string;
  durasi_per_bagian?: {
    khotbah_pertama: number;
    duduk_antara: number;
    khotbah_kedua: number;
  };
  persiapan_khatib: {
    catatan: string;
    salam_naik_mimbar: string;
  };
  khotbah_pertama: {
    pembuka_hamdalah: { arab: string; latin: string; terjemah: string; };
    syahadat: { arab: string; latin: string; terjemah: string; };
    shalawat: { arab: string; latin: string; terjemah: string; };
    wasiat_taqwa: string;
    ayat_quran: { arab: string; latin: string; terjemah: string; referensi: string; }[];
    isi_khotbah: string;
    penutup_khotbah_pertama: { arab: string; latin: string; terjemah: string; };
  };
  duduk_antara_dua_khotbah: {
    catatan: string;
    doa_duduk: { arab: string; latin: string; terjemah: string; sumber: string; };
  };
  khotbah_kedua: {
    pembuka: { arab: string; latin: string; terjemah: string; };
    wasiat_taqwa_2: string;
    isi_khotbah_2: string;
    shalawat_ibrahim: { arab: string; latin: string; terjemah: string; sumber: string; };
    doa_kaum_muslimin: { arab: string; latin: string; terjemah: string; sumber: string; };
    doa_penutup_khotbah: { arab: string; latin: string; terjemah: string; sumber: string; };
    penutup_khotbah: { arab: string; latin: string; terjemah: string; catatan_khatib: string; };
  };
  catatan_pelaksanaan: string[];
}

interface KhotbahJumatViewProps {
  konten: KhotbahJumatOutput
  recordId?: string
  isSaved?: boolean
  isFavorite?: boolean
  isUsed?: boolean
  onToggleFavorite?: () => void
  onToggleUsed?: () => void
}

export function KhotbahJumatView({
  konten, recordId, isSaved, isFavorite = false, isUsed = false, onToggleFavorite, onToggleUsed
}: KhotbahJumatViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const cleanText = (text: string | undefined | null) => text?.replace(/"""/g, '').trim() ?? ''
  
  const isValidText = (text?: string) =>
    !!text && text.trim() !== '' && text.trim() !== '"""' && text.trim() !== '"'

  const handleCopyAll = () => {
    // Basic copy implementation for Khotbah
    let fullText = `${konten.judul}\n(Khotbah Jum'at)\n\n`
    
    fullText += `[Persiapan]\n${konten.persiapan_khatib?.catatan}\n${konten.persiapan_khatib?.salam_naik_mimbar}\n\n`
    
    // Khotbah 1
    fullText += `--- KHOTBAH PERTAMA ---\n`
    fullText += `${konten.khotbah_pertama?.pembuka_hamdalah?.arab}\n${konten.khotbah_pertama?.syahadat?.arab}\n${konten.khotbah_pertama?.shalawat?.arab}\n\n`
    fullText += `${konten.khotbah_pertama?.wasiat_taqwa}\n\n`
    
    ;(konten.khotbah_pertama?.ayat_quran ?? []).forEach(a => {
      fullText += `${a.arab}\n${a.latin}\nArtinya: ${a.terjemah}\n(${a.referensi})\n\n`
    })

    fullText += `${konten.khotbah_pertama?.isi_khotbah}\n\n`
    fullText += `${konten.khotbah_pertama?.penutup_khotbah_pertama?.arab}\n\n`

    // Duduk
    fullText += `--- DUDUK ANTARA DUA KHOTBAH ---\n`
    fullText += `${konten.duduk_antara_dua_khotbah?.doa_duduk?.arab}\n\n`

    // Khotbah 2
    fullText += `--- KHOTBAH KEDUA ---\n`
    fullText += `${konten.khotbah_kedua?.pembuka?.arab}\n\n`
    fullText += `${konten.khotbah_kedua?.wasiat_taqwa_2}\n\n`
    fullText += `${konten.khotbah_kedua?.isi_khotbah_2}\n\n`
    fullText += `${konten.khotbah_kedua?.shalawat_ibrahim?.arab}\n\n`
    fullText += `${konten.khotbah_kedua?.doa_kaum_muslimin?.arab}\n\n`
    fullText += `${konten.khotbah_kedua?.doa_penutup_khotbah?.arab}\n\n`
    fullText += `${konten.khotbah_kedua?.penutup_khotbah?.arab}\n`

    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share && recordId) {
      try {
        await navigator.share({
          title: konten.judul,
          text: `Baca Khotbah Jum'at menarik dengan tema: ${konten.tema}`,
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Info */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[var(--dark3)] border border-[var(--gold-border)] rounded-full text-xs font-bold text-[var(--gold)] uppercase">
              Khotbah Jum&apos;at
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)]">
            {konten.judul}
          </h1>
          <p className="text-[var(--text2)] font-semibold">Tema: {konten.tema}</p>
        </div>

        {/* 1. Persiapan Khatib */}
        <section className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ScrollText className="w-24 h-24 text-sky-500" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-4">📋 Catatan Persiapan Khatib</div>
          <div className="relative z-10 space-y-3">
            <p className="text-[var(--text1)] text-sm">{cleanText(konten.persiapan_khatib?.catatan)}</p>
            <div className="p-3 bg-sky-900/30 rounded-lg border border-sky-500/30">
              <p className="font-bold text-sky-200">Salam: &quot;{cleanText(konten.persiapan_khatib?.salam_naik_mimbar)}&quot;</p>
            </div>
          </div>
        </section>

        {/* 2. Khotbah Pertama */}
        <section className="border-l-4 border-[var(--teal-500)] bg-[var(--dark2)] rounded-r-2xl p-6 md:p-8 space-y-8 shadow-lg relative overflow-hidden">
          <div className="text-sm font-bold tracking-widest text-[var(--teal-400)] mb-6 border-b border-[var(--teal-500)]/30 pb-4 flex items-center justify-between">
            <span>━━━━ KHOTBAH PERTAMA ━━━━</span>
            {konten.durasi_per_bagian?.khotbah_pertama && (
              <span className="font-cairo text-xs text-[var(--text3)] font-normal normal-case flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                ⏱ ~{konten.durasi_per_bagian.khotbah_pertama} menit
              </span>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Hamdalah */}
            <div className="space-y-2">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_pertama?.pembuka_hamdalah?.arab)}</div>
              <p className="italic text-right text-[var(--teal-300)] text-sm">{cleanText(konten.khotbah_pertama?.pembuka_hamdalah?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_pertama?.pembuka_hamdalah?.terjemah)}</p>
            </div>
            
            {/* Syahadat */}
            <div className="space-y-2">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_pertama?.syahadat?.arab)}</div>
              <p className="italic text-right text-[var(--teal-300)] text-sm">{cleanText(konten.khotbah_pertama?.syahadat?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_pertama?.syahadat?.terjemah)}</p>
            </div>

            {/* Shalawat */}
            <div className="space-y-2">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_pertama?.shalawat?.arab)}</div>
              <p className="italic text-right text-[var(--teal-300)] text-sm">{cleanText(konten.khotbah_pertama?.shalawat?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_pertama?.shalawat?.terjemah)}</p>
            </div>

            {/* Wasiat Taqwa */}
            <div className="p-4 bg-[var(--teal-900)]/20 border border-[var(--teal-500)]/20 rounded-xl my-6">
              <p className="font-semibold text-[var(--teal-100)] text-center">{cleanText(konten.khotbah_pertama?.wasiat_taqwa)}</p>
            </div>

            {/* Ayat */}
            {konten.khotbah_pertama?.ayat_quran?.map((ayat, i) => (
              <div key={i} className="my-6 p-6 bg-gradient-to-b from-[var(--dark)] to-[var(--dark3)] rounded-2xl border border-[var(--gold-border)]">
                <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-3xl md:text-4xl leading-[2.5] text-[var(--gold)] text-center mb-6">
                  {cleanText(ayat.arab)}
                </div>
                <p className="italic text-center text-[var(--teal-200)] text-sm mb-4">{cleanText(ayat.latin)}</p>
                <p className="text-[var(--text1)] text-center leading-relaxed font-semibold mb-4">&quot;{cleanText(ayat.terjemah)}&quot;</p>
                <div className="text-center text-xs text-[var(--gold)] tracking-widest uppercase">{cleanText(ayat.referensi)}</div>
              </div>
            ))}

            {/* Isi Khotbah */}
            <div className="prose prose-invert max-w-none text-[var(--text1)] leading-loose whitespace-pre-line text-justify">
              {cleanText(konten.khotbah_pertama?.isi_khotbah)}
            </div>

            {/* Penutup Khotbah Pertama */}
            <div className="pt-8 space-y-2 mt-8 border-t border-[var(--teal-500)]/20">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_pertama?.penutup_khotbah_pertama?.arab)}</div>
              <p className="italic text-right text-[var(--teal-300)] text-sm">{cleanText(konten.khotbah_pertama?.penutup_khotbah_pertama?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_pertama?.penutup_khotbah_pertama?.terjemah)}</p>
            </div>
          </div>
        </section>

        {/* 3. Duduk Antara Dua Khotbah */}
        <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-inner relative">
          <div className="text-xs font-bold tracking-widest text-amber-500 mb-4 uppercase flex items-center justify-between">
            <span>━━━ 🪑 DUDUK ANTARA DUA KHOTBAH ━━━</span>
            {konten.durasi_per_bagian?.duduk_antara && (
              <span className="font-cairo text-xs text-[var(--text3)] font-normal normal-case flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                ⏱ ~{konten.durasi_per_bagian.duduk_antara} menit
              </span>
            )}
          </div>
          <p className="text-[var(--text2)] text-sm italic mb-6">{cleanText(konten.duduk_antara_dua_khotbah?.catatan)}</p>
          <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-3xl leading-loose text-amber-400 mb-4">{cleanText(konten.duduk_antara_dua_khotbah?.doa_duduk?.arab)}</div>
          <p className="italic text-amber-200/70 text-sm mb-2">{cleanText(konten.duduk_antara_dua_khotbah?.doa_duduk?.latin)}</p>
          <p className="text-sm text-[var(--text1)] leading-relaxed">{cleanText(konten.duduk_antara_dua_khotbah?.doa_duduk?.terjemah)}</p>
        </section>

        {/* 4. Khotbah Kedua */}
        <section className="border-l-4 border-purple-500 bg-[var(--dark2)] rounded-r-2xl p-6 md:p-8 space-y-8 shadow-lg relative overflow-hidden">
          <div className="text-sm font-bold tracking-widest text-purple-400 mb-6 border-b border-purple-500/30 pb-4 flex items-center justify-between">
            <span>━━━━ KHOTBAH KEDUA ━━━━</span>
            {konten.durasi_per_bagian?.khotbah_kedua && (
              <span className="font-cairo text-xs text-[var(--text3)] font-normal normal-case flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                ⏱ ~{konten.durasi_per_bagian.khotbah_kedua} menit
              </span>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Pembuka */}
            <div className="space-y-2">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_kedua?.pembuka?.arab)}</div>
              <p className="italic text-right text-purple-300 text-sm">{cleanText(konten.khotbah_kedua?.pembuka?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_kedua?.pembuka?.terjemah)}</p>
            </div>

            {/* Wasiat 2 */}
            <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl my-6">
              <p className="font-semibold text-purple-100 text-center">{cleanText(konten.khotbah_kedua?.wasiat_taqwa_2)}</p>
            </div>

            {/* Isi Khotbah 2 */}
            <div className="prose prose-invert max-w-none text-[var(--text1)] leading-loose whitespace-pre-line text-justify">
              {cleanText(konten.khotbah_kedua?.isi_khotbah_2)}
            </div>

            {/* Shalawat Ibrahim */}
            <div className="my-6 p-6 bg-[var(--dark)] rounded-2xl border border-purple-500/30">
              <div className="text-xs text-purple-400 mb-4 font-bold uppercase tracking-widest text-center">Shalawat Ibrahimiyah</div>
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right mb-4">{cleanText(konten.khotbah_kedua?.shalawat_ibrahim?.arab)}</div>
              <p className="italic text-right text-purple-300 text-sm mb-4">{cleanText(konten.khotbah_kedua?.shalawat_ibrahim?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_kedua?.shalawat_ibrahim?.terjemah)}</p>
            </div>

            {/* Doa Kaum Muslimin */}
            <div className="my-6 p-6 bg-[var(--dark)] rounded-2xl border border-purple-500/30">
              <div className="text-xs text-purple-400 mb-4 font-bold uppercase tracking-widest text-center">Doa untuk Kaum Muslimin</div>
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right mb-4">{cleanText(konten.khotbah_kedua?.doa_kaum_muslimin?.arab)}</div>
              <p className="italic text-right text-purple-300 text-sm mb-4">{cleanText(konten.khotbah_kedua?.doa_kaum_muslimin?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_kedua?.doa_kaum_muslimin?.terjemah)}</p>
            </div>

            {/* Doa Penutup */}
            <div className="my-6 p-6 bg-[var(--dark)] rounded-2xl border border-purple-500/30">
              <div className="text-xs text-purple-400 mb-4 font-bold uppercase tracking-widest text-center">Doa Penutup (Sapu Jagat)</div>
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right mb-4">{cleanText(konten.khotbah_kedua?.doa_penutup_khotbah?.arab)}</div>
              <p className="italic text-right text-purple-300 text-sm mb-4">{cleanText(konten.khotbah_kedua?.doa_penutup_khotbah?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed">{cleanText(konten.khotbah_kedua?.doa_penutup_khotbah?.terjemah)}</p>
            </div>

            {/* Penutup Turun Mimbar */}
            <div className="pt-8 space-y-2 mt-8 border-t border-purple-500/20">
              <div style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }} className="text-2xl leading-loose text-[var(--text1)] text-right">{cleanText(konten.khotbah_kedua?.penutup_khotbah?.arab)}</div>
              <p className="italic text-right text-purple-300 text-sm">{cleanText(konten.khotbah_kedua?.penutup_khotbah?.latin)}</p>
              <p className="text-sm text-[var(--text2)] leading-relaxed mb-4">{cleanText(konten.khotbah_kedua?.penutup_khotbah?.terjemah)}</p>
              <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 mt-4 text-center">
                <p className="font-bold text-rose-300 text-sm">{cleanText(konten.khotbah_kedua?.penutup_khotbah?.catatan_khatib)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Catatan Pelaksanaan */}
        <section className="glass-card p-6 rounded-2xl border-[var(--gold-border)] bg-[var(--dark)]">
          <div className="flex items-center gap-2 text-[var(--gold)] mb-4">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-sm">📝 Tata Cara Pelaksanaan</h3>
          </div>
          <ol className="list-decimal list-inside space-y-3 text-[var(--text2)] text-sm">
            {(konten.catatan_pelaksanaan ?? []).map((note, i) => (
              <li key={i} className="pl-2 leading-relaxed">{cleanText(note)}</li>
            ))}
          </ol>
        </section>

      </div>
    </div>
  )
}
