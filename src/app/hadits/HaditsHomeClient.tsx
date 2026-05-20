"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PERAWI_LIST } from "@/lib/api/hadits";
import { Hadits } from "@/lib/api/hadits";
import { HADITS_TOPIK } from '@/data/hadits-topik'
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from 'next/navigation'
import { ekstrakInti } from '@/lib/ekstrak-inti-hadits'
import { useRestoreScroll } from '@/hooks/useScrollRestore'


const LEVEL_COLOR: Record<string, string> = {
  "Paling Shahih": "rgba(201,163,90,0.9)",
  "Hasan Shahih":  "#4DC99A",
  "Shahih":        "#38BDF8",
  "Hasan":         "#a78bfa",
};

export default function HaditsHomeClient({
  haditsHariIni,
}: {
  haditsHariIni: Hadits | null;
}) {
  useRestoreScroll();
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = React.useState<'perawi' | 'topik'>(
    searchParams.get('tab') === 'topik' ? 'topik' : 'perawi'
  )
  const [topikCounts, setTopikCounts] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    const supabase = createClient()
    // Fetch count semua topik sekaligus
    Promise.all(
      HADITS_TOPIK.map(async (topik) => {
        const { count } = await supabase
          .from('hadits_topik_index')
          .select('*', { count: 'exact', head: true })
          .eq('topik_id', topik.id)
        return { id: topik.id, count: count || 0 }
      })
    ).then(results => {
      const counts: Record<string, number> = {}
      results.forEach(r => { counts[r.id] = r.count })
      setTopikCounts(counts)
    })
  }, [])

  return (
    <main className="flex flex-col min-h-screen pb-28 font-cairo">
      {/* ── Topbar ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(6,13,18,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,163,90,0.08)",
        }}
      >
        <h1 className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)]">
          📜 Hadits Center
        </h1>
        <Link
          href="/hadits/cari"
          className="font-cairo flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.25)", color: "var(--teal-200)" }}
        >
          🔍 Cari Hadits
        </Link>
      </div>

      {/* ── Hero — Hadits Hari Ini ──────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 pt-6 pb-8"
        style={{ background: "linear-gradient(145deg, var(--teal-900), var(--dark2))" }}
      >
        <div className="arabesque-bg opacity-30" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-cinzel text-xs font-bold tracking-widest mb-4 text-center uppercase" style={{ color: "rgba(201,163,90,0.7)" }}>
            ✦ HADITS HARI INI ✦
          </p>
          {haditsHariIni ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-5"
              style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.15)" }}
            >
              {/* Arab text */}
              <p
                className="font-amiri text-2xl md:text-3xl text-right leading-loose mb-3 text-[var(--gold-light)]"
                dir="rtl"
              >
                {haditsHariIni.arab}
              </p>
              {/* Divider */}
              <div className="h-px my-3" style={{ background: "linear-gradient(to right, transparent, rgba(201,163,90,0.3), transparent)" }} />
              {/* Terjemahan */}
              <p className="font-cairo text-base leading-relaxed text-[var(--text1)] mb-4">
                &ldquo;{ekstrakInti(haditsHariIni.id)}&rdquo;
              </p>
              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="font-cairo text-xs font-bold text-[var(--text3)]">
                  HR. Bukhari No. {haditsHariIni.number}
                </span>
                <span
                  className="font-cairo text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest"
                  style={{ background: "rgba(201,163,90,0.1)", border: "1px solid rgba(201,163,90,0.3)", color: "var(--gold-light)" }}
                >
                  ✓ Shahih
                </span>
              </div>
              <Link
                href={`/hadits/bukhari/${haditsHariIni.number}`}
                className="font-cairo mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(13,79,60,0.25)", border: "1px solid rgba(13,143,101,0.3)", color: "var(--teal-200)" }}
              >
                Baca Selengkapnya →
              </Link>
            </motion.div>
          ) : (
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.1)" }}>
              <p className="font-cairo text-sm text-[var(--text3)]">Memuat hadits hari ini...</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="flex justify-center gap-4 px-4 py-4">
        {[
          { n: "9",    label: "Perawi" },
          { n: "30K+", label: "Hadits" },
          { n: "100%", label: "Terpercaya" },
        ].map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center px-4 py-2 rounded-xl flex-1"
            style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.1)" }}
          >
            <span className="font-cinzel text-lg font-bold" style={{ color: "var(--gold-light)" }}>{s.n}</span>
            <span className="font-cairo text-xs uppercase tracking-widest text-[var(--text3)]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tab Toggle */}
      <div className="px-4 max-w-3xl mx-auto w-full">
        <div className="flex gap-2 p-1 rounded-2xl mb-6"
             style={{ background: 'rgba(10,21,32,0.85)', border: '1px solid rgba(201,163,90,0.15)' }}>
          {(['perawi', 'topik'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 font-cinzel text-sm font-bold py-3 rounded-xl transition-all"
              style={{
                background: activeTab === tab ? 'rgba(201,163,90,0.15)' : 'transparent',
                color: activeTab === tab ? 'var(--gold)' : 'var(--text3)',
                border: activeTab === tab ? '1px solid rgba(201,163,90,0.3)' : '1px solid transparent',
              }}
            >
              {tab === 'perawi' ? '📜 Per Perawi' : '🗂️ Per Topik'}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Per Perawi */}
      {activeTab === 'perawi' && (
        <>
          {/* ── Grid 9 Perawi ──────────────────────────────────── */}
          <section className="px-4 max-w-3xl mx-auto w-full">
            <p className="font-cinzel text-xl font-bold text-[var(--text1)] mb-4">
              ✦ Pilih Kitab Hadits
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PERAWI_LIST.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/hadits/${p.id}`}
                    className="flex flex-col gap-1.5 p-3 rounded-2xl h-full transition-all"
                    style={{
                      background: "rgba(10,21,32,0.85)",
                      border: p.level === "Paling Shahih"
                        ? "1px solid rgba(201,163,90,0.35)"
                        : "1px solid rgba(13,143,101,0.15)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Arabic name */}
                    <p dir="rtl" className="font-amiri text-xl text-right leading-loose text-[var(--gold-light)] mb-3">
                      {p.arabName}
                    </p>
                    {/* Latin name */}
                    <p className="font-cinzel font-bold text-base text-[var(--text1)] leading-tight">
                      {p.name}
                    </p>
                    {/* Total */}
                    <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed">
                      {p.available.toLocaleString('id-ID')} hadits
                    </p>
                    {/* Level badge */}
                    <span
                      className="font-cairo text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--gold-border)] text-[var(--gold)] bg-[var(--gold-pale)] uppercase tracking-wider self-start mt-auto"
                    >
                      {p.level}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="px-4 mt-6 max-w-3xl mx-auto w-full">
            <Link
              href="/hadits/cari"
              className="font-cairo flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                boxShadow: "0 4px 20px rgba(13,79,60,0.4)",
                color: "#E8F4EC",
              }}
            >
              🔍 Cari Hadits dari 9 Perawi
            </Link>
          </div>
        </>
      )}

      {/* Konten Per Topik */}
      {activeTab === 'topik' && (
        <section className="px-4 max-w-3xl mx-auto w-full">
          <p className="font-cinzel text-xl font-bold text-[var(--text1)] mb-1">
            ✦ Jelajahi Tema
          </p>
          <p className="font-cairo text-sm text-[var(--text2)] mb-6">
            Temukan hadits pilihan berdasarkan topik kehidupan
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HADITS_TOPIK.map(topik => (
              <Link
                key={topik.id}
                href={`/hadits/topik/${topik.id}`}
                className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(10,21,32,0.85)',
                  border: '1px solid rgba(201,163,90,0.15)',
                }}
              >
                <span className="text-2xl">{topik.icon}</span>
                <p className="font-cinzel font-bold text-base text-[var(--text1)] leading-tight">
                  {topik.nama}
                </p>
                <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed line-clamp-2">
                  {topik.deskripsi}
                </p>
                <p className="font-cairo text-xs font-bold text-[var(--teal-300)] mt-auto uppercase tracking-widest">
                  {topikCounts[topik.id]
                    ? `${topikCounts[topik.id].toLocaleString('id-ID')} hadits →`
                    : '... hadits →'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
