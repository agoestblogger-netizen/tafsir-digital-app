"use client";

import * as React from "react";
import { VerseCard } from "@/components/specific/VerseCard";
import { MurottalPlayer } from "@/components/specific/MurottalPlayer";
import { TajweedLegend } from "@/components/specific/TajweedLegend";
import { BelajarTajwidView } from "@/components/specific/BelajarTajwidView";
import { ListVideo, BookOpenCheck } from "lucide-react";
import { Verse } from "@/lib/api/quran";

interface SurahInteractiveClientProps {
  chapterId: number;
  surahName: string;
  verses: Verse[];
}

export function SurahInteractiveClient({ chapterId, surahName, verses }: SurahInteractiveClientProps) {
  const [masterSpeed, setMasterSpeed] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"daftar" | "tajwid">("daftar");

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

  return (
    <div className="flex flex-col gap-2 relative z-10 w-full max-w-3xl mx-auto">
      
      {/* AREA HEADER KONTROL MUROTTAL & SPEED MASTER */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 mb-4 gap-4 p-4 md:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        
        <div className="w-full flex justify-center md:justify-start">
          <MurottalPlayer chapterId={chapterId} surahName={surahName} globalSpeed={masterSpeed} />
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
      
      {/* TOGGLE DAFTAR / TAJWID */}
      <div className="flex justify-center mt-2 mb-6">
        <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1.5 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 max-w-sm w-full">
          <button
            onClick={() => setViewMode("daftar")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === "daftar"
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <ListVideo className="w-4 h-4" /> Daftar
          </button>
          <button
            onClick={() => setViewMode("tajwid")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === "tajwid"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <BookOpenCheck className="w-4 h-4" /> Belajar-Tajwid
          </button>
        </div>
      </div>

      <div className="mt-2">
        {viewMode === "daftar" ? (
          verses.map((verse, index) => (
            <VerseCard 
              key={verse.id} 
              verse={verse} 
              index={index} 
              surahName={surahName} 
              masterSpeed={masterSpeed}
            />
          ))
        ) : (
          <BelajarTajwidView verses={verses} surahName={surahName} />
        )}
      </div>
    </div>
  );
}
