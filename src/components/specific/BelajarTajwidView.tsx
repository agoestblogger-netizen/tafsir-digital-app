"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Lightbulb } from "lucide-react";
import { Verse } from "@/lib/api/quran";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// TUAS KALIBRASI: Naikkan jika telat, turunkan jika terlalu cepat
const MAGIC_OFFSET_MS = 1500;

interface BelajarTajwidViewProps {
  verses: Verse[];
  surahName: string;
}

export function BelajarTajwidView({ verses, surahName }: BelajarTajwidViewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAudioInteractive, setIsAudioInteractive] = React.useState(false);
  const [activeWordIndex, setActiveWordIndex] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentVerse = verses[currentIndex];

  const handleNext = () => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      stopAudio();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      stopAudio();
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveWordIndex(null);
  };

  const playWordAudio = (url: string | null) => {
    if (!isAudioInteractive || !url) return;
    
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => console.error("Error playing word audio:", err));
  };

  // Clean up audio on unmount
  React.useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!currentVerse) return null;

  let audioCounter = 1;
  const processedWords = currentVerse.words.map(word => {
    if (word.char_type_name === 'word' && word.audio_url) {
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
    <div className="flex flex-col w-full rounded-3xl overflow-hidden mt-6 mb-12 transition-all duration-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
      {/* Top Header: Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50 gap-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-gold" />
            </div>
            <div className="flex flex-col">
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {surahName} Ayat {currentVerse.verse_key.split(":")[1]}
                </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mode Belajar Tajwid Premium</p>
            </div>
        </div>
        
        <button
          onClick={() => setIsAudioInteractive(!isAudioInteractive)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
            isAudioInteractive 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400 shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600"
          )}
        >
          {isAudioInteractive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Suara Interaktif {isAudioInteractive ? "ON" : "OFF"}
        </button>
      </div>

      {/* Main Focus Content */}
      <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[45vh] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent)] relative">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVerse.id}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-x-10 gap-y-16 w-full max-w-4xl"
            dir="rtl"
          >
            {processedWords.map((word, index) => (
              <div 
                key={word.id} 
                className="flex flex-col items-center gap-3 w-fit group"
              >
                {/* Arabic Tajweed */}
                <div 
                  className={cn(
                    "font-arabic text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[2.6] px-3 py-1",
                    index === activeWordIndex 
                      ? "transition-all duration-300 bg-amber-600/20 dark:bg-amber-600/30 rounded-xl text-red-600 dark:text-red-400 font-bold scale-105 border border-amber-600/30 shadow-md" 
                      : "transition-all duration-300 text-slate-800 dark:text-slate-100 bg-transparent border border-transparent",
                    isAudioInteractive && word.correct_audio_url 
                      ? "hover:text-red-600 dark:hover:text-red-400 cursor-pointer" 
                      : ""
                  )}
                  onClick={() => playWordAudio(word.correct_audio_url)}
                  onMouseEnter={() => playWordAudio(word.correct_audio_url)}
                  dangerouslySetInnerHTML={{ 
                    __html: word.text_uthmani_tajweed || word.text_uthmani || "" 
                  }}
                />
                
                {/* Transliteration */}
                <div className="flex flex-col items-center gap-1 mt-2">
                    <span className="text-sm md:text-base font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide text-center">
                    {word.transliteration?.text || "-"}
                    </span>

                    {/* Translation */}
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-[120px] text-center leading-relaxed break-words font-medium">
                    {word.translation?.text || "-"}
                    </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Full Verse Transliteration & Translation Preview */}
      <div className="px-6 md:px-10 pb-6 flex flex-col gap-3 max-w-3xl mx-auto">
        {/* Full Transliteration */}
        <div className="text-center text-sm md:text-base text-gray-500 dark:text-gray-400 italic font-medium leading-relaxed">
          &ldquo;{currentVerse.translations?.find(t => t.resource_id === 57)?.text || currentVerse.translations?.[0]?.text || "Transliterasi tidak tersedia."}&rdquo;
        </div>
        
        {/* Full Translation */}
        <p 
          className="text-center text-sm md:text-base text-slate-500 dark:text-slate-300 not-italic font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: currentVerse.translations?.find(t => t.resource_id === 33)?.text || "Terjemahan tidak tersedia." }}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700/50">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-inner border border-gray-100 dark:border-slate-600">
          Ayat <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base mx-0.5">{currentVerse.verse_key.split(":")[1]}</span> / {verses.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === verses.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/30 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          <span className="hidden sm:inline">Lanjut</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
