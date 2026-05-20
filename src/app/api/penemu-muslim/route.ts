import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const surah = searchParams.get('surah')
  const ayat = searchParams.get('ayat')

  const supabase = await createClient()

  let query = supabase
    .from('penemu_muslim')
    .select('id, nama_ilmuwan, julukan, tahun_hidup, wilayah_peradaban, bidang_ilmu, profil_singkat')

  if (surah && ayat) {
    query = query
      .eq('surah_id', parseInt(surah))
      .eq('ayat_number', parseInt(ayat))
  }

  const { data, error } = await query.order('nama_ilmuwan')

  if (error) {
    console.error('[API penemu-muslim] Error:', error)
    return NextResponse.json({ data: [] })
  }

  console.log('[API penemu-muslim] Total records:', data?.length)
  return NextResponse.json({ data: data ?? [] })
}
