import * as React from "react";
import { DetailSurahHeader } from "@/components/specific/DetailSurahHeader";
import { VerseCard } from "@/components/specific/VerseCard";
import { MurottalPlayer } from "@/components/specific/MurottalPlayer";
import { TajweedLegend } from "@/components/specific/TajweedLegend";
import { getChapter, getTajweedVerses, getChapterInfo, Verse } from "@/lib/api/quran";
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
    <main className="flex flex-col min-h-screen bg-page-warm px-6 pb-32">
      <DetailSurahHeader surah={surah} />

      <MurottalPlayer chapterId={chapter.id} surahName={surah.name} />

      <div className="flex flex-col gap-2 relative z-10 w-full max-w-3xl mx-auto">
        <TajweedLegend />
        {verses.map((verse: Verse, index: number) => (
          <VerseCard key={verse.id} verse={verse} index={index} surahName={surah.name} />
        ))}
      </div>
    </main>
  );
}

