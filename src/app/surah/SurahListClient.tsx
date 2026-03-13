"use client";

import * as React from "react";
import { Compass, Search, BookOpen } from "lucide-react";
import { SurahCard } from "@/components/specific/SurahCard";
import { InputField } from "@/components/ui/InputField";
import { Chapter } from "@/lib/api/quran";
import { getLocalizedSurahName, getLocalizedSurahTranslation } from "@/lib/surahLocalization";

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
    <main className="flex flex-col min-h-screen bg-page-warm pb-24 max-w-7xl mx-auto w-full px-6">
      <header className="flex flex-col gap-2 pt-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-primary mb-2 shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Peta Surah
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Eksplorasi peta kebijakan Al-Qur&apos;an. 114 Surah, 114 panduan hidup.
        </p>
      </header>

      <div className="relative mt-2">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <InputField 
          placeholder="Cari surah, tema, atau nomor..." 
          className="pl-12 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 relative z-10 w-full">
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
                pitch: `Surah ke-${chapter.id} dalam Al-Qur'an. Diturunkan di ${chapter.revelation_place === "makkah" ? "Makkah" : "Madinah"}.`
              }} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gold/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Pencarian tidak ditemukan</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
              Coba gunakan kata kunci lain, seperti nomor surah atau nama latinnya.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
