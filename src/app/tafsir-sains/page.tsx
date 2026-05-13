"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AYAT_SAINS, KategoriSains, AyatSains } from "@/data/sains_ayat";
import { KISAH_LIST } from "@/data/kaum_lampau_list";
import { KisahCard } from "@/components/quran/KisahCard";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Atom } from "lucide-react";

interface PenemuMuslim {
  id: string;
  nama_ilmuwan: string;
  julukan: string;
  bidang_ilmu: string;
  profil_singkat: string;
  No?: string | number;
  no?: string | number;
  ID?: string | number;
}

type FilterKey = "Semua" | KategoriSains;

const FILTER_ITEMS: { key: FilterKey; icon: string; label: string }[] = [
  { key: "Semua", icon: "🌐", label: "Semua" },
  { key: "Kosmologi", icon: "🌌", label: "Kosmologi" },
  { key: "Biologi & Embriologi", icon: "🧬", label: "Biologi & Embriologi" },
  { key: "Oseanografi", icon: "🌊", label: "Oseanografi" },
  { key: "Fisika & Astrofisika", icon: "⚛️", label: "Fisika & Astrofisika" },
  { key: "Kedokteran & Neurosains", icon: "🧠", label: "Kedokteran & Neurosains" },
  { key: "Zoologi", icon: "🐝", label: "Zoologi" },
  { key: "Geologi", icon: "🌍", label: "Geologi" },
];

function SainsCard({ item, index }: { item: AyatSains; index: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const firstPara = item.penjelasan.split('\n\n')[0];
  const shortDesc = firstPara.length > 120 ? firstPara.slice(0, 120) + "…" : firstPara;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: "rgba(10,21,32,0.9)",
        border: expanded ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(56,189,248,0.1)",
        boxShadow: expanded ? "0 4px 24px rgba(56,189,248,0.08)" : "0 2px 16px rgba(0,0,0,0.3)",
        transition: "border 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Header with Arabic */}
      <div
        className="relative p-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--teal-800), var(--teal-900))" }}
      >
        <div className="arabesque-bg opacity-30" />
        <p
          className="relative z-10 font-amiri text-xl text-right leading-loose line-clamp-2"
          style={{ color: "var(--gold-light)" }}
          dir="rtl"
        >
          {item.teks_arab}
        </p>
        <p className="relative z-10 font-cinzel text-xs mt-1" style={{ color: "rgba(201,163,90,0.6)" }}>
          QS. {item.surah_nama_latin} : {item.nomor_ayat}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <span
          className="self-start inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-cairo border"
          style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            color: "#38BDF8",
          }}
        >
          🔬 {item.kategori}
        </span>

        <p className="font-cairo font-bold text-sm" style={{ color: "var(--text1)" }}>
          {item.topik_sains}
        </p>

        <p className="font-cairo text-xs leading-relaxed flex-1" style={{ color: "var(--text2)" }}>
          {shortDesc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(201,163,90,0.08)" }}>
          <span className="text-xs font-cairo" style={{ color: "var(--text3)" }}>
            📹 {item.videos.length} video
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-cairo transition-all"
            style={expanded ? {
              background: "rgba(56,189,248,0.12)",
              border: "1px solid rgba(56,189,248,0.3)",
              color: "#38BDF8",
            } : {
              background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
              color: "var(--text1)",
              boxShadow: "0 2px 8px rgba(13,79,60,0.3)",
            }}
          >
            {expanded ? "Tutup ✕" : "Pelajari →"}
          </button>
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Divider */}
            <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(56,189,248,0.2), transparent)" }} />

            {/* Full explanation */}
            <div className="p-4" style={{ background: "rgba(6,13,18,0.6)" }}>
              <p className="text-xs font-bold font-cairo tracking-widest mb-3" style={{ color: "#38BDF8" }}>
                📝 PENJELASAN ILMIAH
              </p>
              <div className="flex flex-col gap-2">
                {item.penjelasan.split('\n\n').map((para, i) => (
                  <p key={i} className="text-xs font-cairo leading-relaxed" style={{ color: "var(--text2)" }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Videos */}
            {item.videos.length > 0 && (
              <>
                <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(56,189,248,0.15), transparent)" }} />
                <div className="p-4" style={{ background: "rgba(10,21,32,0.8)" }}>
                  <p className="text-xs font-bold font-cairo tracking-widest mb-3" style={{ color: "#38BDF8" }}>
                    📹 VIDEO PENJELASAN
                  </p>
                  <div className="flex flex-col gap-2">
                    {item.videos.map((video, idx) => (
                      <a
                        key={idx}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all group"
                        style={{
                          background: "rgba(14,30,42,0.8)",
                          border: "1px solid rgba(56,189,248,0.12)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.35)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.12)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(14,30,42,0.8)";
                        }}
                      >
                        <div className="w-14 h-10 rounded-lg bg-[#ff0000] flex items-center justify-center flex-shrink-0 text-white text-lg">
                          ▶
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-cairo line-clamp-2 leading-tight" style={{ color: "var(--text1)" }}>
                            {video.judul}
                          </p>
                          <p className="text-[10px] font-cairo mt-0.5" style={{ color: "var(--text3)" }}>
                            📺 {video.channel}
                          </p>
                          <span
                            className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-cairo"
                            style={{
                              background: "rgba(56,189,248,0.08)",
                              border: "1px solid rgba(56,189,248,0.2)",
                              color: "#38BDF8",
                            }}
                          >
                            {video.bahasa}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-cairo flex-shrink-0" style={{ color: "#38BDF8" }}>
                          Tonton →
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Link to surah */}
            <div
              className="p-3 border-t text-center"
              style={{ background: "rgba(14,30,42,0.6)", borderColor: "rgba(56,189,248,0.1)" }}
            >
              <a
                href={`/surah/${item.surah_id}#ayat-${item.nomor_ayat.split('-')[0]}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold font-cairo transition-colors"
                style={{ color: "var(--teal-300)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal-200)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal-300)")}
              >
                📖 Buka Ayat {item.nomor_ayat} di Surah {item.surah_nama_latin} →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TafsirSainsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialTab = searchParams.get("tab") === "tokoh" ? "tokoh" : searchParams.get("tab") === "sejarah" ? "sejarah" : "ayat";
  const [activeTab, setActiveTab] = React.useState<"ayat" | "tokoh" | "sejarah">(initialTab);
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("Semua");
  
  const [tokohData, setTokohData] = React.useState<PenemuMuslim[] | null>(null);
  const [tokohLoading, setTokohLoading] = React.useState(false);

  const [subKatSejarah, setSubKatSejarah] = React.useState<string>('semua');

  const filtered = activeFilter === "Semua"
    ? AYAT_SAINS
    : AYAT_SAINS.filter(a => a.kategori === activeFilter);

  const totalSurah = new Set(AYAT_SAINS.map(a => a.surah_id)).size;
  const totalKategori = new Set(AYAT_SAINS.map(a => a.kategori)).size;
  const totalVideo = AYAT_SAINS.reduce((acc, a) => acc + a.videos.length, 0);

  React.useEffect(() => {
    if (activeTab === "tokoh" && !tokohData) {
      setTokohLoading(true);
      fetch("/api/penemu-muslim")
        .then(res => res.json())
        .then(json => setTokohData(json.data))
        .catch(err => console.error("Gagal memuat tokoh:", err))
        .finally(() => setTokohLoading(false));
    }
  }, [activeTab, tokohData]);

  React.useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "tokoh") {
      setActiveTab("tokoh");
    } else if (tabParam === "sejarah") {
      setActiveTab("sejarah");
    }
  }, [searchParams]);

  React.useEffect(() => {
    const idParam = searchParams.get("id");
    if (activeTab === "tokoh" && idParam && tokohData) {
      setTimeout(() => {
        const el = document.getElementById(`tokoh-${idParam}`);
        if (el) {
          // Calculate offset to ensure header is not covering the card
          const y = el.getBoundingClientRect().top + window.scrollY - 150;
          window.scrollTo({ top: y, behavior: 'smooth' });
          
          el.style.transition = 'all 0.5s ease';
          el.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.4)';
          setTimeout(() => {
            el.style.boxShadow = '';
          }, 3000);
        }
      }, 500);
    }
  }, [activeTab, searchParams, tokohData]);

  return (
    <main className="flex flex-col min-h-screen pb-28">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 pt-8 pb-10"
        style={{ background: "linear-gradient(145deg, var(--teal-900), var(--dark2))" }}
      >
        <div className="arabesque-bg opacity-50" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-amiri text-3xl mb-2"
            style={{ color: "var(--gold-light)" }}
          >
            وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "var(--text1)" }}
          >
            Al-Qur&apos;an &amp; Ilmu Pengetahuan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-cairo text-sm mb-6"
            style={{ color: "var(--text2)" }}
          >
            Temukan mukjizat ilmiah dalam setiap ayat suci yang mendahului penemuan sains modern
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { n: AYAT_SAINS.length, label: "Ayat" },
              { n: totalSurah, label: "Surah" },
              { n: totalKategori, label: "Kategori" },
              { n: totalVideo, label: "Video" },
            ].map(stat => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-4 py-2 rounded-xl"
                style={{ background: "rgba(10,21,32,0.7)", border: "1px solid rgba(201,163,90,0.12)" }}
              >
                <span className="font-cinzel text-xl font-bold" style={{ color: "var(--gold-light)" }}>{stat.n}</span>
                <span className="font-cairo text-xs" style={{ color: "var(--text2)" }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Tabs switch */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-8 max-w-2xl mx-auto"
          >
            <div className="flex w-full rounded-2xl p-1" style={{ background: "rgba(6,13,18,0.6)", border: "1px solid rgba(201,163,90,0.15)" }}>
              <button
                onClick={() => { setActiveTab("ayat"); router.replace("?", { scroll: false }); }}
                className={`flex-1 py-2.5 text-sm font-bold font-cairo rounded-xl transition-all ${
                  activeTab === "ayat" 
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📖 Ayat Sains
              </button>
              <button
                onClick={() => { setActiveTab("tokoh"); router.replace("?tab=tokoh", { scroll: false }); }}
                className={`flex-1 py-2.5 text-sm font-bold font-cairo rounded-xl transition-all ${
                  activeTab === "tokoh" 
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                ✦ Tokoh Sains
              </button>
              <button
                onClick={() => { setActiveTab("sejarah"); router.replace("?tab=sejarah", { scroll: false }); }}
                className={`flex-1 py-2.5 text-sm font-bold font-cairo rounded-xl transition-all ${
                  activeTab === "sejarah" 
                    ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📜 Sejarah Kaum Lampau
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content based on tab */}
      {activeTab === "ayat" ? (
        <>
          {/* Filter chips */}
          <div
            className="sticky top-0 z-30 px-4 py-3"
            style={{
              background: "rgba(6,13,18,0.95)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(201,163,90,0.08)",
            }}
          >
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-5xl mx-auto" style={{ scrollbarWidth: "none" }}>
              {FILTER_ITEMS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-cairo border transition-all"
                  style={activeFilter === f.key ? {
                    background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))",
                    border: "1px solid var(--teal-400)",
                    color: "#E8F4EC",
                    boxShadow: "0 2px 10px rgba(13,79,60,0.4)",
                  } : {
                    background: "rgba(10,21,32,0.7)",
                    border: "1px solid rgba(201,163,90,0.1)",
                    color: "var(--text2)",
                  }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Ayat */}
          <div className="px-4 pt-6 max-w-5xl mx-auto w-full">
            <p className="font-cairo text-sm mb-4" style={{ color: "var(--text2)" }}>
              Menampilkan <strong style={{ color: "var(--teal-200)" }}>{filtered.length}</strong> ayat sains
              {activeFilter !== "Semua" && ` dalam kategori "${activeFilter}"`}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((item, i) => (
                  <SainsCard key={item.id} item={item} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      ) : activeTab === "tokoh" ? (
        /* Grid Tokoh Sains */
        <div className="px-4 pt-6 max-w-5xl mx-auto w-full">
          <p className="font-cairo text-sm mb-6" style={{ color: "var(--text2)" }}>
            Ilmuwan dan pemikir besar dalam peradaban Islam dan kaitannya dengan ayat-ayat alam semesta.
          </p>
          
          {tokohLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: "var(--teal-400)" }} />
              <p className="font-cairo text-sm" style={{ color: "var(--text3)" }}>Memuat tokoh sains...</p>
            </div>
          ) : !tokohData || tokohData.length === 0 ? (
            <div className="text-center py-10" style={{ color: "var(--text3)" }}>
              <p>Tidak ada data tokoh yang tersedia.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {tokohData.map((tokoh, idx) => {
                const match = tokoh.nama_ilmuwan.match(/^(.*?)\s*\((.*?)\)$/);
                const cleanName = match ? match[1].trim() : tokoh.nama_ilmuwan;
                const status = match ? match[2].trim() : null;
                const isMuslim = status?.toLowerCase() === "muslim";
                const safeId = tokoh.id || tokoh.No || tokoh.no || tokoh.ID;
                
                return (
                  <motion.div
                    key={safeId || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/ensiklopedia/penemu/${safeId}`}
                      id={`tokoh-${safeId}`}
                      className="flex flex-col gap-3 p-5 rounded-2xl h-full transition-all group relative overflow-hidden"
                      style={{ 
                        background: "rgba(10,21,32,0.85)", 
                        border: "1px solid rgba(201,163,90,0.15)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
                      }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500" style={{ background: "rgba(56,189,248,0.05)" }} />
                      
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--teal-600), var(--teal-500))" }}>
                          <Atom className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-cinzel text-lg font-bold leading-tight group-hover:text-teal-400 transition-colors line-clamp-2" style={{ color: "var(--text1)" }}>
                            {cleanName}
                          </h3>
                          {status && (
                            <span 
                              className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider font-cairo"
                              style={isMuslim 
                                ? { background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38BDF8" }
                                : { background: "rgba(201,163,90,0.1)", border: "1px solid rgba(201,163,90,0.2)", color: "var(--gold)" }
                              }
                            >
                              {status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative z-10 mt-auto pt-2 flex flex-col gap-1">
                        <p className="text-xs font-bold font-cairo" style={{ color: "var(--text3)" }}>
                          {tokoh.bidang_ilmu}
                        </p>
                        <p className="text-sm font-cairo leading-relaxed line-clamp-2" style={{ color: "var(--text2)" }}>
                          {tokoh.profil_singkat || tokoh.julukan}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      ) : (
        /* Tab Sejarah Kaum Lampau */
        <div className="px-4 pt-6 max-w-4xl mx-auto w-full">
          <p className="font-cairo text-sm mb-6 text-center" style={{ color: "var(--text2)" }}>
            Kisah dan jejak peninggalan kaum terdahulu yang disebutkan dalam Al-Qur&apos;an sebagai ibrah (pelajaran).
          </p>

          {/* Filter sub-kategori */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-start sm:justify-center" style={{ scrollbarWidth: "none" }}>
            {[
              { id: 'semua', label: 'Semua', icon: '🌍' },
              { id: 'kaum_diazab', label: 'Kaum Diazab', icon: '⚡' },
              { id: 'kisah_pilihan', label: 'Kisah Pilihan', icon: '⭐' },
              { id: 'kisah_nabi', label: 'Kisah Nabi', icon: '🌟' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setSubKatSejarah(tab.id)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold font-cairo transition-all border whitespace-nowrap"
                style={subKatSejarah === tab.id ? {
                  background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                  borderColor: "var(--gold-light)",
                  color: "var(--dark)",
                  boxShadow: "0 2px 10px rgba(201,163,90,0.4)",
                } : {
                  background: "rgba(10,21,32,0.7)",
                  borderColor: "rgba(201,163,90,0.1)",
                  color: "var(--text2)",
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Grid kisah */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {KISAH_LIST
                .filter(k => subKatSejarah === 'semua' || k.kategori === subKatSejarah)
                .map((kisah, idx) => (
                  <motion.div
                    key={kisah.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <KisahCard {...kisah} />
                  </motion.div>
                ))
              }
            </AnimatePresence>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TafsirSainsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center pb-28" style={{ background: "var(--dark)" }}>
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: "var(--gold)" }} />
        <p className="font-cairo text-sm font-bold" style={{ color: "var(--gold-light)" }}>Memuat Halaman Sains...</p>
      </div>
    }>
      <TafsirSainsContent />
    </React.Suspense>
  );
}
