'use client'

import React from 'react'
import { KisahConfig } from '@/data/kaum_lampau_list'

interface KisahCardProps extends KisahConfig {
  onClick?: () => void
}

const KATEGORI_CONFIG: Record<string, {
  bg: string, border: string, arabColor: string,
  badge: string, badgeBg: string, badgeColor: string,
  badgeBorder: string
}> = {
  kaum_diazab: {
    bg: '#1a0808', border: '#7a1a1a',
    arabColor: '#e05a5a', badge: 'Kaum Diazab',
    badgeBg: '#2a0d0d', badgeColor: '#e05a5a',
    badgeBorder: '#7a1a1a'
  },
  kisah_nabi: {
    bg: '#0d2035', border: '#1a4a7a',
    arabColor: '#4a9eda', badge: 'Kisah Nabi',
    badgeBg: '#0d2035', badgeColor: '#4a9eda',
    badgeBorder: '#1a4a7a'
  },
  kisah_pilihan: {
    bg: '#1a2a0d', border: '#3a6a1a',
    arabColor: '#7acc50', badge: 'Kisah Pilihan',
    badgeBg: '#1a2a0d', badgeColor: '#7acc50',
    badgeBorder: '#3a6a1a'
  },
  sirah_nabawiyah: {
    bg: '#1a1535', border: '#2a2050',
    arabColor: '#9a85e0', badge: 'Sirah Nabawiyah',
    badgeBg: '#1a1535', badgeColor: '#9a85e0',
    badgeBorder: '#4a3a9a'
  }
}

export function KisahCard({ nama, nama_arab, kategori, periode, lokasi, ringkasan, icon, surah_utama, onClick }: KisahCardProps) {
  const config = KATEGORI_CONFIG[kategori] || {
    bg: '#0f1419', border: '#1e2530',
    arabColor: '#e0d5b0', badge: kategori,
    badgeBg: '#0f1419', badgeColor: '#e0d5b0',
    badgeBorder: '#1e2530'
  }

  return (
    <div 
      onClick={onClick}
      className="bg-[#0f1419] border border-[#1e2530] 
        rounded-2xl overflow-hidden cursor-pointer select-none
        hover:border-[var(--gold)] transition-colors duration-200 flex flex-col justify-between
        min-h-[140px] max-h-[160px] h-full"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
    >
      <div className="flex flex-col flex-1 justify-between">
        {/* Header berwarna */}
        <div style={{
          background: config.bg,
          borderBottom: `0.5px solid ${config.border}`,
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="font-amiri text-base leading-relaxed" style={{ 
            color: config.arabColor,
            direction: 'rtl'
          }}>
            {nama_arab}
          </span>
          <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1 justify-between min-h-0">
          <div className="min-h-0">
            {/* Badge & Meta Row */}
            <div className="flex items-center justify-between gap-2">
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '8px',
                background: config.badgeBg,
                color: config.badgeColor,
                border: `0.5px solid ${config.badgeBorder}`,
                display: 'inline-block'
              }} className="uppercase tracking-widest font-bold font-cairo">
                {config.badge}
              </span>
              
              {(periode || lokasi) && (
                <span className="font-cairo text-[9px] text-[#555] truncate max-w-[120px]">
                  {periode && `📅 ${periode}`}
                  {periode && lokasi && ' • '}
                  {lokasi && `📍 ${lokasi}`}
                </span>
              )}
            </div>

            {/* Nama */}
            <p className="font-cairo text-sm font-semibold text-[#e0d5b0] mt-1 mb-1 leading-snug truncate">
              {nama}
            </p>

            {/* Sinopsis */}
            <p className="font-cairo text-xs text-white/55 leading-relaxed line-clamp-2">
              {ringkasan || 'Klik untuk memuat kisah lengkap...'}
            </p>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {surah_utama.slice(0, 2).map((s, i) => (
                <span key={i} 
                  className="font-cairo text-[10px] italic text-white/35">
                  QS. {s.surah_nama}: {s.ayat_range}
                </span>
              ))}
            </div>

            <p className="font-cairo text-[10px] text-[#b8985c] font-medium hover:underline flex items-center gap-0.5">
              Detail ➜
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
