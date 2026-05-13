import React from 'react'
import Link from 'next/link'
import { getMustajab, HAJAT_INFO, TemaHajat, DOA_QURANI, NABI_LIST } from '@/data/doa_qurani'
import { ArrowRight, BookOpen, Search, Heart, Sparkles, Shield, User, HeartHandshake } from 'lucide-react'

// Icon mapping for categories
const CATEGORY_CARDS = [
  { id: 'rabbana', title: 'Doa Rabbana', icon: <BookOpen className="w-6 h-6" />, desc: 'Kumpulan doa yang diawali dengan Rabbana', count: DOA_QURANI.filter(d => d.kategori === 'rabbana').length, color: 'from-amber-500/20 to-amber-700/20', borderColor: 'border-amber-500/30' },
  { id: 'rabbi', title: 'Doa Rabbi', icon: <Heart className="w-6 h-6" />, desc: 'Kumpulan doa yang diawali dengan Rabbi', count: DOA_QURANI.filter(d => d.kategori === 'rabbi').length, color: 'from-emerald-500/20 to-emerald-700/20', borderColor: 'border-emerald-500/30' },
  { id: 'nabi', title: 'Doa Para Nabi', icon: <User className="w-6 h-6" />, desc: 'Doa-doa spesifik yang dipanjatkan para Nabi', count: DOA_QURANI.filter(d => d.kategori === 'nabi').length, color: 'from-blue-500/20 to-blue-700/20', borderColor: 'border-blue-500/30' },
  { id: 'semua', title: 'Semua Doa', icon: <Sparkles className="w-6 h-6" />, desc: 'Jelajahi seluruh koleksi doa dalam Al-Qur&apos;an', count: DOA_QURANI.length, color: 'from-purple-500/20 to-purple-700/20', borderColor: 'border-purple-500/30' },
]

export default function DoaPage() {
  const mustajabList = getMustajab()
  // Use a stable random based on the current date, to avoid hydration mismatch
  // However, in SSR nextjs, we can't reliably use Date.now() if it's rendered on server vs client.
  // For simplicity, we just use a fixed seed based on today's date if we want it to change daily.
  // Pilih doa pertama yang mustajab sebagai 'Doa Pilihan Hari Ini' (Bisa di-randomisasi jika diperlukan)
  const doaHariIni = mustajabList[0]

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
                {/* Background glow */}
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

      </div>
    </div>
  )
}
