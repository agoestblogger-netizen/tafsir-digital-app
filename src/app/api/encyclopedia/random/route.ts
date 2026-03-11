import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET: Fetch the latest daily wonder from Supabase (ultra-fast, no AI call)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("daily_wonders")
      .select("title, surah, teaser, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("[Latest Wonder] Supabase error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Belum ada keajaiban hari ini. Jalankan cron job terlebih dahulu." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("LATEST WONDER ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
