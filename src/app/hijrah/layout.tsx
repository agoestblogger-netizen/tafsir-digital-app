import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hijrah Tracker | Quranic Life Hacking',
  description: 'Pantau perjalanan hijrahmu dengan program 21 hari detox penyakit hati. Satu langkah setiap hari menuju pribadi yang lebih baik.',
};

export default function HijrahLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
