import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from("ayat_quran_index")
      .select("*", { count: "exact", head: true });

    if (!count) return NextResponse.json({ error: "No data" }, { status: 404 });

    const randomIndex = Math.floor(Math.random() * count);

    const { data } = await supabaseAdmin
      .from("ayat_quran_index")
      .select("teks_arab, terjemah, teks_latin, surah_nama_latin, nomor_ayat")
      .range(randomIndex, randomIndex)
      .single();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
