export interface LocalizedSurah {
  name: string;
  translation?: string;
}

export const localSurahNames: Record<number, LocalizedSurah> = {
  17: { name: "Al-Isra'" },
  40: { name: "Al-Mu'min (Ghafir)" },
  111: { name: "Al-Lahab", translation: "Gejolak Api" },
  // Tambahkan mapping Kemenag lainnya jika diperlukan di masa depan
};

/**
 * Returns the localized name for a Surah, falling back to the API's default name if not found.
 */
export function getLocalizedSurahName(id: number, apiName: string): string {
  return localSurahNames[id]?.name || apiName;
}

/**
 * Returns the localized translation/meaning for a Surah, falling back to the API's default translation if not found.
 */
export function getLocalizedSurahTranslation(id: number, apiTranslation: string): string {
  return localSurahNames[id]?.translation || apiTranslation;
}
