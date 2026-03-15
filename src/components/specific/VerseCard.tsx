"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, PauseCircle, Sparkles, Loader2,
  ScrollText, BookOpen, Lightbulb, ChevronDown, Atom, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Verse, VerseWord } from "@/lib/api/quran";
import { useAudioState } from "@/lib/audioStore";

// ─── Tafsir Data Interface (v2 — nullable perspectives) ────────
type LensKey = 'sains' | 'psikologi' | 'sosial';

interface VerseTafsirData {
  tafsir_kemenag: string | null;
  asbabun_nuzul: string | null;
  perspektif_sains: string | null;
  perspektif_psikologi: string | null;
  perspektif_sosial: string | null;
  hadith: string | null;
  todo_list: string[];
}

interface PenemuMuslimRef {
  id: string;
  nama_ilmuwan: string;
  bidang_ilmu: string;
}

const LENS_CONFIG: { key: LensKey; field: keyof VerseTafsirData; label: string; emoji: string; color: string; activeColor: string }[] = [
  { key: 'sains', field: 'perspektif_sains', label: 'Sains', emoji: '🧬', color: 'text-cyan-600', activeColor: 'bg-cyan-600 text-white shadow-cyan-200' },
  { key: 'psikologi', field: 'perspektif_psikologi', label: 'Psikologi', emoji: '🧠', color: 'text-violet-600', activeColor: 'bg-violet-600 text-white shadow-violet-200' },
  { key: 'sosial', field: 'perspektif_sosial', label: 'Sosial', emoji: '🤝', color: 'text-rose-600', activeColor: 'bg-rose-600 text-white shadow-rose-200' },
];

interface VerseCardProps {
  verse: Verse;
  index: number;
  surahName?: string;
}

export function VerseCard({ verse, index, surahName }: VerseCardProps) {
  const { activeVerseKey, activeWordId, isPlaying, playVerse, pause } = useAudioState();
  const [clickedWordId, setClickedWordId] = React.useState<number | null>(null);
  const wordAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Tafsir AI State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [tafsirData, setTafsirData] = React.useState<VerseTafsirData | null>(null);
  const [tafsirError, setTafsirError] = React.useState<string | null>(null);
  const [showTafsir, setShowTafsir] = React.useState(false);
  const [activeLens, setActiveLens] = React.useState<LensKey>('psikologi');

  // Penemu Muslim State
  const [penemuData, setPenemuData] = React.useState<PenemuMuslimRef | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (wordAudioRef.current) {
        wordAudioRef.current.pause();
        wordAudioRef.current.src = "";
        wordAudioRef.current = null;
      }
    };
  }, []);

  // Translate 33 is Kemenag Indonesian translation, 57 is Transliteration
  const translationText = verse.translations?.find(t => t.resource_id === 33)?.text || "Terjemahan tidak tersedia.";
  const transliterationText = verse.translations?.find(t => t.resource_id === 57)?.text || "";

  // Extract verse number from verse_key (e.g. "2:286" -> "286")
  const verseNumber = verse.verse_key.split(":")[1];

  const isActive = activeVerseKey === verse.verse_key;
  const isCurrentlyPlaying = isActive && isPlaying;

  const toggleVerseAudio = () => {
    if (isCurrentlyPlaying) {
      pause();
    } else if (verse.audio?.url) {
      const positionMap: Record<number, number> = {};
      let lastValidWordId: number | null = null;

      verse.words.forEach(w => {
        if (w.char_type_name === 'end') {
          if (lastValidWordId !== null) {
            positionMap[w.position] = lastValidWordId;
          }
        } else {
          positionMap[w.position] = w.id;
          if (w.audio_url || w.char_type_name === 'word') {
            lastValidWordId = w.id;
          }
        }
      });
      playVerse(verse.verse_key, verse.audio.url, verse.audio.segments, positionMap);
    }
  };

  const handleWordClick = (word: VerseWord) => {
    if (!word.audio_url) return;

    if (isPlaying) pause();

    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current.currentTime = 0;
      wordAudioRef.current.src = "";
    }

    setClickedWordId(word.id);

    const wordAudio = new Audio(word.audio_url);
    wordAudioRef.current = wordAudio;

    wordAudio.onended = () => setClickedWordId(null);
    wordAudio.onerror = () => setClickedWordId(null);

    const playPromise = wordAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setClickedWordId(null));
    }
  };

  // ─── Kupas Makna Modern: Fetch AI Tafsir ─────────────────────
  const handleKupasMakna = async () => {
    // Toggle show/hide if already fetched
    if (tafsirData) {
      setShowTafsir(!showTafsir);
      return;
    }

    setIsAnalyzing(true);
    setTafsirError(null);

    try {
      // Strip HTML tags from translation for the AI prompt
      const cleanTranslation = translationText.replace(/<[^>]*>/g, "");
      const arabicText = verse.words
        .filter(w => w.char_type_name !== 'end')
        .map(w => w.text_uthmani || w.text)
        .join(" ");

      const res = await fetch("/api/verse-tafsir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahName: surahName || "Tidak diketahui",
          surahNumber: verse.verse_key.split(":")[0],
          verseNumber,
          verseText: arabicText,
          translation: cleanTranslation,
        }),
      });

      // Fetch cross-reference Penemu Muslim
      const fetchPenemu = fetch(`/api/penemu-muslim?surah=${verse.verse_key.split(":")[0]}&ayat=${verseNumber}`)
        .then(r => r.json())
        .then(d => {
          if (d.data && d.data.length > 0) {
            setPenemuData(d.data[0]);
          }
        })
        .catch(err => console.error("Gagal fetch penemu:", err));

      const [resData] = await Promise.all([res.json(), fetchPenemu]);
      if (!res.ok) throw new Error(resData.error || "Gagal menganalisis ayat.");

      setTafsirData(resData as VerseTafsirData);
      setShowTafsir(true);
    } catch (err) {
      setTafsirError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative overflow-hidden mb-6 rounded-3xl group transition-all duration-500 ${isActive ? 'card-premium border-gold/50 shadow-md scale-[1.01]' : 'card-premium'}`}
    >
      {/* Gold left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b transition-opacity duration-300 ${isActive ? 'from-gold to-primary opacity-100' : 'from-gold-light to-gold opacity-60'}`}></div>

      <div className="p-6 md:p-8">
        {/* Verse Header (Number and Play Button) */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border text-sm font-medium transition-colors ${isActive ? 'bg-gold text-white border-gold shadow-sm' : 'bg-gold/10 border-gold/30 text-gold'}`}>
            {verseNumber}
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent"></div>


          {verse.audio?.url && (
            <button
              onClick={toggleVerseAudio}
              className="flex items-center justify-center p-2 rounded-full text-gold hover:text-gold-light hover:bg-gold/10 transition-colors"
              aria-label={isCurrentlyPlaying && activeWordId === null ? "Pause Audio" : "Play Full Verse"}
            >
              {isCurrentlyPlaying && activeWordId === null ? (
                <PauseCircle className="w-8 h-8 fill-gold/10" strokeWidth={1.5} />
              ) : (
                <PlayCircle className="w-8 h-8" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>


        {/* Arabic Text — Word-by-Word Interactive Tajweed (semua surah) */}
        <div dir="rtl" className="mb-6">
          <div className="tajweed flex flex-wrap gap-x-1 gap-y-3 justify-end text-3xl md:text-5xl leading-loose drop-shadow-sm">
            {verse.words.map((word) => {
              const isWordActive =
                (isActive && activeWordId === word.id && isPlaying) ||
                (clickedWordId === word.id);

              // 'end' glyph (nomor ayat) — render tanpa interaksi
              if (word.char_type_name === 'end') {
                return (
                  <span
                    key={word.id}
                    className="font-arabic text-foreground/50 opacity-75 select-none self-center"
                  >
                    {word.text_uthmani || word.text}
                  </span>
                );
              }

              const isClickable = !!word.audio_url;

              return (
                <span
                  key={word.id}
                  onClick={isClickable ? () => handleWordClick(word) : undefined}
                  title={word.translation?.text ? `${word.translation.text}${isClickable ? ' — ketuk untuk audio' : ''}` : undefined}
                  className={`tajweed-word font-arabic ${isWordActive ? 'playing' : ''} ${!isClickable ? 'cursor-default' : ''}`}
                >
                  {word.text_uthmani_tajweed ? (
                    <span dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed }} />
                  ) : (
                    word.text_uthmani || word.text
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Transliteration */}
        {transliterationText && (
          <div className="mb-4 text-right">
            <p className="text-base text-primary/80 italic leading-relaxed">
              {transliterationText}
            </p>
          </div>
        )}

        {/* Translation */}
        <div className="relative pl-6 py-2 border-l-2 border-gold/40 mt-4">
          <div
            className="text-base text-foreground/90 leading-relaxed pr-2"
            dangerouslySetInnerHTML={{ __html: translationText }}
          />
        </div>

        {/* ✨ Kupas Makna Modern — AI Tafsir CTA */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <button
            onClick={handleKupasMakna}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary/90 to-primary text-white text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis ayat...
              </>
            ) : tafsirData ? (
              <>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTafsir ? 'rotate-180' : ''}`} />
                {showTafsir ? "Tutup Tafsir" : "Lihat Tafsir Digital"}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="flex items-center gap-2">
                Kupas Makna Digital
              </span>
            </>
            )}
          </button>

          {tafsirError && (
            <p className="text-red-500 text-xs mt-2">{tafsirError}</p>
          )}

          {/* Loading Skeleton */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col gap-3 overflow-hidden"
              >
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-2xl bg-secondary/30 p-4 animate-pulse">
                    <div className="h-3 bg-gold/10 rounded-full w-1/4 mb-3" />
                    <div className="h-3 bg-primary/5 rounded-full w-full mb-2" />
                    <div className="h-3 bg-primary/5 rounded-full w-4/5" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Tafsir Accordion Result ─────────────────────────── */}
          <AnimatePresence>
            {showTafsir && tafsirData && (() => {
              const availableLenses = LENS_CONFIG.filter(
                (lens) => {
                  const val = String(tafsirData[lens.field] || "").trim();
                  return val !== "" && 
                         val.toLowerCase() !== "null" && 
                         val !== "undefined" &&
                         !val.toLowerCase().includes("fakta ilmiah spesifik") &&
                         !val.toLowerCase().includes("atau null");
                }
              );
              const hasAnyPerspective = availableLenses.length > 0;
              const effectiveLens = availableLenses.find(l => l.key === activeLens)
                ? activeLens
                : availableLenses[0]?.key || null;

              return (
                <motion.div
                  key="tafsir-result"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 flex flex-col gap-4 overflow-hidden"
                >
                  {/* Section 1: Tafsir Kemenag (ALWAYS SHOWN) */}
                  {tafsirData.tafsir_kemenag && String(tafsirData.tafsir_kemenag).trim() !== "" && String(tafsirData.tafsir_kemenag).trim().toLowerCase() !== "null" && (
                    <div className="rounded-2xl bg-teal-50/60 border border-teal-100/80 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-bold text-teal-700 tracking-wider uppercase">Tafsir Kemenag RI</h4>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                        {tafsirData.tafsir_kemenag}
                      </p>
                    </div>
                  )}

                  {/* Section 2: Asbabun Nuzul (only if exists) */}
                  {tafsirData.asbabun_nuzul && 
                   String(tafsirData.asbabun_nuzul).trim() !== "" && 
                   String(tafsirData.asbabun_nuzul).trim().toLowerCase() !== "null" && 
                   !String(tafsirData.asbabun_nuzul).toLowerCase().includes("riwayat asbabun nuzul jika disebutkan kemenag") && 
                   !String(tafsirData.asbabun_nuzul).toLowerCase().includes("jika asbabun nuzul tidak ditemukan") && (
                    <div className="rounded-2xl bg-amber-50/60 border border-amber-100/80 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ScrollText className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-700 tracking-wider uppercase">Asbabun Nuzul</h4>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {tafsirData.asbabun_nuzul}
                      </p>
                    </div>
                  )}

                  {/* Section 3: Perspektif Modern — CONDITIONAL */}
                  {hasAnyPerspective && effectiveLens && (
                    <div className="rounded-2xl bg-blue-50/60 border border-blue-100/80 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-blue-700 tracking-wider uppercase">Perspektif Modern</h4>
                      </div>

                      <div className="flex gap-2 mb-3">
                        {availableLenses.map(lens => (
                          <button
                            key={lens.key}
                            onClick={() => setActiveLens(lens.key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${effectiveLens === lens.key
                              ? `${lens.activeColor} shadow-sm`
                              : `bg-white/70 ${lens.color} hover:bg-white border border-current/10`
                              }`}
                          >
                            <span>{lens.emoji}</span>
                            {lens.label}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.p
                          key={effectiveLens}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-foreground/80 leading-relaxed"
                        >
                          {tafsirData[`perspektif_${effectiveLens}` as keyof VerseTafsirData] as string}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Section 4: Hadits Penguat */}
                  {tafsirData.hadith && String(tafsirData.hadith).trim() !== "" && String(tafsirData.hadith).trim().toLowerCase() !== "null" && (
                    <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100/80 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ScrollText className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Hadits Penguat</h4>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed italic">
                        &ldquo;{tafsirData.hadith}&rdquo;
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* ─── Penemu Muslim Cross-Reference ───────────────────── */}
          <AnimatePresence>
            {showTafsir && penemuData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-4 card-premium border-gold/50 bg-gold/5 p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Atom className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gold tracking-wider uppercase flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Khazanah Sains Islam
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                      Ayat ini menginspirasi <strong>{penemuData.nama_ilmuwan}</strong> dalam bidang <strong>{penemuData.bidang_ilmu}</strong>.
                    </p>
                    <Link
                      href={`/ensiklopedia/penemu/${penemuData.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-gold transition-colors"
                    >
                      Baca Kisah Ilmuwan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
