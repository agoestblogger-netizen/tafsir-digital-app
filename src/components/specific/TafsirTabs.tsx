"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookHeart, BrainCircuit, Globe2 } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: string;
}

const tabs: Tab[] = [
  {
    id: "spiritual",
    label: "Spiritual",
    icon: BookHeart,
    content: "Ayat ini mengingatkan bahwa setiap beban yang kita pikul sudah diukur sesuai dengan kapasitas kita oleh Yang Maha Mengetahui. Jangan putus asa, karena Allah selalu bersama keberserahan diri kita.",
  },
  {
    id: "science",
    label: "Sains & Psikologi",
    icon: BrainCircuit,
    content: "Secara neurobiologis, menerima kenyataan bahwa kita memiliki 'batas kemampuan' menurunkan produksi kortisol (hormon stres). Resiliensi psikologis tumbuh saat kita melepaskan hal-hal di luar kendali kita.",
  },
  {
    id: "history",
    label: "Sejarah",
    icon: Globe2,
    content: "Diturunkan di Madinah saat kaum muslimin menghadapi berbagai tekanan eksternal dan perpecahan internal, ayat ini menjadi pelipur lara dan pondasi mental pasukan muslim di masa-masa krisis.",
  },
];

export function TafsirTabs() {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0].id);

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex gap-2 relative overflow-x-auto pb-2 scrollbar-hide hide-scroll-bar no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap",
                isActive ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-secondary rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
                <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="card-premium p-5 rounded-3xl"
              >
                <p className="text-foreground/80 leading-relaxed text-sm">
                  {tab.content}
                </p>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}
