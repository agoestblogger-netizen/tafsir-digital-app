'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface AyatResmiTextProps {
  surahId?: number;
  ayatNumber?: number | string;
  fallbackArab?: string;
  fallbackLatin?: string;
  fallbackTerjemah?: string;
  surahNama?: string;
  showLink?: boolean;
}

export function AyatResmiText({
  surahId,
  ayatNumber,
  fallbackArab,
  fallbackLatin,
  fallbackTerjemah,
  surahNama,
  showLink = false
}: AyatResmiTextProps) {
  const [arab, setArab] = useState(fallbackArab || '');
  const [latin, setLatin] = useState(fallbackLatin || '');
  const [terjemah, setTerjemah] = useState(fallbackTerjemah || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Jika tidak ada surahId atau ayatNumber, atau ayatNumber bukan angka valid, gunakan fallback saja
    const ayatNum = Number(ayatNumber);
    if (!surahId || isNaN(ayatNum) || ayatNum <= 0) {
      setLoading(false);
      return;
    }

    const fetchResmi = async () => {
      try {
        const res = await fetch(`/api/ayat-resmi?surah=${surahId}&ayat=${ayatNum}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.arab) setArab(json.data.arab);
            if (json.data.latin) setLatin(json.data.latin);
            if (json.data.terjemah) setTerjemah(json.data.terjemah);
          }
        }
      } catch (err) {
        console.error('Failed to fetch official translation', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResmi();
  }, [surahId, ayatNumber]);

  return (
    <div className="rounded-xl p-4 border" style={{ background: "rgba(0,0,0,0.2)", borderColor: "rgba(201,163,90,0.15)" }}>
      {arab ? (
        <div 
          dir="rtl"
          className="font-amiri text-xl text-right leading-loose text-[var(--gold-light)] mb-2 relative"
        >
          {arab}
          {loading && <Loader2 className="absolute -left-2 top-0 w-4 h-4 text-[var(--gold)]/30 animate-spin" />}
        </div>
      ) : (
        <div className="font-cairo text-xs italic mb-2 text-right text-[var(--text3)]">
          Teks Arab tidak tersedia
        </div>
      )}
      
      {latin && (
        <p className="font-cairo text-xs italic text-right mb-3 text-[var(--teal-200)]">
          {latin}
        </p>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-transparent to-transparent my-2" style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(201,163,90,0.3), transparent)" }} />
      
      {terjemah && (
        <p className="font-cairo text-sm italic text-white/80 leading-relaxed relative">
          {terjemah}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 font-cairo">
        {(surahId || surahNama) && (
          <span className="font-cairo text-[11px] text-white/40">
            QS. {surahNama || surahId}: {ayatNumber}
          </span>
        )}
        
        {showLink && surahId && ayatNumber && (
          <Link
            href={`/surah/${surahId}#ayat-${ayatNumber}`}
            className="font-cairo text-[11px] font-medium hover:underline text-[var(--teal-300)]"
          >
            Buka di Al-Qur&apos;an →
          </Link>
        )}
      </div>
    </div>
  );
}
