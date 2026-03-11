"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
        <Compass className="w-10 h-10 text-gold" />
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-4">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Afwan, halaman yang Anda cari mungkin telah dipindahkan atau tidak pernah ada.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
