"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Atom, Sparkles, BookOpen, Quote, ChevronDown, Award, Globe, Hourglass, Scroll, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Interfaces ─────────────────────────────────────────────────
interface PenemuMuslim {
  id: string;
  nama_ilmuwan: string;
  julukan: string;
  tahun_hidup: string;
  wilayah_peradaban: string;
  bidang_ilmu: string;
  profil_singkat: string;
  kontribusi_ilmiah: string;
  nomor_surat: string | number | null;
  nomor_ayat: string | number | null;
  ayat_quran: string | null;
  tafsir_ibnu_katsir: string | null;
  tafsir_al_qurthubi: string | null;
  tafsir_at_tabari: string | null;
  refleksi_ilmiah: string | null;
  renungan: string | null;
  created_at: string;
}

// ─── Helper Functions ───────────────────────────────────────────
function parseQuranReferences(surahInput: string | number, ayatInput: string | number): { surah: number; ayat: number }[] {
  const surahs = String(surahInput).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const ayahsRaw = String(ayatInput).split(',').map(s => s.trim());
  
  const ayahs: number[] = [];
  for (const a of ayahsRaw) {
    if (a.includes('-')) {
      const parts = a.split('-');
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) ayahs.push(i);
      }
    } else {
      const n = parseInt(a);
      if (!isNaN(n)) ayahs.push(n);
    }
  }

  const pairs: { surah: number; ayat: number }[] = [];
  if (surahs.length === 1) {
    ayahs.forEach(a => pairs.push({ surah: surahs[0], ayat: a }));
  } else {
    // If multiple surahs, try to pair index by index, fallback to last surah seen
    ayahs.forEach((a, idx) => {
      const s = surahs[idx] !== undefined ? surahs[idx] : surahs[surahs.length - 1];
      pairs.push({ surah: s, ayat: a });
    });
  }
  return pairs;
}

// ─── Page Component ─────────────────────────────────────────────
export default function PenemuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [data, setData] = React.useState<PenemuMuslim | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quranDataList, setQuranDataList] = React.useState<{arabic: string; latin: string; translation: string; surahName?: string; surahNum: number; ayatNum: number}[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const res = await fetch(`/api/penemu-muslim/${id}`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || "Gagal memuat data penemu.");
        
        // Cerdas me-mapping data DB yang mungkin memiliki Capitalization / Spasi
        const raw = json.data;
        const mappedData: PenemuMuslim = {
          id: raw.id,
          nama_ilmuwan: raw.nama_ilmuwan,
          julukan: raw.julukan,
          tahun_hidup: raw["Tahun Hidup"] || raw.tahun_hidup,
          wilayah_peradaban: raw.wilayah_peradaban,
          bidang_ilmu: raw.bidang_ilmu,
          profil_singkat: raw.profil_singkat,
          kontribusi_ilmiah: raw.kontribusi_ilmiah,
          nomor_surat: raw.nomor_surat,
          nomor_ayat: raw.nomor_ayat,
          ayat_quran: raw.ayat_quran,
          tafsir_ibnu_katsir: raw.tafsir_ibnu_katsir,
          tafsir_al_qurthubi: raw.tafsir_al_qurthubi,
          tafsir_at_tabari: raw["Tafsir At-Tabari"] || raw.tafsir_at_tabari,
          refleksi_ilmiah: raw.refleksi_ilmiah,
          renungan: raw.Renungan || raw.renungan,
          created_at: raw.created_at,
        };

        setData(mappedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params]);

  React.useEffect(() => {
    async function fetchArabicVerses() {
      if (data?.nomor_surat && data?.nomor_ayat) {
        try {
          const pairs = parseQuranReferences(data.nomor_surat, data.nomor_ayat);
          
          const fetchPromises = pairs.map(async (pair) => {
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${pair.surah}:${pair.ayat}/editions/quran-uthmani,en.transliteration,id.indonesian`);
            const json = await res.json();
            if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 3) {
              return {
                arabic: json.data[0].text,
                latin: json.data[1].text,
                translation: json.data[2].text,
                surahName: json.data[0].surah?.englishName,
                surahNum: pair.surah,
                ayatNum: pair.ayat
              };
            }
            return null;
          });
          
          const results = await Promise.all(fetchPromises);
          // Type cast safely
          const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
          setQuranDataList(validResults);
        } catch (err) {
          console.error("Failed to fetch dynamic Quran multi verses data:", err);
          // Fallback quietly
        }
      }
    }
    fetchArabicVerses();
  }, [data?.nomor_surat, data?.nomor_ayat]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-page-warm flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gold/20 flex items-center justify-center animate-pulse">
            <Atom className="w-8 h-8 text-gold" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Menelusuri lipatan sejarah...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-page-warm flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 mb-4">{error || "Data tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          Kembali
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page-warm pb-32 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60vh] bg-gradient-to-br from-gold/10 via-amber-500/5 to-transparent rounded-[100%] blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ─── Navigation Bar ─── */}
      <nav className="px-6 pt-12 pb-4 sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-gold/20">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-border/50 shadow-sm text-sm font-semibold text-foreground/80 hover:bg-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Jejak Al-Qur&apos;an di Alam Semesta
        </button>
      </nav>

      {/* ─── Header Section ─── */}
      <header className="px-6 pt-8 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          {(() => {
            const match = data.nama_ilmuwan.match(/^(.*?)\s*\((.*?)\)$/);
            const cleanName = match ? match[1].trim() : data.nama_ilmuwan;
            const status = match ? match[2].trim() : null;
            const isMuslim = status?.toLowerCase() === "muslim";

            return (
              <>
                {/* Badge Kategori & Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex max-w-max items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest">
                    <Atom className="w-3.5 h-3.5" />
                    {data.bidang_ilmu}
                  </div>
                  
                  {status && (
                    <div className={`inline-flex max-w-max items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${
                      isMuslim ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      {status}
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-[1.15] mb-2 tracking-tight">
                    {cleanName}
                  </h1>
                  <p className="text-xl text-muted-foreground font-medium italic">
                    {data.julukan}
                  </p>
                </div>
              </>
            );
          })()}

          <div className="flex flex-wrap gap-3 mt-2">
            {data.tahun_hidup && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                <Hourglass className="w-3.5 h-3.5 opacity-70" /> {data.tahun_hidup}
              </div>
            )}
            {data.wilayah_peradaban && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                <Globe className="w-3.5 h-3.5 opacity-70" /> {data.wilayah_peradaban}
              </div>
            )}
          </div>
        </motion.div>
      </header>


      <div className="px-6 flex flex-col gap-8">
        {/* ─── Section 1: Biografi ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div className="prose prose-sm sm:prose-base text-foreground/90 leading-relaxed space-y-4">
            <p className="text-lg leading-relaxed font-medium">
              {data.profil_singkat}
            </p>
            
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mt-6 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150 duration-700" />
               <h2 className="text-sm font-bold text-gold flex items-center gap-2 mb-4 uppercase tracking-wider">
                 <Award className="w-5 h-5" /> Warisan & Kontribusi
               </h2>
               <p className="text-foreground/80 leading-relaxed whitespace-pre-line relative z-10">
                 {data.kontribusi_ilmiah}
               </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 2: Koneksi Al-Qur'an ─── */}
        {data.nomor_surat && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Cahaya Al-Qur&apos;an</h2>
            </div>
            
            <div className="card-premium p-6 sm:p-8 rounded-[2rem] relative overflow-hidden flex flex-col gap-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none" />
              
              {quranDataList.length > 0 ? (
                // Successfully parsed rendering multi-verses
                quranDataList.map((quran, idx) => (
                  <div key={`${quran.surahNum}-${quran.ayatNum}`} className="relative z-10 flex flex-col">
                    <div className="flex flex-col items-end justify-between mb-8 gap-2">
                       <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold tracking-widest uppercase self-start mb-2">
                         {quran.surahName ? `QS. ${quran.surahName} : ${quran.ayatNum}` : `Surah ${quran.surahNum} : ${quran.ayatNum}`}
                       </span>
                    </div>

                    <p 
                      dir="rtl"
                      className="font-arabic text-3xl sm:text-4xl leading-[2.2] sm:leading-[2.4] text-right text-foreground mb-4 drop-shadow-sm"
                    >
                      {quran.arabic}
                    </p>

                    <p className="text-base sm:text-lg text-muted-foreground/80 italic text-left mb-6 font-medium">
                      {quran.latin}
                    </p>
                    
                    <div className="relative pl-5 border-l-2 border-gold/40 flex flex-col gap-3">
                      <Quote className="w-5 h-5 text-gold/30 absolute -left-3 -top-2 bg-background p-0.5 rounded-full" />
                      <p className="text-base sm:text-lg text-foreground/90 leading-relaxed text-justify font-medium">
                        {quran.translation}
                      </p>
                    </div>
                    
                    {idx < quranDataList.length - 1 && (
                      <hr className="mt-10 border-border/50" />
                    )}
                  </div>
                ))
              ) : (
                // Fallback rendering
                <div className="relative z-10">
                  <div className="flex flex-col items-end justify-between mb-8 gap-2">
                     <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold tracking-widest uppercase self-start mb-2">
                       Surah {data.nomor_surat} : {data.nomor_ayat}
                     </span>
                  </div>

                  <p 
                    dir="rtl"
                    className="font-arabic text-3xl sm:text-4xl leading-[2.2] sm:leading-[2.4] text-right text-foreground mb-4 drop-shadow-sm"
                  >
                    Memuat lafaz...
                  </p>
                  
                  <div className="relative pl-5 border-l-2 border-gold/40 flex flex-col gap-3 mt-6">
                    <Quote className="w-5 h-5 text-gold/30 absolute -left-3 -top-2 bg-background p-0.5 rounded-full" />
                    
                    <p className="text-base sm:text-lg text-foreground/90 leading-relaxed text-justify font-medium">
                      {data.ayat_quran || "Terjadi kesalahan memuat terjemahan."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ─── Section 3: Kajian Tafsir ─── */}
        {(data.tafsir_ibnu_katsir || data.tafsir_al_qurthubi || data.tafsir_at_tabari) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <Scroll className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Kajian Mufassir</h2>
            </div>

            <div className="flex flex-col gap-3">
              <TafsirAccordion title="Tafsir Ibnu Katsir" content={data.tafsir_ibnu_katsir} defaultOpen />
              <TafsirAccordion title="Tafsir Al-Qurthubi" content={data.tafsir_al_qurthubi} />
              <TafsirAccordion title="Tafsir At-Tabari" content={data.tafsir_at_tabari} />
            </div>
          </motion.section>
        )}

        {/* ─── Section 4: Hikmah & Refleksi ─── */}
        {(data.refleksi_ilmiah || data.renungan) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="rounded-[2.5rem] bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-8 sm:p-10 relative overflow-hidden shadow-xl shadow-cyan-900/10 mb-8">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-6">
                {data.refleksi_ilmiah && (
                  <div>
                    <h3 className="text-cyan-100/80 text-xs font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                       <Sparkles className="w-4 h-4" /> Perspektif Sains
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {data.refleksi_ilmiah}
                    </p>
                  </div>
                )}

                {data.renungan && (
                  <div>
                    <h3 className="text-cyan-100/80 text-xs font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Tadabbur & Renungan
                    </h3>
                    <div className="text-white/90 leading-relaxed italic border-l-2 border-white/20 pl-4 space-y-3">
                      <p>{data.renungan}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}

// ─── Sub-Component: Tafsir Accordion ──────────────────────────────
function TafsirAccordion({ title, content, defaultOpen = false }: { title: string; content: string | null; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!content) return null;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden transition-all hover:border-border/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <span className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" /> {title}
        </span>
        <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 pt-2 border-t border-border/10">
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
