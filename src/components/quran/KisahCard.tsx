'use client'
import { useState } from 'react'
import Link from 'next/link'

interface KisahCardProps {
  slug: string
  nama: string
  nama_arab: string
  kategori: string
  periode?: string
  lokasi?: string
  nabi_diutus?: string
  icon: string
  surah_utama: { surah_id: number; surah_nama: string; ayat_range: string }[]
}

export function KisahCard({ slug, nama, nama_arab, kategori, periode, lokasi, nabi_diutus, icon, surah_utama }: KisahCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const handleExpand = async () => {
    if (!expanded && !fetched) {
      setLoading(true)
      setFetched(true)
      try {
        const res = await fetch(`/api/kisah-quran?slug=${slug}`)
        const json = await res.json()
        if (json.data) setData(json.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    setExpanded(!expanded)
  }

  const kategoriLabel: Record<string, string> = {
    kaum_diazab: '⚡ Kaum yang Diazab',
    kisah_pilihan: '⭐ Kisah Orang Pilihan',
    kisah_nabi: '🌟 Kisah Para Nabi',
  }

  return (
    <div className="rounded-2xl border overflow-hidden transition-all" style={{ background: "rgba(10,21,32,0.85)", borderColor: "rgba(201,163,90,0.15)", boxShadow: expanded ? "0 4px 24px rgba(201,163,90,0.08)" : "0 4px 16px rgba(0,0,0,0.2)" }}>
      {/* Header Card */}
      <button
        onClick={handleExpand}
        className="w-full text-left p-5 transition-all"
        style={{ background: expanded ? "rgba(201,163,90,0.05)" : "transparent" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="font-amiri text-xl mb-1"
                   style={{ color: "var(--gold-light)", fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                {nama_arab}
              </div>
              <div className="font-bold text-base" style={{ color: "var(--text1)" }}>{nama}</div>
              <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>{kategoriLabel[kategori] || kategori}</div>
            </div>
          </div>
          <span className="transition-transform" style={{ color: "var(--text3)", transform: expanded ? "rotate(180deg)" : "none" }}>
            ▼
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mt-3">
          {periode && (
            <span className="text-xs" style={{ color: "var(--text3)" }}>📅 {periode}</span>
          )}
          {lokasi && (
            <span className="text-xs" style={{ color: "var(--text3)" }}>📍 {lokasi}</span>
          )}
          {nabi_diutus && nabi_diutus !== '-' && (
            <span className="text-xs font-bold" style={{ color: "var(--teal-300)" }}>🕌 {nabi_diutus}</span>
          )}
        </div>

        {/* Surah tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {surah_utama.slice(0, 3).map((s, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded-full border" style={{ background: "rgba(201,163,90,0.08)", color: "var(--gold)", borderColor: "rgba(201,163,90,0.2)" }}>
              QS. {s.surah_nama}: {s.ayat_range}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "rgba(201,163,90,0.15)" }}>
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              <div className="h-4 rounded w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="h-4 rounded w-4/5" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="h-4 rounded w-3/5" style={{ background: "rgba(255,255,255,0.05)" }} />
              <p className="text-xs text-center mt-4 italic" style={{ color: "var(--text3)" }}>
                Sedang mengambil kisah dari Al-Qur'an...
              </p>
            </div>
          ) : data ? (
            <div className="p-5 space-y-5">

              {/* Ringkasan */}
              <div className="border rounded-xl p-4" style={{ background: "rgba(201,163,90,0.05)", borderColor: "rgba(201,163,90,0.2)" }}>
                <p className="text-sm leading-relaxed italic" style={{ color: "var(--text1)" }}>
                  {data.ringkasan as string}
                </p>
              </div>

              {/* Ayat Utama */}
              {Array.isArray(data.ayat_utama) && (data.ayat_utama as unknown[]).length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text3)" }}>
                    📖 Ayat Al-Qur'an
                  </h4>
                  <div className="space-y-3">
                    {(data.ayat_utama as Array<{surah_nama: string; nomor_ayat: string; teks_arab: string; terjemah: string; link: string; surah_id: number}>).map((ayat, i) => (
                      <div key={i} className="rounded-xl p-4 border" style={{ background: "rgba(0,0,0,0.2)", borderColor: "rgba(201,163,90,0.15)" }}>
                        {ayat.teks_arab ? (
                          <div className="font-amiri text-lg text-right leading-loose mb-2"
                               style={{ color: "var(--gold-light)", fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                            {ayat.teks_arab}
                          </div>
                        ) : (
                          <div className="text-xs italic mb-2 text-right" style={{ color: "var(--text3)" }}>
                            Teks Arab tidak tersedia
                          </div>
                        )}
                        <div className="h-px bg-gradient-to-r from-transparent via-transparent to-transparent my-2" style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(201,163,90,0.3), transparent)" }} />
                        <p className="text-sm italic leading-relaxed" style={{ color: "var(--text2)" }}>
                          {ayat.terjemah}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>
                            QS. {ayat.surah_nama}: {ayat.nomor_ayat}
                          </span>
                          <Link
                            href={`/surah/${ayat.surah_id}#ayat-${ayat.nomor_ayat}`}
                            className="text-xs font-bold hover:underline"
                            style={{ color: "var(--teal-300)" }}
                          >
                            Buka di Al-Qur'an →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Latar Belakang */}
              {data.latar_belakang ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text3)" }}>
                    📜 Latar Belakang
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                    {data.latar_belakang as string}
                  </p>
                </div>
              ) : null}

              {/* Kondisi Kaum */}
              {data.kondisi_kaum ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text3)" }}>
                    🏛️ Kondisi Kaum
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                    {data.kondisi_kaum as string}
                  </p>
                </div>
              ) : null}

              {/* Kisah Lengkap */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text3)" }}>
                  📖 Kisah Lengkap
                </h4>
                <div className="text-sm leading-relaxed space-y-3" style={{ color: "var(--text2)" }}>
                  {(data.kisah_lengkap as string).split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Azab / Kejadian */}
              {data.azab_atau_kejadian ? (
                <div className="border rounded-xl p-4" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f87171" }}>
                    ⚡ Azab / Kejadian Luar Biasa
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                    {data.azab_atau_kejadian as string}
                  </p>
                </div>
              ) : null}

              {/* Pelajaran */}
              <div className="border rounded-xl p-4" style={{ background: "rgba(20,184,166,0.05)", borderColor: "rgba(20,184,166,0.2)" }}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--teal-300)" }}>
                  💡 Pelajaran & Hikmah
                </h4>
                <div className="text-sm leading-relaxed space-y-2" style={{ color: "var(--text2)" }}>
                  {(data.pelajaran as string).split('\n').filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Referensi */}
              {data.referensi ? (
                <div className="text-xs italic border-t pt-3" style={{ color: "var(--text3)", borderColor: "rgba(201,163,90,0.15)" }}>
                  📚 Referensi: {data.referensi as string}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: "var(--text3)" }}>Gagal memuat kisah. Coba lagi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
