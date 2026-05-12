"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { AyatSains, VideoYoutube } from "@/data/sains_ayat";

const KATEGORI_ICON: Record<string, string> = {
  'Kosmologi': '🌌',
  'Biologi & Embriologi': '🧬',
  'Oseanografi': '🌊',
  'Fisika & Astrofisika': '⚛️',
  'Kedokteran & Neurosains': '🧠',
  'Zoologi': '🐝',
  'Geologi': '🌍',
};

function YouTubeCard({ video }: { video: VideoYoutube }) {
  const BAHASA_COLOR: Record<string, string> = {
    Indonesia: 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.25)] text-[#22c55e]',
    English: 'bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.25)] text-[#38BDF8]',
    Arab: 'bg-[rgba(201,163,90,0.1)] border-[rgba(201,163,90,0.25)] text-[#C9A35A]',
  };

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-xl border border-[rgba(56,189,248,0.12)] bg-[rgba(56,189,248,0.04)] hover:border-[rgba(56,189,248,0.3)] hover:bg-[rgba(56,189,248,0.08)] transition-all group"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-14 rounded-lg bg-[#ff0000] flex items-center justify-center shadow">
        <span className="text-white text-2xl">▶</span>
      </div>
      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-sm font-bold text-[#E8F4EC] font-cairo leading-snug line-clamp-2 group-hover:text-[#38BDF8] transition-colors">
          {video.judul}
        </p>
        <p className="text-xs text-[#4a6a5a] font-cairo">{video.channel}</p>
        <p className="text-[9px] text-[#4a6a5a] font-cairo italic">Membuka pencarian YouTube</p>
        <span className={`inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-bold border font-cairo ${BAHASA_COLOR[video.bahasa]}`}>
          {video.bahasa}
        </span>
      </div>
      <div className="text-[#38BDF8] text-xs font-bold flex-shrink-0 whitespace-nowrap self-center">
        🔍 Cari →
      </div>
    </a>
  );
}

interface SciencePanelProps {
  data: AyatSains;
  onClose: () => void;
}

export function SciencePanel({ data, onClose }: SciencePanelProps) {
  const icon = KATEGORI_ICON[data.kategori] ?? '🔬';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 rounded-xl border border-[rgba(56,189,248,0.2)] overflow-hidden"
      style={{ background: "rgba(10,21,32,0.95)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-[rgba(56,189,248,0.1)]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-[#38BDF8] font-bold font-cairo tracking-wider uppercase">{data.kategori}</p>
            <p className="text-sm font-bold text-[#E8F4EC] font-cairo leading-snug">{data.topik_sains}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="ml-2 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-[rgba(56,189,248,0.08)] hover:bg-[rgba(56,189,248,0.2)] text-[#38BDF8] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        {/* Penjelasan */}
        <div className="flex flex-col gap-2">
          {data.penjelasan.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm text-[#8BAAA0] font-cairo leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,163,90,0.2)] to-transparent" />

        {/* Videos */}
        {data.videos.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#38BDF8] font-cairo tracking-wider">📹 VIDEO PENJELASAN</p>
            <div className="flex flex-col gap-2">
              {data.videos.map((v, i) => (
                <YouTubeCard key={i} video={v} />
              ))}
            </div>
          </div>
        )}

        {/* Link to surah with hash anchor */}
        <a
          href={`/surah/${data.surah_id}#ayat-${data.nomor_ayat.split('-')[0]}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold font-cairo transition-all border mt-1"
          style={{
            background: 'rgba(13,79,60,0.15)',
            border: '1px solid rgba(13,143,101,0.25)',
            color: 'var(--teal-200)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,79,60,0.3)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,79,60,0.15)'; }}
        >
          📖 Baca Ayat {data.nomor_ayat} di Surah {data.surah_nama_latin} →
        </a>
      </div>
    </motion.div>
  );
}
