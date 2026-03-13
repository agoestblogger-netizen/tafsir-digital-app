export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('penemu_muslim')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[API Penemu Muslim] DB Fetch error for ${id}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error(`[API Penemu Muslim] Unexpected error for ID:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Kesalahan server internal' },
      { status: 500 }
    );
  }
}
