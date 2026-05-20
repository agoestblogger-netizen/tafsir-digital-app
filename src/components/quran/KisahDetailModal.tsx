'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { KisahConfig } from '@/data/kaum_lampau_list'

interface KisahDetailModalProps {
  selectedKisah: KisahConfig | null
  onClose: () => void
}

const arabColorMap: Record<string, string> = {
  kaum_diazab: '#e05a5a',
  kisah_nabi: '#4a9eda',
  kisah_pilihan: '#7acc50',
  sirah_nabawiyah: '#9a85e0',
}

const labelMap: Record<string, string> = {
  kaum_diazab: 'Kaum Diazab',
  kisah_nabi: 'Kisah Nabi',
  kisah_pilihan: 'Kisah Pilihan',
  sirah_nabawiyah: 'Sirah Nabawiyah',
}

export function KisahDetailModal({ selectedKisah, onClose }: KisahDetailModalProps) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedKisah) {
      setLoading(true)
      setData(null)
      fetch(`/api/kisah-quran?slug=${selectedKisah.slug}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) setData(json.data)
        })
        .catch(err => console.error('Failed to fetch detailed kisah:', err))
        .finally(() => setLoading(false))
    }
  }, [selectedKisah])

  if (!selectedKisah) return null

  const themeColor = arabColorMap[selectedKisah.kategori] || '#e0d5b0'
  const badgeLabel = labelMap[selectedKisah.kategori] || selectedKisah.kategori

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
      />
      
      {/* Modal panel */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 100, opacity: 0 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-10 w-full sm:max-w-lg mx-auto bg-[#0a140d] border border-white/10 
                   rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/85 text-xl transition-colors z-20"
        >✕</button>

        {/* Main Content Area */}
        <div className="px-5 pb-8 pt-4 overflow-y-auto">
          {/* Header */}
          <p 
            className="text-right font-amiri text-2xl leading-loose" 
            style={{ color: themeColor }}
            dir="rtl"
          >
            {selectedKisah.nama_arab}
          </p>
          <h2 className="font-cinzel text-base font-semibold text-white mt-1">
            {selectedKisah.nama}
          </h2>
          <span 
            className="inline-block mt-2 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full"
            style={{ 
              background: themeColor + '18', 
              color: themeColor,
              border: `1px solid ${themeColor}33`
            }}
          >
            {badgeLabel}
          </span>

          {/* Sinopsis */}
          {selectedKisah.ringkasan && (
            <p 
              className="mt-4 font-cairo text-[13px] leading-[1.75] text-white/70 italic border-l-2 pl-3"
              style={{ borderColor: themeColor }}
            >
              {selectedKisah.ringkasan}
            </p>
          )}

          {/* Surah referensi */}
          <p className="mt-3 font-cairo text-[11px] text-white/35 italic">
            Rujukan: {selectedKisah.surah_utama.map(s => `QS. ${s.surah_nama}: ${s.ayat_range}`).join(', ')}
          </p>

          {/* CTA */}
          <button 
            onClick={() => router.push(`/kultum?kisah_id=${selectedKisah.slug}`)}
            className="mt-6 w-full py-3 rounded-xl font-cairo text-sm font-semibold
                       text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ 
              background: themeColor + '25',
              border: `1px solid ${themeColor}45` 
            }}
          >
            📖 Buat Kultum dari Kisah Ini
          </button>

          {/* Detailed DB Stories Section */}
          <div className="border-t border-white/10 mt-6 pt-2">
            {loading ? (
              <div className="py-8 space-y-3 animate-pulse">
                <div className="h-4 rounded w-full bg-white/5" />
                <div className="h-4 rounded w-4/5 bg-white/5" />
                <div className="h-4 rounded w-3/5 bg-white/5" />
                <p className="text-xs text-center mt-4 italic text-white/40 font-cairo">
                  Sedang mengambil kisah dari Al-Qur&apos;an...
                </p>
              </div>
            ) : data ? (
              <div className="space-y-5">
                {/* Ayat Utama */}
                {Array.isArray(data.ayat_utama) && data.ayat_utama.length > 0 ? (
                  <div className="mt-5">
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                      ▶ AYAT AL-QUR&apos;AN
                    </h4>
                    <div className="space-y-4 mt-3">
                      {data.ayat_utama.map((ayat: any, i: number) => (
                        <div key={i} className="border-l-2 pl-3" 
                             style={{ borderColor: themeColor + '50' }}>
                          
                          {/* Nomor + teks Arab dalam satu baris konteks */}
                          <p className="font-amiri text-base leading-loose text-right"
                             style={{ color: themeColor }}
                             dir="rtl">
                            {ayat.teks_arab}
                          </p>
                          
                          {/* Terjemah langsung di bawah, tanpa card */}
                          <p className="font-cairo text-[12px] text-white/65 italic leading-relaxed mt-1">
                            {ayat.terjemah}
                          </p>
                          
                          {/* Referensi + link kecil */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-cairo text-[10px] text-white/30">
                              QS. {ayat.surah_nama}: {ayat.nomor_ayat}
                            </span>
                            <button
                              onClick={() => {
                                onClose()
                                router.push(ayat.link || `/surah/${ayat.surah_id}#ayat-${ayat.nomor_ayat}`)
                              }}
                              className="font-cairo text-[10px] text-green-400/60 hover:text-green-400 hover:underline transition-colors"
                            >
                              Buka di Al-Qur'an →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Latar Belakang */}
                {data.latar_belakang ? (
                  <div className="mt-5">
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                      ▶ LATAR BELAKANG
                    </h4>
                    <p className="font-cairo text-[13px] leading-[1.75] text-white/70">
                      {data.latar_belakang as string}
                    </p>
                  </div>
                ) : null}

                {/* Kondisi Kaum */}
                {data.kondisi_kaum ? (
                  <div className="mt-5">
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                      ▶ KONDISI KAUM
                    </h4>
                    <p className="font-cairo text-[13px] leading-[1.75] text-white/70">
                      {data.kondisi_kaum as string}
                    </p>
                  </div>
                ) : null}

                {/* Kisah Lengkap */}
                {data.kisah_lengkap ? (
                  <div className="mt-5">
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
                      ▶ KISAH LENGKAP
                    </h4>
                    <div className="space-y-3">
                      {(data.kisah_lengkap as string).split('\n\n').map((p, i) => (
                        <p key={i} className="font-cairo text-[13px] leading-[1.75] text-white/70">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Azab / Kejadian */}
                {data.azab_atau_kejadian ? (
                  <div 
                    className="border rounded-xl p-3 bg-red-950/20 mt-5"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}
                  >
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-red-400 mb-2">
                      ▶ AZAB / KEJADIAN LUAR BIASA
                    </h4>
                    <p className="font-cairo text-[13px] leading-[1.75] text-white/70">
                      {data.azab_atau_kejadian as string}
                    </p>
                  </div>
                ) : null}

                {/* Pelajaran */}
                {data.pelajaran ? (
                  <div 
                    className="border rounded-xl p-3 bg-teal-950/20 mt-5"
                    style={{ borderColor: 'rgba(20, 184, 166, 0.15)' }}
                  >
                    <h4 className="font-cairo text-[11px] uppercase tracking-[0.15em] font-bold text-teal-400 mb-2">
                      ▶ PELAJARAN & HIKMAH
                    </h4>
                    <div className="space-y-2">
                      {(data.pelajaran as string).split('\n').filter(Boolean).map((p, i) => (
                        <p key={i} className="font-cairo text-[13px] leading-[1.75] text-white/70">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Referensi */}
                {data.referensi ? (
                  <div className="font-cairo text-[10px] italic text-white/30 border-t pt-3 border-white/10 mt-5">
                    📚 Referensi: {data.referensi as string}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
