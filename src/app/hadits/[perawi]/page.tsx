import { PERAWI_LIST } from '@/lib/api/hadits';
import PerawiListClient from './PerawiListClient';

export function generateStaticParams() {
  return PERAWI_LIST.map(p => ({ perawi: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ perawi: string }> }) {
  const { perawi } = await params;
  const p = PERAWI_LIST.find(x => x.id === perawi);
  return {
    title: p ? `${p.name} | Hadits Center` : 'Hadits Center',
    description: p ? `Jelajahi ${p.available.toLocaleString('id-ID')} hadits dari ${p.name}` : '',
  };
}

export default function PerawiPage() {
  return <PerawiListClient />;
}
