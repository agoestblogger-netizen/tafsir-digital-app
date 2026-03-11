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
  { id: "afraid-start", label: "Takut Memulai Hari", icon: Sunrise, color: "bg-sky-50 text-sky-600 border-sky-100" },
  { id: "need-spirit", label: "Butuh Semangat", icon: Flame, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { id: "work-anxiety", label: "Cemas Pekerjaan", icon: CloudRain, color: "bg-blue-50 text-blue-600 border-blue-100" },
];

const afternoonFeelings: FeelingItem[] = [
  { id: "tired-work", label: "Lelah Bekerja", icon: Coffee, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: "lost-focus", label: "Kehilangan Fokus", icon: Target, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { id: "burnout", label: "Burnout", icon: BatteryLow, color: "bg-red-50 text-red-600 border-red-100" },
];

const nightFeelings: FeelingItem[] = [
  { id: "overthinking", label: "Overthinking Malam", icon: Brain, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "insomnia", label: "Susah Tidur", icon: Moon, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { id: "lonely", label: "Kesepian", icon: HeartHandshake, color: "bg-rose-50 text-rose-600 border-rose-100" },
];

// Always-visible feelings
const universalFeelings: FeelingItem[] = [
  { id: "insecure", label: "Butuh Kepercayaan Diri", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "overwhelmed", label: "Merasa Kewalahan", icon: Zap, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { id: "lost-purpose", label: "Kehilangan Arah Hidup", icon: Eye, color: "bg-teal-50 text-teal-600 border-teal-100" },
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
      <h3 className="font-medium text-foreground/80 px-1">
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
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md active:bg-secondary/20",
              "text-sm font-medium"
            )}
          >
            <div className={cn("inline-flex p-1.5 rounded-full", feeling.color)}>
              <feeling.icon className="w-4 h-4" />
            </div>
            <span className="text-foreground/80">{feeling.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
