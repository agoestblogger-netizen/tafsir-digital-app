import * as React from "react";
import { DetailSurahHeader } from "@/components/specific/DetailSurahHeader";
import { SurahInteractiveClient } from "./SurahInteractiveClient";
import { getChapter, getTajweedVerses, getChapterInfo } from "@/lib/api/quran";
import { getLocalizedSurahName, getLocalizedSurahTranslation } from "@/lib/surahLocalization";

export default async function DetailSurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // All surahs now use getTajweedVerses — includes word-by-word tajweed HTML
  // and audio_url per word, with full pagination support.
  const [chapter, verses, chapterInfo] = await Promise.all([
    getChapter(id),
    getTajweedVerses(id),
    getChapterInfo(id)
  ]);

  const isMakkiyah = chapter.revelation_place === "makkah";
  const poeticFallback = isMakkiyah
    ? `Surah Makkiyah yang agung ini terdiri dari ${chapter.verses_count} ayat. Turun di fase awal kenabian, membawa pesan fundamental tentang ketauhidan, hari kiamat, dan fondasi keimanan.`
    : `Surah Madaniyah yang mulia ini terdiri dari ${chapter.verses_count} ayat. Membawa petunjuk mendalam tentang hukum, muamalah, dan panduan membangun peradaban umat.`;

  // Construct the surah object expected by DetailSurahHeader
  const surah = {
    id: chapter.id,
    name: getLocalizedSurahName(chapter.id, chapter.name_simple),
    translation: getLocalizedSurahTranslation(chapter.id, chapter.translated_name.name),
    arab: chapter.name_arabic,
    pitch: `Surah ke-${chapter.id} dalam Al-Qur'an. Diturunkan di ${isMakkiyah ? "Makkah" : "Madinah"}. Memiliki ${chapter.verses_count} ayat.`,
    resume: chapterInfo.short_text || poeticFallback
  };

  return (
    <main className="flex flex-col min-h-screen bg-page-warm px-4 sm:px-6 pb-32">
      <SurahInteractiveClient 
        chapterId={chapter.id} 
        surahName={surah.name} 
        surah={surah}
        verses={verses} 
      />
    </main>
  );
}

