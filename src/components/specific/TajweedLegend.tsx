"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronDown } from "lucide-react";

// ─── Data Kamus Warna Tajwid ────────────────────────────────
const TAJWEED_RULES = [
    {
        color: "#537FE7",
        name: "Mad Thabi'i",
        arabic: "مَدّ طَبِيعِي",
        desc: "Panjang biasa — 2 harakat",
    },
    {
        color: "#2DB67E",
        name: "Mad Jaiz Munfasil",
        arabic: "مَدّ جَائِز مُنفَصِل",
        desc: "Panjang boleh — 2, 4, atau 5 harakat",
    },
    {
        color: "#E74646",
        name: "Mad Wajib / Lazim",
        arabic: "مَدّ وَاجِب / لَازِم",
        desc: "Panjang wajib — 6 harakat",
    },
    {
        color: "#DD58D6",
        name: "Qalqalah",
        arabic: "قَلقَلَة",
        desc: "Pantulan/memantul pada huruf قطبجد",
    },
    {
        color: "#27AE60",
        name: "Ikhfa'",
        arabic: "إِخفَاء",
        desc: "Samar — antara izhar dan idgham",
    },
    {
        color: "#A6D0DD",
        name: "Idgham Bilaghunnah",
        arabic: "إِدغَام بِلَا غُنَّة",
        desc: "Melebur tanpa dengung",
    },
    {
        color: "#FF7B54",
        name: "Idgham Bighunnah",
        arabic: "إِدغَام بِغُنَّة",
        desc: "Melebur dengan dengung — 2 harakat",
    },
    {
        color: "#F5A623",
        name: "Ghunnah",
        arabic: "غُنَّة",
        desc: "Dengung ditahan — 2 harakat",
    },
    {
        color: "#9B59B6",
        name: "Iqlab",
        arabic: "إِقلَاب",
        desc: "Nun/tanwin berubah menjadi mim",
    },
    {
        color: "#95A5A6",
        name: "Hamzah Wasl",
        arabic: "هَمزَة وَصل",
        desc: "Alif sambung — tidak dibaca saat washal",
    },
] as const;

// ─── Komponen ─────────────────────────────────────────────────
export function TajweedLegend() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="w-full max-w-3xl mx-auto mb-4">
            {/* ── Trigger Button ──────────────────────────────────── */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                className="group w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border border-gold/30 bg-white/60 dark:bg-slate-800 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700 hover:border-gold/60 transition-all duration-200 shadow-sm"
            >
                <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.8} />
                    <span className="text-sm font-semibold text-foreground/80 dark:text-gray-200">
                        Panduan Warna Tajwid
                    </span>
                    {/* Pil warna kecil sebagai preview */}
                    <div className="hidden sm:flex items-center gap-1 ml-1">
                        {["#537FE7", "#E74646", "#DD58D6", "#27AE60", "#FF7B54"].map((c) => (
                            <span
                                key={c}
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0 opacity-80"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gold/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    strokeWidth={2}
                />
            </button>

            {/* ── Accordion Body ──────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="legend-body"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-4 rounded-2xl border border-gold/20 bg-white/70 dark:bg-slate-800 backdrop-blur-sm shadow-sm">
                            {/* Header */}
                            <p className="text-xs text-foreground/45 dark:text-gray-400 mb-3 font-medium tracking-wide uppercase">
                                Kamus Warna Al-Qur&apos;an (Rasm Uthmani Tajweed)
                            </p>

                            {/* Grid kamus warna */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {TAJWEED_RULES.map(({ color, name, arabic, desc }) => (
                                    <div
                                        key={name}
                                        className="flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-gold/5 transition-colors"
                                    >
                                        {/* Dot warna */}
                                        <span
                                            className="mt-0.5 w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm ring-1 ring-black/10"
                                            style={{ backgroundColor: color }}
                                        />
                                        {/* Teks */}
                                        <div className="min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-foreground/85 dark:text-gray-200 leading-snug">
                                                    {name}
                                                </span>
                                                <span
                                                    className="text-xs font-arabic leading-none"
                                                    style={{ color, direction: "rtl" }}
                                                >
                                                    {arabic}
                                                </span>
                                            </div>
                                            <p className="text-xs text-foreground/50 dark:text-gray-400 leading-snug mt-0.5">
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer note */}
                            <p className="mt-3 pt-3 border-t border-border/30 text-xs text-foreground/40 text-center">
                                Ketuk tiap kata Arab untuk mendengar pelafalannya
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
