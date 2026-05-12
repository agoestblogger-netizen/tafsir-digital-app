import { getHaditsDetail, PERAWI_LIST } from '@/lib/api/hadits';
import HaditsDetailClient from './HaditsDetailClient';
import { notFound } from 'next/navigation';

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

  // getHaditsDetail now returns Hadits | null directly
  const hadits = await getHaditsDetail(perawi, nomorNum);
  if (!hadits) notFound();

  return <HaditsDetailClient hadits={hadits} perawiInfo={perawiInfo} nomor={nomorNum} />;
}
