export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const filter = searchParams.get('filter') || 'terbaru';
    const tema = searchParams.get('tema') || '';
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    let query = supabase
      .from('kultum_publik')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (tema) {
      query = query.ilike('tema', `%${tema}%`);
    }

    if (filter === 'terpopuler') {
      query = query.order('like_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[API Komunitas Feed] DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      hasMore: (count ?? 0) > page * limit,
    });
  } catch (err) {
    console.error('[API Komunitas Feed] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
