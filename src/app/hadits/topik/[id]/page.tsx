import { HADITS_TOPIK } from '@/data/hadits-topik'
import { PERAWI_LIST } from '@/lib/api/hadits'
import { createClient } from '@/lib/supabase/server'
import HaditsTopikClient from './HaditsTopikClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const topik = HADITS_TOPIK.find(t => t.id === id)
  return {
    title: topik ? `${topik.nama} | Hadits Topik` : 'Hadits Topik',
    description: topik?.deskripsi || 'Jelajahi hadits berdasarkan topik',
  }
}

export default async function HaditsTopikPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const topik = HADITS_TOPIK.find(t => t.id === id)
  if (!topik) return <div>Topik tidak ditemukan</div>

  const supabase = await createClient()

  // Fetch total count
  const { count } = await supabase
    .from('hadits_topik_index')
    .select('*', { count: 'exact', head: true })
    .eq('topik_id', id)

  // Fetch initial hadits (50 per page)
  const { data: haditsData } = await supabase
    .from('hadits_topik_index')
    .select('perawi, nomor, arab, terjemah')
    .eq('topik_id', id)
    .order('nomor', { ascending: true })
    .limit(50)

  return (
    <HaditsTopikClient 
      topik={topik} 
      initialHadits={haditsData || []} 
      totalCount={count || 0}
      topikId={id}
    />
  )
}
