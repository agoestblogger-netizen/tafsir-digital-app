"use client";

import dynamic from 'next/dynamic';

const BottomNav = dynamic(() => import('@/components/layout/BottomNav').then(mod => mod.BottomNav), {
  ssr: false,
});

export function ClientBottomNav() {
  return <BottomNav />;
}
