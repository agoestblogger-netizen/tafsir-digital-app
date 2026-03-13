"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Atom, ArrowLeft, Loader2, BookOpenCheck, ChevronDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PenemuMuslim {
  id: string;
  nama_ilmuwan: string;
  julukan: string;
  bidang_ilmu: string;
  profil_singkat: string;
  No?: string | number;
  no?: string | number;
  ID?: string | number;
}

export default function PenemuListPage() {
  const router = useRouter();
  const [data, setData] = React.useState<PenemuMuslim[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  const [groupedData, setGroupedData] = React.useState<Record<string, PenemuMuslim[]>>({});
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/penemu-muslim");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memuat data tokoh Islam yang mengubah dunia.");
        
        const fetchedData: PenemuMuslim[] = json.data;
        setData(fetchedData);

        // Extract and process unique categories into grouped data
        const grouped: Record<string, PenemuMuslim[]> = {};
        
        fetchedData.forEach((item) => {
          if (item.bidang_ilmu) {
            item.bidang_ilmu.split(",").forEach((cat) => {
              const trimmed = cat.trim();
              if (trimmed) {
                if (!grouped[trimmed]) {
                  grouped[trimmed] = [];
                }
                grouped[trimmed].push(item);
              }
            });
          }
        });
        
        setGroupedData(grouped);
        
        // Auto-expand the first alphabetically sorted category
        const sortedKeys = Object.keys(grouped).sort();
        if (sortedKeys.length > 0) {
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
          <h1 className="text-2xl font-bold tracking-tight text-balance">Tokoh Islam yang Mengubah Dunia</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6 flex flex-col gap-6">
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
        ) : Object.keys(groupedData).length > 0 ? (
          <div className="flex flex-col gap-4">
            {Object.keys(groupedData).sort().map((category) => {
              const items = groupedData[category];
              const isExpanded = expandedCategory === category;
              
              return (
                <div key={category} className="flex flex-col bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
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
                            
                            return (
                              <Link
                                href={`/ensiklopedia/penemu/${safeId}`}
                                key={safeId || i}
                                className="relative flex flex-col items-start gap-2 p-4 rounded-2xl bg-background border border-border shadow-sm hover:border-gold/50 transition-all overflow-hidden group hover:shadow-md"
                              >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none transition-transform group-hover:scale-150 duration-500" />
                                
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm relative z-10">
                                  <Atom className="w-5 h-5" />
                                </div>
                                
                                <div className="mt-1 w-full relative z-10">
                                  <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-gold transition-colors line-clamp-2">
                                    {penemu.nama_ilmuwan}
                                  </h3>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-1 truncate">
                                    {penemu.bidang_ilmu}
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
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-3xl">
            <p className="text-muted-foreground text-sm font-medium">Belum ada data tokoh Islam yang mengubah dunia.</p>
          </div>
        )}
      </div>
    </main>
  );
}
