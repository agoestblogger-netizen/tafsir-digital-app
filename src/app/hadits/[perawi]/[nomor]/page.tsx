import { getHaditsDetail, PERAWI_LIST } from '@/lib/api/hadits';
import HaditsDetailClient from './HaditsDetailClient';
import { notFound } from 'next/navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ perawi: string; nomor: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { perawi, nomor } = await params;
  const p = PERAWI_LIST.find(x => x.id === perawi);
  return {
    title: `${p?.name ?? 'Hadits'} No. ${nomor} | Hadits Center`,
  };
}

export default async function HaditsDetailPage({ params }: Props) {
  const { perawi, nomor } = await params;
  const nomorNum = parseInt(nomor, 10);
  if (isNaN(nomorNum)) notFound();

  const perawiInfo = PERAWI_LIST.find(p => p.id === perawi);
  if (!perawiInfo) notFound();

  const supabase = await createClient();

  // Cek cache Supabase dulu
  const { data: cached } = await supabase
    .from('hadits_cache')
    .select('arab, terjemah, grade')
    .eq('perawi', perawi)
    .eq('nomor', nomorNum)
    .maybeSingle();

  let hadits;
  if (cached?.arab && cached?.terjemah) {
    // Pakai dari cache
    hadits = { number: nomorNum, arab: cached.arab, id: cached.terjemah, grade: cached.grade };
  } else {
    const MASTER_PERAWI = ['bukhari', 'muslim', 'abu-dawud', 'tirmidzi', 'nasai', 'ibnu-majah', 'malik', 'ahmad', 'darimi', 'riyadhus-shalihin', 'arbain-nawawi', 'bulughul-maram']
    if (MASTER_PERAWI.includes(perawi)) {
      const { data: masterHadits } = await supabase
        .from('hadits_master')
        .select('arab, terjemah, matan, kitab, bab, intisari')
        .eq('perawi', perawi)
        .eq('nomor', nomorNum)
        .maybeSingle()
      if (!masterHadits) notFound()
      hadits = { 
        number: nomorNum, 
        arab: masterHadits.arab ?? '', 
        id: (masterHadits.matan && masterHadits.matan.length > 0) ? masterHadits.matan : (masterHadits.terjemah ?? ''),
        grade: 'Shahih',
      } as any
      ;(hadits as any).kitab = masterHadits.kitab
      ;(hadits as any).bab = masterHadits.bab
      ;(hadits as any).intisari = masterHadits.intisari
    } else {
    // Fetch dari API
    hadits = await getHaditsDetail(perawi, nomorNum);
    if (!hadits) notFound();

    // Simpan ke cache Supabase
    await supabase.from('hadits_cache').upsert({
      perawi: perawi,
      nomor: nomorNum,
      arab: hadits.arab,
      terjemah: hadits.id,
      grade: hadits.grade || perawiInfo.level,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'perawi,nomor' });
    } // end else non-api
  }

  return (
    <ErrorBoundary>
      <HaditsDetailClient hadits={hadits} perawiInfo={perawiInfo} nomor={nomorNum} kitab={(hadits as any).kitab} bab={(hadits as any).bab} intisari={(hadits as any).intisari} />
    </ErrorBoundary>
  );
}
