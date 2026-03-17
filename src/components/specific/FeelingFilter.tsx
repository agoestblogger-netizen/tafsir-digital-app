"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CloudRain, ShieldCheck, HeartHandshake, Zap, Brain,
  Coffee, BatteryLow, Moon, Eye, Flame, Sunrise, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeelingItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const morningFeelings: FeelingItem[] = [
  { id: "afraid-start", label: "Takut Memulai Hari", icon: Sunrise, color: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/50" },
  { id: "need-spirit", label: "Butuh Semangat", icon: Flame, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50" },
  { id: "work-anxiety", label: "Cemas Pekerjaan", icon: CloudRain, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50" },
];

const afternoonFeelings: FeelingItem[] = [
  { id: "tired-work", label: "Lelah Bekerja", icon: Coffee, color: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/50" },
  { id: "lost-focus", label: "Kehilangan Fokus", icon: Target, color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" },
  { id: "burnout", label: "Burnout", icon: BatteryLow, color: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50" },
];

const nightFeelings: FeelingItem[] = [
  { id: "overthinking", label: "Overthinking Malam", icon: Brain, color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50" },
  { id: "insomnia", label: "Susah Tidur", icon: Moon, color: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/50" },
  { id: "lonely", label: "Kesepian", icon: HeartHandshake, color: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50" },
];

// Always-visible feelings
const universalFeelings: FeelingItem[] = [
  { id: "insecure", label: "Butuh Kepercayaan Diri", icon: ShieldCheck, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50" },
  { id: "overwhelmed", label: "Merasa Kewalahan", icon: Zap, color: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/50" },
  { id: "lost-purpose", label: "Kehilangan Arah Hidup", icon: Eye, color: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/50" },
];

function getTimeLabel(hour: number): { label: string; feelings: FeelingItem[] } {
  if (hour >= 4 && hour <= 10) return { label: "Pagi", feelings: morningFeelings };
  if (hour >= 11 && hour <= 17) return { label: "Siang", feelings: afternoonFeelings };
  return { label: "Malam", feelings: nightFeelings };
}

interface FeelingFilterProps {
  onSelectFeeling?: (feeling: string) => void;
}

export function FeelingFilter({ onSelectFeeling }: FeelingFilterProps) {
  const [currentHour, setCurrentHour] = React.useState<number>(new Date().getHours());

  React.useEffect(() => {
    setCurrentHour(new Date().getHours());
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const { label, feelings: timeFeelings } = getTimeLabel(currentHour);
  const allFeelings = [...timeFeelings, ...universalFeelings];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-medium text-gray-900/80 dark:text-gray-200/80 px-1">
        Bagaimana perasaanmu {label.toLowerCase()} ini?
      </h3>
      <div className="flex flex-wrap gap-2">
        {allFeelings.map((feeling, i) => (
          <motion.button
            key={feeling.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectFeeling?.(feeling.label)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md dark:hover:bg-gray-750 active:bg-emerald-50 dark:active:bg-emerald-900/40",
              "text-sm font-medium"
            )}
          >
            <div className={cn("inline-flex p-1.5 rounded-full", feeling.color)}>
              <feeling.icon className="w-4 h-4" />
            </div>
            <span className="text-gray-900/80 dark:text-gray-200/80">{feeling.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
