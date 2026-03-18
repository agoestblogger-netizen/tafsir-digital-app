"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, PauseCircle, Sparkles, Loader2,
  ScrollText, BookOpen, Lightbulb, ChevronDown, Atom, ArrowRight, Telescope
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
  masterSpeed?: number;
}

export function VerseCard({ verse, index, surahName, masterSpeed = 1 }: VerseCardProps) {
  const { activeVerseKey, activeWordId, isPlaying, playVerse, pause, setPlaybackRateGlobal } = useAudioState();
  const [clickedWordId, setClickedWordId] = React.useState<number | null>(null);
  const wordAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1);

  // Tafsir AI State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [tafsirData, setTafsirData] = React.useState<VerseTafsirData | null>(null);
  const [tafsirError, setTafsirError] = React.useState<string | null>(null);
  const [showTafsir, setShowTafsir] = React.useState(false);
  const [activeLens, setActiveLens] = React.useState<LensKey>('psikologi');

  // Penemu Muslim Cross-Link State
  const [penemuList, setPenemuList] = React.useState<PenemuMuslimRef[]>([]);

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

  // ─── Tunduk pada Titah Sang Master (Global Speed) ─────────────
  React.useEffect(() => {
    setPlaybackRate(masterSpeed);
    if (wordAudioRef.current) {
      wordAudioRef.current.playbackRate = masterSpeed;
    }
  }, [masterSpeed]);

  // ─── Fetch Cross-Link Penemu Muslim ─────────────────────
  // Berjalan diam-diam saat VerseCard di-mount (intersection observer / render)
  React.useEffect(() => {
    // Avoid re-fetching if data is already loaded or attempted
    let isMounted = true;
    const surahNumber = verse.verse_key.split(":")[0];
    const ayatNumber = verse.verse_key.split(":")[1];

    fetch(`/api/penemu-muslim?surah=${surahNumber}&ayat=${ayatNumber}`)
      .then(r => r.json())
      .then(d => {
        if (isMounted && d.data && d.data.length > 0) {
          setPenemuList(d.data);
        }
      })
      .catch(err => console.error("Gagal sinkronisasi data cross-link Penemu Muslim:", err));

    return () => {
      isMounted = false;
    };
  }, [verse.verse_key]);

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
      playVerse(verse.verse_key, verse.audio.url, verse.audio.segments, positionMap, playbackRate);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);

    // Jika sedang play audio global
    if (isActive) {
      setPlaybackRateGlobal(rate);
    }

    // Jika sedang play word-by-word
    if (wordAudioRef.current) {
      wordAudioRef.current.playbackRate = rate;
    }
  };

  const handleWordClick = (wordObj: VerseWord & { correct_audio_url?: string | null }, visualIndex: number) => {
    const activeUrl = wordObj.correct_audio_url || wordObj.audio_url;

    // 1. AUDIT LOG
    console.log("Diklik kata:", wordObj.text_uthmani, "URL Audio Asli:", wordObj.audio_url, "URL Bypass:", activeUrl);

    // 2. CEK WAKAF / KOSONG
    if (!activeUrl || wordObj.char_type_name === 'pause' || wordObj.char_type_name === 'end') {
      console.log("Ini wakaf/end, batalkan audio.");
      return;
    }

    // Jeda lantunan satu surat utuh jika sedang berbunyi
    if (isPlaying) pause();

    // 3. HENTIKAN AUDIO SEBELUMNYA
    if (wordAudioRef.current) {
      // CLEAR LISTENER LAMA AGAR TIDAK TER-TRIGGER SAAT DI-CLEANUP
      wordAudioRef.current.onended = null;
      wordAudioRef.current.onerror = null;
      wordAudioRef.current.pause();
      wordAudioRef.current.currentTime = 0;
      wordAudioRef.current.removeAttribute('src'); // Forcing clean up source
      wordAudioRef.current.load();
    }

    // 4. JALANKAN AUDIO & BINDING STATE
    setClickedWordId(visualIndex);

    const wordAudio = new Audio(activeUrl);
    wordAudio.playbackRate = playbackRate;
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

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal menganalisis ayat.");

      setTafsirData(resData as VerseTafsirData);
      setShowTafsir(true);
    } catch (err) {
      setTafsirError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── Pre-processing Audio Offset Bypass ───────────────────────
  let audioCounter = 1;
  const processedWords = verse.words.map(word => {
    if (word.char_type_name === 'word' && word.audio_url) {
      // Ekstrak base URL (contoh: ".../021_035_") dan timpa 3 digit terakhirnya
      const match = word.audio_url.match(/(.*_)\d{3}(\.mp3)/);
      let fixedUrl = word.audio_url;
      if (match) {
        const correctNum = String(audioCounter).padStart(3, '0');
        fixedUrl = match[1] + correctNum + match[2];
      }
      audioCounter++;
      return { ...word, correct_audio_url: fixedUrl };
    }
    return { ...word, correct_audio_url: null };
  });


  return (
    <motion.div
      id={`ayat-${verseNumber}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative overflow-hidden mb-6 rounded-3xl group transition-all duration-500 scroll-mt-32 ${isActive ? 'card-premium border-gold/50 shadow-md scale-[1.01]' : 'card-premium'}`}
    >
      {/* Gold left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b transition-opacity duration-300 ${isActive ? 'from-gold to-primary opacity-100' : 'from-gold-light to-gold opacity-60'}`}></div>

      <div className="p-4 sm:p-6 md:p-8">
        {/* Verse Header (Number and Play Button) */}
        <div className="flex flex-col items-center gap-4 mb-6 md:mb-8">
          {/* Centered Number with Side Lines */}
          <div className="flex items-center w-full max-w-xs mx-auto">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30"></div>
            <div className={`mx-4 flex shrink-0 items-center justify-center w-10 h-10 rounded-full border text-sm font-medium transition-colors ${isActive ? 'bg-gold text-white border-gold shadow-sm' : 'bg-gold/10 border-gold/30 text-gold'}`}>
              {verseNumber}
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30"></div>
          </div>

          {/* Wrapper flex untuk Slider & Play Button (Centered) */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {verse.audio?.url && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-600">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-center">
                  {playbackRate}x
                </span>
                <input
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={playbackRate}
                  onChange={handleSpeedChange}
                  className="w-20 md:w-24 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600"
                  aria-label="Atur Kecepatan Murottal"
                />
              </div>
            )}

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
        </div>


        {/* Arabic Text — Word-by-Word Interactive Tajweed (semua surah) */}
        <div dir="rtl" className="mb-4 md:mb-6">
          <div className="tajweed flex flex-wrap justify-center items-center gap-x-2 gap-y-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-loose drop-shadow-sm">
            {processedWords.map((word, index) => {
              const isWordActive =
                (isActive && activeWordId === word.id && isPlaying) ||
                (clickedWordId === index);

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

              const actualUrl = word.correct_audio_url || word.audio_url;
              const isClickable = !!actualUrl && word.char_type_name !== 'pause' && word.char_type_name !== 'end';

              return (
                <span
                  key={word.id}
                  onClick={isClickable ? () => handleWordClick(word, index) : undefined}
                  onMouseEnter={isClickable ? () => handleWordClick(word, index) : undefined}
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
          <div className="mb-4 text-center">
            <p className="text-sm md:text-base text-primary/80 italic leading-relaxed">
              {transliterationText}
            </p>
          </div>
        )}

        {/* Translation */}
        <div className="relative py-2 mt-4">
          <div
            className="text-sm md:text-base text-foreground/90 dark:text-gray-200 leading-relaxed text-center"
            dangerouslySetInnerHTML={{ __html: translationText }}
          />
        </div>

        {/* ✨ Kupas Makna Modern — AI Tafsir CTA */}
        <div className="mt-6 pt-6 border-t border-border/30 flex justify-center">
          <button
            onClick={handleKupasMakna}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary/90 to-primary text-white text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:bg-none dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-600 dark:border-transparent"
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
                  {/* ─── Premium Cross-Link Banner: Jejak Al-Qur'an (Dipindah Dalam Accordion) ─────────────────────────── */}
                  {penemuList.length > 0 && (
                    <div className="space-y-3 mb-2">
                      {penemuList.map((tokoh) => (
                        <Link 
                          key={tokoh.id}
                          href={`/ensiklopedia/penemu/${tokoh.id}`} 
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center">
                              <Telescope className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-900 dark:text-emerald-50 text-sm md:text-base">
                                Jejak Al-Qur&apos;an di Alam Semesta
                              </h4>
                              <p className="text-xs md:text-sm text-emerald-700/80 dark:text-emerald-200/70">
                                Temukan kaitan ayat ini dengan penemu <strong>{tokoh.nama_ilmuwan}</strong>
                              </p>
                            </div>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform ml-2 flex-shrink-0">
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Section 1: Tafsir Kemenag (ALWAYS SHOWN) */}
                  {tafsirData.tafsir_kemenag && String(tafsirData.tafsir_kemenag).trim() !== "" && String(tafsirData.tafsir_kemenag).trim().toLowerCase() !== "null" && (
                    <div className="rounded-2xl bg-teal-50/60 dark:bg-slate-800 border border-teal-100/80 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs font-bold text-teal-700 dark:text-teal-300 tracking-wider uppercase">Tafsir Kemenag RI</h4>
                      </div>
                      <p className="text-sm text-foreground/80 dark:text-gray-200 leading-relaxed whitespace-pre-line">
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
                    <div className="rounded-2xl bg-amber-50/60 dark:bg-slate-800 border border-amber-100/80 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ScrollText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 tracking-wider uppercase">Asbabun Nuzul</h4>
                      </div>
                      <p className="text-sm text-foreground/80 dark:text-gray-200 leading-relaxed">
                        {tafsirData.asbabun_nuzul}
                      </p>
                    </div>
                  )}

                  {/* Section 3: Perspektif Modern — CONDITIONAL */}
                  {hasAnyPerspective && effectiveLens && (
                    <div className="rounded-2xl bg-blue-50/60 dark:bg-slate-800 border border-blue-100/80 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wider uppercase">Perspektif Modern</h4>
                      </div>

                      <div className="flex gap-2 mb-3">
                        {availableLenses.map(lens => (
                          <button
                            key={lens.key}
                            onClick={() => setActiveLens(lens.key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${effectiveLens === lens.key
                              ? `${lens.activeColor} shadow-sm dark:bg-indigo-600`
                              : `bg-white/70 dark:bg-slate-700 ${lens.color} dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 border border-current/10 dark:border-slate-600`
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
                          className="text-sm text-foreground/80 dark:text-gray-200 leading-relaxed"
                        >
                          {tafsirData[`perspektif_${effectiveLens}` as keyof VerseTafsirData] as string}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Section 4: Hadist Penguat */}
                  {tafsirData.hadith && String(tafsirData.hadith).trim() !== "" && String(tafsirData.hadith).trim().toLowerCase() !== "null" && (
                    <div className="rounded-2xl bg-emerald-50/60 dark:bg-slate-800 border border-emerald-100/80 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ScrollText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">Hadist Penguat</h4>
                      </div>
                      <p className="text-sm text-foreground/80 dark:text-gray-200 leading-relaxed italic">
                        &ldquo;{tafsirData.hadith}&rdquo;
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
