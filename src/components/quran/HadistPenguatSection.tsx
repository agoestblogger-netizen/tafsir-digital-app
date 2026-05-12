'use client'
import { useState, useEffect, useRef } from 'react'
import { parseHaditsRef, type ParsedHaditsRef } from '@/lib/api/hadits'

interface HadistData {
  exists: boolean
  arab?: string
  teks_hadist?: string
  referensi_lengkap?: string
  perawi?: string
  perawi_name?: string
  nomor_hadits?: number
  source?: string
}

interface Props {
  surahId: number
  ayatNumber: number
  ayatTeks: string
  tafsirTeks?: string
}

export function HadistPenguatSection({
  surahId, ayatNumber, ayatTeks, tafsirTeks = ''
}: Props) {
  const [data, setData] = useState<HadistData | null>(null)
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    setLoading(true)

    const params = new URLSearchParams({
      surah_id: String(surahId),
      ayat_number: String(ayatNumber),
      ayat_teks: ayatTeks.slice(0, 200),
      tafsir_teks: tafsirTeks.slice(0, 300),
    })

    fetch(`/api/hadist-penguat?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then((json: HadistData) => setData(json))
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err)
      })
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--gold-border)] p-4 bg-[var(--dark2)] animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <span>📜</span>
          <div className="h-3 bg-[var(--dark3)] rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--dark3)] rounded w-full" />
          <div className="h-3 bg-[var(--dark3)] rounded w-4/5" />
        </div>
      </div>
    )
  }

  // Tidak ada data / tidak relevan → tidak tampilkan sama sekali
  if (!data || !data.exists) return null

  const refs = data.referensi_lengkap
    ? parseHaditsRef(data.referensi_lengkap)
    : []

  return (
    <div className="rounded-2xl border border-[var(--gold-border)] overflow-hidden">
      <div className="p-4 bg-[var(--dark2)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span>📜</span>
          <span className="text-xs font-bold text-[var(--teal-300)] tracking-widest uppercase">
            Hadist Penguat
          </span>
        </div>

        {/* Teks Arab */}
        {data.arab && (
          <div
            className="text-xl text-right leading-loose text-[var(--gold-light)] mb-3 pb-3 border-b border-[var(--gold-border)]"
            style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
          >
            {data.arab}
          </div>
        )}

        {/* Terjemahan */}
        <p className="text-sm italic text-[var(--text2)] leading-relaxed mb-2">
          "{data.teks_hadist}"
        </p>

        {/* Referensi */}
        {data.referensi_lengkap && (
          <p className="text-xs font-bold text-[var(--gold)]">
            {data.referensi_lengkap}
          </p>
        )}
      </div>

      {/* Link ke Hadits Center */}
      <div className="px-4 py-3 bg-[var(--dark3)] border-t border-[var(--gold-border)]">
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2 font-bold">
          Baca hadits ini lengkap:
        </p>
        <div className="flex flex-wrap gap-2">
          {refs.map((ref, idx) => (
            <a
              key={idx}
              href={ref.nomor
                ? `/hadits/${ref.perawi}/${ref.nomor}`
                : `/hadits/${ref.perawi}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--dark2)] border border-[var(--gold-border)] text-[var(--gold)] hover:border-[var(--gold)] transition-all"
            >
              📚 {ref.perawiName}
              {ref.nomor && (
                <span className="bg-[var(--gold-pale)] px-1.5 py-0.5 rounded-full text-[9px]">
                  No. {ref.nomor}
                </span>
              )}
              →
            </a>
          ))}
          <a
            href={`/hadits/cari?q=${encodeURIComponent(
              (data.teks_hadist || '').split(' ').slice(0,4).join(' ')
            )}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[rgba(26,170,120,0.08)] border border-[rgba(26,170,120,0.2)] text-[var(--teal-300)] transition-all"
          >
            🔍 Cari Terkait →
          </a>
        </div>
      </div>
    </div>
  )
}
