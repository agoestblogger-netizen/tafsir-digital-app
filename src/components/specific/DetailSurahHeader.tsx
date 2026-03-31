"use client";

import * as React from "react";
import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface DetailSurahHeaderProps {
  surah: {
    id: number;
    name: string;
    translation: string;
    arab: string;
    pitch: string;
    resume?: string;
  };
  viewMode?: "daftar" | "tajwid";
}

export function DetailSurahHeader({ surah, viewMode = "daftar" }: DetailSurahHeaderProps) {
  const router = useRouter();

  return (
    <div className={`z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50 px-4 -mx-4 transition-all duration-300 ${viewMode === "tajwid" ? "py-2 mb-2" : "py-3 mb-4 flex flex-col gap-3"}`}>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background shadow-sm border border-gold/40 text-gold"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <div className="flex flex-col items-center min-w-0 px-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="truncate">{surah.name}</span>
            <span className="font-arabic text-[1.1em] text-primary/80 font-medium relative top-0.5">{"{"}{surah.arab}{"}"}</span>
          </h1>
          {viewMode === "daftar" && (
            <p className="text-muted-foreground text-[10px] md:text-xs tracking-widest uppercase truncate max-w-full">{surah.translation}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 md:w-10 md:h-10 text-gold">
          <Info className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      {viewMode === "daftar" && (
        <div className="flex flex-col items-center text-center">
          <div className="card-premium p-3 md:px-5 rounded-2xl relative overflow-hidden w-full text-left flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <p className="text-foreground/80 leading-snug text-xs md:text-sm relative z-10 font-medium md:border-r border-gold/20 md:pr-4 md:whitespace-nowrap flex-shrink-0">
              &quot;{surah.pitch}&quot;
            </p>
            {surah.resume && (
              <div 
                className="text-foreground/70 leading-snug text-[11px] md:text-xs relative z-10 italic line-clamp-2 md:line-clamp-none flex-grow"
                dangerouslySetInnerHTML={{ __html: surah.resume }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
