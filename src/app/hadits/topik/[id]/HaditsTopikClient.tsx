"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HaditsTopik } from "@/data/hadits-topik";
import { PERAWI_LIST } from "@/lib/api/hadits";
import { createClient } from "@/lib/supabase/client";
import { ekstrakInti } from "@/lib/ekstrak-inti-hadits";
import { BackButton } from "@/components/ui/BackButton";
import { useRestoreScroll } from "@/hooks/useScrollRestore";

interface HaditsItem {
  perawi: string;
  nomor: number;
  arab: string;
  terjemah: string;
}

export default function HaditsTopikClient({
  topik,
  initialHadits,
  totalCount,
  topikId,
}: {
  topik: HaditsTopik;
  initialHadits: HaditsItem[];
  totalCount: number;
  topikId: string;
}) {
  const router = useRouter();
  useRestoreScroll();
  const [haditsData, setHaditsData] = React.useState<HaditsItem[]>(initialHadits);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialHadits.length < totalCount);
  const supabase = createClient();

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextOffset = haditsData.length;
    const { data, error } = await supabase
      .from('hadits_topik_index')
      .select('perawi, nomor, arab, terjemah')
      .eq('topik_id', topikId)
      .order('nomor', { ascending: true })
      .range(nextOffset, nextOffset + 49);

    if (error) {
      console.error('Error loading more hadits:', error);
    } else if (data) {
      setHaditsData(prev => [...prev, ...data]);
      if (haditsData.length + data.length >= totalCount) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col min-h-screen pb-28 font-cairo">
      {/* ── Topbar ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(6,13,18,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,163,90,0.08)",
        }}
      >
        <BackButton label="" />
        <span className="font-cinzel text-xl font-bold flex-1 text-[var(--gold-light)] ml-2">
          Hadits Topik
        </span>
      </div>

      <div className="px-4 py-6 max-w-3xl mx-auto w-full">
        {/* ── Header Topik ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-8 text-center relative overflow-hidden"
          style={{ 
            background: "linear-gradient(145deg, var(--teal-900), var(--dark2))",
            border: "1px solid rgba(201,163,90,0.15)"
          }}
        >
          <div className="relative z-10">
            <span className="text-5xl mb-4 block">{topik.icon}</span>
            <h2 className="font-cinzel text-3xl font-extrabold text-[var(--gold-light)] mb-2">
              {topik.nama}
            </h2>
            <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed max-w-lg mx-auto mb-4">
              {topik.deskripsi}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/5 shadow-inner">
              <span className="text-sm font-bold text-[var(--gold-light)]">
                {totalCount.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-[var(--text3)] uppercase tracking-wider">
                hadits tentang {topik.nama}
              </span>
            </div>
          </div>
          <div className="arabesque-bg opacity-10 absolute inset-0 pointer-events-none" />
        </motion.div>

        {/* ── List Hadits Kurasi ────────────────────────────── */}
        <div className="space-y-4">
          <p className="font-cinzel text-lg font-bold text-[var(--text1)] mb-4 px-2">
            ✦ Daftar Hadits
          </p>
          
          {haditsData.length > 0 ? (
            <>
              {haditsData.map((item, i) => {
                return (
                  <motion.div
                    key={`${item.perawi}-${item.nomor}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <div className="rounded-2xl border p-4 transition-all hover:border-[rgba(201,163,90,0.3)]"
                         style={{ background: 'rgba(10,21,32,0.85)', borderColor: 'rgba(201,163,90,0.15)' }}>

                      {/* Badge perawi + nomor */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-cairo text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--gold-border)] text-[var(--gold)] bg-[var(--gold-pale)] uppercase tracking-wider">
                          {item.perawi === 'bukhari' ? 'Shahih Bukhari'
                            : item.perawi === 'muslim' ? 'Shahih Muslim'
                            : item.perawi === 'tirmidzi' ? 'Sunan Tirmidzi'
                            : item.perawi === 'abu-dawud' ? 'Sunan Abu Dawud'
                            : item.perawi === 'nasai' ? "Sunan Nasa'i"
                            : item.perawi === 'ibnu-majah' ? 'Sunan Ibnu Majah'
                            : item.perawi === 'ahmad' ? 'Musnad Ahmad'
                            : item.perawi === 'malik' ? "Muwatha' Malik"
                            : item.perawi}
                        </span>
                        <span className="font-cairo text-xs text-[var(--text3)]">No. {item.nomor}</span>
                      </div>

                      {/* Teks Arab singkat */}
                      <p className="font-amiri text-lg text-right leading-loose text-[var(--gold-light)] mb-2 line-clamp-2"
                         dir="rtl">
                        {item.arab}
                      </p>

                      {/* Intisari otomatis */}
                      {(() => {
                        const inti = ekstrakInti(item.terjemah)
                        return inti ? (
                          <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed italic mb-3 line-clamp-3">
                            &ldquo;{inti}&rdquo;
                          </p>
                        ) : null
                      })()}

                      {/* Link detail */}
                      <Link href={`/hadits/${item.perawi}/${item.nomor}`}
                         className="font-cairo text-xs font-bold text-[var(--teal-300)] hover:underline">
                        Lihat Detail →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}

              {hasMore && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="font-cairo px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                    style={{ 
                      background: "rgba(13,79,60,0.2)", 
                      border: "1px solid rgba(13,143,101,0.3)", 
                      color: "var(--teal-200)" 
                    }}
                  >
                    {loading ? "Memuat..." : "Muat 50 Lagi"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="font-cairo text-[var(--text3)] italic">Belum ada hadits untuk topik ini.</p>
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="mt-12 text-center flex justify-center">
          <BackButton label="Kembali ke Hadits Center" />
        </div>
      </div>
    </main>
  );
}
