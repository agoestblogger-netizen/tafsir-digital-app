"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
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
  const showBismillah = surah.id !== 9;

  return (
    <div
      className="relative overflow-hidden rounded-b-3xl mb-4 -mx-4 px-4"
      style={{
        background: "linear-gradient(145deg, var(--teal-800) 0%, var(--teal-900) 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Arabesque pattern overlay */}
      <div className="arabesque-bg opacity-40" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between pt-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full"
          style={{
            background: "rgba(201,163,90,0.1)",
            border: "1px solid rgba(201,163,90,0.3)",
            color: "var(--gold)",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Surah name center */}
        <div className="flex flex-col items-center flex-1 px-3">
          <p
            className="font-amiri text-3xl md:text-4xl text-center leading-none"
            style={{ color: "var(--gold-light)", textShadow: "0 0 20px rgba(201,163,90,0.3)" }}
            dir="rtl"
          >
            {surah.arab}
          </p>
          <h1
            className="font-cinzel text-base md:text-lg font-semibold mt-1"
            style={{ color: "rgba(232,196,106,0.85)" }}
          >
            {surah.name}
          </h1>
          {viewMode === "daftar" && (
            <p
              className="font-cairo text-[10px] tracking-widest uppercase mt-0.5"
              style={{ color: "rgba(201,163,90,0.5)" }}
            >
              {surah.translation}
            </p>
          )}
        </div>

        {/* Placeholder right */}
        <div className="w-9 h-9" />
      </div>

      {/* Bismillah */}
      {showBismillah && viewMode === "daftar" && (
        <div
          className="relative z-10 text-center py-3 mx-2 mb-3 rounded-2xl"
          style={{
            background: "rgba(3,14,10,0.4)",
            border: "1px solid rgba(201,163,90,0.12)",
          }}
        >
          <p
            className="font-amiri text-2xl md:text-3xl"
            style={{ color: "var(--gold-light)" }}
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Pitch / resume card */}
      {viewMode === "daftar" && (
        <div
          className="relative z-10 mx-2 mb-4 p-3 rounded-xl text-left"
          style={{
            background: "rgba(10,21,32,0.6)",
            border: "1px solid rgba(201,163,90,0.1)",
          }}
        >
          <p
            className="font-cairo text-xs md:text-sm leading-relaxed"
            style={{ color: "rgba(232,244,236,0.75)" }}
          >
            &quot;{surah.pitch}&quot;
          </p>
          {surah.resume && (
            <div
              className="font-cairo text-[11px] md:text-xs mt-2 leading-relaxed line-clamp-2"
              style={{ color: "rgba(139,170,160,0.8)" }}
              dangerouslySetInnerHTML={{ __html: surah.resume }}
            />
          )}
        </div>
      )}
    </div>
  );
}
