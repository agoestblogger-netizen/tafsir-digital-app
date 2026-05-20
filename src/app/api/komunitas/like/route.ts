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

    // Cek apakah sudah like
    const { data: existing } = await supabase
      .from('kultum_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('kultum_publik_id', kultum_publik_id)
      .single();

    let liked: boolean;

    if (existing) {
      // Unlike: hapus like
      await supabase
        .from('kultum_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('kultum_publik_id', kultum_publik_id);

      // Decrement like_count (min 0)
      await supabase.rpc('decrement_like_count', { row_id: kultum_publik_id });
      liked = false;
    } else {
      // Like: tambah like
      await supabase
        .from('kultum_likes')
        .insert({ user_id: user.id, kultum_publik_id });

      // Increment like_count
      await supabase.rpc('increment_like_count', { row_id: kultum_publik_id });
      liked = true;
    }

    // Ambil like_count terbaru
    const { data: updated } = await supabase
      .from('kultum_publik')
      .select('like_count')
      .eq('id', kultum_publik_id)
      .single();

    return NextResponse.json({
      liked,
      like_count: updated?.like_count ?? 0,
    });
  } catch (err) {
    console.error('[API Komunitas Like] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
