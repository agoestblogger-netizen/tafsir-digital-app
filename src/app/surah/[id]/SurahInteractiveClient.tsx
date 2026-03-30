"use client";

import * as React from "react";
import { VerseCard } from "@/components/specific/VerseCard";
import { TajweedLegend } from "@/components/specific/TajweedLegend";
import { BelajarTajwidView } from "@/components/specific/BelajarTajwidView";
import { ListVideo, BookOpenCheck } from "lucide-react";
import { Verse } from "@/lib/api/quran";
import { DetailSurahHeader } from "@/components/specific/DetailSurahHeader";
import { PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";

interface SurahInteractiveClientProps {
  chapterId: number;
  surahName: string;
  verses: Verse[];
  surah: {
    id: number;
    name: string;
    translation: string;
    arab: string;
    pitch: string;
    resume?: string;
  };
}

export function SurahInteractiveClient({ chapterId, surahName, verses, surah }: SurahInteractiveClientProps) {
  const [masterSpeed, setMasterSpeed] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"daftar" | "tajwid">("daftar");
  const [isInteractiveAudio, setIsInteractiveAudio] = React.useState(true);
  // Relay Race State
  const [playingVerseIndex, setPlayingVerseIndex] = React.useState<number | null>(null);
  const [isFullPlayActive, setIsFullPlayActive] = React.useState(false);
  
  const handleMasterSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterSpeed(parseFloat(e.target.value));
  };
  
  // Bulletproof Ayah Jump (Scroll DOM Timing Fix)
  React.useEffect(() => {
    if (verses && verses.length > 0 && window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Wait 500ms for stable DOM
    }
  }, [verses]);

  const stopFullPlay = React.useCallback(() => {
    setIsFullPlayActive(false);
    setPlayingVerseIndex(null);
  }, []);

  const handleVerseEnd = React.useCallback((currentIndex: number) => {
    if (isFullPlayActive && currentIndex + 1 < verses.length) {
      setPlayingVerseIndex(currentIndex + 1);
    } else {
      stopFullPlay();
    }
  }, [isFullPlayActive, verses.length, stopFullPlay]);

  const toggleFullPlay = () => {
    if (isFullPlayActive) {
      stopFullPlay();
    } else {
      // 1. Auto-switch ke tab Full (Daftar Ayat)
      setViewMode("daftar");
      // 2. Mulai estafet setelah jeda kecil agar Full mode selesai render
      setTimeout(() => {
        setIsFullPlayActive(true);
        setPlayingVerseIndex(0);
      }, 100);
    }
  };

  React.useEffect(() => {
    return () => {
      stopFullPlay();
    };
  }, [stopFullPlay]);

  React.useEffect(() => {
    if (playingVerseIndex !== null && viewMode === "daftar") {
      const verseElement = document.getElementById(`verse-${playingVerseIndex}`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [playingVerseIndex, viewMode]);

  const handleInteraction = () => {
    if (isFullPlayActive) {
      stopFullPlay();
    }
  };

  // (Mousedown listener replaced by Emergency Overlay in render)

  return (
    <>
      <DetailSurahHeader surah={surah} viewMode={viewMode} />

      {/* OVERLAY KLIK DARURAT UNTUK STOP AUTO-PLAY */}
      {isFullPlayActive && playingVerseIndex !== null && (
        <div 
          className="fixed inset-0 z-50 cursor-pointer" 
          onClick={stopFullPlay}
          title="Klik di mana saja untuk menghentikan Murottal"
        />
      )}

      <div className="flex flex-col gap-2 relative z-10 w-full max-w-3xl mx-auto">
        
        {/* AREA HEADER KONTROL MUROTTAL & SPEED MASTER */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 mb-4 gap-4 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        
        <div className="w-full flex justify-center md:justify-start">
          <button
            onClick={toggleFullPlay}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm md:text-base font-bold transition-all shadow-sm w-full md:w-auto justify-center ${
              isFullPlayActive
                ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/30"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
            }`}
          >
            {isFullPlayActive ? (
              <>
                <PauseCircle className="w-5 h-5 md:w-6 md:h-6" /> Hentikan Murottal
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 md:w-6 md:h-6" /> Putar Murottal Surah
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-slate-600/50 w-full md:w-auto shrink-0 justify-center shadow-inner">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Global Speed:</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 w-8 text-center">{masterSpeed}x</span>
          <input 
            type="range" 
            min="0.25" 
            max="2" 
            step="0.25" 
            value={masterSpeed} 
            onChange={handleMasterSpeedChange} 
            className="w-24 md:w-32 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600"
            aria-label="Atur Kecepatan Keseluruhan (Master)"
          />
        </div>
      </div>

      <TajweedLegend />
      
      {/* TABS TOGGLE - DESAIN LEBIH PREMIUM */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 inline-flex">
          <button
            onClick={() => setViewMode("daftar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
              viewMode === "daftar"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <ListVideo className="w-4 h-4" /> Full
          </button>
          <button
            onClick={() => setViewMode("tajwid")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
              viewMode === "tajwid"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" /> Ayat per Kata
          </button>
        </div>
      </div>

      <div className="mt-2">
        {viewMode === "daftar" ? (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-end p-4 mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl gap-4">
              <button
                onClick={() => setIsInteractiveAudio(!isInteractiveAudio)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isInteractiveAudio 
                    ? "bg-white border-emerald-200 text-emerald-700 dark:bg-slate-800 dark:border-emerald-800 dark:text-emerald-400 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300"
                }`}
              >
                {isInteractiveAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Suara Interaktif {isInteractiveAudio ? "ON" : "OFF"}
              </button>
            </div>

            {verses.map((verse, index) => (
              <VerseCard 
                key={verse.id} 
                verse={verse} 
                index={index} 
                surahName={surahName} 
                masterSpeed={masterSpeed}
                isPlayingVerse={playingVerseIndex === index}
                isInteractiveAudio={isInteractiveAudio}
                onInteraction={handleInteraction}
                isAutoPlaying={playingVerseIndex === index}
                onAutoPlayEnd={() => handleVerseEnd(index)}
              />
            ))}
          </>
        ) : (
          <BelajarTajwidView verses={verses} surahName={surahName} />
        )}
      </div>
    </div>
    </>
  );
}
