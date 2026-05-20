'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  // State for "Buat Kultum" button
  const [loadingKultum, setLoadingKultum] = useState(false)
  const [toastError, setToastError] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

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

  const handleBuatKultum = async () => {
    setLoadingKultum(true)
    setToastVisible(false)
    setToastError('')

    try {
      // Ambil user_id dari supabase session (opsional)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id ?? null

      const res = await fetch('/api/kultum-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'Kultum',
          durasi_menit: 10,
          gaya_bahasa: 'Semi-Formal',
          tema: nama,
          kategori_tema: "Kisah Al-Qur'an",
          user_id: userId,
        }),
      })

      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal membuat kultum')
      }

      if (resData.id) {
        router.push(`/kultum/hasil/${resData.id}`)
      } else {
        // Not logged in — store in sessionStorage and go to preview
        sessionStorage.setItem('kultum_result', JSON.stringify(resData.konten))
        router.push('/kultum/hasil/preview')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setToastError(msg)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 4000)
    } finally {
      setLoadingKultum(false)
    }
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
              <div 
                dir="rtl"
                className="font-amiri text-2xl md:text-3xl text-right leading-loose text-[var(--gold-light)] mb-1"
              >
                {nama_arab}
              </div>
              <div className="font-bold font-cinzel text-[var(--text1)] text-base leading-tight">{nama}</div>
              <div className="font-cairo text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 text-[var(--gold)] inline-block border border-[var(--gold-border)] bg-[var(--gold-pale)]">{kategoriLabel[kategori] || kategori}</div>
            </div>
          </div>
          <span className="transition-transform" style={{ color: "var(--text3)", transform: expanded ? "rotate(180deg)" : "none" }}>
            ▼
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mt-3">
          {periode && (
            <span className="text-xs text-[var(--text3)] font-cairo">📅 {periode}</span>
          )}
          {lokasi && (
            <span className="text-xs text-[var(--text3)] font-cairo">📍 {lokasi}</span>
          )}
          {nabi_diutus && nabi_diutus !== '-' && (
            <span className="text-xs font-bold text-[var(--teal-300)] font-cairo">🕌 {nabi_diutus}</span>
          )}
        </div>

        {/* Surah tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {surah_utama.slice(0, 3).map((s, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-[var(--gold-pale)] border border-[var(--gold-border)] text-[var(--gold)] font-cairo">
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
                Sedang mengambil kisah dari Al-Qur&apos;an...
              </p>
            </div>
          ) : data ? (
            <div className="p-5 space-y-5">

              {/* Ringkasan */}
              <div className="border rounded-xl p-4" style={{ background: "rgba(201,163,90,0.05)", borderColor: "rgba(201,163,90,0.2)" }}>
                <p className="text-base text-[var(--text1)] leading-relaxed italic font-cairo">
                  {data.ringkasan as string}
                </p>
              </div>

              {/* Ayat Utama */}
              {Array.isArray(data.ayat_utama) && (data.ayat_utama as unknown[]).length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-2 font-cinzel">
                    📖 Ayat Al-Qur&apos;an
                  </h4>
                  <div className="space-y-3">
                    {(data.ayat_utama as Array<{surah_nama: string; nomor_ayat: string; teks_arab: string; terjemah: string; link: string; surah_id: number}>).map((ayat, i) => (
                      <div key={i} className="rounded-xl p-4 border" style={{ background: "rgba(0,0,0,0.2)", borderColor: "rgba(201,163,90,0.15)" }}>
                        {ayat.teks_arab ? (
                          <div 
                            dir="rtl"
                            className="font-amiri text-2xl md:text-3xl text-right leading-loose text-[var(--gold-light)] mb-2"
                          >
                            {ayat.teks_arab}
                          </div>
                        ) : (
                          <div className="text-xs italic mb-2 text-right text-[var(--text3)] font-cairo">
                            Teks Arab tidak tersedia
                          </div>
                        )}
                        <div className="h-px bg-gradient-to-r from-transparent via-transparent to-transparent my-2" style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(201,163,90,0.3), transparent)" }} />
                        <p className="text-base text-[var(--text1)] leading-relaxed italic font-cairo">
                          {ayat.terjemah}
                        </p>
                        <div className="flex items-center justify-between mt-2 font-cairo">
                          <span className="text-xs font-bold text-[var(--gold)]">
                            QS. {ayat.surah_nama}: {ayat.nomor_ayat}
                          </span>
                          <Link
                            href={`/surah/${ayat.surah_id}#ayat-${ayat.nomor_ayat}`}
                            className="text-xs font-bold hover:underline text-[var(--teal-300)]"
                          >
                            Buka di Al-Qur&apos;an →
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
                  <h4 className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-2 font-cinzel">
                    📜 Latar Belakang
                  </h4>
                  <p className="text-base text-[var(--text1)] leading-relaxed font-cairo">
                    {data.latar_belakang as string}
                  </p>
                </div>
              ) : null}

              {/* Kondisi Kaum */}
              {data.kondisi_kaum ? (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-2 font-cinzel">
                    🏛️ Kondisi Kaum
                  </h4>
                  <p className="text-base text-[var(--text1)] leading-relaxed font-cairo">
                    {data.kondisi_kaum as string}
                  </p>
                </div>
              ) : null}

              {/* Kisah Lengkap */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-2 font-cinzel">
                  📖 Kisah Lengkap
                </h4>
                <div className="text-base text-[var(--text1)] leading-relaxed space-y-3 font-cairo">
                  {(data.kisah_lengkap as string).split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Azab / Kejadian */}
              {data.azab_atau_kejadian ? (
                <div className="border rounded-xl p-4" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2 font-cinzel text-red-400">
                    ⚡ Azab / Kejadian Luar Biasa
                  </h4>
                  <p className="text-base text-[var(--text1)] leading-relaxed font-cairo">
                    {data.azab_atau_kejadian as string}
                  </p>
                </div>
              ) : null}

              {/* Pelajaran */}
              <div className="border rounded-xl p-4" style={{ background: "rgba(20,184,166,0.05)", borderColor: "rgba(20,184,166,0.2)" }}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2 font-cinzel text-[var(--teal-300)]">
                  💡 Pelajaran & Hikmah
                </h4>
                <div className="text-base text-[var(--text1)] leading-relaxed space-y-2 font-cairo">
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

              {/* ─── Buat Kultum dari Kisah Ini ─── */}
              <div className="border-t pt-4 mt-2" style={{ borderColor: "rgba(201,163,90,0.15)" }}>
                {/* Toast Error */}
                {toastVisible && (
                  <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-cairo font-semibold text-rose-300 border border-rose-500/30 bg-rose-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-lg">⚠️</span>
                    {toastError}
                  </div>
                )}
                <button
                  onClick={handleBuatKultum}
                  disabled={loadingKultum}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-cairo font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: loadingKultum
                      ? "rgba(201,163,90,0.15)"
                      : "linear-gradient(135deg, rgba(201,163,90,0.25) 0%, rgba(201,163,90,0.1) 100%)",
                    border: "1.5px solid rgba(201,163,90,0.4)",
                    color: "var(--gold-light)",
                    boxShadow: loadingKultum ? "none" : "0 2px 16px rgba(201,163,90,0.12)",
                  }}
                >
                  {loadingKultum ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                      Sedang membuat kultum...
                    </>
                  ) : (
                    <>
                      ✨ Buat Kultum dari Kisah Ini
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] mt-2 font-cairo" style={{ color: "var(--text3)" }}>
                  Kultum ~10 menit · Gaya Semi-Formal · Powered by AI
                </p>
              </div>

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
