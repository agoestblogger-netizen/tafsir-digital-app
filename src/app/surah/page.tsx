import * as React from "react";
import { getChapters } from "@/lib/api/quran";
import { SurahListClient } from "./SurahListClient";

export default async function PetaSurahPage() {
  const chapters = await getChapters();

  return <SurahListClient initialChapters={chapters} />;
}
