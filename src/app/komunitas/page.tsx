'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, Filter, LogIn } from 'lucide-react';
import Link from 'next/link';
import { KultumPublikCard } from '@/components/komunitas/KultumPublikCard';
import { createClient } from '@/lib/supabase/client';



interface KultumPubilkItem {
  id: string;
  kultum_id: string;
  judul: string;
  tema: string;
  preview: string;
  durasi?: string | null;
  gaya?: string | null;
  like_count: number;
  created_at: string;
}

const TEMA_OPTIONS = [
  'Akhlak', 'Ibadah', 'Keluarga', 'Sosial', 'Motivasi', 'Momen', 'Sains', 'Kisah Al-Qur\'an'
];

// Skeleton card
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'rgba(10,21,32,0.9)', border: '1px solid rgba(201,163,90,0.08)' }}
    >
      <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(201,163,90,0.06)' }}>
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-6 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="h-5 rounded-lg w-5/6 mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-4 rounded-lg w-3/4" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="px-5 py-4">
        <div className="space-y-2">
          <div className="h-4 rounded-lg w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-4 rounded-lg w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-4 rounded-lg w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <div className="px-5 py-3 flex justify-between" style={{ borderTop: '1px solid rgba(201,163,90,0.06)' }}>
        <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </div>
  );
}

export default function KomunitasPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feed, setFeed] = useState<KultumPubilkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<'terbaru' | 'terpopuler'>('terbaru');
  const [temaFilter, setTemaFilter] = useState('');
  const [showTemaDropdown, setShowTemaDropdown] = useState(false);

  // Check login status
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const fetchFeed = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        filter,
      });
      if (temaFilter) params.set('tema', temaFilter);

      const res = await fetch(`/api/komunitas/feed?${params}`);
      const json = await res.json();

      if (isLoadMore) {
        setFeed(prev => [...prev, ...(json.data ?? [])]);
      } else {
        setFeed(json.data ?? []);
      }
      setHasMore(json.hasMore ?? false);
    } catch (err) {
      console.error('[Komunitas] Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, temaFilter]);

  useEffect(() => {
    setPage(1);
    fetchFeed(1, false);
  }, [fetchFeed, filter, temaFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  };

  return (
    <div className="min-h-screen pb-24 font-cairo">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 pt-10 pb-10"
        style={{ background: 'linear-gradient(145deg, var(--teal-900), var(--dark2))' }}
      >
        <div className="arabesque-bg opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 font-cairo text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(201,163,90,0.1)',
              border: '1px solid rgba(201,163,90,0.25)',
              color: 'var(--gold)',
            }}
          >
            <Users className="w-3.5 h-3.5" /> Komunitas Muslim Digital
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--gold-light)] mb-3"
          >
            Komunitas Kultum
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-cairo text-sm text-[var(--text2)] max-w-xl mx-auto"
          >
            Temukan, baca, dan bagikan kultum terbaik dari sesama Muslim. Berbagi ilmu adalah amal jariyah.
          </motion.p>

          {/* Login banner */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(10,21,32,0.7)',
                border: '1px solid rgba(201,163,90,0.2)',
              }}
            >
              <LogIn className="w-4 h-4 text-[var(--gold)]" />
              <span className="font-cairo text-sm text-[var(--text2)]">
                <Link href="/login" className="text-[var(--gold-light)] font-bold hover:underline">
                  Login
                </Link>{' '}
                untuk like, bookmark, dan berbagi kultum Anda.
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Filter bar */}
      <div
        className="sticky top-0 z-30 px-4 py-3"
        style={{
          background: 'rgba(6,13,18,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(201,163,90,0.08)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          {/* Filter chips */}
          <button
            onClick={() => setFilter('terbaru')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-cairo transition-all border"
            style={
              filter === 'terbaru'
                ? { background: 'rgba(13,79,60,0.3)', border: '1px solid rgba(13,143,101,0.4)', color: 'var(--teal-200)' }
                : { background: 'rgba(10,21,32,0.7)', border: '1px solid rgba(201,163,90,0.1)', color: 'var(--text2)' }
            }
          >
            <Clock className="w-3 h-3" /> Terbaru
          </button>
          <button
            onClick={() => setFilter('terpopuler')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-cairo transition-all border"
            style={
              filter === 'terpopuler'
                ? { background: 'rgba(13,79,60,0.3)', border: '1px solid rgba(13,143,101,0.4)', color: 'var(--teal-200)' }
                : { background: 'rgba(10,21,32,0.7)', border: '1px solid rgba(201,163,90,0.1)', color: 'var(--text2)' }
            }
          >
            <TrendingUp className="w-3 h-3" /> Terpopuler
          </button>

          {/* Tema dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemaDropdown(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-cairo transition-all border"
              style={
                temaFilter
                  ? { background: 'rgba(201,163,90,0.15)', border: '1px solid rgba(201,163,90,0.35)', color: 'var(--gold)' }
                  : { background: 'rgba(10,21,32,0.7)', border: '1px solid rgba(201,163,90,0.1)', color: 'var(--text2)' }
              }
            >
              <Filter className="w-3 h-3" />
              {temaFilter || 'Semua Tema'}
            </button>
            {showTemaDropdown && (
              <div
                className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden shadow-2xl min-w-[180px]"
                style={{
                  background: 'rgba(10,21,32,0.98)',
                  border: '1px solid rgba(201,163,90,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <button
                  onClick={() => { setTemaFilter(''); setShowTemaDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 font-cairo text-xs font-bold text-[var(--text2)] hover:bg-[var(--dark2)] transition-colors"
                >
                  Semua Tema
                </button>
                {TEMA_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTemaFilter(t); setShowTemaDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 font-cairo text-xs transition-colors"
                    style={{ color: temaFilter === t ? 'var(--gold)' : 'var(--text2)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {temaFilter && (
            <button
              onClick={() => setTemaFilter('')}
              className="font-cairo text-xs text-[var(--text3)] hover:text-[var(--text1)] transition-colors"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : feed.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: 'rgba(10,21,32,0.6)', border: '1px solid rgba(201,163,90,0.08)' }}
          >
            <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text3)]" />
            <h3 className="font-cinzel text-xl font-bold text-[var(--text1)] mb-2">Belum ada kultum</h3>
            <p className="font-cairo text-sm text-[var(--text2)] mb-6">
              {temaFilter
                ? `Belum ada kultum dengan tema "${temaFilter}".`
                : 'Jadilah yang pertama berbagi kultum!'}
            </p>
            {isLoggedIn && (
              <Link
                href="/kultum"
                className="font-cairo inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                  color: 'var(--dark)',
                  boxShadow: '0 4px 16px rgba(201,163,90,0.3)',
                }}
              >
                Buat Kultum Sekarang
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="font-cairo text-sm text-[var(--text2)] mb-6">
              Menampilkan{' '}
              <strong style={{ color: 'var(--teal-200)' }}>{feed.length}</strong> kultum
              {temaFilter && ` dengan tema "${temaFilter}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <KultumPublikCard
                    {...item}
                    isLoggedIn={isLoggedIn}
                  />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="font-cairo px-8 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(10,21,32,0.85)',
                    border: '1px solid rgba(201,163,90,0.2)',
                    color: 'var(--gold)',
                  }}
                >
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
