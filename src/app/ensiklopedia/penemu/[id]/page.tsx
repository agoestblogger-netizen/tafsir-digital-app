"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Atom, Sparkles, BookOpen, Quote, ChevronDown, Award, Globe, Hourglass, Scroll, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
  refleksi_kosmetik: string | null;
  renungan: string | null;
  renungan_kosmetik: string | null;
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
  const [isGeneratingStory, setIsGeneratingStory] = React.useState(false);
  const [localStory, setLocalStory] = React.useState<{ refleksi_md: string, renungan_md: string } | null>(null);

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
          refleksi_kosmetik: raw.refleksi_kosmetik || null,
          renungan: raw.Renungan || raw.renungan,
          renungan_kosmetik: raw.renungan_kosmetik || null,
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
          
          const validResults: {arabic: string; latin: string; translation: string; surahName?: string; surahNum: number; ayatNum: number}[] = [];
          
          for (const pair of pairs) {
            try {
              const res = await fetch(`https://api.alquran.cloud/v1/ayah/${pair.surah}:${pair.ayat}/editions/quran-uthmani,en.transliteration,id.indonesian`);
              const json = await res.json();
              
              if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 3) {
                validResults.push({
                  arabic: json.data[0].text,
                  latin: json.data[1].text,
                  translation: json.data[2].text,
                  surahName: json.data[0].surah?.englishName,
                  surahNum: pair.surah,
                  ayatNum: pair.ayat
                });
              }
            } catch (err) {
              console.error(`Gagal fetch ayat: Surah ${pair.surah} Ayat ${pair.ayat}`, err);
              // Lanjut ke ayat berikutnya tanpa menggagalkan seluruh komponen
              continue;
            }
          }
          
          setQuranDataList(validResults);
        } catch (err) {
          console.error("Failed to fetch dynamic Quran multi verses data:", err);
          // Fallback quietly
        }
      }
    }
    fetchArabicVerses();
  }, [data?.nomor_surat, data?.nomor_ayat]);

  React.useEffect(() => {
    // Determine whether we should fetch auto-story
    // Only generate if both original files exist but the cosmetics don't, and no local fetching is occurring
    if (data?.refleksi_ilmiah && data?.renungan && !data.refleksi_kosmetik && !data.renungan_kosmetik && !localStory && !isGeneratingStory) {
      const fetchStory = async () => {
        setIsGeneratingStory(true);
        try {
          const res = await fetch('/api/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.id,
              teks_refleksi_mentah: data.refleksi_ilmiah,
              teks_renungan_mentah: data.renungan
            })
          });

          if (res.ok) {
            const result = await res.json();
            if (result.refleksi_md && result.renungan_md) {
              setLocalStory({
                refleksi_md: result.refleksi_md,
                renungan_md: result.renungan_md
              });
            }
          }
        } catch (error) {
          console.error("Gagal men-generate story AI:", error);
        } finally {
          setIsGeneratingStory(false);
        }
      };

      fetchStory();
    }
  }, [data?.id, data?.refleksi_ilmiah, data?.refleksi_kosmetik, data?.renungan, data?.renungan_kosmetik, localStory, isGeneratingStory]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gold/20 flex items-center justify-center animate-pulse">
            <Atom className="w-8 h-8 text-gold" />
          </div>
          <p className="text-base font-medium text-muted-foreground animate-pulse">
            Menelusuri lipatan sejarah...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
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
    <main className="min-h-screen bg-slate-50/50 pb-32 relative overflow-hidden">
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
                  <h1 className="text-base font-bold text-foreground mb-2">
                    {cleanName}
                  </h1>
                  <p className="text-base text-gray-600 italic">
                    {data.julukan}
                  </p>
                </div>
              </>
            );
          })()}

          <div className="flex flex-wrap gap-3 mt-2">
            {data.tahun_hidup && (
              <div className="flex items-center gap-1.5 text-base font-bold text-gray-800 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                <Hourglass className="w-4 h-4 opacity-70" /> {data.tahun_hidup}
              </div>
            )}
            {data.wilayah_peradaban && (
              <div className="flex items-center gap-1.5 text-base font-bold text-gray-800 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                <Globe className="w-4 h-4 opacity-70" /> {data.wilayah_peradaban}
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
          <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed text-base md:text-lg space-y-8">
            <div className="font-normal mb-6">
              <ReactMarkdown>{data.profil_singkat}</ReactMarkdown>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6">
               <h2 className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm not-prose text-base md:text-lg">
                 <Award className="w-5 h-5" /> Warisan & Kontribusi
               </h2>
               <div className="whitespace-pre-line relative z-10 prose prose-emerald max-w-none text-gray-800 leading-relaxed text-base md:text-lg">
                 <ReactMarkdown>{data.kontribusi_ilmiah}</ReactMarkdown>
               </div>
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
            <div className="mb-4 px-2">
              <h2 className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                <BookOpen className="w-5 h-5" /> Cahaya Al-Qur&apos;an
              </h2>
            </div>
            
            <div className="flex flex-col gap-6 relative">
              {quranDataList.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {Object.entries(
                    quranDataList.reduce((acc, quran) => {
                      const key = quran.surahName ? `${quran.surahNum}-${quran.surahName}` : `${quran.surahNum}`;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(quran);
                      return acc;
                    }, {} as Record<string, typeof quranDataList>)
                  ).map(([surahKey, verses], idx) => (
                    <SurahAccordion key={surahKey} verses={verses} defaultOpen={idx === 0} />
                  ))}
                </div>
              ) : (
                // Fallback rendering
                <div className="bg-white border border-gray-100 shadow-sm p-6 sm:p-8 rounded-2xl flex flex-col gap-2 relative z-10">
                  <div className="mb-4">
                     <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-sm font-medium w-fit inline-block">
                       Surah {data.nomor_surat} : {data.nomor_ayat}
                     </span>
                  </div>

                  <p dir="rtl" className="font-arabic text-2xl md:text-3xl leading-loose text-gray-900 text-right">
                    Memuat lafaz...
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-base md:text-lg text-gray-800 font-normal leading-relaxed text-justify">
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
            <div className="mb-4 px-2">
              <h2 className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                <Scroll className="w-5 h-5" /> Kajian Mufassir
              </h2>
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
            <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-sm mb-8">
              
              <div className="relative z-10 flex flex-col gap-8">
                {data.refleksi_ilmiah && (
                  <div className="mb-6">
                    <h3 className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                       <Sparkles className="w-5 h-5" /> Perspektif Sains
                    </h3>
                    
                    {/* Storytelling logic for Refleksi */}
                    {data.refleksi_kosmetik || localStory?.refleksi_md ? (
                      <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed text-base md:text-lg">
                        <ReactMarkdown>{localStory?.refleksi_md || data.refleksi_kosmetik || ""}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 py-4 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-base font-bold text-emerald-800 animate-pulse">
                            Sedang meracik uraian sains ilmiah...
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded-full w-11/12 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded-full w-10/12 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {data.renungan && (
                  <div>
                    <h3 className="bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                      <BookOpen className="w-5 h-5" /> Tadabbur & Renungan
                    </h3>
                    
                    {/* Storytelling logic for Renungan */}
                    {data.renungan_kosmetik || localStory?.renungan_md ? (
                      <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed italic border-l-2 border-emerald-100 pl-5 text-base md:text-lg">
                        <ReactMarkdown>{localStory?.renungan_md || data.renungan_kosmetik || ""}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 py-4 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-base font-bold text-emerald-800 animate-pulse">
                            Sedang merangkai hikmah tadabbur...
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded-full w-11/12 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded-full w-10/12 animate-pulse" />
                        </div>
                      </div>
                    )}
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
        <span className="font-bold text-gray-800 text-base md:text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" /> {title}
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
              <div className="prose prose-emerald max-w-none text-base md:text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-Component: Surah Accordion ──────────────────────────────
function SurahAccordion({ verses, defaultOpen = false }: { verses: {arabic: string; latin: string; translation: string; surahName?: string; surahNum: number; ayatNum: number}[], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  if (!verses || verses.length === 0) return null;

  const firstVerse = verses[0];
  const lastVerse = verses[verses.length - 1];
  
  const surahLabel = firstVerse.surahName ? firstVerse.surahName : `Surah ${firstVerse.surahNum}`;
  const isSingleVerse = verses.length === 1;
  const ayatRangeText = isSingleVerse 
    ? `Ayat ${firstVerse.ayatNum}` 
    : `Ayat ${firstVerse.ayatNum} - ${lastVerse.ayatNum}`;
    
  const title = `QS ${surahLabel}: ${ayatRangeText}`;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100/50 transition-colors"
      >
        <span className="font-bold text-emerald-800 text-base md:text-lg flex items-center gap-2 text-left">
          <BookOpen className="w-5 h-5 opacity-70 flex-shrink-0" /> {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-emerald-600" />
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
            <div className="p-5 sm:p-6 border-t border-emerald-100/30 flex flex-col">
              {verses.map((quran, idx) => (
                <div key={`${quran.surahNum}-${quran.ayatNum}`} className={`flex flex-col gap-4 ${idx !== verses.length - 1 ? 'border-b border-gray-100 mb-6 pb-6' : ''}`}>
                   <p dir="rtl" className="font-arabic text-2xl md:text-3xl leading-loose text-gray-900 text-right">
                     {quran.arabic}
                   </p>
                   <p className="text-base md:text-lg italic text-gray-600 text-left">
                     {quran.latin}
                   </p>
                   <div className="mt-2 text-base md:text-lg text-gray-800 font-normal leading-relaxed text-justify">
                     {quran.translation}
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
