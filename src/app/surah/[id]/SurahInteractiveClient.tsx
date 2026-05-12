"use client";

import * as React from "react";
import { VerseCard } from "@/components/specific/VerseCard";
import { TajweedLegend } from "@/components/specific/TajweedLegend";
import { BelajarTajwidView } from "@/components/specific/BelajarTajwidView";
import { ListVideo, BookOpenCheck } from "lucide-react";
import { Verse } from "@/lib/api/quran";
import { DetailSurahHeader } from "@/components/specific/DetailSurahHeader";
import { PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";
import { useAudioState } from "@/lib/audioStore";

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
  const { isPlaying, pause } = useAudioState();
  const [masterSpeed, setMasterSpeed] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"daftar" | "tajwid">("daftar");
  const [isInteractiveAudio, setIsInteractiveAudio] = React.useState(true);
  // Relay Race State
  const [playingVerseIndex, setPlayingVerseIndex] = React.useState<number | null>(null);
  const [isFullPlayActive, setIsFullPlayActive] = React.useState(false);

  const handleMasterSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterSpeed(parseFloat(e.target.value));
  };
  
  // Scroll to ayat from URL hash (e.g. /surah/21#ayat-30)
  React.useEffect(() => {
    if (!verses || verses.length === 0 || !window.location.hash) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(window.location.hash) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Temporary highlight ring
        el.style.outline = '2px solid #38BDF8';
        el.style.outlineOffset = '4px';
        el.style.borderRadius = '16px';
        el.style.transition = 'outline 0.3s';
        setTimeout(() => {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }, 2000);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [verses]);

  const stopFullPlay = React.useCallback(() => {
    setIsFullPlayActive(false);
    setPlayingVerseIndex(null);
  }, []);

  // Stop total: matikan relay race + sinyal VerseCard untuk pause via Robot Pencet.
  // PENTING: JANGAN panggil pause() di sini! pause() harus dipanggil dari Robot Pencet
  // SETELAH isAutoPlaying berubah menjadi false, agar isUserStoppingRef sudah terpasang
  // sebelum wasPlayingRef sempat meneruskan baton.
  const stopAll = React.useCallback(() => {
    stopFullPlay();
  }, [stopFullPlay]);

  // Dipanggil oleh VerseCard saat toggle "Lanjut Ayat" aktif dan audio manual selesai
  const handleStartContinuous = React.useCallback((startIndex: number) => {
    if (startIndex < verses.length) {
      setViewMode("daftar");
      setIsFullPlayActive(true);
      setPlayingVerseIndex(startIndex);
    }
  }, [verses.length]);

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

  // NOTE: Scroll saat pergantian ayat kini diatur sepenuhnya oleh useEffect
  // Pelacak Scroll Per-Kata di dalam komponen VerseCard (block: 'start' untuk
  // kata pertama, block: 'center' untuk kata berikutnya). Tidak ada scroll di
  // sini agar tidak terjadi 'tarik-menarik' / efek bouncing.

  const handleInteraction = () => {
    if (isFullPlayActive) {
      stopFullPlay();
    }
  };

  // (Mousedown listener replaced by Emergency Overlay in render)

  return (
    <>
      <DetailSurahHeader surah={surah} viewMode={viewMode} />

      {/* OVERLAY GLOBAL STOP — Muncul saat relay race ATAU play manual aktif */}
      {/* Overlay z-40 hanya menerima klik pada area background (luar content z-50) */}
      {(isFullPlayActive || isPlaying) && (
        <div 
          className="fixed inset-0 z-40 cursor-pointer" 
          onClick={stopAll}
          title="Klik di mana saja untuk menghentikan Murottal"
        />
      )}

      {/* z-50 agar semua kontrol halaman tetap dapat diklik di atas overlay z-40 */}
      <div className="flex flex-col gap-2 relative z-50 w-full max-w-3xl mx-auto">
        
        {/* AREA HEADER KONTROL MUROTTAL & SPEED MASTER */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 mb-4 gap-4 p-4 md:p-6 rounded-3xl relative overflow-hidden" style={{ background: 'rgba(10,21,32,0.9)', border: '1px solid rgba(201,163,90,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
        
        <div className="w-full flex justify-center md:justify-start">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullPlay(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm md:text-base font-bold font-cairo transition-all shadow-sm w-full md:w-auto justify-center ${
              isFullPlayActive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-[#E8F4EC] hover:opacity-90"
            }`}
            style={isFullPlayActive ? {} : { background: 'linear-gradient(135deg, var(--teal-600), var(--teal-500))', boxShadow: '0 4px 16px rgba(13,79,60,0.4)' }}
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

        <div className="flex items-center gap-3 p-3 rounded-xl w-full md:w-auto shrink-0 justify-center" style={{ background: 'rgba(14,30,42,0.8)', border: '1px solid rgba(201,163,90,0.1)' }}>
          <span className="text-sm font-semibold font-cairo" style={{ color: 'var(--text2)' }}>Global Speed:</span>
          <span className="text-sm font-bold font-cairo w-8 text-center" style={{ color: 'var(--teal-200)' }}>{masterSpeed}x</span>
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
      
      {/* TABS TOGGLE */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="p-1.5 rounded-2xl inline-flex" style={{ background: 'rgba(10,21,32,0.9)', border: '1px solid rgba(201,163,90,0.1)' }}>
          <button
            onClick={() => setViewMode("daftar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-cairo font-medium transition-all duration-300 text-sm md:text-base ${
              viewMode === "daftar"
                ? "text-[#E8F4EC]"
                : "hover:opacity-80"
            }`}
            style={viewMode === "daftar" ? { background: 'linear-gradient(135deg, var(--teal-600), var(--teal-500))', boxShadow: '0 2px 12px rgba(13,79,60,0.4)', color: '#E8F4EC' } : { color: 'var(--text2)' }}
          >
            <ListVideo className="w-4 h-4" /> Full
          </button>
          <button
            onClick={() => setViewMode("tajwid")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-cairo font-medium transition-all duration-300 text-sm md:text-base`}
            style={viewMode === "tajwid" ? { background: 'linear-gradient(135deg, var(--teal-600), var(--teal-500))', boxShadow: '0 2px 12px rgba(13,79,60,0.4)', color: '#E8F4EC' } : { color: 'var(--text2)' }}
          >
            <BookOpenCheck className="w-4 h-4" /> Ayat per Kata
          </button>
        </div>
      </div>

      <div className="mt-2">
        {viewMode === "daftar" ? (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-end p-4 mb-6 rounded-2xl gap-4" style={{ background: 'rgba(10,21,32,0.7)', border: '1px solid rgba(13,143,101,0.2)' }}>
              <button
                onClick={() => setIsInteractiveAudio(!isInteractiveAudio)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cairo font-medium transition-all border"
                style={isInteractiveAudio
                  ? { background: 'rgba(13,79,60,0.3)', border: '1px solid rgba(13,143,101,0.4)', color: 'var(--teal-200)' }
                  : { background: 'rgba(14,30,42,0.6)', border: '1px solid rgba(201,163,90,0.1)', color: 'var(--text3)' }
                }
              >
                {isInteractiveAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Suara Interaktif {isInteractiveAudio ? "ON" : "OFF"}
              </button>
            </div>

            {verses.map((verse, index) => {
              const verseNum = parseInt(verse.verse_key.split(':')[1], 10);
              return (
                <div key={verse.id} id={`ayat-${verseNum}`} className="relative scroll-mt-4">
                  <VerseCard
                    verse={verse}
                    index={index}
                    surahName={surahName}
                    masterSpeed={masterSpeed}
                    isPlayingVerse={playingVerseIndex === index}
                    isInteractiveAudio={isInteractiveAudio}
                    onInteraction={handleInteraction}
                    isAutoPlaying={playingVerseIndex === index}
                    onAutoPlayEnd={() => handleVerseEnd(index)}
                    onStartContinuous={handleStartContinuous}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <BelajarTajwidView verses={verses} surahName={surahName} />
        )}
      </div>
    </div>
    </>
  );
}
