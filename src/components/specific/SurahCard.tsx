"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export interface SurahProps {
  id: number;
  name: string;
  arab: string;
  translation: string;
  revelation: string;
  verses: number;
  pitch: string;
  hasSains?: boolean;
}

export function SurahCard({ surah }: { surah: SurahProps }) {
  return (
    <Link href={`/surah/${surah.id}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer group"
        style={{
          background: "rgba(10,21,32,0.9)",
          border: surah.hasSains
            ? "1px solid rgba(56,189,248,0.15)"
            : "1px solid rgba(201,163,90,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.border = surah.hasSains
            ? "1px solid rgba(56,189,248,0.35)"
            : "1px solid rgba(201,163,90,0.22)";
          (e.currentTarget as HTMLElement).style.boxShadow = surah.hasSains
            ? "0 4px 20px rgba(56,189,248,0.1)"
            : "0 4px 20px rgba(13,79,60,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.border = surah.hasSains
            ? "1px solid rgba(56,189,248,0.15)"
            : "1px solid rgba(201,163,90,0.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
        }}
      >
        {/* Gold left accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "linear-gradient(180deg, var(--teal-400), var(--teal-600))" }}
        />

        <div className="p-4 pl-5">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Surah number */}
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold font-cairo flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                  color: "var(--gold-light)",
                  boxShadow: "0 2px 8px rgba(13,79,60,0.4)",
                }}
              >
                {surah.id}
              </div>
              <div>
                <h3 className="font-bold text-base font-cairo leading-tight" style={{ color: "var(--text1)" }}>
                  {surah.name}
                </h3>
                <p className="text-xs font-cairo mt-0.5" style={{ color: "var(--text2)" }}>
                  {surah.translation}
                </p>
              </div>
            </div>

            {/* Arabic name */}
            <p
              className="font-amiri text-xl leading-none mt-1"
              style={{ color: "var(--gold-light)" }}
              dir="rtl"
            >
              {surah.arab}
            </p>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-cairo border"
              style={{
                background: "rgba(13,79,60,0.15)",
                border: "1px solid rgba(13,143,101,0.25)",
                color: "var(--teal-200)",
              }}
            >
              📖 {surah.verses} Ayat
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-cairo border"
              style={{
                background: "rgba(201,163,90,0.06)",
                border: "1px solid rgba(201,163,90,0.15)",
                color: "rgba(201,163,90,0.7)",
              }}
            >
              {surah.revelation}
            </span>
            {surah.hasSains && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-cairo border"
                style={{
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(56,189,248,0.25)",
                  color: "#38BDF8",
                }}
              >
                🔬 Sains
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
