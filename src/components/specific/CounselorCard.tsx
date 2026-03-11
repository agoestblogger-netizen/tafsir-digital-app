"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, BookOpenCheck, ScrollText, Landmark, Star } from "lucide-react";

// ─── Response Interface (Sirah Nabawiyah Mode) ───────────────────
export interface CounselorResponse {
  emotion_validation: string;
  quran_verse: {
    reference: string;
    arabic: string;
    translation: string;
  };
  hadith: {
    reference: string;
    translation: string;
  };
  sirah_reference: {
    source: string;
    story: string;
    lesson: string;
  };
  prophetic_method: string;
}

interface CounselorCardProps {
  data: CounselorResponse;
}

export function CounselorCard({ data }: CounselorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col gap-5"
    >
      {/* 1. Validasi Emosi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="card-premium p-5 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Heart className="w-4 h-4 text-gold" />
          </div>
          <p className="text-foreground/85 text-sm leading-relaxed italic">
            &ldquo;{data.emotion_validation}&rdquo;
          </p>
        </div>
      </motion.div>

      {/* 2. Ayat Al-Qur'an */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="card-premium rounded-3xl relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold/70 via-gold to-gold/70" />
        <div className="p-5 pl-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpenCheck className="w-4 h-4 text-gold" />
            <span className="text-xs font-semibold text-gold tracking-wide uppercase">
              {data.quran_verse.reference}
            </span>
          </div>
          <p dir="rtl" className="font-arabic text-3xl leading-[3rem] text-foreground mb-4 text-right">
            {data.quran_verse.arabic}
          </p>
          <div className="relative pl-4 py-2">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold/30 rounded-full" />
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              &ldquo;{data.quran_verse.translation}&rdquo;
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. Hadits Nabi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="card-premium rounded-3xl relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-primary/70 to-primary/50" />
        <div className="p-5 pl-6">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              Hadits — {data.hadith.reference}
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed italic">
            &ldquo;{data.hadith.translation}&rdquo;
          </p>
        </div>
      </motion.div>

      {/* 4. Kisah Sirah Nabawiyah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="card-premium rounded-3xl p-5 relative overflow-hidden"
      >
        {/* Watermark tulisan Arab dekoratif */}
        <div className="absolute top-3 right-4 font-arabic text-6xl text-gold/5 select-none leading-none">
          سيرة
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Landmark className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold text-gold tracking-wide uppercase">
            Sirah Nabawiyah
          </span>
        </div>
        <p className="text-xs text-foreground/40 mb-3 italic">{data.sirah_reference.source}</p>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          {data.sirah_reference.story}
        </p>
        <div className="relative pl-4 py-2 border-l-2 border-gold/40">
          <p className="text-sm text-foreground/70 leading-relaxed italic">
            <span className="font-semibold text-gold/80 not-italic">Pelajaran: </span>
            {data.sirah_reference.lesson}
          </p>
        </div>
      </motion.div>

      {/* 5. Prophetic Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        className="bg-primary/5 rounded-3xl p-5 border border-primary/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">
            Prophetic Method — Metode Kenabian
          </span>
        </div>
        <p className="text-sm text-foreground/75 leading-relaxed">
          {data.prophetic_method}
        </p>
      </motion.div>
    </motion.div>
  );
}
