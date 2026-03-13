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
}

export function DetailSurahHeader({ surah }: DetailSurahHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 pt-6 pb-4">
      <div className="flex items-center justify-between pb-4 border-b gold-divider">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-background shadow-sm border border-gold/40 text-gold"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium text-gold">Surah {surah.id}</span>
        <Button variant="ghost" size="icon" className="w-10 h-10 text-gold">
          <Info className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center text-center mt-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1">{surah.name}</h1>
        <p className="text-muted-foreground mb-6 text-sm tracking-widest uppercase">{surah.translation}</p>
        
        <p className="font-arabic text-4xl text-primary font-medium mb-8 drop-shadow-sm">{surah.arab}</p>
        
        <div className="card-premium p-6 rounded-3xl relative overflow-hidden w-full text-left flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <p className="text-foreground/80 leading-relaxed text-sm relative z-10 font-medium">
            &quot;{surah.pitch}&quot;
          </p>
          {surah.resume && (
            <>
              <div className="w-full h-px bg-gold/20 relative z-10 my-1"></div>
              <div 
                className="text-foreground/70 leading-relaxed text-sm relative z-10 italic"
                dangerouslySetInnerHTML={{ __html: surah.resume }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
