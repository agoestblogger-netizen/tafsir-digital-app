export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kultum_publik_id } = body;

    if (!kultum_publik_id) {
      return NextResponse.json({ error: 'kultum_publik_id wajib diisi.' }, { status: 400 });
    }

    // Cek apakah sudah bookmark
    const { data: existing } = await supabase
      .from('kultum_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('kultum_publik_id', kultum_publik_id)
      .single();

    let bookmarked: boolean;

    if (existing) {
      // Unbookmark
      await supabase
        .from('kultum_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('kultum_publik_id', kultum_publik_id);
      bookmarked = false;
    } else {
      // Bookmark
      await supabase
        .from('kultum_bookmarks')
        .insert({ user_id: user.id, kultum_publik_id });
      bookmarked = true;
    }

    return NextResponse.json({ bookmarked });
  } catch (err) {
    console.error('[API Komunitas Bookmark] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
