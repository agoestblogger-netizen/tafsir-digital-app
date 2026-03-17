"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Atom, ArrowLeft, Loader2, BookOpenCheck, ChevronDown, Search } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface PenemuMuslim {
  id: string;
  nama_ilmuwan: string;
  julukan: string;
  bidang_ilmu: string;
  profil_singkat: string;
  refleksi_ilmiah?: string;
  No?: string | number;
  no?: string | number;
  ID?: string | number;
}

function PenemuListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<PenemuMuslim[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  const initialCategory = searchParams.get("kategori");
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(initialCategory);
  const [globalSearchQuery, setGlobalSearchQuery] = React.useState('');

  const toggleCategory = (category: string) => {
    // Prevent toggling if global search is active and explicitly forces open
    if (globalSearchQuery.trim() !== '') return;

    const isExpanded = expandedCategory === category;
    const newCategory = isExpanded ? null : category;
    setExpandedCategory(newCategory);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory) {
      params.set("kategori", newCategory);
    } else {
      params.delete("kategori");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/penemu-muslim");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memuat data Jejak Al-Qur'an di Alam Semesta.");
        
        const fetchedData: PenemuMuslim[] = json.data;
        setData(fetchedData);

        // Extract and process unique categories into grouped data
        const grouped: Record<string, PenemuMuslim[]> = {};
        
        fetchedData.forEach((item) => {
          if (item.bidang_ilmu) {
            // Bersihkan string dari tanda kurung
            const text = item.bidang_ilmu.replace(/\(.*?\)/g, "").trim();
            
            // Pecah kata hubung (dan, koma, &)
            const categories = text.split(/\s*(?:dan|,|&)\s*/i);

            categories.forEach((rawCat) => {
              let mainCat = rawCat.trim();
              if (mainCat) {
                // Standarisasi kata kunci (Normalisasi)
                if (mainCat.toLowerCase().startsWith("arkeologi")) {
                  mainCat = "Arkeologi";
                }
                if (mainCat.toLowerCase().startsWith("sejarah")) {
                  mainCat = "Sejarah";
                }

                if (!grouped[mainCat]) {
                  grouped[mainCat] = [];
                }
                grouped[mainCat].push(item);
              }
            });
          }
        });
        
        // Auto-expand the first alphabetically sorted category if no category is in URL
        const sortedKeys = Object.keys(grouped).sort();
        if (sortedKeys.length > 0 && !searchParams.get("kategori")) {
          setExpandedCategory(sortedKeys[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
      }
    }
    fetchData();
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 pb-24 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl z-20 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpenCheck className="w-7 h-7 text-gold" />
          <h1 className="text-2xl font-bold tracking-tight text-balance">Jejak Al-Qur&apos;an di Alam Semesta</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6 flex flex-col gap-6">
        
        {/* Global Search Interface */}
        <div className="relative z-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Cari tokoh atau topik (misal: Fir'aun)..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 shadow-sm text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-all font-medium placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Safe Render Pattern */}
        {error ? (
          <div className="text-center py-20 flex flex-col items-center gap-3 bg-red-50/50 rounded-3xl border border-red-100">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold transition-all hover:bg-red-200 hover:scale-105 active:scale-95">
              Coba Lagi
            </button>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Membuka lembaran sejarah...
            </p>
          </div>
        ) : (() => {
          // Perform global filtering matching names, titles, descriptions, and science reflections
          const query = globalSearchQuery.toLowerCase().trim();
          const filteredData = data.filter(penemu => {
            if (!query) return true;
            const matchName = penemu.nama_ilmuwan?.toLowerCase().includes(query);
            const matchTitle = penemu.julukan?.toLowerCase().includes(query);
            const matchProfile = penemu.profil_singkat?.toLowerCase().includes(query);
            const matchRefleksi = penemu.refleksi_ilmiah?.toLowerCase().includes(query);
            return matchName || matchTitle || matchProfile || matchRefleksi;
          });

          // Group the filtered data
          const currentGrouped: Record<string, PenemuMuslim[]> = {};
          filteredData.forEach((item) => {
            if (item.bidang_ilmu) {
              const text = item.bidang_ilmu.replace(/\(.*?\)/g, "").trim();
              const categories = text.split(/\s*(?:dan|,|&)\s*/i);

              categories.forEach((rawCat) => {
                let mainCat = rawCat.trim();
                if (mainCat) {
                  if (mainCat.toLowerCase().startsWith("arkeologi")) mainCat = "Arkeologi";
                  if (mainCat.toLowerCase().startsWith("sejarah")) mainCat = "Sejarah";
                  if (!currentGrouped[mainCat]) currentGrouped[mainCat] = [];
                  currentGrouped[mainCat].push(item);
                }
              });
            }
          });

          if (Object.keys(currentGrouped).length === 0) {
            return (
              <div className="text-center py-20 bg-card border border-border rounded-3xl">
                <p className="text-muted-foreground text-sm font-medium">Pencarian tidak ditemukan.</p>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-4">
              {Object.keys(currentGrouped).sort().map((category) => {
                const items = currentGrouped[category];
                // Force open if user is currently searching
                const isExpanded = query !== '' || expandedCategory === category;
              
              return (
                <div key={category} className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-[2rem] shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-gray-700 focus:outline-none text-gray-700 dark:text-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{category}</h2>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                        {items.length} tokoh
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {items.map((penemu, i) => {
                            const safeId = penemu?.id || penemu?.No || penemu?.no || penemu?.ID;
                            if (!safeId) return null;
                            
                            // Regex to extract status like "Zahi Hawass (Muslim)"
                            const match = penemu.nama_ilmuwan.match(/^(.*?)\s*\((.*?)\)$/);
                            const cleanName = match ? match[1].trim() : penemu.nama_ilmuwan;
                            const status = match ? match[2].trim() : null;
                            const isMuslim = status?.toLowerCase() === "muslim";
                            
                            return (
                              <Link
                                href={`/ensiklopedia/penemu/${safeId}`}
                                key={safeId || i}
                                className="relative flex flex-col items-start gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:bg-gray-750 hover:border-emerald-200 dark:hover:border-gray-600 transition-all overflow-hidden group"
                              >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none transition-transform group-hover:scale-150 duration-500" />
                                
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm relative z-10 shrink-0">
                                  <Atom className="w-5 h-5" />
                                </div>
                                
                                <div className="mt-1 w-full relative z-10 flex flex-col items-start">
                                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {cleanName}
                                  </h3>
                                  
                                  {status && (
                                    <span className={`mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                                      isMuslim ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-600"
                                    }`}>
                                      {status}
                                    </span>
                                  )}
                                  
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1.5 w-full">
                                    {penemu.julukan || penemu.bidang_ilmu}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
              })}
            </div>
          );
        })()}
      </div>
    </main>
  );
}

export default function PenemuListPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-page-warm flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    }>
      <PenemuListContent />
    </React.Suspense>
  );
}
