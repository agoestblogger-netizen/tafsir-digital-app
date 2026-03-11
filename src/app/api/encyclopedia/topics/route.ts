import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak disertakan." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch ALL topics for this category from Supabase
    const { data, error } = await supabase
      .from("encyclopedia_articles")
      .select("id, title, teaser")
      .eq("category", category);

    if (error) {
      console.error("[Topics] Supabase error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Belum ada topik untuk kategori ini. Jalankan cron job terlebih dahulu." },
        { status: 404 }
      );
    }

    // Shuffle the array (Fisher-Yates) and take first 5
    const shuffled = shuffle(data);
    const randomTopics = shuffled.slice(0, 5);

    // Return as array of topic strings (for backward compatibility with frontend)
    const topics = randomTopics.map((t) => t.title);

    console.log(`[Topics] ${category}: returned ${topics.length}/${data.length} shuffled topics`);

    return NextResponse.json({ topics });
  } catch (error: unknown) {
    console.error("TOPICS API ERROR:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
