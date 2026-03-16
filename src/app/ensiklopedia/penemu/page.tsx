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
    <main className="flex flex-col min-h-screen bg-page-warm pb-24 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/90 backdrop-blur-xl z-20 border-b gold-divider shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors mr-2">
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
            className="w-full pl-12 pr-4 py-3.5 border-2 border-border/50 rounded-2xl bg-card shadow-sm text-base focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/10 transition-all font-medium placeholder:text-muted-foreground/60"
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
            <Loader2 className="w-10 h-10 text-gold animate-spin" />
            <p className="text-sm font-medium text-foreground/70 mb-1">
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
                <div key={category} className="flex flex-col bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-muted/30 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground">{category}</h2>
                      <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-full border border-gold/20">
                        {items.length} tokoh
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180 text-gold" : ""}`}
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
                        <div className="p-5 pt-0 border-t border-border grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                                className="relative flex flex-col items-start gap-2 p-4 rounded-2xl bg-background border border-border shadow-sm hover:border-gold/50 transition-all overflow-hidden group hover:shadow-md"
                              >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none transition-transform group-hover:scale-150 duration-500" />
                                
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm relative z-10 shrink-0">
                                  <Atom className="w-5 h-5" />
                                </div>
                                
                                <div className="mt-1 w-full relative z-10 flex flex-col items-start">
                                  <h3 className="text-base md:text-lg font-semibold text-foreground leading-tight group-hover:text-gold transition-colors line-clamp-1">
                                    {cleanName}
                                  </h3>
                                  
                                  {status && (
                                    <span className={`mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                                      isMuslim ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}>
                                      {status}
                                    </span>
                                  )}
                                  
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1.5 w-full">
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
