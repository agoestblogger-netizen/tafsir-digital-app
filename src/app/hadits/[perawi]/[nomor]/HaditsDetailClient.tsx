"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Hadits } from "@/lib/api/hadits";

interface PerawiInfo {
  id: string;
  name: string;
  arabName: string;
  available: number;
  level: string;
}

export default function HaditsDetailClient({
  hadits,
  perawiInfo,
  nomor,
}: {
  hadits: Hadits;
  perawiInfo: PerawiInfo;
  nomor: number;
}) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = `${hadits.arab}\n\n${hadits.id}\n\n(HR. ${perawiInfo.name} No. ${nomor})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${perawiInfo.name} No. ${nomor}`,
        text: `${hadits.id}\n\n(HR. ${perawiInfo.name} No. ${nomor})`,
        url: window.location.href,
      });
    }
  };

  return (
    <main className="flex flex-col min-h-screen pb-28 font-cairo">
      {/* ── Topbar ──────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(6,13,18,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,163,90,0.08)",
        }}
      >
        <button onClick={() => router.back()} className="text-lg" style={{ color: "var(--text2)" }}>←</button>
        <span className="font-cinzel text-sm font-bold flex-1" style={{ color: "var(--gold-light)" }}>Detail Hadits</span>
        <button onClick={handleCopy} className="text-sm px-2 py-1 rounded-lg transition-all" style={{ color: "var(--teal-200)", background: "rgba(13,79,60,0.15)" }}>
          {copied ? "✓ Disalin" : "📋"}
        </button>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto w-full flex flex-col gap-4">
        {/* ── Header info ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-2"
        >
          <div>
            <p className="font-cinzel text-xs font-bold" style={{ color: "var(--text2)" }}>{perawiInfo.name} · No. {nomor}</p>
          </div>
          <div className="flex gap-2">
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: "rgba(201,163,90,0.1)", border: "1px solid rgba(201,163,90,0.3)", color: "var(--gold-light)" }}
            >
              ✓ {perawiInfo.level}
            </span>
            {(perawiInfo.id === "bukhari" || perawiInfo.id === "muslim") && (
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(13,79,60,0.15)", border: "1px solid rgba(13,143,101,0.3)", color: "var(--teal-200)" }}
              >
                Muttafaq &apos;Alaih
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Teks Arab ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(10,21,32,0.85)", border: "1px solid rgba(201,163,90,0.15)" }}
        >
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "rgba(201,163,90,0.6)" }}>
            TEKS ARAB
          </p>
          <p
            className="font-amiri text-3xl text-right leading-loose"
            dir="rtl"
            style={{ color: "var(--gold-light)", fontFamily: "'Amiri', serif" }}
          >
            {hadits.arab}
          </p>
        </motion.div>

        {/* ── Transliterasi (jika tersedia dari API) ── */}
        {(hadits as { transliteration?: string }).transliteration && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl px-5 py-4"
            style={{ background: "rgba(13,79,60,0.1)", border: "1px solid rgba(13,143,101,0.15)" }}
          >
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "var(--teal-400)" }}>
              TRANSLITERASI
            </p>
            <p
              className="text-base md:text-lg italic text-right text-teal-400 leading-relaxed opacity-85"
              style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
            >
              {(hadits as { transliteration?: string }).transliteration}
            </p>
          </motion.div>
        )}

        {/* ── Divider ─────────────────────────── */}
        <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,163,90,0.25), transparent)" }} />

        {/* ── Terjemahan ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(13,143,101,0.12)" }}
        >
          <p className="text-sm font-bold tracking-widest mb-3" style={{ color: "var(--teal-300)" }}>
            TERJEMAHAN INDONESIA
          </p>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: "var(--text2)" }}>
            &ldquo;{hadits.id}&rdquo;
          </p>
        </motion.div>

        {/* ── Info Grid ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: "Perawi", value: perawiInfo.name },
            { label: "Nomor", value: `#${nomor}` },
            { label: "Derajat", value: perawiInfo.level, green: true },
            { label: "Total Kitab", value: `${perawiInfo.available.toLocaleString('id-ID')} hadits` },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.08)" }}
            >
              <span className="text-sm font-bold tracking-widest" style={{ color: "var(--text3)" }}>{item.label}</span>
              <span className="text-xl font-bold" style={{ color: item.green ? "var(--teal-200)" : "var(--text1)" }}>{item.value}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Actions ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-4 rounded-xl text-base md:text-lg font-bold transition-all"
            style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold)" }}
          >
            {copied ? "✓ Disalin" : "📋 Salin"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-4 rounded-xl text-base md:text-lg font-bold transition-all"
            style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(13,143,101,0.2)", color: "var(--teal-200)" }}
          >
            🔗 Bagikan
          </button>
        </motion.div>

        {/* ── Navigasi Hadits ─────────────────── */}
        <div className="flex items-center gap-3">
          {nomor > 1 && (
            <Link
              href={`/hadits/${perawiInfo.id}/${nomor - 1}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base md:text-lg font-bold transition-all"
              style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.1)", color: "var(--text2)" }}
            >
              ← No. {nomor - 1}
            </Link>
          )}
          {nomor < perawiInfo.available && (
            <Link
              href={`/hadits/${perawiInfo.id}/${nomor + 1}`}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base md:text-lg font-bold transition-all"
              style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.25)", color: "var(--teal-200)" }}
            >
              No. {nomor + 1} →
            </Link>
          )}
        </div>

        {/* ── Kembali ke Hadits Center ─────────── */}
        <Link
          href="/hadits"
          className="flex items-center justify-center gap-2 py-4 rounded-xl text-base md:text-lg font-bold transition-all"
          style={{ background: "rgba(201,163,90,0.05)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold)" }}
        >
          📜 Kembali ke Hadits Center
        </Link>

      </div>
    </main>
  );
}
