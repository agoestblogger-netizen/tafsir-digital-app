"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share2, Star, CheckCircle, RefreshCcw, ArrowLeft, BookOpen, ScrollText } from 'lucide-react'
import { TEMPLATE_KHOTBAH_JUMAT } from '@/lib/template-khotbah-jumat'

// Interface based on generateKhotbahJumat output
export interface KhotbahJumatOutput {
  judul: string;
  format: string;
  tema: string;
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
  referensiDipilih?: any[]
  metricsSection?: React.ReactNode
}

const DoaCard = ({ arab, latin, terjemah, sumber, label, color = '#C9A84C' }: any) => (
  <div className="mt-4 p-6 sm:p-8 rounded-3xl" style={{ background: '#0a1624', border: '1px solid #1a2c42' }}>
    {label && (
      <p className="font-cairo text-xs uppercase tracking-widest text-white/40 mb-6 text-center font-semibold">
        {label}
      </p>
    )}
    {arab && (
      <p className="font-amiri text-3xl sm:text-4xl leading-[2.2] sm:leading-[2.5] text-center" 
         dir="rtl" style={{ color }}>
        {arab}
      </p>
    )}
    {latin && (
      <p className="font-cairo text-sm sm:text-[15px] italic text-center mt-8 text-[#10b981]">
        {latin}
      </p>
    )}
    {terjemah && (
      <p className="font-cairo text-sm sm:text-[15px] text-white/90 text-center mt-5 leading-relaxed">
        "{terjemah}"
      </p>
    )}
    {sumber && (
      <p className="font-cairo text-xs uppercase tracking-[0.2em] text-center mt-8 font-semibold"
         style={{ color: '#C9A84C' }}>
        {sumber}
      </p>
    )}
  </div>
)

export function KhotbahJumatView({
  konten, recordId, isSaved, isFavorite = false, isUsed = false, onToggleFavorite, onToggleUsed, referensiDipilih, metricsSection
}: KhotbahJumatViewProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const cleanText = (text: string | undefined | null) => text?.replace(/"""/g, '').trim() ?? ''
  
  const isValidText = (text?: string) =>
    !!text && text.trim() !== '' && text.trim() !== '"""' && text.trim() !== '"'

  const toStr = (val: any) => {
    if (!val) return ''
    if (typeof val === 'string') return val
    return val.teks || val.arab || val.indonesia || val.terjemah || JSON.stringify(val)
  }

  const handleCopyAll = () => {
    let fullText = `${konten.judul}\n(Khotbah Jum'at)\n\n`
    
    // Salam Persiapan
    const salam = (konten as any).catatan_khatib?.salam ?? 
                  (konten as any).pembuka?.salam ??
                  konten.persiapan_khatib?.salam_naik_mimbar ??
                  'Assalamu\'alaikum warahmatullahi wabarakatuh'
    const salamStr = typeof salam === 'string' ? salam : 
                     (salam as any)?.teks ?? JSON.stringify(salam)
                     
    fullText += `[Persiapan]\n${(konten as any).catatan_khatib?.catatan ?? konten.persiapan_khatib?.catatan ?? 'Pastikan untuk menyiapkan diri dengan baik...'}\nSalam: "${salamStr}"\n\n`
    
    // Khotbah 1
    fullText += `--- KHOTBAH PERTAMA ---\n`
    
    // Khutbatul Hajah
    fullText += `[Khutbatul Hajah]\n${TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.arab}\n${TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.latin}\nArtinya: ${TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.terjemah}\n\n`
    
    // Syahadat
    fullText += `[Syahadat]\n${TEMPLATE_KHOTBAH_JUMAT.syahadat.arab}\n${TEMPLATE_KHOTBAH_JUMAT.syahadat.latin}\nArtinya: ${TEMPLATE_KHOTBAH_JUMAT.syahadat.terjemah}\n\n`
    
    // Shalawat Pembuka
    fullText += `[Shalawat Pembuka]\n${TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.arab}\n${TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.latin}\nArtinya: ${TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.terjemah}\n\n`
    
    // Wasiat Taqwa
    fullText += `[Wasiat Taqwa]\n${toStr(konten.khotbah_pertama?.wasiat_taqwa)}\n\n`
    
    // Ayat Pendukung
    const ayatList = (konten.khotbah_pertama as any)?.ayat_pendukung ?? konten.khotbah_pertama?.ayat_quran ?? []
    if (ayatList.length > 0) {
      fullText += `[Ayat Pendukung]\n`
      ayatList.forEach((a: any) => {
        fullText += `${a.arab ?? a.teks_arab}\n${a.latin ?? a.teks_latin ?? ''}\nArtinya: ${a.terjemah ?? a.arti}\n(${a.referensi ?? a.sumber ?? `QS. ${a.surah_nama}: ${a.nomor_ayat}`})\n\n`
      })
    }

    // Isi Utama
    fullText += `[Isi Khotbah Utama]\n${toStr((konten.khotbah_pertama as any)?.isi_utama ?? konten.khotbah_pertama?.isi_khotbah)}\n\n`
    
    // Penutup & Istighfar
    const penutup = (konten.khotbah_pertama as any)?.penutup ?? konten.khotbah_pertama?.penutup_khotbah_pertama
    if (penutup) {
      fullText += `[Penutup Khotbah Pertama]\n${toStr(penutup)}\n\n`
    }
    fullText += `أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ الْعَظِيمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ\n`
    fullText += `Aquulu qawlii haadzaa wa astaghfirullaahal 'azhiima lii wa lakum wa lisaa'iril muslimiina wal muslimaati fastaghfiruuhu innahuu huwal ghafuurur rahiim.\n`
    fullText += `Artinya: Aku katakan perkataanku ini, dan aku memohon ampunan kepada Allah Yang Maha Agung untukku dan untukmu serta seluruh umat Islam laki-laki dan perempuan, maka mohonlah ampunan kepada-Nya, sesungguhnya Dia Maha Pengampun lagi Maha Penyayang.\n\n`

    // Duduk
    fullText += `--- DUDUK ANTARA DUA KHOTBAH ---\n`
    fullText += `Khatib duduk sejenak ± 1-2 menit. Jamaah dianjurkan membaca istighfar dan shalawat dalam hati.\n`
    fullText += `اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي\n`
    fullText += `Allaahummaghfir lii warhamnii wajburnii warfa'nii warzuqnii wahdinii wa 'aafinii\n`
    fullText += `Artinya: Ya Allah ampunilah aku, rahmatilah aku, perbaikilah keadaanku, angkatlah derajatku, berilah aku rezeki, tunjukkanlah aku, dan sehatkanlah aku.\n\n`

    // Khotbah 2
    fullText += `--- KHOTBAH KEDUA ---\n`
    
    // 2. Pembuka arab khotbah kedua
    fullText += `[Pembuka]\n${TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.arab}\n${TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.latin}\nArtinya: ${TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.terjemah}\n\n`
    
    // 3. Wasiat taqwa ringkas
    const wasiatTaqwa = (konten.khotbah_kedua as any)?.wasiat_taqwa_ringkas || konten.khotbah_kedua?.wasiat_taqwa_2 || "Marilah kita senantiasa meningkatkan ketakwaan kita kepada Allah SWT di mana pun kita berada, dengan menjalankan segala perintah-Nya dan menjauhi segala larangan-Nya."
    fullText += `[Wasiat Taqwa Ringkas]\n${toStr(wasiatTaqwa)}\n\n`
    
    // 4. Isi ringkas
    const isiRingkasText = (konten.khotbah_kedua as any)?.isi_ringkas || konten.khotbah_kedua?.isi_khotbah_2 || "Semoga dengan khotbah yang singkat ini, kita dapat mengambil pelajaran berharga dan mengamalkannya dalam kehidupan sehari-hari demi kebaikan di dunia dan akhirat."
    fullText += `[Isi Ringkas]\n${toStr(isiRingkasText)}\n\n`
    
    // 5. Shalawat Ibrahimiyah
    fullText += `[Shalawat Ibrahimiyah]\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.arab}\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.latin}\n`
    fullText += `Artinya: ${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.terjemah}\n\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.arab}\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.latin}\n`
    fullText += `Artinya: ${TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.terjemah}\n\n`

    // 6. Doa Pilihan Jamaah
    const doaUser = (referensiDipilih ?? [])
      .filter((r: any) => r.type === 'doa_quran')
      
    if (doaUser.length > 0) {
      fullText += `[Doa Pilihan Jamaah]\n`
      doaUser.forEach(r => {
        const d = r.data ?? r
        fullText += `${d.judul ?? r.judul ?? 'Doa'}\n`
        if (d.arab || d.teks_arab) fullText += `${d.arab ?? d.teks_arab}\n`
        if (d.latin || d.teks_latin) fullText += `${d.latin ?? d.teks_latin}\n`
        if (d.terjemah) fullText += `Artinya: ${d.terjemah}\n`
        fullText += `\n`
      })
    } else {
      fullText += `[Doa Pilihan Jamaah]\n`
      fullText += `رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ\n`
      fullText += `Rabbana taqabbal minna innaka antas-Sami'ul 'Alim\n`
      fullText += `Artinya: "Ya Tuhan kami, terimalah (amal) dari kami, sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui."\n\n`
    }

    // 7. Doa Kaum Muslimin
    fullText += `[Doa Untuk Kaum Muslimin]\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.arab}\n`
    fullText += `${TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.latin}\n`
    fullText += `Artinya: ${TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.terjemah}\n\n`

    // 8. Doa Sapu Jagad
    fullText += `[Doa Penutup (Sapu Jagad)]\n`
    fullText += `رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ وَأَدْخِلْنَا الْجَنَّةَ مَعَ الْأَبْرَارِ يَا عَزِيزُ يَا غَفَّارُ يَا رَبَّ الْعَالَمِينَ\n`
    fullText += `Rabbaanaa aatinaa fid dunyaa hasanatan wa fil aakhirati hasanatan wa qinaa 'adzaabaan naar. Wa adkhilnal jannata ma'al abroor, yaa 'aziizu yaa ghaffaar yaa rabbal 'aalamiin\n`
    fullText += `Artinya: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka. Masukkan kami dalam surga bersama orang-orang yang baik, wahai Zat Yang Maha Mulia, Maha Pengampun, Tuhan semesta alam."\n\n`

    // 9. Dzikir Penutup
    fullText += `[Dzikir Penutup]\n`
    fullText += `اذْكُرُوا اللَّهَ الْعَظِيمَ يَذْكُرْكُمْ وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ وَلَذِكْرُ اللَّهِ أَكْبَرُ وَاللَّهُ يَعْلَمُ مَا تَصْنَعُونَ\n`
    fullText += `Udzkurullaahal 'azhiima yadzkurkum wasyukruuhu 'alaa ni'amihii yazidkum wa ladzikrullaahi akbar, wallaahu ya'lamu maa tashna'uun\n`
    fullText += `Artinya: Ingatlah Allah Yang Maha Agung niscaya Dia akan mengingatmu, syukurilah nikmat-Nya niscaya Dia akan menambahkannya, dan dzikirlah adalah yang terbesar. Allah mengetahui apa yang kalian kerjakan.\n\n`
    
    // 10. Instruksi Turun Mimbar
    fullText += `[Setelah membaca ini, khatib turun dari mimbar. Muadzin segera mengumandangkan iqamat untuk shalat Jum'at dua rakaat.]\n`

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
        <section className="p-5 sm:p-6 rounded-2xl relative overflow-hidden"
                 style={{ background: 'rgba(13, 31, 53, 0.8)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
            <ScrollText className="w-24 h-24" style={{ color: '#4a9eda' }} />
          </div>
          <div className="relative z-10">
            <p className="font-cairo text-sm uppercase tracking-wide mb-4 font-bold flex items-center gap-2"
               style={{ color: '#4a9eda' }}>
              <span className="text-base">📋</span> CATATAN PERSIAPAN KHATIB
            </p>
            <p className="font-cairo text-[15px] sm:text-base text-white/90 leading-relaxed text-justify mb-5">
              {(konten as any).catatan_khatib?.catatan ?? 
               konten.persiapan_khatib?.catatan ??
               'Pastikan untuk menyiapkan diri dengan baik, ingatkan jamaah untuk tetap khusyu dan fokus. Sampaikan dengan nada yang lembut dan penuh keyakinan.'}
            </p>
            {(() => {
              const salam = (konten as any).catatan_khatib?.salam ?? 
                            (konten as any).pembuka?.salam ??
                            konten.persiapan_khatib?.salam_naik_mimbar ??
                            'Assalamu\'alaikum warahmatullahi wabarakatuh'
              const salamStr = typeof salam === 'string' ? salam : 
                               (salam as any)?.teks ?? JSON.stringify(salam)
              return (
                <div className="px-5 py-4 rounded-xl"
                     style={{ background: 'rgba(10, 25, 45, 0.8)', border: '1px solid rgba(74, 158, 218, 0.3)' }}>
                  <p className="font-cairo text-[15px] sm:text-base font-bold text-white/95" style={{ fontWeight: 700 }}>
                    Salam: "{salamStr}"
                  </p>
                </div>
              )
            })()}
          </div>
        </section>

        {/* 2. Khotbah Pertama */}
        <section className="border-l-4 border-[var(--teal-500)] bg-[var(--dark2)] rounded-r-2xl p-6 md:p-8 space-y-6 shadow-lg relative overflow-hidden">
          <div className="font-cairo text-lg sm:text-xl font-bold uppercase tracking-[0.15em] text-[#10b981] mb-6 border-b border-[var(--teal-500)]/30 pb-4 flex items-center justify-center gap-3">
            <span>━━━━</span> 
            <span>KHOTBAH PERTAMA</span> 
            <span>━━━━</span>
          </div>
          
          <div className="space-y-4">
            {/* Hamdalah */}
            <DoaCard 
              arab={cleanText(TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.arab)}
              latin={cleanText(TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.latin)}
              terjemah={cleanText(TEMPLATE_KHOTBAH_JUMAT.khutbatul_hajah.terjemah)}
            />
            
            {/* Syahadat */}
            <DoaCard 
              arab={cleanText(TEMPLATE_KHOTBAH_JUMAT.syahadat.arab)}
              latin={cleanText(TEMPLATE_KHOTBAH_JUMAT.syahadat.latin)}
              terjemah={cleanText(TEMPLATE_KHOTBAH_JUMAT.syahadat.terjemah)}
            />

            {/* Shalawat */}
            <DoaCard 
              arab={cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.arab)}
              latin={cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.latin)}
              terjemah={cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_pembuka.terjemah)}
            />

            {/* Wasiat Taqwa */}
            <div className="border-l-2 border-[var(--teal-500)]/30 pl-4 py-2 my-4">
              <p className="font-cairo text-sm sm:text-[15px] text-white/90 leading-relaxed text-justify italic">
                {cleanText(toStr(konten.khotbah_pertama?.wasiat_taqwa))}
              </p>
            </div>

            {/* Ayat */}
            {(() => {
              const ayatList = (konten.khotbah_pertama as any)?.ayat_pendukung ?? konten.khotbah_pertama?.ayat_quran ?? []
              return ayatList.map((ayat: any, i: number) => (
                <DoaCard 
                  key={i}
                  arab={cleanText(ayat.arab ?? ayat.teks_arab)}
                  latin={cleanText(ayat.latin ?? ayat.teks_latin)}
                  terjemah={cleanText(ayat.terjemah ?? ayat.arti)}
                  sumber={cleanText(ayat.referensi ?? ayat.sumber ?? `QS. ${ayat.surah_nama}: ${ayat.nomor_ayat}`)}
                />
              ))
            })()}

            {/* Isi Khotbah */}
            <p className="font-cairo text-sm sm:text-[15px] text-white/90 leading-relaxed text-justify whitespace-pre-line mt-6">
              {cleanText(toStr((konten.khotbah_pertama as any)?.isi_utama ?? konten.khotbah_pertama?.isi_khotbah))}
            </p>

            {/* Penutup Khotbah Pertama + Istighfar */}
            {(() => {
              const penutup = (konten.khotbah_pertama as any)?.penutup ?? konten.khotbah_pertama?.penutup_khotbah_pertama
              return (
                <div className="pt-6 space-y-4 mt-6 border-t border-[var(--teal-500)]/20">
                  {penutup && (
                    <p className="font-cairo text-sm sm:text-[15px] text-white/90 leading-relaxed text-justify">
                      {cleanText(toStr(penutup))}
                    </p>
                  )}
                  <DoaCard 
                    arab="أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ الْعَظِيمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ"
                    latin="Aquulu qawlii haadzaa wa astaghfirullaahal 'azhiima lii wa lakum wa lisaa'iril muslimiina wal muslimaati fastaghfiruuhu innahuu huwal ghafuurur rahiim."
                    terjemah="Aku katakan perkataanku ini, dan aku memohon ampunan kepada Allah Yang Maha Agung untukku dan untukmu serta seluruh umat Islam laki-laki dan perempuan, maka mohonlah ampunan kepada-Nya, sesungguhnya Dia Maha Pengampun lagi Maha Penyayang."
                  />
                </div>
              )
            })()}
          </div>
        </section>

        {/* 3. Duduk Antara Dua Khotbah */}
        <section className="p-6 rounded-2xl border border-[var(--gold-border)] bg-[var(--dark3)] text-center max-w-2xl mx-auto">
          {/* Header */}
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">
            ——— 🪑 DUDUK ANTARA DUA KHOTBAH ———
          </p>
          
          {/* Instruksi */}
          <p className="font-cairo text-sm sm:text-[15px] italic text-justify text-white/90 mb-4">
            Khatib duduk sejenak ± 1-2 menit. Jamaah dianjurkan membaca istighfar 
            dan shalawat dalam hati.
          </p>

          {/* Doa duduk antara dua khotbah — HARDCODE */}
          <p className="font-amiri text-3xl sm:text-4xl text-center leading-[2.2] sm:leading-[2.5] mt-6 text-[var(--gold)]" dir="rtl">
            اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي
          </p>
          <p className="font-cairo text-sm sm:text-[15px] italic text-center mt-8 text-[#10b981]">
            Allaahummaghfir lii warhamnii wajburnii warfa&apos;nii warzuqnii wahdinii wa &apos;aafinii
          </p>
          <p className="font-cairo text-sm sm:text-[15px] text-white/90 text-center mt-5 leading-relaxed">
            "Ya Allah ampunilah aku, rahmatilah aku, perbaikilah keadaanku, angkatlah 
            derajatku, berilah aku rezeki, tunjukkanlah aku, dan sehatkanlah aku."
          </p>
        </section>

        {/* 4. Khotbah Kedua */}
        <section className="border-l-4 border-[var(--gold)] bg-[var(--dark2)] rounded-r-2xl p-6 md:p-8 space-y-6 shadow-lg relative overflow-hidden">
          <div className="font-cairo text-lg sm:text-xl font-bold uppercase tracking-[0.15em] text-[var(--gold)] mb-6 border-b border-[var(--gold-border)]/30 pb-4 flex items-center justify-center gap-3">
            <span>━━━━</span> 
            <span>KHOTBAH KEDUA</span> 
            <span>━━━━</span>
          </div>
          
          <div className="space-y-6">
            {/* 2. Pembuka arab khotbah kedua (TEMPLATE) */}
            <DoaCard 
              arab={cleanText(TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.arab)}
              latin={cleanText(TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.latin)}
              terjemah={cleanText(TEMPLATE_KHOTBAH_JUMAT.pembuka_khotbah_kedua.terjemah)}
            />

            {/* 3. Wasiat taqwa ringkas */}
            {(() => {
              const wasiatTaqwa = (konten.khotbah_kedua as any)?.wasiat_taqwa_ringkas || konten.khotbah_kedua?.wasiat_taqwa_2 || "Marilah kita senantiasa meningkatkan ketakwaan kita kepada Allah SWT di mana pun kita berada, dengan menjalankan segala perintah-Nya dan menjauhi segala larangan-Nya."
              return (
                <div className="mt-8 p-6 sm:p-8 rounded-3xl" style={{ background: 'rgba(28, 19, 44, 0.6)', border: '1px solid rgba(75, 45, 115, 0.5)' }}>
                  <p className="font-cairo text-[15px] sm:text-base font-semibold text-[#e9d5ff] leading-relaxed text-center">
                    {cleanText(toStr(wasiatTaqwa))}
                  </p>
                </div>
              )
            })()}

            {/* 4. Isi ringkas */}
            {(() => {
              const isiRingkas = (konten.khotbah_kedua as any)?.isi_ringkas || konten.khotbah_kedua?.isi_khotbah_2 || "Semoga dengan khotbah yang singkat ini, kita dapat mengambil pelajaran berharga dan mengamalkannya dalam kehidupan sehari-hari demi kebaikan di dunia dan akhirat."
              return (
                <p className="font-cairo text-sm sm:text-[15px] text-white/90 leading-relaxed text-justify whitespace-pre-line mt-6">
                  {cleanText(toStr(isiRingkas))}
                </p>
              )
            })()}

            {/* 5. Shalawat Ibrahimiyah (TEMPLATE) */}
            <DoaCard 
              label="SHALAWAT IBRAHIMIYAH"
              arab={`${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.arab)}\n\n${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.arab)}`}
              latin={`${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.latin)}\n\n${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.latin)}`}
              terjemah={`${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.terjemah)}\n\n${cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.doa.terjemah)}`}
              sumber={cleanText(TEMPLATE_KHOTBAH_JUMAT.shalawat_ibrahimiyah.ayat.sumber)}
            />

            {/* 6. Doa Pilihan Jamaah (dari referensi user) */}
            {(() => {
              const doaUser = (referensiDipilih ?? [])
                .filter((r: any) => r.type === 'doa_quran')
              
              if (doaUser.length === 0) {
                return (
                  <DoaCard 
                    label="DOA PILIHAN JAMAAH"
                    arab="رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ"
                    latin="Rabbana taqabbal minna innaka antas-Sami'ul 'Alim"
                    terjemah="Ya Tuhan kami, terimalah (amal) dari kami, sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui."
                    sumber="QS. Al-Baqarah: 127"
                  />
                )
              }
              
              return (
                <>
                  <p className="font-cairo text-[10px] uppercase tracking-widest text-white/35 text-center mt-6">
                    DOA PILIHAN JAMAAH
                  </p>
                  <p className="italic text-white/40 text-sm text-center mb-4">
                    Marilah kita berdoa kepada Allah SWT...
                  </p>
                  {doaUser.map((r: any, i: number) => {
                    const d = r.data ?? r
                    return (
                      <DoaCard 
                        key={i}
                        label={d.judul ?? r.judul}
                        arab={d.arab ?? d.teks_arab}
                        latin={d.latin ?? d.teks_latin}
                        terjemah={d.terjemah}
                        sumber={d.referensi ?? (d.surah_nama ? `QS. ${d.surah_nama}: ${d.nomor_ayat}` : undefined)}
                      />
                    )
                  })}
                </>
              )
            })()}

            {/* 7. Doa untuk kaum muslimin (TEMPLATE) */}
            <DoaCard 
              label="DOA UNTUK KAUM MUSLIMIN"
              arab={cleanText(TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.arab)}
              latin={cleanText(TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.latin)}
              terjemah={cleanText(TEMPLATE_KHOTBAH_JUMAT.doa_kaum_muslimin.terjemah)}
            />

            {/* 8. Doa Sapu Jagad (HARDCODE) */}
            <DoaCard 
              label="DOA PENUTUP (SAPU JAGAD)"
              arab="رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ وَأَدْخِلْنَا الْجَنَّةَ مَعَ الْأَبْرَارِ يَا عَزِيزُ يَا غَفَّارُ يَا رَبَّ الْعَالَمِينَ"
              latin="Rabbaanaa aatinaa fid dunyaa hasanatan wa fil aakhirati hasanatan wa qinaa 'adzaabaan naar. Wa adkhilnal jannata ma'al abroor, yaa 'aziizu yaa ghaffaar yaa rabbal 'aalamiin"
              terjemah="Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka. Masukkan kami dalam surga bersama orang-orang yang baik, wahai Zat Yang Maha Mulia, Maha Pengampun, Tuhan semesta alam."
            />

            {/* 9. Dzikir penutup (HARDCODE) */}
            <DoaCard 
              label="DZIKIR PENUTUP"
              arab="اذْكُرُوا اللَّهَ الْعَظِيمَ يَذْكُرْكُمْ وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ وَلَذِكْرُ اللَّهِ أَكْبَرُ وَاللَّهُ يَعْلَمُ مَا تَصْنَعُونَ"
              latin="Udzkurullaahal 'azhiima yadzkurkum wasyukruuhu 'alaa ni'amihii yazidkum wa ladzikrullaahi akbar, wallaahu ya'lamu maa tashna'uun"
              terjemah="Ingatlah Allah Yang Maha Agung niscaya Dia akan mengingatmu, syukurilah nikmat-Nya niscaya Dia akan menambahkannya, dan dzikirlah adalah yang terbesar. Allah mengetahui apa yang kalian kerjakan."
            />

            {/* 10. Instruksi turun mimbar (HARDCODE) */}
            <div className="mt-6 p-4 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-center">
              <p className="font-cairo text-sm text-[#C9A84C] font-semibold leading-relaxed">
                Setelah membaca ini, khatib turun dari mimbar. Muadzin segera mengumandangkan 
                iqamat untuk shalat Jum'at dua rakaat.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Catatan Pelaksanaan */}
        <section className="mt-8 p-6 rounded-2xl border border-[var(--gold-border)] bg-[var(--dark2)]">
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-6">
            📋 TATA CARA PELAKSANAAN
          </p>
          <ol className="font-cairo text-sm text-[var(--text2)] leading-relaxed space-y-4 list-none">
            {[
              'Khatib naik mimbar saat adzan dikumandangkan, langsung mengucap salam',
              'Khotbah pertama: berdiri, bacakan susunan di atas, akhiri dengan istighfar',
              'Duduk sejenak ± 1 menit antara dua khotbah',
              'Khotbah kedua: lebih singkat dari khotbah pertama',
              'Akhiri dengan doa penutup, lalu turun mimbar',
              'Muadzin iqamat, laksanakan shalat Jum\'at 2 rakaat berjamaah',
            ].map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="flex-shrink-0 font-cairo text-sm font-bold text-[var(--gold)]">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {metricsSection}

      </div>
    </div>
  )
}
