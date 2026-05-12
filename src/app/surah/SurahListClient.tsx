"use client";

import * as React from "react";
import { Search, BookOpen } from "lucide-react";
import { SurahCard } from "@/components/specific/SurahCard";
import { InputField } from "@/components/ui/InputField";
import { Chapter } from "@/lib/api/quran";
import { getLocalizedSurahName, getLocalizedSurahTranslation } from "@/lib/surahLocalization";
import { hasSains } from "@/data/sains_ayat";

interface SurahListClientProps {
  initialChapters: Chapter[];
}

export function SurahListClient({ initialChapters }: SurahListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredChapters = initialChapters.filter((chapter) => {
    const q = searchQuery.toLowerCase();
    const locName = getLocalizedSurahName(chapter.id, chapter.name_simple).toLowerCase();
    const locTrans = getLocalizedSurahTranslation(chapter.id, chapter.translated_name.name).toLowerCase();
    return (
      chapter.id.toString().includes(q) ||
      locName.includes(q) ||
      locTrans.includes(q)
    );
  });

  return (
    <main className="flex flex-col min-h-screen pb-28 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-2 pt-6 pb-4">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2"
          style={{
            background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
            boxShadow: "0 4px 16px rgba(13,79,60,0.4)",
          }}
        >
          <BookOpen className="w-6 h-6" style={{ color: "var(--gold-light)" }} />
        </div>
        <h1 className="font-cinzel text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--text1)" }}>
          Al-Qur&apos;an
        </h1>
        <p className="font-cairo text-sm" style={{ color: "var(--text2)" }}>
          114 Surah — panduan hidup abadi. Badge 🔬 menandai surah dengan kaitan sains modern.
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5" style={{ color: "var(--text3)" }} />
        </div>
        <InputField
          placeholder="Cari surah, tema, atau nomor..."
          className="pl-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chapter) => (
            <SurahCard
              key={chapter.id}
              surah={{
                id: chapter.id,
                name: getLocalizedSurahName(chapter.id, chapter.name_simple),
                arab: chapter.name_arabic,
                translation: getLocalizedSurahTranslation(chapter.id, chapter.translated_name.name),
                revelation: chapter.revelation_place === "makkah" ? "Makkiyah" : "Madaniyah",
                verses: chapter.verses_count,
                pitch: `Surah ke-${chapter.id} dalam Al-Qur'an.`,
                hasSains: hasSains(chapter.id),
              }}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(201,163,90,0.08)", border: "1px solid rgba(201,163,90,0.15)" }}
            >
              <BookOpen className="w-8 h-8" style={{ color: "rgba(201,163,90,0.5)" }} />
            </div>
            <h3 className="text-lg font-bold font-cinzel mb-2" style={{ color: "var(--text1)" }}>
              Tidak ditemukan
            </h3>
            <p className="font-cairo text-sm max-w-[250px] leading-relaxed" style={{ color: "var(--text2)" }}>
              Coba gunakan kata kunci lain, seperti nomor atau nama latin surah.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
