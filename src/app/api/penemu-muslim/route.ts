export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahParam = searchParams.get('surah');
    const ayatParam = searchParams.get('ayat');

    const supabase = getSupabaseAdmin();
    let query = supabase.from('penemu_muslim').select('*');

    if (surahParam && ayatParam) {
      // Fetch specifically for cross-reference
      query = query
        .eq('nomor_surat', parseInt(surahParam, 10))
        .eq('nomor_ayat', parseInt(ayatParam, 10));
    } else {
      // Fetch all for encyclopedia
      query = query.order('nama_ilmuwan', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API Penemu Muslim] DB Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    console.error('[API Penemu Muslim] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Kesalahan server internal' },
      { status: 500 }
    );
  }
}
