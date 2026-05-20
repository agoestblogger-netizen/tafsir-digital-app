"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Atom, Sparkles, BookOpen, Quote, ChevronDown, Award, Globe, Hourglass, Scroll, FileText, X, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { BackButton } from "@/components/ui/BackButton";
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
  agama?: string;
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

  // Wikipedia Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [wikiTokohData, setWikiTokohData] = React.useState<{ title?: string; extract?: string; description?: string; thumbnail?: { source: string }; content_urls?: { desktop?: { page: string } } } | null>(null);
  const [isWikiTokohLoading, setIsWikiTokohLoading] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [wikiTermData, setWikiTermData] = React.useState<{ title?: string; extract?: string; description?: string; thumbnail?: { source: string }; content_urls?: { desktop?: { page: string } } } | null>(null);
  const [isWikiTermLoading, setIsWikiTermLoading] = React.useState(false);
  const [currentWikiTerm, setCurrentWikiTerm] = React.useState("");

  // Helper: Auto-translate English text to Indonesian using Google Translate GTX
  const translateToIndonesian = async (text: string): Promise<string> => {
    if (!text) return text;
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      // data[0] is an array of [translatedText, originalText, ...] tuples
      return (data[0] as [string][]).map((item) => item[0]).join('');
    } catch {
      return text; // Jika gagal, kembalikan teks asli
    }
  };

  // Wikipedia Fetch Function - 4-Step Cross-Language Fallback + Auto-Translate
  const fetchWikipediaData = async (keyword: string, type: 'tokoh' | 'term') => {
    try {
      if (type === 'tokoh') {
        setIsWikiTokohLoading(true);
        setIsDrawerOpen(true);
      } else {
        setCurrentWikiTerm(keyword);
        setIsWikiTermLoading(true);
        setIsModalOpen(true);
      }

      // Clean: strip parentheses (e.g. "Abbas Ibn Firnas (Muslim)" -> "Abbas Ibn Firnas")
      const cleanKeyword = keyword.replace(/\s*\(.*?\)\s*/g, '').trim();
      const encodedKeyword = encodeURIComponent(cleanKeyword);

      let isEnglishFallback = false;

      // STEP 1: Exact match Bahasa Indonesia
      let res = await fetch(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodedKeyword}`);

      // STEP 2: Exact match English (if Step 1 fails/404)
      if (!res.ok) {
        console.log(`[Wiki] ID miss for: "${cleanKeyword}", trying EN exact...`);
        res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedKeyword}`);
        if (res.ok) isEnglishFallback = true;
      }

      // STEP 3: Fuzzy Search strictly on EN Wikipedia (if Step 2 also fails)
      if (!res.ok) {
        console.log(`[Wiki] EN exact miss, trying EN fuzzy search...`);
        try {
          const searchRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedKeyword}&utf8=&format=json&origin=*`
          );
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.query && searchData.query.search.length > 0) {
              const bestMatch = searchData.query.search[0].title as string;
              console.log(`[Wiki] EN best match: "${bestMatch}", fetching summary...`);
              res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`);
              if (res.ok) isEnglishFallback = true;
            }
          }
        } catch (searchErr) {
          console.warn("[Wiki] EN fuzzy search failed:", searchErr);
        }
      }

      // STEP 4: Set final result or null (with auto-translate if from EN)
      let data = null;
      if (res && res.ok) {
        data = await res.json();
        if (isEnglishFallback && data) {
          console.log(`[Wiki] Translating EN content to ID...`);
          const [translatedExtract, translatedDescription] = await Promise.all([
            translateToIndonesian(data.extract || ''),
            translateToIndonesian(data.description || ''),
          ]);
          data = { ...data, extract: translatedExtract, description: translatedDescription };
        }
      }

      if (type === 'tokoh') {
        setWikiTokohData(data);
      } else {
        setWikiTermData(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data dari Wikipedia", err);
      if (type === 'tokoh') setWikiTokohData(null);
      else setWikiTermData(null);
    } finally {
      if (type === 'tokoh') setIsWikiTokohLoading(false);
      else setIsWikiTermLoading(false);
    }
  };

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
          agama: raw.agama,
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
      <main className="min-h-screen bg-slate-50/50 dark:bg-gray-900 flex items-center justify-center p-6">
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
        <BackButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-gray-900 pb-32 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60vh] bg-gradient-to-br from-gold/10 via-amber-500/5 to-transparent rounded-[100%] blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ─── Navigation Bar ─── */}
      <nav className="px-6 pt-12 pb-4 sticky top-0 bg-background/80 dark:bg-gray-900/90 backdrop-blur-md z-30 border-b border-gold/20 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <BackButton label="Jejak Al-Qur'an di Alam Semesta" />
        </div>
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
                    const isMuslim = data.agama === 'Muslim' || status === 'Muslim';

                    return (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex max-w-max items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest">
                            <Atom className="w-3.5 h-3.5" />
                            {data.bidang_ilmu}
                          </div>
                          
                          {/* Badge Agama */}
                          <div className="inline-flex max-w-max items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                                style={{
                                  background: isMuslim
                                    ? 'rgba(26,170,120,0.15)'
                                    : 'rgba(201,163,90,0.15)',
                                  border: isMuslim
                                    ? '1px solid rgba(26,170,120,0.3)'
                                    : '1px solid rgba(201,163,90,0.3)',
                                  color: isMuslim
                                    ? 'var(--teal-200)'
                                    : 'var(--gold)',
                                }}>
                            {data.agama || status || 'Muslim'}
                          </div>
                        </div>

                        <div>
                          <h1 
                            onClick={() => fetchWikipediaData(cleanName, 'tokoh')}
                            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-1 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                          >
                            {cleanName}
                          </h1>
                          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 italic mb-6">
                            {data.julukan}
                          </p>
                        </div>
                      </>
                    );
                  })()}

          <div className="flex flex-wrap gap-3 mt-2">
            {data.tahun_hidup && (
              <div className="flex items-center gap-1.5 text-base font-bold text-gray-800 dark:text-gray-200 bg-secondary/50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-border dark:border-gray-700">
                <Hourglass className="w-4 h-4 opacity-70" /> {data.tahun_hidup}
              </div>
            )}
            {data.wilayah_peradaban && (
              <div className="flex items-center gap-1.5 text-base font-bold text-gray-800 dark:text-gray-200 bg-secondary/50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-border dark:border-gray-700">
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
          <div className="prose prose-emerald dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-base md:text-lg space-y-8 dark:prose-blockquote:bg-slate-800 dark:prose-blockquote:text-gray-300 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
            <div className="font-normal mb-6">
              <ReactMarkdown>{data.profil_singkat}</ReactMarkdown>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6">
               <h2 className="bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-50 font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm not-prose text-base md:text-lg">
                 <Award className="w-5 h-5" /> Warisan & Kontribusi
               </h2>
               <div className="whitespace-pre-line relative z-10 prose prose-emerald dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-base md:text-lg dark:prose-blockquote:bg-slate-800 dark:prose-blockquote:text-gray-300 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
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
              <h2 className="bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-50 font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
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
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8 rounded-2xl flex flex-col gap-2 relative z-10">
                  <div className="mb-4">
                     <span className="bg-emerald-50 dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-gray-700 px-3 py-1 rounded-full text-sm font-medium w-fit inline-block">
                       Surah {data.nomor_surat} : {data.nomor_ayat}
                     </span>
                  </div>

                  <p dir="rtl" className="font-arabic text-2xl md:text-3xl leading-loose text-gray-900 dark:text-gray-100 text-right">
                    Memuat lafaz...
                  </p>
                  
                  <div className="mt-4">
                    <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 font-normal leading-relaxed text-justify">
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
              <h2 className="bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-50 font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
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
            <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-sm mb-8">
              
              <div className="relative z-10 flex flex-col gap-8">
                {data.refleksi_ilmiah && (
                  <div className="mb-6">
                    <h3 className="bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-50 font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                       <Sparkles className="w-5 h-5" /> Perspektif Sains
                    </h3>
                    
                    {/* Storytelling logic for Refleksi */}
                    {data.refleksi_kosmetik || localStory?.refleksi_md ? (
                      <div className="prose prose-emerald dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-base md:text-lg hover-prose-a:text-emerald-700 dark:hover:prose-a:text-emerald-400 prose-p:leading-loose prose-p:mb-6 prose-headings:text-emerald-800 dark:prose-headings:text-emerald-400 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline dark:prose-blockquote:bg-slate-800 dark:prose-blockquote:text-gray-300 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => {
                              // If it's a Wikipedia auto-link from AI, intercept it
                              return (
                                <a 
                                  {...props} 
                                  className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer underline decoration-emerald-300 dark:decoration-emerald-700 decoration-2 underline-offset-2 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // Use href (the AI-generated keyword) as primary, fallback to display text
                                    const raw = props.href || props.children?.toString() || "";
                                    // Sanitize: underscores -> spaces, strip noise prefixes
                                    let keyword = raw.replace(/_/g, ' ');
                                    keyword = keyword.replace(/kota kuno |kota |kerajaan |sistem |teori |peradaban |sejarah |bangsa |dinasti |era |zaman /gi, '');
                                    keyword = keyword.trim();
                                    if (keyword) fetchWikipediaData(keyword, 'term');
                                  }}
                                >
                                  {props.children}
                                </a>
                              );
                            }
                          }}
                        >{localStory?.refleksi_md || data.refleksi_kosmetik || ""}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 py-4 px-6 bg-slate-50/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-base font-bold text-emerald-800 dark:text-emerald-500 animate-pulse">
                            Sedang meracik uraian sains ilmiah...
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-11/12 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-10/12 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {data.renungan && (
                  <div>
                    <h3 className="bg-emerald-800 dark:bg-emerald-900 text-white dark:text-emerald-50 font-bold px-4 py-1.5 rounded-md inline-flex items-center gap-2 mb-4 shadow-sm text-base md:text-lg">
                      <BookOpen className="w-5 h-5" /> Tadabbur & Renungan
                    </h3>
                    
                    {/* Storytelling logic for Renungan */}
                    {data.renungan_kosmetik || localStory?.renungan_md ? (
                      <div className="prose prose-emerald dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 italic border-l-2 border-emerald-100 dark:border-emerald-900 pl-5 text-base md:text-lg hover-prose-a:text-emerald-700 dark:hover:prose-a:text-emerald-400 prose-p:leading-loose prose-p:mb-6 prose-headings:text-emerald-800 dark:prose-headings:text-emerald-400 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline dark:prose-blockquote:bg-slate-800 dark:prose-blockquote:text-gray-300 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => {
                              return (
                                <a 
                                  {...props} 
                                  className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer font-semibold underline decoration-emerald-300 dark:decoration-emerald-700 decoration-2 underline-offset-2 transition-colors not-italic"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // Use href (the AI-generated keyword) as primary, fallback to display text
                                    const raw = props.href || props.children?.toString() || "";
                                    // Sanitize: underscores -> spaces, strip noise prefixes
                                    let keyword = raw.replace(/_/g, ' ');
                                    keyword = keyword.replace(/kota kuno |kota |kerajaan |sistem |teori |peradaban |sejarah |bangsa |dinasti |era |zaman /gi, '');
                                    keyword = keyword.trim();
                                    if (keyword) fetchWikipediaData(keyword, 'term');
                                  }}
                                >
                                  {props.children}
                                </a>
                              );
                            }
                          }}
                        >{localStory?.renungan_md || data.renungan_kosmetik || ""}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 py-4 px-6 bg-slate-50/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center animate-pulse">
                            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-base font-bold text-emerald-800 dark:text-emerald-500 animate-pulse">
                            Sedang merangkai hikmah tadabbur...
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-11/12 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-10/12 animate-pulse" />
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

      {/* ─── Wikipedia Drawer Panel (Tokoh) ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" /> Wikipedia
                  </h3>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isWikiTokohLoading ? (
                  <div className="flex flex-col gap-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mt-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                  </div>
                ) : wikiTokohData?.extract ? (
                  <div className="flex flex-col gap-6">
                    {wikiTokohData.thumbnail?.source && (
                      <div className="w-full overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative">
                        <img 
                          src={wikiTokohData.thumbnail.source} 
                          alt={wikiTokohData.title}
                          className="w-full h-auto object-cover max-h-64 dark:brightness-90"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{wikiTokohData.title}</h4>
                      {wikiTokohData.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">{wikiTokohData.description}</p>
                      )}
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                        {wikiTokohData.extract}
                      </p>
                    </div>
                    <a 
                      href={wikiTokohData.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${wikiTokohData.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors mt-4"
                    >
                      Baca Selengkapnya
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                      <Globe className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Artikel Wikipedia tidak ditemukan.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Wikipedia Inline Modal (Terms) ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl w-[95%] md:w-[80%] max-w-2xl shadow-2xl overflow-hidden border border-transparent dark:border-gray-800"
            >
              <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 opacity-80" /> Ensiklopedia Mini
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-emerald-200 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {isWikiTermLoading ? (
                  <div className="flex flex-col gap-3 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  </div>
                ) : wikiTermData?.extract ? (
                  <div className="flex flex-col gap-4">
                    {wikiTermData.thumbnail?.source && (
                      <div className="w-full bg-slate-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex justify-center py-4 mb-2">
                        <img 
                          src={wikiTermData.thumbnail.source} 
                          alt={wikiTermData.title}
                          className="h-32 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:brightness-90"
                        />
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">{wikiTermData.title}</h4>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {wikiTermData.extract}
                    </p>
                    <div className="pt-4 mt-2">
                      <a 
                        href={wikiTermData.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${wikiTermData.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 text-sm bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-md"
                      >
                        Lihat Sumber di Wikipedia
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center border border-red-100 dark:border-red-900/30 mb-2">
                       <BookOpen className="w-8 h-8 text-red-300 dark:text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Data Tidak Ditemukan</h4>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Penjelasan Wikipedia untuk istilah ini belum tersedia.</p>
                    </div>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(currentWikiTerm)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Cari di Google
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <span className="font-bold text-gray-800 dark:text-gray-100 text-base md:text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {title}
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
              <div className="prose prose-emerald dark:prose-invert max-w-none text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line dark:prose-blockquote:bg-slate-800 dark:prose-blockquote:text-gray-300 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl">
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
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:border-gray-200 dark:hover:border-slate-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100/50 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="font-bold text-emerald-800 dark:text-emerald-400 text-base md:text-lg flex items-center gap-2 text-left">
          <BookOpen className="w-5 h-5 opacity-70 flex-shrink-0" /> {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
            <div className="p-5 sm:p-6 border-t border-emerald-100/30 dark:border-slate-700 flex flex-col">
              {verses.map((quran, idx) => (
                <div key={`${quran.surahNum}-${quran.ayatNum}`} className={`flex flex-col gap-4 ${idx !== verses.length - 1 ? 'border-b border-gray-100 dark:border-slate-700 mb-6 pb-6' : ''}`}>
                   <p dir="rtl" className="font-arabic text-2xl md:text-3xl leading-loose text-gray-900 dark:text-gray-100 text-right">
                     {quran.arabic}
                   </p>
                   <p className="text-base md:text-lg italic text-gray-600 dark:text-gray-400 text-left">
                     {quran.latin}
                   </p>
                   <div className="mt-2 text-base md:text-lg text-gray-800 dark:text-gray-300 font-normal leading-relaxed text-justify">
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
