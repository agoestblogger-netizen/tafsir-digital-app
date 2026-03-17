"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";
import { globalAudioPlayer } from "@/lib/audioStore";

interface MurottalPlayerProps {
  chapterId: number;
  surahName: string;
}

export function MurottalPlayer({ chapterId, surahName }: MurottalPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = React.useRef<string | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const fetchAudioUrl = async (): Promise<string | null> => {
    // Return cached URL if already fetched
    if (audioUrlRef.current) return audioUrlRef.current;

    try {
      // Reciter 7 = Mishary Rashid Alafasy
      const res = await fetch(
        `https://api.quran.com/api/v4/chapter_recitations/7/${chapterId}`
      );
      const data = await res.json();
      const url = data?.audio_file?.audio_url;

      if (!url) throw new Error("Audio URL tidak ditemukan.");

      audioUrlRef.current = url;
      return url;
    } catch (err) {
      console.error("[MurottalPlayer] Fetch error:", err);
      setError("Gagal memuat audio murottal.");
      return null;
    }
  };

  const handleToggle = async () => {
    // If already playing → just pause
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Conflict resolution: Stop any verse/word audio first
    globalAudioPlayer.pause();

    setIsLoading(true);
    setError(null);

    const url = await fetchAudioUrl();
    if (!url) {
      setIsLoading(false);
      return;
    }

    // Initialize audio if not already, or reuse existing
    if (!audioRef.current || audioRef.current.src !== url) {
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError("Gagal memutar audio.");
      };
      audio.oncanplaythrough = () => setIsLoading(false);
      audio.onplaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.warn("[MurottalPlayer] Play prevented:", e);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex flex-col items-center gap-3 mt-6 mb-8"
    >
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`group inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed dark:bg-none dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-600 dark:border-transparent ${
          isPlaying
            ? "bg-gold text-white shadow-gold/30 hover:bg-gold-light"
            : "bg-gradient-to-r from-primary to-primary/90 text-white shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Memuat Murottal...
          </>
        ) : isPlaying ? (
          <>
            <Pause className="w-5 h-5" />
            Jeda Murottal
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Putar Murottal Surah
          </>
        )}
      </button>

      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-1.5 text-xs text-gold"
        >
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span>Mishary Rashid Alafasy — {surahName}</span>
        </motion.div>
      )}

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </motion.div>
  );
}
