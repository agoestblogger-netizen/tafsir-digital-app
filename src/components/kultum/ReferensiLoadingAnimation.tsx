'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

export function ReferensiLoadingAnimation({ onComplete }: Props) {
  useEffect(() => {
    // Jalankan animasi selama 2.5 detik lalu panggil onComplete
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="rounded-2xl border p-5 flex flex-col items-center justify-center text-center py-8"
         style={{ background: "rgba(10,21,32,0.85)", borderColor: "rgba(201,163,90,0.15)" }}>
      
      <div className="relative mb-4">
        {/* Radar sweep animation */}
        <motion.div
          className="absolute inset-0 rounded-full border border-[var(--teal-500)]/30"
          animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-[var(--gold)]/30"
          animate={{ scale: [1, 1.5, 2], opacity: [1, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        
        {/* Core icon */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
             style={{ background: 'linear-gradient(135deg, var(--dark2), var(--teal-900))', border: '1px solid var(--gold-border)' }}>
          <Search className="w-5 h-5 text-[var(--gold-light)] animate-pulse" />
        </div>
      </div>

      <h3 className="font-cinzel text-sm font-bold text-[var(--gold)] mb-2 uppercase tracking-widest">
        Mencari Referensi
      </h3>
      <p className="font-cairo text-xs text-[var(--text2)] max-w-xs mx-auto">
        Sedang memindai database Ayat Sains dan Sejarah Al-Qur'an untuk menemukan referensi yang relevan dengan tema Anda...
      </p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--teal-300)]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
