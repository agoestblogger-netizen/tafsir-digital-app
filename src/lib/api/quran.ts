export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface ChapterInfo {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
}

export interface VerseTranslation {
  id: number;
  resource_id: number;
  text: string;
}

export interface VerseAudio {
  url: string;
  segments: [number, number, number, number][]; // [word_index, ???, start_ms, end_ms]
}

export interface VerseWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  text: string;
  text_uthmani?: string;
  text_imlaei?: string;
  text_indopak?: string;
  text_uthmani_tajweed?: string;  // HTML tajweed markup per-word (Surah 1 PoC)
  code_v1?: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  hasTajweed?: boolean;    // true for Surah 1 — tells VerseCard to use tajweed mode
  translations: VerseTranslation[];
  audio?: VerseAudio;
  words: VerseWord[];
}

const AUDIO_BASE_URL = "https://verses.quran.com/";
const API_BASE_URL = "https://api.quran.com/api/v4";

export async function getChapters(): Promise<Chapter[]> {
  const res = await fetch(`${API_BASE_URL}/chapters?language=id`, {
    next: { revalidate: 86400 }, // Cache for 24 hours since chapters rarely change
  });

  if (!res.ok) {
    throw new Error('Failed to fetch chapters');
  }

  const data = await res.json();
  return data.chapters;
}

export async function getChapter(id: number | string): Promise<Chapter> {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}?language=id`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch chapter details');
  }

  const data = await res.json();
  return data.chapter;
}

export async function getChapterInfo(id: number | string): Promise<ChapterInfo> {
  const res = await fetch(`${API_BASE_URL}/chapters/${id}/info?language=id`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch chapter info');
  }

  const data = await res.json();
  return data.chapter_info;
}

// ─── Tajweed Verses — Word-by-Word fetch (ALL Surahs) ──────
// Fetches ALL pages of verses with word_fields=text_uthmani_tajweed
// so each word carries its own tajweed HTML snippet.
// Supports pagination for long surahs (e.g. Al-Baqarah: 286 verses).
export async function getTajweedVerses(chapterId: number | string): Promise<Verse[]> {
  const allVerses: Verse[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `${API_BASE_URL}/verses/by_chapter/${chapterId}` +
      `?language=id&words=true&translations=33,57&audio=7` +
      `&word_fields=text_uthmani,text_uthmani_tajweed,audio_url` +
      `&fields=text_uthmani&per_page=50&page=${currentPage}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      console.warn(`[Tajweed] Page ${currentPage} fetch failed, stopping.`);
      break;
    }

    const data = await res.json();
    totalPages = data.pagination?.total_pages || 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (data.verses || []).map((v: any) => ({
      ...v,
      hasTajweed: true,
      audio: v.audio ? { ...v.audio, url: `${AUDIO_BASE_URL}${v.audio.url}` } : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      words: (v.words || []).map((w: any) => ({
        ...w,
        audio_url: w.audio_url ? `${AUDIO_BASE_URL}${w.audio_url}` : null,
      })),
    }));

    allVerses.push(...mapped);
    currentPage++;
  } while (currentPage <= totalPages);

  return allVerses;
}

export async function getVersesByChapter(chapterId: number | string): Promise<Verse[]> {
  // Quran.com API caps per_page at 50, so we must paginate for longer surahs
  const allVerses: Verse[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `${API_BASE_URL}/verses/by_chapter/${chapterId}?language=id&words=true&translations=33,57&audio=7&word_fields=text_uthmani,text_imlaei,text_indopak&fields=text_uthmani&per_page=50&page=${currentPage}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch verses (page ${currentPage})`);
    }

    const data = await res.json();
    totalPages = data.pagination?.total_pages || 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = data.verses.map((v: any) => ({
      ...v,
      audio: v.audio ? { ...v.audio, url: `${AUDIO_BASE_URL}${v.audio.url}` } : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      words: v.words ? v.words.map((w: any) => ({
        ...w,
        audio_url: w.audio_url ? `${AUDIO_BASE_URL}${w.audio_url}` : null
      })) : []
    }));

    allVerses.push(...mapped);
    currentPage++;
  } while (currentPage <= totalPages);

  return allVerses;
}
