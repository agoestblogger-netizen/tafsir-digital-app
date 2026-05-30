"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PERAWI_LIST } from "@/lib/api/hadits";

// ─── Result type from /api/hadits-search ──────────────────────────
type HaditsSearchResult = {
  id: number;
  perawi: string;
  nomor: number;
  topik_nama: string;
  terjemah: string;
  arab: string;
  similarity: number;
};

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
  const [results, setResults] = React.useState<HaditsSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [limited, setLimited] = React.useState(false);

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
    try {
      const res = await fetch('/api/hadits-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchKw, perawi: perawiIds })
      });
      const json = await res.json();
      setResults(json.results ?? []);
    } catch {
      setResults([]);
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

  // Lookup perawi display name from PERAWI_LIST using perawi field from result
  const getPerawiName = (perawiSlug: string) => {
    // match_hadits returns perawi as a display name like "Bukhari" or full name
    // Try to find a matching entry in PERAWI_LIST by id similarity
    const found = PERAWI_LIST.find(p =>
      p.id === perawiSlug.toLowerCase() ||
      p.name.toLowerCase().includes(perawiSlug.toLowerCase()) ||
      perawiSlug.toLowerCase().includes(p.id.replace('-', ' '))
    );
    return found?.name ?? perawiSlug;
  };

  const getPerawiSlug = (perawiStr: string) => {
    // Try to derive a URL-safe slug from the perawi string
    const found = PERAWI_LIST.find(p =>
      p.id === perawiStr.toLowerCase() ||
      p.name.toLowerCase().includes(perawiStr.toLowerCase()) ||
      perawiStr.toLowerCase().includes(p.id.replace('-', ' '))
    );
    return found?.id ?? perawiStr.toLowerCase().replace(/\s+/g, '-');
  };

  const similarityPercent = (sim: number) => Math.round(sim * 100);

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
          <p className="font-cinzel text-center text-sm font-bold mb-1" style={{ color: "var(--gold-light)" }}>
            Cari dari 10.851 Hadits Terindeks
          </p>
          <p className="font-cairo text-center text-xs mb-4" style={{ color: "var(--text3)" }}>
            Pencarian semantik — menemukan makna, bukan sekadar kata kunci
          </p>
          <div className="flex gap-2">
            <input
              type="search"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Ketik tema atau makna dalam bahasa Indonesia..."
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
          Filter perawi (kosong = cari semua perawi):
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
            🔍 Mencari hadits secara semantik...
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📜</p>
            <p className="font-bold mb-1" style={{ color: "var(--text1)" }}>Tidak ditemukan</p>
            <p className="text-sm" style={{ color: "var(--text3)" }}>Coba kata kunci lain atau ubah pilihan perawi</p>
          </div>
        )}

        {!loading && searched && limited && results.length > 0 && results.length < 3 && (
          <div
            className="px-4 py-3 rounded-xl text-sm font-cairo"
            style={{ background: "rgba(201,163,90,0.08)", border: "1px solid rgba(201,163,90,0.2)", color: "var(--text2)" }}
          >
            ⚠️ Hasil terbatas — coba kata kunci lain
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm" style={{ color: "var(--text2)" }}>
              Ditemukan <strong style={{ color: "var(--teal-200)" }}>{results.length}</strong> hadits relevan
            </p>
            <AnimatePresence>
              {results.map((h, i) => {
                const perawiSlug = getPerawiSlug(h.perawi);
                const perawiName = getPerawiName(h.perawi);
                const detailHref = `/hadits/${perawiSlug}/${h.nomor}`;

                return (
                  <motion.div
                    key={`${h.id}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div
                      className="flex flex-col gap-2 p-4 rounded-2xl"
                      style={{ background: "rgba(10,21,32,0.85)", border: "1px solid rgba(201,163,90,0.08)" }}
                    >
                      {/* Header badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.2)", color: "var(--teal-200)" }}>
                          {perawiName} #{h.nomor}
                        </span>
                        {h.topik_nama && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-[180px]" style={{ background: "rgba(201,163,90,0.08)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold-light)" }}>
                            {h.topik_nama}
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "rgba(13,79,60,0.15)", color: "var(--teal-300)" }}>
                          {similarityPercent(h.similarity)}% relevan
                        </span>
                      </div>

                      {/* Arab text */}
                      {h.arab && (
                        <p className="font-amiri text-lg text-right leading-loose line-clamp-2" dir="rtl" style={{ color: "var(--gold-light)" }}>
                          {h.arab}
                        </p>
                      )}

                      <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,163,90,0.15), transparent)" }} />

                      {/* Terjemah */}
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text2)" }}>
                        {h.terjemah}
                      </p>

                      {/* Link detail */}
                      <div className="flex justify-end pt-1">
                        <Link
                          href={detailHref}
                          className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                          style={{ color: "var(--teal-300)" }}
                        >
                          Lihat Detail →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
