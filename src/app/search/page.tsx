"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Telescope, Landmark, Dna, Waves, Brain, Scroll,
  Sparkles, BookOpenCheck, ArrowLeft, Quote, ChevronRight, Loader2,
  Atom
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────
interface EncyclopediaEntry {
  title: string;
  surah_reference: string;
  verse_arabic: string;
  verse_translation: string;
  modern_discovery: string;
  quranic_correlation: string;
  conclusion: string;
}

interface RandomWonder {
  title: string;
  surah: string;
  teaser: string;
}

type ViewState = "categories" | "topicList" | "articleDetail";

// ─── Category Definitions ───────────────────────────────────────
const CATEGORIES = [
  { key: "astronomi", apiKey: "Astronomi & Kosmologi", label: "Astronomi", emoji: "🔭", icon: Telescope, gradient: "from-indigo-500 to-violet-600", bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", headerGradient: "from-indigo-600 via-violet-600 to-purple-700" },
  { key: "biologi", apiKey: "Biologi & Embriologi Manusia", label: "Biologi Manusia", emoji: "🧬", icon: Dna, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", headerGradient: "from-emerald-600 via-teal-600 to-cyan-700" },
  { key: "geografi", apiKey: "Geografi & Oseanografi", label: "Geografi & Alam", emoji: "🌊", icon: Waves, gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", headerGradient: "from-cyan-600 via-blue-600 to-indigo-700" },
  { key: "sejarah", apiKey: "Sejarah Kaum Lampau", label: "Sejarah Kaum Lampau", emoji: "🏛️", icon: Landmark, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", headerGradient: "from-amber-600 via-orange-600 to-red-700" },
  { key: "penemu", href: "/ensiklopedia/penemu", apiKey: "Penemu Muslim", label: "Jejak Al-Qur'an di Alam Semesta", emoji: "💡", icon: Atom, gradient: "from-gold to-amber-600", bg: "bg-amber-50/50", border: "border-gold/30", text: "text-amber-700", headerGradient: "from-gold via-amber-500 to-orange-600" },
  { key: "psikologi", apiKey: "Psikologi Kognitif & Neurosains", label: "Psikologi Kognitif", emoji: "🧠", icon: Brain, gradient: "from-rose-500 to-pink-600", bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", headerGradient: "from-rose-600 via-pink-600 to-fuchsia-700" },
];

type CategoryType = (typeof CATEGORIES)[number];

// ─── Shimmer Component ──────────────────────────────────────────
function HeroShimmer() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800" />
      <div className="relative p-6 flex flex-col gap-3">
        {/* Label shimmer */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-white/20 animate-pulse" />
          <div className="h-3 w-28 rounded-full bg-white/20 animate-pulse" />
        </div>
        {/* Title shimmer */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-6 w-[85%] rounded-lg bg-white/15 animate-pulse" />
          <div className="h-6 w-[60%] rounded-lg bg-white/15 animate-pulse" />
        </div>
        {/* Teaser shimmer */}
        <div className="h-4 w-[70%] rounded-full bg-white/10 animate-pulse mt-1" />
        {/* Surah shimmer */}
        <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
        {/* Link shimmer */}
        <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse mt-1" />
      </div>
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

// ─── Page Transition Variants ───────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function EncyclopediaPage() {
  const [viewState, setViewState] = React.useState<ViewState>("categories");
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryType | null>(null);
  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);

  // AI-driven Hero state
  const [randomWonder, setRandomWonder] = React.useState<RandomWonder | null>(null);
  const [isHeroLoading, setIsHeroLoading] = React.useState(true);

  // Dynamic topic list state
  const [topicList, setTopicList] = React.useState<string[]>([]);
  const [isLoadingList, setIsLoadingList] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);

  // Article detail state
  const [isLoadingArticle, setIsLoadingArticle] = React.useState(false);
  const [entry, setEntry] = React.useState<EncyclopediaEntry | null>(null);
  const [articleError, setArticleError] = React.useState<string | null>(null);

  // ─── Fetch random wonder on mount ─────────────────────────────
  React.useEffect(() => {
    async function fetchRandomWonder() {
      setIsHeroLoading(true);
      try {
        const res = await fetch("/api/encyclopedia/random");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setRandomWonder(data);
      } catch (err) {
        console.error("Failed to fetch random wonder:", err);
        // Silently fail — hero just won't show
        setRandomWonder(null);
      } finally {
        setIsHeroLoading(false);
      }
    }
    fetchRandomWonder();
  }, []);

  const handleCategoryClick = async (cat: CategoryType) => {
    setSelectedCategory(cat);

    setViewState("topicList");
    setIsLoadingList(true);
    setListError(null);
    setTopicList([]);

    try {
      const res = await fetch("/api/encyclopedia/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat.apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopicList(data.topics || []);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Gagal memuat daftar topik.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleTopicClick = async (topic: string) => {
    setSelectedTopic(topic);
    setViewState("articleDetail");
    setIsLoadingArticle(true);
    setArticleError(null);
    setEntry(null);

    try {
      const res = await fetch("/api/encyclopedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicTitle: topic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEntry(data);
    } catch (err) {
      setArticleError(err instanceof Error ? err.message : "Gagal memuat artikel.");
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const handleHeroClick = () => {
    if (!randomWonder) return;
    // Use the first category as default for hero articles
    const defaultCat = CATEGORIES[0];
    setSelectedCategory(defaultCat);
    handleTopicClick(randomWonder.title);
  };

  const goBackToCategories = () => {
    setViewState("categories");
    setSelectedCategory(null);
    setTopicList([]);
  };

  const goBackToTopicList = () => {
    if (topicList.length === 0) {
      goBackToCategories();
      return;
    }
    setViewState("topicList");
    setEntry(null);
    setArticleError(null);
  };

  return (
    <main className="flex flex-col min-h-screen bg-page-warm pb-24 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40vh] bg-gradient-to-br from-primary/5 via-gold/5 to-transparent rounded-[100%] blur-3xl -z-10 pointer-events-none" />

      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/90 backdrop-blur-xl z-20 border-b gold-divider shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="w-7 h-7 text-gold" />
          <h1 className="text-2xl font-bold tracking-tight">Ensiklopedia Semesta</h1>
        </div>
      </header>

      {/* ─── Screen Views ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ═══ Screen 1: Category Grid ═══ */}
        {viewState === "categories" && (
          <motion.div
            key="categories"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="px-6 mt-6 flex flex-col gap-6"
          >
            {/* AI-Generated Hero Card */}
            {isHeroLoading ? (
              <HeroShimmer />
            ) : randomWonder ? (
              <motion.button
                onClick={handleHeroClick}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full rounded-3xl overflow-hidden text-left shadow-lg group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_70%)]" />
                <div className="absolute top-4 right-4 flex gap-1 opacity-40">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
                </div>
                <div className="relative p-6 flex flex-col gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    Keajaiban Saat Ini
                  </span>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {randomWonder.title}
                  </h2>
                  <p className="text-sm text-cyan-100/90 leading-relaxed">
                    {randomWonder.teaser}
                  </p>
                  <p className="text-xs text-cyan-200/70">{randomWonder.surah}</p>
                  <span className="mt-1 text-xs text-white/60 group-hover:text-white transition-colors">
                    Baca selengkapnya →
                  </span>
                </div>
              </motion.button>
            ) : null}

            {/* Category Grid */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wider uppercase">
                Jelajahi Kategori
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat, i) => {
                  const CategoryCard = (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      className={`relative flex flex-col items-start gap-2.5 p-4 rounded-2xl ${cat.bg} ${cat.border} border text-left shadow-sm hover:shadow-md transition-all group overflow-hidden w-full h-full`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/30 blur-2xl -mr-8 -mt-8 pointer-events-none" />
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shadow-sm`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-semibold ${cat.text}`}>
                        {cat.emoji} {cat.label}
                      </span>
                    </motion.div>
                  );

                  return "href" in cat && cat.href ? (
                    <Link href={cat.href} key={cat.key} className="w-full h-full block">
                      {CategoryCard}
                    </Link>
                  ) : (
                    <button key={cat.key} onClick={() => handleCategoryClick(cat)} className="text-left w-full h-full">
                      {CategoryCard}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Screen 2: Dynamic Topic List ═══ */}
        {viewState === "topicList" && selectedCategory && (
          <motion.div
            key="topicList"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${selectedCategory.headerGradient} px-6 py-5`}>
              <button
                onClick={goBackToCategories}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <selectedCategory.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedCategory.emoji} {selectedCategory.label}
                  </h2>
                  <p className="text-white/60 text-xs">
                    {isLoadingList ? "Memuat topik..." : `${topicList.length} topik ditemukan`}
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingList && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className={`w-8 h-8 ${selectedCategory.text} animate-spin`} />
                <p className="text-sm text-muted-foreground">AI sedang mengumpulkan topik menarik...</p>
              </div>
            )}

            {/* Error State */}
            {listError && (
              <div className="text-center py-16 px-6">
                <p className="text-red-500 text-sm mb-4">{listError}</p>
                <button
                  onClick={() => handleCategoryClick(selectedCategory)}
                  className="text-sm text-primary underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Topic List */}
            {!isLoadingList && !listError && topicList.length > 0 && (
              <div className="px-6 py-4 flex flex-col gap-2">
                {topicList.map((topic, i) => (
                  <motion.button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-between gap-3 p-4 rounded-2xl ${selectedCategory.bg} ${selectedCategory.border} border text-left hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedCategory.gradient} text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm`}>
                        {i + 1}
                      </div>
                      <span className={`text-sm font-medium ${selectedCategory.text} group-hover:underline`}>
                        {topic}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${selectedCategory.text} opacity-40 group-hover:opacity-100 flex-shrink-0 transition-opacity`} />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ Screen 3: Article Detail ═══ */}
        {viewState === "articleDetail" && selectedCategory && (
          <motion.div
            key="articleDetail"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Article Header Bar */}
            <div className={`bg-gradient-to-r ${selectedCategory.headerGradient} px-6 py-4`}>
              <button
                onClick={goBackToTopicList}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> {topicList.length === 0 ? "Kembali ke Beranda" : "Kembali ke Daftar Topik"}
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Loading — Book Opening Animation */}
              {isLoadingArticle && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 gap-5"
                >
                  <motion.div
                    animate={{ rotateY: [0, 180, 360] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center"
                  >
                    <BookOpenCheck className="w-8 h-8 text-gold" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground/70 mb-1">
                      Membuka lembaran ensiklopedia...
                    </p>
                    <p className="text-xs text-muted-foreground animate-pulse max-w-[250px]">
                      &ldquo;{selectedTopic}&rdquo;
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {articleError && (
                <div className="text-center py-20">
                  <p className="text-red-500 text-sm mb-4">{articleError}</p>
                  <button
                    onClick={() => selectedTopic && handleTopicClick(selectedTopic)}
                    className="text-sm text-primary underline"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {/* ─── Article Content ──────────────────────────── */}
              {entry && (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-6"
                >
                  {/* Title */}
                  <div>
                    <span className={`text-xs font-bold ${selectedCategory.text} tracking-wider uppercase`}>
                      {entry.surah_reference}
                    </span>
                    <h1 className="text-2xl font-bold text-foreground leading-snug mt-1">
                      {entry.title}
                    </h1>
                  </div>

                  {/* Quranic Verse Card */}
                  <div className="card-premium p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <p className="font-arabic text-2xl leading-[2.2] text-right text-foreground mb-4 relative z-10">
                      {entry.verse_arabic}
                    </p>
                    <div className="relative pl-4 border-l-2 border-gold/40">
                      <Quote className="w-4 h-4 text-gold/50 absolute -left-2 -top-0.5 bg-background" />
                      <p className="text-sm text-foreground/80 italic leading-relaxed">
                        &ldquo;{entry.verse_translation}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Modern Discovery Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedCategory.gradient} text-white flex items-center justify-center`}>
                        <Telescope className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">
                        Penemuan Modern
                      </h3>
                    </div>
                    <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {entry.modern_discovery}
                    </div>
                  </section>

                  {/* Quranic Correlation */}
                  <section className={`${selectedCategory.bg} ${selectedCategory.border} border rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Scroll className={`w-4 h-4 ${selectedCategory.text}`} />
                      <h3 className={`text-xs font-bold ${selectedCategory.text} tracking-wider uppercase`}>
                        Korelasi Al-Qur&apos;an
                      </h3>
                    </div>
                    <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {entry.quranic_correlation}
                    </div>
                  </section>

                  {/* Conclusion */}
                  <section className="bg-gradient-to-r from-gold/5 to-primary/5 rounded-2xl p-5 border border-gold/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <h3 className="text-xs font-bold text-gold tracking-wider uppercase">
                        Hikmah & Refleksi
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium italic">
                      {entry.conclusion}
                    </p>
                  </section>
                </motion.article>
              )}
            </div>
          </motion.div>
        )}

        {/* Remove Legacy Tab Penemu Muslim */}
      </AnimatePresence>

    </main>
  );
}
