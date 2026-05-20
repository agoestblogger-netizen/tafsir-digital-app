"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PERAWI_LIST, getHaditsList, type Hadits } from "@/lib/api/hadits";
import { ekstrakInti } from "@/lib/ekstrak-inti-hadits";

const LIMIT = 50;

export default function PerawiListClient() {
  const params = useParams();
  const router = useRouter();
  const perawiId = typeof params.perawi === "string" ? params.perawi : "";
  const perawi = PERAWI_LIST.find(p => p.id === perawiId);

  const [hadiths, setHadiths] = React.useState<Hadits[]>([]);
  const [totalHadits, setTotalHadits] = React.useState(0);
  const [totalPagesCount, setTotalPagesCount] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!perawiId) return;
    setLoading(true);
    setError(null);
    getHaditsList(perawiId, page, LIMIT)
      .then(data => {
        setHadiths(data.data ?? []);
        setTotalHadits(data.total ?? 0);
        setTotalPagesCount(data.total_pages ?? 1);
      })
      .catch(err => {
        console.error("[HaditsPerawi] fetch error:", err);
        setError("Gagal memuat hadits. Silakan coba lagi.");
        setHadiths([]);
      })
      .finally(() => setLoading(false));
  }, [perawiId, page]);

  const filtered = search.trim()
    ? hadiths.filter(h =>
        h.id.toLowerCase().includes(search.toLowerCase()) ||
        h.arab.includes(search)
      )
    : hadiths;

  const pages = totalPagesCount;

  if (!perawi) return (
    <main className="flex items-center justify-center min-h-screen">
      <p style={{ color: "var(--text3)" }}>Perawi tidak ditemukan.</p>
    </main>
  );

  return (
    <main className="flex flex-col min-h-screen pb-28 font-cairo">
      {/* ── Topbar ──────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(6,13,18,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(201,163,90,0.08)" }}
      >
        <Link href="/hadits?tab=perawi" className="text-lg font-cairo" style={{ color: "var(--text2)" }}>←</Link>
        <span className="font-cinzel text-base md:text-xl font-bold flex-1" style={{ color: "var(--gold-light)" }}>{perawi.name}</span>
        {totalHadits > 0 && (
          <span className="font-cairo text-xs uppercase tracking-widest text-[var(--text3)]">{totalHadits.toLocaleString('id-ID')} hadits</span>
        )}
      </div>

      {/* ── Perawi Header ───────────────────────── */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-5"
        style={{ background: "linear-gradient(145deg, var(--teal-900), var(--dark2))" }}
      >
        <div className="relative z-10 text-center">
          <p dir="rtl" className="font-amiri text-2xl md:text-3xl mb-2 leading-loose text-[var(--gold-light)]">{perawi.arabName}</p>
          <p className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-[var(--gold-light)]">{perawi.name}</p>
          <span
            className="font-cairo inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(201,163,90,0.1)", border: "1px solid rgba(201,163,90,0.3)", color: "var(--gold)" }}
          >
            ✓ {perawi.level}
          </span>
        </div>
      </div>

      {/* ── Search ──────────────────────────────── */}
      <div className="px-4 py-3 max-w-3xl mx-auto w-full">
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); }}
          placeholder="Cari dalam halaman ini (Arab / terjemahan)..."
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none font-cairo"
          style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.12)", color: "var(--text1)" }}
        />
      </div>

      {/* ── Hadits List ─────────────────────────── */}
      <div className="px-4 flex flex-col gap-3 max-w-3xl mx-auto w-full">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: "rgba(10,21,32,0.7)", height: 130 }} />
          ))
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => { setPage(1); setError(null); setLoading(true); }}
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.3)", color: "var(--teal-200)" }}
            >
              Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--text3)" }}>
            {search ? `Tidak ditemukan untuk "${search}"` : "Tidak ada hadits."}
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((h, i) => (
              <motion.div
                key={h.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <div className="rounded-2xl border p-4 transition-all hover:border-[rgba(201,163,90,0.3)]"
                     style={{ background: 'rgba(10,21,32,0.85)', borderColor: 'rgba(201,163,90,0.15)' }}>

                  {/* Nomor + badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-cairo text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--gold-border)] text-[var(--gold)] bg-[var(--gold-pale)] uppercase tracking-wider">
                      {perawi.name}
                    </span>
                    <span className="font-cairo text-xs text-[var(--text3)]">No. {h.number}</span>
                  </div>

                  {/* Teks Arab — 2 baris */}
                  <p className="font-amiri text-lg text-right leading-loose text-[var(--gold-light)] mb-2 line-clamp-2" dir="rtl">
                    {h.arab}
                  </p>

                  {/* Intisari */}
                  {(() => {
                    const inti = ekstrakInti(h.id)
                    return inti ? (
                      <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed italic mb-3 line-clamp-3">
                        &ldquo;{inti}&rdquo;
                      </p>
                    ) : null
                  })()}

                  {/* Link detail */}
                  <Link href={`/hadits/${perawiId}/${h.number}`}
                     className="font-cairo text-xs font-bold text-[var(--teal-300)] hover:underline">
                    Lihat Detail →
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Pagination ──────────────────────────── */}
      {!search && pages > 1 && !loading && (
        <div className="flex items-center justify-center gap-4 px-4 mt-6 pb-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-30"
            style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold)" }}
          >
            ‹
          </button>
          <span className="text-sm font-cairo" style={{ color: "var(--text2)" }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="w-10 h-10 rounded-full font-bold transition-all disabled:opacity-30"
            style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold)" }}
          >
            ›
          </button>
        </div>
      )}
    </main>
  );
}
