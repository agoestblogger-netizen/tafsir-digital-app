import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Komunitas Kultum | Quranic Life Hacking',
  description: 'Temukan dan bagikan kultum terbaik dari komunitas Muslim digital.',
};

export default function KomunitasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
