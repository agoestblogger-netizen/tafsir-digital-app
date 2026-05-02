"use client";

import dynamic from 'next/dynamic';

const FloatingNav = dynamic(
  () => import('@/components/layout/FloatingNav').then(mod => mod.FloatingNav),
  { ssr: false }
);

export function ClientBottomNav() {
  return <FloatingNav />;
}
