export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Login untuk berbagi kultum.' }, { status: 401 });
    }

    const body = await request.json();
    const { kultum_id, judul, tema, preview, durasi, gaya } = body;

    if (!kultum_id || !judul || !tema || !preview) {
      return NextResponse.json({ error: 'Field kultum_id, judul, tema, dan preview wajib diisi.' }, { status: 400 });
    }

    // Cek apakah sudah pernah dibagikan
    const { data: existing } = await supabase
      .from('kultum_publik')
      .select('id')
      .eq('kultum_id', kultum_id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Kultum ini sudah pernah dibagikan.', id: existing.id }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('kultum_publik')
      .insert({
        user_id: user.id,
        kultum_id,
        judul,
        tema,
        preview,
        durasi: durasi ?? null,
        gaya: gaya ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[API Komunitas Share] DB error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[API Komunitas Share] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
