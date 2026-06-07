"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Hadits } from "@/lib/api/hadits";
import { BackButton } from "@/components/ui/BackButton";

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
  kitab,
  bab,
}: {
  hadits: Hadits;
  perawiInfo: PerawiInfo;
  nomor: number;
  kitab?: string;
  bab?: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [resume, setResume] = React.useState<string | null>(null);
  const [loadingResume, setLoadingResume] = React.useState(false);
  const [penjelasan, setPenjelasan] = React.useState<string | null>(null);
  const [loadingPenjelasan, setLoadingPenjelasan] = React.useState(false);
  const [showPenjelasan, setShowPenjelasan] = React.useState(false);


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

  React.useEffect(() => {
    setLoadingResume(true)
    fetch('/api/hadits-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        perawi: perawiInfo.id,
        nomor,
        arab: hadits.arab,
        terjemah: hadits.id,
        mode: 'resume',
      }),
    })
      .then(async r => {
        if (!r.ok) {
          const err = await r.text()
          console.error('hadits-ai error:', r.status, err)
          return null
        }
        return r.json()
      })
      .then(json => {
        console.log('hadits-ai response:', json)
        if (json?.result) setResume(json.result)
      })
      .catch(err => console.error('fetch error:', err))
      .finally(() => setLoadingResume(false))
  }, [perawiInfo.id, nomor, hadits.arab, hadits.id])



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
        <BackButton label="" />
        <span className="font-cinzel text-xl font-bold flex-1 text-[var(--gold-light)] ml-2">Detail Hadits</span>
        <button onClick={handleCopy} className="font-cairo text-sm font-bold px-2 py-1 rounded-lg transition-all" style={{ color: "var(--teal-200)", background: "rgba(13,79,60,0.15)" }}>
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
            <p className="font-cinzel text-base md:text-lg font-bold text-[var(--text1)]">{perawiInfo.name}{nomor <= 5000 ? ` · No. ${nomor}` : ''}</p>

          </div>
          <div className="flex gap-2">
            <span
              className="font-cairo text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full"
              style={{ background: "rgba(201,163,90,0.1)", border: "1px solid rgba(201,163,90,0.3)", color: "var(--gold-light)" }}
            >
              ✓ {perawiInfo.level}
            </span>
            {(perawiInfo.id === "bukhari" || perawiInfo.id === "muslim") && (
              <span
                className="font-cairo text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(13,79,60,0.15)", border: "1px solid rgba(13,143,101,0.3)", color: "var(--teal-200)" }}
              >
                Muttafaq &apos;Alaih
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Resume AI ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <p className="font-cairo text-xs uppercase tracking-widest font-bold mb-3 text-[var(--teal-300)]">
            ✦ INTISARI HADITS
          </p>
          {loadingResume ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-3 rounded w-3/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          ) : resume ? (
            <p className="font-cairo text-base leading-relaxed text-[var(--text1)]">
              {resume}
            </p>
          ) : (
            <p className="font-cairo text-sm text-[var(--text3)] italic">
              Intisari tidak tersedia
            </p>
          )}
        </motion.div>


        {/* ── Teks Arab ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: "rgba(10,21,32,0.85)", border: "1px solid rgba(201,163,90,0.15)" }}
        >
          <p className="font-cairo text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "rgba(201,163,90,0.6)" }}>
            TEKS ARAB
          </p>
          <p
            className="font-amiri text-2xl md:text-3xl text-right leading-loose text-[var(--gold-light)]"
            dir="rtl"
            style={{ direction: 'rtl' }}
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
            <p className="font-cairo text-xs uppercase tracking-widest font-bold mb-2" style={{ color: "var(--teal-400)" }}>
              TRANSLITERASI
            </p>
            <p
              className="font-cairo text-sm italic text-right text-[var(--teal-200)] leading-relaxed"
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
          <p className="font-cairo text-xs uppercase tracking-widest font-bold mb-3" style={{ color: "var(--teal-300)" }}>
            TERJEMAHAN INDONESIA
          </p>
          <p className="font-cairo text-base leading-relaxed text-[var(--text1)]">
            &ldquo;{hadits.id}&rdquo;
          </p>
        </motion.div>

        {/* ── Penjelasan Ulama ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            onClick={async () => {
              setShowPenjelasan(!showPenjelasan)
              if (!penjelasan && !loadingPenjelasan) {
                setLoadingPenjelasan(true)
                try {
                  const res = await fetch('/api/hadits-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      perawi: perawiInfo.id,
                      nomor,
                      arab: hadits.arab,
                      terjemah: hadits.id,
                      mode: 'penjelasan',
                    }),
                  })
                  const json = await res.json()
                  setPenjelasan(json.result)
                } catch {
                  setPenjelasan(null)
                } finally {
                  setLoadingPenjelasan(false)
                }
              }
            }}
            className="w-full font-cairo text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-all"
            style={{
              background: showPenjelasan ? 'rgba(201,163,90,0.08)' : 'rgba(10,21,32,0.7)',
              border: '1px solid rgba(201,163,90,0.15)',
              color: 'var(--gold)',
            }}
          >
            <span>📚 Penjelasan Ulama</span>
            <span>{showPenjelasan ? '▲' : '▼'}</span>
          </button>

          {showPenjelasan && (
            <div
              className="mt-2 rounded-2xl p-5"
              style={{ background: "rgba(10,21,32,0.85)", border: "1px solid rgba(201,163,90,0.15)" }}
            >
              {/* Disclaimer WAJIB */}
              <div
                className="rounded-xl p-3 mb-4"
                style={{ background: 'rgba(201,163,90,0.08)', border: '1px solid rgba(201,163,90,0.2)' }}
              >
                <p className="font-cairo text-xs text-[var(--gold)] leading-relaxed">
                  ⚠️ <strong>Catatan:</strong> Penjelasan ini adalah rangkuman AI berdasarkan kitab-kitab syarah hadits.
                  Bukan kutipan langsung. Untuk rujukan akademis dan fatwa, konsultasikan dengan ulama atau lembaga resmi.
                </p>
              </div>

              {loadingPenjelasan ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-1">
                      <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                  ))}
                </div>
              ) : penjelasan ? (
                <div className="space-y-3">
                  {penjelasan.split('\n\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="font-cairo text-sm leading-relaxed text-[var(--text1)]">
                      {p}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="font-cairo text-sm text-[var(--text3)] italic text-center">
                  Penjelasan tidak tersedia
                </p>
              )}
            </div>
          )}
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
            { label: "Nomor", value: nomor > 5000 ? '-' : `#${nomor}` },
            { label: "Derajat", value: perawiInfo.level, green: true },
            { label: "Total Kitab", value: `${perawiInfo.available.toLocaleString('id-ID')} hadits` },
            ...(kitab ? [{ label: "Kitab", value: kitab }] : []),
            ...(bab ? [{ label: "Bab", value: bab }] : []),
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.08)" }}
            >
              <span className="font-cairo text-xs uppercase tracking-widest text-[var(--text3)]">{item.label}</span>
              <span className="font-cairo text-sm font-bold" style={{ color: item.green ? "var(--teal-200)" : "var(--text1)" }}>{item.value}</span>
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
            className="font-cairo flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
            style={{ background: "rgba(10,21,32,0.8)", border: "1px solid rgba(201,163,90,0.15)", color: "var(--gold)" }}
          >
            {copied ? "✓ Disalin" : "📋 Salin"}
          </button>
          <button
            onClick={handleShare}
            className="font-cairo flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
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
              className="font-cairo flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.1)", color: "var(--text2)" }}
            >
              ← No. {nomor - 1}
            </Link>
          )}
          {nomor < perawiInfo.available && (
            <Link
              href={`/hadits/${perawiInfo.id}/${nomor + 1}`}
              className="font-cairo flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(13,79,60,0.2)", border: "1px solid rgba(13,143,101,0.25)", color: "var(--teal-200)" }}
            >
              No. {nomor + 1} →
            </Link>
          )}
        </div>

        {/* ── Kembali ke Hadits Center ─────────── */}
        <div className="flex justify-center">
          <BackButton label="Kembali ke Daftar Hadits" />
        </div>

      </div>
    </main>
  );
}
