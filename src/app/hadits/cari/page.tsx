"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PERAWI_LIST, getHaditsList, type Hadits } from "@/lib/api/hadits";

// ── Inner component: reads searchParams ──────────────────────────
function CariHaditsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialPerawi = searchParams.get("perawi") ?? "";

  const [keyword, setKeyword] = React.useState(initialQ);
  const [selectedPerawi, setSelectedPerawi] = React.useState<string[]>(
    initialPerawi ? [initialPerawi] : []
  );
  const [results, setResults] = React.useState<(Hadits & { perawiId: string; perawiName: string })[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const togglePerawi = (id: string) => {
    setSelectedPerawi(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const doSearch = React.useCallback(async (kw: string, perawiIds: string[]) => {
    const searchKw = kw.trim();
    if (!searchKw) return;
    setLoading(true);
    setSearched(true);
    setResults([]);

    const targetPerawi = perawiIds.length > 0
      ? PERAWI_LIST.filter(p => perawiIds.includes(p.id))
      : PERAWI_LIST.slice(0, 3);

    try {
      const allResults: (Hadits & { perawiId: string; perawiName: string })[] = [];
      await Promise.all(
        targetPerawi.map(async p => {
          try {
            const [page1, page2] = await Promise.all([
              getHaditsList(p.id, 1, 20),
              getHaditsList(p.id, 2, 20),
            ]);
            const combined = [...(page1.data ?? []), ...(page2.data ?? [])];
            
            const keywords = searchKw.toLowerCase().split(' ').filter(w => w.length > 3);
            
            const matched = combined
              .filter(h => {
                if (keywords.length === 0) return h.id.toLowerCase().includes(searchKw.toLowerCase());
                const teksLower = h.id.toLowerCase();
                // Cukup 1-2 kata kunci yang match
                const matchCount = keywords.filter(kw => teksLower.includes(kw)).length;
                return matchCount >= Math.min(2, keywords.length);
              })
              .map(h => ({ ...h, perawiId: p.id, perawiName: p.name }));
            allResults.push(...matched);
          } catch { /* skip failed perawi */ }
        })
      );
      setResults(allResults);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search when URL has ?q= param (e.g. coming from Hadist Penguat link)
  React.useEffect(() => {
    if (initialQ) {
      doSearch(initialQ, initialPerawi ? [initialPerawi] : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  const handleSearch = () => doSearch(keyword, selectedPerawi);

  return (
    <main className="flex flex-col min-h-screen pb-28 font-cairo">
      {/* ── Topbar ──────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(6,13,18,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(201,163,90,0.08)" }}
      >
        <Link href="/hadits" className="text-lg" style={{ color: "var(--text2)" }}>←</Link>
        <span className="font-cinzel text-sm font-bold flex-1" style={{ color: "var(--gold-light)" }}>🔍 Cari Hadits</span>
      </div>

      {/* ── Search Hero ─────────────────────────── */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-5"
        style={{ background: "linear-gradient(145deg, var(--teal-900), var(--dark2))" }}
      >
        <div className="arabesque-bg opacity-20" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="font-cinzel text-center text-sm font-bold mb-4" style={{ color: "var(--gold-light)" }}>
            Cari dari 9 Kitab Hadits
          </p>
          <div className="flex gap-2">
            <input
              type="search"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Ketik kata kunci dalam bahasa Indonesia..."
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "rgba(10,21,32,0.9)", border: "1px solid rgba(201,163,90,0.2)", color: "var(--text1)" }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !keyword.trim()}
              className="px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))", color: "#E8F4EC" }}
            >
              {loading ? "..." : "Cari"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Perawi Chips ──────────────────── */}
      <div className="px-4 py-3">
        <p className="text-xs mb-2" style={{ color: "var(--text3)" }}>
          Filter perawi (kosong = cari dari Bukhari, Muslim, Abu Dawud):
        </p>
        <div className="flex flex-wrap gap-2">
          {PERAWI_LIST.map(p => (
            <button
              key={p.id}
              onClick={() => togglePerawi(p.id)}
              className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
              style={selectedPerawi.includes(p.id) ? {
                background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                border: "1px solid var(--teal-400)",
                color: "#E8F4EC",
              } : {
                background: "rgba(10,21,32,0.7)",
                border: "1px solid rgba(201,163,90,0.1)",
                color: "var(--text2)",
              }}
            >
              {p.name.replace("Shahih ", "").replace("Sunan ", "").replace("Musnad ", "").replace("Muwatha' ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ─────────────────────────────── */}
      <div className="px-4 flex flex-col gap-3 max-w-3xl mx-auto w-full">
        {loading && (
          <div className="text-center py-8 font-cairo" style={{ color: "var(--text3)" }}>
            🔍 Mencari hadits...
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📜</p>
            <p className="font-bold mb-1" style={{ color: "var(--text1)" }}>Tidak ditemukan</p>
            <p className="text-sm" style={{ color: "var(--text3)" }}>Coba kata kunci lain atau pilih lebih banyak perawi</p>
          </div>
        )}
        {!loading && results.length > 0 && (
          <>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Ditemukan <strong style={{ color: "var(--teal-200)" }}>{results.length}</strong> hadits
            </p>
            <AnimatePresence>
              {results.map((h, i) => (
                <motion.div
                  key={`${h.perawiId}-${h.number}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/hadits/${h.perawiId}/${h.number}`}
                    className="flex flex-col gap-2 p-4 rounded-2xl block transition-all"
                    style={{ background: "rgba(10,21,32,0.85)", border: "1px solid rgba(201,163,90,0.08)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.2)", color: "var(--teal-200)" }}>
                        {h.perawiName} #{h.number}
                      </span>
                    </div>
                    <p className="font-amiri text-lg text-right leading-loose line-clamp-2" dir="rtl" style={{ color: "var(--gold-light)" }}>
                      {h.arab}
                    </p>
                    <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,163,90,0.15), transparent)" }} />
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text2)" }}>{h.id}</p>
                    <div className="flex justify-end">
                      <span className="text-xs font-bold" style={{ color: "var(--teal-300)" }}>Buka →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}

// ── Outer wrapper: Suspense boundary required for useSearchParams ─
export default function CariHaditsPage() {
  return (
    <React.Suspense fallback={
      <main className="flex items-center justify-center min-h-screen font-cairo" style={{ color: "var(--text3)" }}>
        🔍 Memuat pencarian...
      </main>
    }>
      <CariHaditsInner />
    </React.Suspense>
  );
}
