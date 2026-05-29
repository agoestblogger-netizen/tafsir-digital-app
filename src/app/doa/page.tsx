'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMustajab, HAJAT_INFO, DOA_QURANI } from '@/data/doa_qurani'
import { ArrowRight, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useRestoreScroll } from '@/hooks/useScrollRestore'
import { createClient } from '@/lib/supabase/client'

// ─── Unified category mapping ─────────────────────────────────────────────────
interface KategoriUnified {
  key: string
  label: string
  icon: string
  /** TemaHajat key to filter DOA_QURANI (null = no Al-Qur'an doas) */
  hajat: string | null
  /** Substrings to match against doa_master.tema_kultum[] */
  temaKultum: string[]
}

const KATEGORI_UNIFIED: KategoriUnified[] = [
  { key: 'rezeki',     label: 'Rezeki & Kemudahan',  icon: '💰', hajat: 'rezeki',    temaKultum: ['Rezeki', 'Kerja', 'Zuhud'] },
  { key: 'jodoh',      label: 'Jodoh & Pasangan',    icon: '❤️', hajat: 'jodoh',     temaKultum: ['Pernikahan', 'Rumah Tangga'] },
  { key: 'anak',       label: 'Anak & Keturunan',    icon: '👨‍👩‍👧', hajat: 'anak',      temaKultum: ['Anak', 'Keluarga'] },
  { key: 'karir',      label: 'Karir & Pekerjaan',   icon: '💼', hajat: 'karir',     temaKultum: ['Rezeki', 'Kerja', 'Ilmu'] },
  { key: 'kesehatan',  label: 'Kesehatan',            icon: '🏥', hajat: 'kesehatan', temaKultum: ['Kesehatan', 'Thibbun', 'Jiwa', 'Qalbu'] },
  { key: 'perlindungan',label:'Perlindungan',         icon: '🛡️', hajat: 'perlindungan', temaKultum: ['Perlindungan', 'Iman', 'Akidah'] },
  { key: 'kesedihan',  label: 'Kesedihan & Ujian',   icon: '💔', hajat: 'kesedihan', temaKultum: ['Sabar', 'Syukur', 'Tazkiyatun'] },
  { key: 'taubat',     label: 'Taubat & Ampunan',    icon: '🙏', hajat: 'taubat',    temaKultum: ['Taubat', 'Ampunan', 'Istighfar'] },
  { key: 'ilmu',       label: 'Ilmu & Hikmah',       icon: '📚', hajat: 'ilmu',      temaKultum: ['Ilmu', 'Pendidikan'] },
  { key: 'keluarga',   label: 'Keluarga',             icon: '👨‍👩‍👦', hajat: 'keluarga',  temaKultum: ['Keluarga', 'Pernikahan', 'Birrul'] },
  { key: 'akhirat',    label: 'Akhirat',              icon: '⭐', hajat: null,        temaKultum: ['Akhirat', 'Kiamat'] },
  { key: 'ibadah',     label: 'Ibadah & Dzikir',     icon: '🕌', hajat: null,        temaKultum: ['Shalat', 'Dzikir', 'Doa', 'Istiqomah'] },
  { key: 'ukhuwah',    label: 'Ukhuwah & Sosial',    icon: '🤝', hajat: null,        temaKultum: ['Ukhuwah', 'Persaudaraan', 'Sosial'] },
  { key: 'hutang',     label: 'Bebas Hutang',         icon: '💸', hajat: 'hutang',    temaKultum: ['Muamalah', 'Jual Beli', 'Hutang'] },
  { key: 'musibah',    label: 'Menghadapi Musibah',  icon: '🌧️', hajat: 'musibah',   temaKultum: ['Sabar', 'Musibah', 'Syukur'] },
]

// ─── Filter helpers ───────────────────────────────────────────────────────────
function filterQuranByKat(kat: KategoriUnified) {
  if (!kat.hajat) return []
  return DOA_QURANI.filter(d => d.tema_hajat?.includes(kat.hajat as any))
}

function filterHisnulByKat(kat: KategoriUnified, doaMaster: any[]) {
  if (kat.temaKultum.length === 0) return []
  return doaMaster.filter(d =>
    Array.isArray(d.tema_kultum) &&
    d.tema_kultum.some((t: string) =>
      kat.temaKultum.some(kw => t.toLowerCase().includes(kw.toLowerCase()))
    )
  )
}

// ─── derajat badge ────────────────────────────────────────────────────────────
function derajatBadge(derajat: string | null) {
  if (!derajat) return null
  const d = derajat.toLowerCase()
  let cls = ''
  if (d.includes('shahih') && d.includes('hasan')) cls = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
  else if (d.includes('shahih')) cls = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
  else if (d.includes('hasan'))  cls = 'bg-blue-500/15 border-blue-500/30 text-blue-300'
  else cls = 'bg-[var(--gold)]/10 border-[var(--gold-border)] text-[var(--gold-light)]'
  return (
    <span className={`font-cairo text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-semibold ${cls}`}>
      {derajat}
    </span>
  )
}

// ─── DoaMasterCard ────────────────────────────────────────────────────────────
function DoaMasterCard({ doa }: { doa: any }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="glass-card rounded-2xl border border-[var(--gold-border)]/40 p-5 flex flex-col gap-3 transition-all hover:border-[var(--gold)]/40">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className="font-cinzel text-sm font-bold text-[var(--gold-light)] leading-snug flex-1">{doa.judul}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {doa.waktu_baca && (
            <span className="font-cairo text-[10px] px-2 py-0.5 rounded-full border border-[var(--gold-border)]/40 text-[var(--text3)] bg-[var(--dark3)]">
              🕐 {doa.waktu_baca}
            </span>
          )}
          {derajatBadge(doa.derajat)}
        </div>
      </div>
      {doa.arab && <p className="font-amiri text-2xl leading-loose text-[var(--gold-light)] text-right" dir="rtl">{doa.arab}</p>}
      {doa.latin && <p className="font-cairo text-sm italic text-[var(--teal-200)] leading-relaxed">{doa.latin}</p>}
      {doa.terjemah && <p className="font-cairo text-sm text-[var(--text1)] leading-relaxed">&ldquo;{doa.terjemah}&rdquo;</p>}
      {(doa.referensi || doa.sumber_kitab) && (
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-[var(--gold-border)]/20">
          {doa.referensi && <span className="font-cairo text-xs text-[var(--text3)]">📚 {doa.referensi}</span>}
          {doa.sumber_kitab && <span className="font-cairo text-xs text-[var(--text3)]">— {doa.sumber_kitab}</span>}
        </div>
      )}
      {doa.keutamaan && (
        <div>
          <button type="button" onClick={() => setExpanded(p => !p)}
            className="font-cairo text-xs flex items-center gap-1.5 text-[var(--teal-200)] hover:text-[var(--teal-100)] transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            ℹ️ {expanded ? 'Sembunyikan keutamaan' : 'Lihat keutamaan'}
          </button>
          {expanded && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-[var(--dark3)]/60 border border-[var(--gold-border)]/20">
              <p className="font-cairo text-xs text-[var(--text2)] leading-relaxed">{doa.keutamaan}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── DoaQuranCard ─────────────────────────────────────────────────────────────
function DoaQuranCard({ doa }: { doa: any }) {
  return (
    <Link href={`/doa/${doa.id}`} className="block group">
      <div className="glass-card rounded-2xl border border-[var(--gold-border)]/40 p-5 flex flex-col gap-3 transition-all hover:border-[var(--gold)]/40 hover:shadow-[0_4px_20px_rgba(201,163,90,0.10)]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h3 className="font-cinzel text-sm font-bold text-[var(--gold-light)] leading-snug flex-1 group-hover:text-[var(--gold)]">{doa.judul}</h3>
          {doa.nabi && (
            <span className="font-cairo text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-amber-500/15 border-amber-500/30 text-amber-300 font-semibold">
              {doa.nabi}
            </span>
          )}
        </div>
        {doa.arab && <p className="font-amiri text-2xl leading-loose text-[var(--gold-light)] text-right" dir="rtl">{doa.arab}</p>}
        {doa.latin && <p className="font-cairo text-sm italic text-[var(--teal-200)] leading-relaxed">{doa.latin}</p>}
        {doa.terjemah && <p className="font-cairo text-sm text-[var(--text1)] leading-relaxed line-clamp-3">&ldquo;{doa.terjemah}&rdquo;</p>}
        {doa.referensi && (
          <div className="flex items-center justify-between pt-1 border-t border-[var(--gold-border)]/20">
            <span className="font-cairo text-xs text-[var(--text3)]">{doa.referensi}</span>
            <span className="font-cairo text-xs font-semibold text-[var(--teal-200)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Detail <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── KategoriModal ────────────────────────────────────────────────────────────
function KategoriModal({ kat, doaMaster, onClose }: { kat: KategoriUnified; doaMaster: any[]; onClose: () => void }) {
  const quranList  = filterQuranByKat(kat)
  const hisnulList = filterHisnulByKat(kat, doaMaster)
  const [tabModal, setTabModal] = useState<'quran' | 'hisnul'>(
    quranList.length > 0 ? 'quran' : 'hisnul'
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(8,17,28,0.98)', border: '1px solid rgba(201,163,90,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--gold-border)]/20 shrink-0">
          <div>
            <span className="text-2xl mr-2">{kat.icon}</span>
            <span className="font-cinzel text-lg font-bold text-[var(--gold-light)]">{kat.label}</span>
            <p className="font-cairo text-xs text-[var(--text3)] mt-0.5">
              {quranList.length} Doa Al-Qur&apos;an · {hisnulList.length} Hisnul Muslim
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[var(--gold-border)]/30 flex items-center justify-center text-[var(--text2)] hover:text-[var(--text1)] hover:border-[var(--gold-border)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal tabs */}
        <div className="flex border-b border-[var(--gold-border)]/20 shrink-0">
          {([
            { key: 'quran',  label: `📖 Doa Al-Qur'an (${quranList.length})` },
            { key: 'hisnul', label: `📚 Hisnul Muslim (${hisnulList.length})` },
          ] as const).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabModal(tab.key)}
              className={`flex-1 font-cairo text-sm px-4 py-3 transition-all ${
                tabModal === tab.key
                  ? 'text-[var(--gold)] border-b-2 border-[var(--gold)] font-semibold'
                  : 'text-[var(--text2)] border-b-2 border-transparent hover:text-[var(--text1)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {tabModal === 'quran' && (
            quranList.length === 0
              ? <p className="font-cairo text-sm text-[var(--text3)] italic text-center py-10">Belum ada doa Al-Qur&apos;an untuk kategori ini.</p>
              : quranList.map(d => <DoaQuranCard key={d.id} doa={d} />)
          )}
          {tabModal === 'hisnul' && (
            hisnulList.length === 0
              ? <p className="font-cairo text-sm text-[var(--text3)] italic text-center py-10">Belum ada doa Hisnul Muslim untuk kategori ini.</p>
              : hisnulList.map(d => <DoaMasterCard key={d.id} doa={d} />)
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoaPage() {
  useRestoreScroll()
  const mustajabList = getMustajab()
  const doaHariIni = mustajabList[0]

  const [doaMaster, setDoaMaster] = useState<any[]>([])
  const [loadingDoaMaster, setLoadingDoaMaster] = useState(false)
  const [activeKategori, setActiveKategori] = useState<KategoriUnified | null>(null)

  useEffect(() => {
    const fetchDoaMaster = async () => {
      setLoadingDoaMaster(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('doa_master')
          .select('id, judul, arab, latin, terjemah, referensi, sumber_kitab, keutamaan, waktu_baca, derajat, tema_kultum, kategori')
          .order('id')
        if (!error && data) setDoaMaster(data)
      } catch (err) {
        console.error('[DoaMaster] fetch error:', err)
      } finally {
        setLoadingDoaMaster(false)
      }
    }
    fetchDoaMaster()
  }, [])

  return (
    <div className="min-h-screen pb-24 font-cairo">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--dark3)] to-[var(--dark)] pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="arabesque-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--gold-light)] mb-4">
            Kumpulan Doa Islam
          </h1>

          <div className="max-w-2xl mx-auto glass-card p-6 md:p-8 rounded-3xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--dark)] border border-[var(--gold)] px-4 py-1 rounded-full font-cinzel text-xs uppercase tracking-widest font-bold text-[var(--gold-light)]">
              QS. Ghafir : 60
            </div>
            <p className="font-amiri text-2xl md:text-3xl leading-loose text-[var(--gold-light)] mb-4 mt-2" dir="rtl">
              وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ
            </p>
            <p className="font-cairo text-sm italic text-[var(--teal-200)] text-right mb-2">
              Wa qāla rabbukumud&apos;ūnī astajib lakum
            </p>
            <p className="font-cairo text-base leading-relaxed text-[var(--text1)] font-medium">
              &quot;Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu.&quot;
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{DOA_QURANI.length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Doa Al-Qur&apos;an</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{loadingDoaMaster ? '…' : doaMaster.length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Hisnul Muslim</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-[var(--gold-border)]">
              <span className="text-[var(--gold-light)] font-bold">{Object.keys(HAJAT_INFO).length}</span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[var(--text2)]">Kategori</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* ── Doa Pilihan Hari Ini ── */}
        {doaHariIni && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-rose-400" />
              <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Doa Pilihan Hari Ini</h2>
            </div>
            <Link href={`/doa/${doaHariIni.id}`} className="block group">
              <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,163,90,0.15)] hover:border-[var(--gold-light)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -z-10 group-hover:bg-rose-500/20 transition-all duration-500" />
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-cairo text-xs uppercase tracking-widest px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full font-semibold text-rose-300">Mustajab</span>
                    {doaHariIni.nabi && (
                      <span className="font-cairo text-xs uppercase tracking-widest px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full font-semibold text-amber-300">{doaHariIni.nabi}</span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-[var(--text1)] mb-2 group-hover:text-[var(--gold-light)] transition-colors">{doaHariIni.judul}</h3>
                  <div className="font-amiri text-2xl md:text-3xl leading-loose text-[var(--gold-light)] my-6" dir="rtl">{doaHariIni.arab}</div>
                  <p className="font-cairo text-base leading-relaxed text-[var(--text1)] line-clamp-2">{doaHariIni.terjemah}</p>
                  <div className="pt-4 mt-4 border-t border-[var(--gold-border)] flex items-center justify-between">
                    <span className="font-cairo text-xs text-[var(--text3)] font-bold">{doaHariIni.referensi}</span>
                    <span className="font-cairo text-sm font-semibold flex items-center gap-1 text-[var(--teal-200)] group-hover:translate-x-1 transition-transform">
                      Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── Jelajahi Doa berdasarkan Kebutuhan ── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🗂️</span>
            <h2 className="font-cinzel text-xl font-bold text-[var(--text1)]">Jelajahi Doa berdasarkan Kebutuhan</h2>
          </div>
          <p className="font-cairo text-sm text-[var(--text2)] mb-6">
            Setiap kategori menggabungkan doa dari Al-Qur&apos;an dan Hisnul Muslim — klik untuk membaca
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {KATEGORI_UNIFIED.map(kat => {
              const qCount = filterQuranByKat(kat).length
              const hCount = loadingDoaMaster ? null : filterHisnulByKat(kat, doaMaster).length
              return (
                <button
                  key={kat.key}
                  type="button"
                  onClick={() => setActiveKategori(kat)}
                  className="glass-card p-4 rounded-2xl border border-[var(--gold-border)]/40 text-left flex flex-col gap-2 hover:border-[var(--gold)]/50 hover:-translate-y-0.5 transition-all group"
                >
                  <span className="text-3xl">{kat.icon}</span>
                  <h3 className="font-cinzel text-xs font-bold text-[var(--text1)] leading-snug group-hover:text-[var(--gold-light)] transition-colors">
                    {kat.label}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    {qCount > 0 && (
                      <span className="font-cairo text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-300">
                        {qCount} Al-Qur&apos;an
                      </span>
                    )}
                    {hCount === null ? (
                      <span className="font-cairo text-[10px] text-[var(--text3)]">…</span>
                    ) : hCount > 0 ? (
                      <span className="font-cairo text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300">
                        {hCount} Hisnul
                      </span>
                    ) : null}
                    {!loadingDoaMaster && qCount === 0 && (hCount ?? 0) === 0 && (
                      <span className="font-cairo text-[10px] text-[var(--text3)] italic">Segera hadir</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

      </div>

      {/* ── Modal ── */}
      {activeKategori && (
        <KategoriModal
          kat={activeKategori}
          doaMaster={doaMaster}
          onClose={() => setActiveKategori(null)}
        />
      )}
    </div>
  )
}
