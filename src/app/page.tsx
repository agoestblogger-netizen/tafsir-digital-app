"use client";

import * as React from "react";
import Link from "next/link";
import { User, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Feature {
  id: string;
  icon: string;
  name: string;
  desc: string;
  cta: string;
  href: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES: Feature[] = [
  { id: "kultum",  icon: "🎤", name: "Kultum AI",      href: "/kultum",       desc: "Generate kultum dari 10.000+ hadits & ayat Al-Qur'an dalam hitungan detik", cta: "Buat Kultum Sekarang →" },
  { id: "quran",   icon: "📖", name: "Al-Qur'an",      href: "/surah",        desc: "Baca, dengar & tafsir 6.236 ayat lengkap",                                   cta: "Buka Al-Qur'an →" },
  { id: "hadits",  icon: "📜", name: "Hadits Center",  href: "/hadits",       desc: "30K+ hadits, pencarian semantik AI",                                          cta: "Cari Hadits →" },
  { id: "doa",     icon: "🤲", name: "Doa Harian",     href: "/doa",          desc: "100+ doa Hisnul Muslim & Al-Qur'an",                                          cta: "Lihat Doa →" },
  { id: "sains",   icon: "🔬", name: "Sains Islam",    href: "/tafsir-sains", desc: "Mukjizat ilmiah Al-Qur'an & tokoh sains",                                     cta: "Jelajahi →" },
  { id: "hijrah",  icon: "🧭", name: "Jalur Hijrah",   href: "/hijrah",       desc: "Tracker perjalanan spiritual harianmu",                                        cta: "Mulai Hijrah →" },
];

const STORAGE_KEY = "quranic_hero_feature";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTodayDate() {
  return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Ayat placeholder (ganti dengan fetch Supabase jika ada) ──────────────────
const AYAT_HARI_INI = {
  text: "Sesungguhnya Allah bersama orang-orang yang sabar.",
  source: "QS. Al-Baqarah: 153",
};

// ── Edit Overlay ──────────────────────────────────────────────────────────────
function EditOverlay({
  current,
  onSave,
  onClose,
}: {
  current: string;
  onSave: (id: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = React.useState(current);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="w-full max-w-md rounded-t-3xl p-5 pb-8"
        style={{ background: "#0d1a14", border: "1px solid rgba(201,163,90,0.2)" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.15)" }} />

        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">Pilih Fitur Unggulan</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Fitur ini akan tampil besar di beranda kamu
        </p>

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {FEATURES.map((f) => {
            const isSelected = f.id === selected;
            return (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
                style={{
                  background: isSelected ? "rgba(201,163,90,0.12)" : "rgba(255,255,255,0.04)",
                  border: isSelected ? "1px solid rgba(201,163,90,0.5)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    background: isSelected ? "#C9A35A" : "transparent",
                    border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSave(selected)}
          className="w-full mt-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: "#C9A35A", color: "#000" }}
        >
          ✓ Simpan
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [userName, setUserName] = React.useState("Hamba Allah");
  const [heroId, setHeroId] = React.useState("kultum");
  const [showEdit, setShowEdit] = React.useState(false);

  // Load saved hero preference
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && FEATURES.find((f) => f.id === saved)) setHeroId(saved);
  }, []);

  // Fetch user
  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserName(user.email.split("@")[0]);
    };
    fetchUser();
  }, []);

  const handleSave = (id: string) => {
    setHeroId(id);
    localStorage.setItem(STORAGE_KEY, id);
    setShowEdit(false);
  };

  const hero = FEATURES.find((f) => f.id === heroId)!;
  const others = FEATURES.filter((f) => f.id !== heroId);

  return (
    <>
      <main
        className="flex flex-col min-h-screen pb-32 w-full relative"
        style={{ background: "linear-gradient(170deg, #060d12 0%, #0a1a14 60%, #060d12 100%)" }}
      >
        {/* BG grain */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="px-5 pt-5 pb-2 flex flex-col gap-0 relative z-10 max-w-lg mx-auto w-full">

          {/* ── TOP BAR ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border transition-all group-hover:border-emerald-500/60"
                style={{ background: "rgba(16,56,36,0.6)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="leading-none">
                <p className="text-[10px] font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Assalamu&apos;alaikum
                </p>
                <p className="text-sm font-semibold text-white capitalize">{userName}</p>
              </div>
            </Link>
          </div>

          {/* ── GREETING ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-4"
          >
            <div>
              <p className="text-base font-semibold text-white">Assalamu&apos;alaikum 👋</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{getTodayDate()}</p>
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-105 active:scale-95"
              style={{
                background: "rgba(201,163,90,0.08)",
                border: "0.5px solid rgba(201,163,90,0.35)",
                color: "rgba(201,163,90,0.8)",
              }}
            >
              <Pencil className="w-2.5 h-2.5" />
              Atur Beranda
            </button>
          </motion.div>

          {/* ── AYAT HARI INI ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-2xl p-4 mb-5"
            style={{
              background: "rgba(201,163,90,0.07)",
              border: "0.5px solid rgba(201,163,90,0.22)",
            }}
          >
            <p
              className="text-[9px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: "rgba(201,163,90,0.6)" }}
            >
              ✨ Ayat Hari Ini
            </p>
            <p className="text-sm italic leading-relaxed mb-1.5" style={{ color: "rgba(255,255,255,0.78)" }}>
              &ldquo;{AYAT_HARI_INI.text}&rdquo;
            </p>
            <p className="text-[10px]" style={{ color: "rgba(201,163,90,0.55)" }}>{AYAT_HARI_INI.source}</p>
          </motion.div>

          {/* ── SECTION: FITUR UNGGULAN ───────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[9px] font-semibold tracking-widest uppercase mb-2.5"
            style={{ color: "rgba(201,163,90,0.6)" }}
          >
            Fitur Unggulan
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={heroId}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <Link
                href={hero.href}
                className="flex items-center gap-4 rounded-2xl p-4 mb-5 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                style={{
                  background: "rgba(201,163,90,0.07)",
                  border: "1px solid rgba(201,163,90,0.22)",
                }}
              >
                <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {hero.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white mb-1">{hero.name}</p>
                  <p className="text-xs leading-relaxed mb-2.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {hero.desc}
                  </p>
                  <span
                    className="inline-block text-[10px] px-3 py-1 rounded-full"
                    style={{
                      border: "0.5px solid rgba(201,163,90,0.4)",
                      color: "#C9A35A",
                    }}
                  >
                    {hero.cta}
                  </span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* ── SECTION: FITUR LAINNYA ────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[9px] font-semibold tracking-widest uppercase mb-2.5"
            style={{ color: "rgba(201,163,90,0.6)" }}
          >
            Fitur Lainnya
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {others.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.05 }}
              >
                <Link
                  href={f.href}
                  className="flex flex-col rounded-2xl p-3 h-full transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "0.5px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <span className="text-xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">
                    {f.icon}
                  </span>
                  <p className="text-xs font-semibold text-white mb-1">{f.name}</p>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
                    {f.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </main>

      {/* ── EDIT OVERLAY ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEdit && (
          <EditOverlay
            current={heroId}
            onSave={handleSave}
            onClose={() => setShowEdit(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
