import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surah_id = searchParams.get("surah_id");
  const nomor_ayat = searchParams.get("nomor_ayat");

  if (!surah_id || !nomor_ayat) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ayat_quran_index")
    .select("teks_arab, teks_latin, terjemah, surah_nama_latin, nomor_ayat")
    .eq("surah_id", parseInt(surah_id))
    .eq("nomor_ayat", parseInt(nomor_ayat))
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
