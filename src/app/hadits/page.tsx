import * as React from 'react';
import { getHaditsHariIni } from '@/lib/api/hadits';
import HaditsHomeClient from './HaditsHomeClient';

export const metadata = {
  title: 'Hadits Center | Quranic Life Hacking',
  description: 'Jelajahi 30.000+ hadits dari 9 perawi terpercaya',
};

export default async function HaditsPage() {
  const haditsHariIni = await getHaditsHariIni();
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HaditsHomeClient haditsHariIni={haditsHariIni} />
    </React.Suspense>
  );
}
