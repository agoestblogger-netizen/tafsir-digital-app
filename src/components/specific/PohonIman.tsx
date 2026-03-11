"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Sprout, TreePine, TreeDeciduous, Trophy } from "lucide-react";

interface PohonImanProps {
  progress: number; // 0 to 100
}

export function PohonIman({ progress }: PohonImanProps) {
  // Determine state based on progress
  let state = "seed";
  let icon = CloudRain;
  let color = "text-sky-500";
  let bg = "bg-sky-100";
  let label = "Benih Niat (Menyemai)";

  if (progress > 10 && progress <= 40) {
    state = "sprout";
    icon = Sprout;
    color = "text-emerald-500";
    bg = "bg-emerald-100";
    label = "Tunas Kesungguhan";
  } else if (progress > 40 && progress <= 80) {
    state = "sapling";
    icon = TreePine;
    color = "text-green-600";
    bg = "bg-green-100";
    label = "Pohon Istiqomah";
  } else if (progress > 80) {
    state = "tree";
    icon = TreeDeciduous;
    color = "text-emerald-700";
    bg = "bg-emerald-200";
    label = "Pohon Ketakwaan";
  }
  if (progress === 100) {
    state = "harvest";
    icon = Trophy;
    color = "text-amber-500";
    bg = "bg-amber-100";
    label = "Panen Berkah";
  }

  const IconComponent = icon;

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        {/* Decorative background circle */}
        <motion.div 
          className="absolute inset-0 bg-primary/5 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-4 bg-primary/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Main Icon Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`w-32 h-32 rounded-full ${bg} flex items-center justify-center relative z-10 shadow-lg border-4 border-white`}
          >
            <IconComponent className={`w-16 h-16 ${color}`} strokeWidth={1.5} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">{label}</h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          {progress === 100 
            ? "Kamu berhasil detox habit ini!" 
            : "Terus sirami dengan kesabaran setiap hari."}
        </p>
      </div>
    </div>
  );
}
