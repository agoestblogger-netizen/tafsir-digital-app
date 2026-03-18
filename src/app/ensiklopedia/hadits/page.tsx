"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, BookOpen, ScrollText, ArrowRight, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface HaditsData {
  id: number;
  kategori: string;
  perawi: string;
  derajat: string;
  arab: string;
  latin: string | null;
  terjemah: string;
  asbabul_wurud?: string | null;
  kaitan_surah: string | null;
  kaitan_ayat: string | null;
}

export default function EnsiklopediaHaditsPage() {
  const [haditsList, setHaditsList] = useState<HaditsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('hadithSearchQuery') || '';
    }
    return '';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('hadithFilter') || 'Semua';
    }
    return 'Semua';
  });

  useEffect(() => {
    async function fetchHadits() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await getSupabase()
          .from('hadits')
          .select('*')
          .order('id', { ascending: true });

        if (sbError) throw sbError;
        if (data) setHaditsList(data as HaditsData[]);
      } catch (err) {
        console.error("Gagal mengambil data hadits:", err);
        setError("Gagal memuat kumpulan hadits. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHadits();
  }, []);

  // Ekstrak kategori unik dari data hadits yang didapat
  const categories = useMemo(() => {
    const uniqueCategories = new Set(haditsList.map(h => h.kategori));
    // Filter string kosong jika ada
    const validCategories = Array.from(uniqueCategories).filter(Boolean);
    return ['Semua', ...validCategories];
  }, [haditsList]);

  // Filter data berdasarkan kategori dan pencarian
  const filteredHadits = useMemo(() => {
    return haditsList.filter((hadits) => {
      // 1. Filter Kategori
      const matchCategory = selectedCategory === 'Semua' || hadits.kategori === selectedCategory;
      
      // 2. Filter Pencarian Text (Aman dari null/undefined)
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = query === "" || 
        (hadits.terjemah && hadits.terjemah.toLowerCase().includes(query)) || 
        (hadits.latin && hadits.latin.toLowerCase().includes(query)) ||
        (hadits.arab && hadits.arab.includes(query)) ||
        (hadits.perawi && hadits.perawi.toLowerCase().includes(query)) ||
        (hadits.kategori && hadits.kategori.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [haditsList, selectedCategory, searchQuery]);

  // Restorasi Scroll Memory saat Jamaah kembali dari layar Surah
  useEffect(() => {
    if (!isLoading && haditsList && haditsList.length > 0) {
      const savedPos = sessionStorage.getItem('haditsScrollPos');
      if (savedPos) {
        // Beri DOM jeda napas cukup lama (300ms) untuk menuntaskan render Layout Kartu sebelum melompat instan
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedPos, 10), behavior: 'instant' });
          sessionStorage.removeItem('haditsScrollPos'); // Bersihkan sisa rekaman posisi
          sessionStorage.removeItem('hadithFilter'); // Bersihkan sisa rekaman filter
          sessionStorage.removeItem('hadithSearchQuery'); // Bersihkan memori pencarian
        }, 300);
      }
    }
  }, [isLoading, haditsList]);

  return (
    <main className="min-h-screen bg-page-warm pb-24">
      {/* ─── HERO HEADER ─── */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-white/40 dark:bg-slate-900/40 border-b border-border/50">
        <div className="absolute inset-0 bg-gold/5 dark:bg-gold/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/80 text-primary mb-6 shadow-sm border border-primary/10">
              <ScrollText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 font-serif">
              Kumpulan Hadist Pilihan
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Ensiklopedia hadist shahih tematik seputar penyucian jiwa, psikologi transenden, 
              dan habit-building peradaban Islam.
            </p>
            
            {/* Search Input */}
            <div className="w-full relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari tema, perawi, atau terjemahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-gray-800 shadow-sm focus:shadow-md transition-all text-gray-900 dark:text-gray-100 outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── KONTEN UTAMA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Category Pills/Chips Filter */}
        {!isLoading && categories.length > 1 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2 snap-x">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all snap-start ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Memuat kumpulan hadits...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && error && (
           <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <AlertCircle className="w-16 h-16 text-rose-400 mb-4 opacity-80" />
             <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
             <button 
               onClick={() => window.location.reload()}
               className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
             >
               Coba Lagi
             </button>
           </div>
        )}

        {/* LIST KARTU HADITS */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredHadits.length > 0 ? (
                filteredHadits.map((hadits, index) => (
                  <motion.div
                    key={hadits.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-md transition-shadow border-gray-100 dark:border-slate-700 overflow-hidden relative group">
                      {/* Decorative Edge */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/60 to-gold/60 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      
                      <CardContent className="p-6 md:p-8">
                        {/* Meta: Kategori, Perawi, Derajat */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100 dark:border-slate-700/60">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1 font-medium shadow-sm flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            {hadits.kategori}
                          </Badge>
                          <div className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {hadits.perawi} <span className="text-gray-300 dark:text-gray-600">•</span> <span className="text-gold dark:text-gold-light">{hadits.derajat}</span>
                          </div>
                        </div>

                        {/* Arabic Text */}
                        <div dir="rtl" className="mb-8">
                          <p className="font-arabic text-2xl sm:text-3xl md:text-4xl leading-loose text-center text-gray-900 dark:text-gray-50 drop-shadow-sm">
                            {hadits.arab}
                          </p>
                        </div>

                        {/* Latin Text */}
                        {hadits.latin && (
                          <div className="mb-6 relative">
                            <p className="font-serif italic text-emerald-700 dark:text-emerald-400 text-lg md:text-xl leading-relaxed text-center drop-shadow-sm">
                              {hadits.latin}
                            </p>
                          </div>
                        )}

                        {/* Terjemah */}
                        <div className="mb-6 relative">
                          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                            {hadits.terjemah}
                          </p>
                        </div>

                        {/* Asbabul Wurud (Konteks Sejarah) */}
                        {hadits.asbabul_wurud && (
                          <div className="mt-6 mb-6 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center text-center">
                            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                              Penjelasan / Asbabul Wurud
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {hadits.asbabul_wurud}
                            </p>
                          </div>
                        )}

                        {/* Cross-linking ke Tafsir QS. X:Y */}
                        {hadits.kaitan_surah && hadits.kaitan_ayat && (
                           <div className="mt-8 pt-5 border-t border-gray-100 dark:border-slate-700/60 flex justify-end">
                             {(() => {
                               const targetAyat = hadits.kaitan_ayat.match(/\d+/)?.[0];
                               return (
                                 <Link 
                                   onClick={() => {
                                     sessionStorage.setItem('haditsScrollPos', window.scrollY.toString());
                                     sessionStorage.setItem('hadithFilter', selectedCategory);
                                     sessionStorage.setItem('hadithSearchQuery', searchQuery);
                                   }}
                                   href={`/surah/${hadits.kaitan_surah}#ayat-${targetAyat}`}
                                   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors shadow-sm group/btn border border-gray-200/60 dark:border-slate-600/50"
                                 >
                                   <BookOpen className="w-4 h-4 text-primary" />
                                   <span className="hidden sm:inline">Lihat Ayat Terkait</span>
                                   <span className="sm:hidden">Terkait</span>
                                   <span className="text-primary">(QS. {hadits.kaitan_surah}: {hadits.kaitan_ayat})</span>
                                   <ArrowRight className="w-4 h-4 text-gray-400 group-hover/btn:translate-x-1 transition-transform" />
                                 </Link>
                               );
                             })()}
                           </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-20 text-center col-span-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl"
                >
                  <ScrollText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Hadits tidak ditemukan</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Coba sesuaikan kata kunci atau filter kategori Anda.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}
