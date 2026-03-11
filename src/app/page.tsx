"use client";

import * as React from "react";
import { Sunrise, Send, Loader2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeelingFilter } from "@/components/specific/FeelingFilter";
import { CounselorCard, CounselorResponse } from "@/components/specific/CounselorCard";
import { cn } from "@/lib/utils";

// Reusable SVG for Classic Islamic Corner Ornaments
const CornerOrnament = ({ className }: { className?: string }) => (
  <svg
    className={cn("absolute w-16 h-16 text-gold/80 drop-shadow-md", className)}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Outer elegant curve */}
    <path d="M5,95 C5,50 50,5 95,5" strokeWidth="4" strokeLinecap="round" />
    {/* Inner floral curl */}
    <path d="M15,95 C15,60 35,30 65,30 C75,30 85,35 85,45" strokeLinecap="round" />
    {/* Decorative dots */}
    <circle cx="20" cy="20" r="4" fill="currentColor" />
    <circle cx="38" cy="14" r="2" fill="currentColor" />
    <circle cx="14" cy="38" r="2" fill="currentColor" />
  </svg>
);

export default function Home() {
  const [counselorPrompt, setCounselorPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState<CounselorResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const counselorRef = React.useRef<HTMLDivElement>(null);

  // Core fetch logic — reusable by form submit AND feeling filter shortcuts
  const submitPrompt = React.useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    // Smooth scroll to the counselor card area so user sees loading state
    setTimeout(() => {
      counselorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan.");
      }

      setAiResponse(data as CounselorResponse);

      // Auto-scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt(counselorPrompt);
  };

  // FeelingFilter shortcut: auto-fill the prompt and immediately submit
  const handleFeelingSelect = (feeling: string) => {
    setCounselorPrompt(feeling);
    submitPrompt(feeling);
  };

  const handleReset = () => {
    setAiResponse(null);
    setCounselorPrompt("");
    setError(null);
  };

  return (
    <main className="flex flex-col min-h-screen pb-32 bg-background w-full relative">

      {/* 1. MUSHAF COVER HERO SECTION (CLASSIC ARABESQUE & CARTOUCHE) */}
      <section className="relative w-full h-[65vh] flex flex-col items-center justify-center p-4 pt-12 overflow-hidden bg-geometric-heavy shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] z-20">

        {/* Entrance Light Sweep Animation on Page Load */}
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "200%" }}
          transition={{ duration: 4, ease: "easeInOut", delay: 0.2 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="w-full h-full gold-shimmer mix-blend-color-dodge blur-lg"></div>
        </motion.div>

        {/* Thick Outer Gold Frame with Emboss & Curved Corners */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-5 md:inset-8 gold-border-thick rounded-sm emboss-texture bg-primary/20 backdrop-blur-[2px]"
        >
          {/* Inner Decorative Dashed Line */}
          <div className="absolute inset-2 border border-dashed border-gold/50 rounded-sm"></div>

          {/* Intricate Curved SVG Corner Ornaments */}
          <CornerOrnament className="top-1 left-1" />
          <CornerOrnament className="top-1 right-1 rotate-90" />
          <CornerOrnament className="bottom-1 right-1 rotate-180" />
          <CornerOrnament className="bottom-1 left-1 -rotate-90" />
        </motion.div>

        {/* Central Cartouche Emblem for Title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mt-4 px-6 w-full max-w-sm">

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, type: "spring" }}
            className="w-full"
          >
            {/* The Elegant Cartouche Outline */}
            <div className="emblem-cartouche flex flex-col items-center w-full">

              {/* Calligraphic Badge (Bismillah) */}
              <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center mb-6 shadow-inner bg-background/10">
                <span className="font-arabic text-2xl text-gold">﷽</span>
              </div>

              {/* Arabic Title: Tafsir Al-Qur'an Al-Mu'ashir */}
              <h1 className="font-arabic text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-gold-glow">
                تفسير القرآن المعاصر
              </h1>

              {/* Latin Translation */}
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/60 max-w-16"></div>
                <p className="text-xs md:text-sm tracking-[0.2em] font-medium text-gold/90 uppercase pt-1">
                  Tafsir Al-Qur'an Digital
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent max-w-16"></div>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* 2. INTERACTIVE SECTION */}
      <section className="px-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-12 gap-8 flex-1 mt-6 relative z-10 max-w-7xl mx-auto w-full">

        {/* Header / Sapaan Menenangkan */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col gap-2 relative bg-white border border-border/50 p-6 rounded-3xl shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/80 text-primary mb-2 shadow-sm border border-primary/10">
            <Sunrise className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Assalamu&apos;alaikum.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Tarik napas dalam-dalam. Mari kita temukan ketenangan dan petunjuk dari ayat-ayat-Nya hari ini.
          </p>
        </motion.header>

        {/* 🧠 AI COUNSELOR HERO: Otak Konselor */}
        <motion.div
          ref={counselorRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="card-premium p-6 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <span className="text-xl">🧠</span> Otak Konselor
          </h3>
          <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
            Ceritakan keluh kesahmu. Al-Hakim akan menemukan ayat Al-Qur&apos;an yang paling relevan beserta tafsir digitalnya.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={counselorPrompt}
              onChange={(e) => setCounselorPrompt(e.target.value)}
              placeholder="Apa yang membebani pikiranmu hari ini? (Misal: Saya merasa tertinggal dari teman-teman saya...)"
              rows={3}
              disabled={isLoading}
              className="w-full rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!counselorPrompt.trim() || isLoading}
              className="self-end inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Merenungkan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Tanya Al-Hakim
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        {/* Right side wrap for loading, errors, results, and feelings on Desktop */}
        <div className="flex flex-col gap-8">

        {/* ⏳ Loading Skeleton */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-premium rounded-3xl p-5 animate-pulse"
                >
                  <div className="h-3 bg-gold/10 rounded-full w-1/3 mb-4" />
                  <div className="h-3 bg-primary/5 rounded-full w-full mb-2" />
                  <div className="h-3 bg-primary/5 rounded-full w-5/6 mb-2" />
                  <div className="h-3 bg-primary/5 rounded-full w-2/3" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ❌ Error State */}
        <AnimatePresence>
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card-premium p-5 rounded-3xl border-red-200 text-center"
            >
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={handleReset}
                className="text-xs text-gold font-medium hover:underline"
              >
                Coba lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ AI Response: Counselor Card */}
        <AnimatePresence>
          {aiResponse && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={resultRef}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gold tracking-widest uppercase">
                  Jawaban Al-Hakim
                </h3>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Tanya lagi
                </button>
              </div>
              <CounselorCard data={aiResponse} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Berbasis Perasaan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <FeelingFilter onSelectFeeling={handleFeelingSelect} />
        </motion.div>
        </div>


      </section>
    </main>
  );
}
