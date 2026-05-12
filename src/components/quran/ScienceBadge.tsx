"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScienceBadgeProps {
  onClick: () => void;
  kategori: string;
  isActive?: boolean;
}

export function ScienceBadge({ onClick, kategori, isActive = false }: ScienceBadgeProps) {
  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileTap={{ scale: 0.93 }}
      animate={isActive ? {} : {
        boxShadow: [
          "0 0 0px rgba(56,189,248,0)",
          "0 0 8px rgba(56,189,248,0.4)",
          "0 0 0px rgba(56,189,248,0)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      title={`Lihat koneksi sains: ${kategori}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-cairo transition-all duration-200 border",
        isActive
          ? "bg-[#38BDF8] text-[#060d12] border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          : "bg-[rgba(56,189,248,0.08)] border-[rgba(56,189,248,0.25)] text-[#38BDF8] hover:bg-[rgba(56,189,248,0.15)]"
      )}
    >
      🔬 Sains
    </motion.button>
  );
}
