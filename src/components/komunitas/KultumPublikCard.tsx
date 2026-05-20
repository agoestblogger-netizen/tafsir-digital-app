'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Bookmark, ArrowRight } from 'lucide-react';

interface KultumPublikCardProps {
  id: string;
  kultum_id: string;
  judul: string;
  tema: string;
  preview: string;
  durasi?: string | null;
  gaya?: string | null;
  like_count: number;
  created_at: string;
  isLoggedIn?: boolean;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });

  if (diffSecs < 60) return 'baru saja';
  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function KultumPublikCard({
  id,
  kultum_id,
  judul,
  tema,
  preview,
  durasi,
  gaya,
  like_count: initialLikeCount,
  created_at,
  isLoggedIn = false,
  initialLiked = false,
  initialBookmarked = false,
}: KultumPublikCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn || loadingLike) return;
    setLoadingLike(true);
    try {
      const res = await fetch('/api/komunitas/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kultum_publik_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.like_count);
      }
    } catch (err) {
      console.error('[KultumPublikCard] Like error:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn || loadingBookmark) return;
    setLoadingBookmark(true);
    try {
      const res = await fetch('/api/komunitas/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kultum_publik_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error('[KultumPublikCard] Bookmark error:', err);
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_4px_24px_rgba(201,163,90,0.12)]"
      style={{
        background: 'rgba(10,21,32,0.9)',
        border: '1px solid rgba(201,163,90,0.12)',
      }}
    >
      {/* Header strip */}
      <div
        className="px-5 pt-5 pb-3"
        style={{ borderBottom: '1px solid rgba(201,163,90,0.08)' }}
      >
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className="font-cairo text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{
              background: 'rgba(201,163,90,0.1)',
              border: '1px solid rgba(201,163,90,0.25)',
              color: 'var(--gold)',
            }}
          >
            {tema}
          </span>
          {durasi && (
            <span
              className="font-cairo text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(13,79,60,0.15)',
                border: '1px solid rgba(13,143,101,0.2)',
                color: 'var(--teal-200)',
              }}
            >
              ⏱ {durasi}
            </span>
          )}
          {gaya && (
            <span
              className="font-cairo text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text3)' }}
            >
              {gaya}
            </span>
          )}
        </div>

        {/* Judul */}
        <h3 className="font-cinzel text-base font-bold text-[var(--gold-light)] leading-snug mb-2 line-clamp-2">
          {judul}
        </h3>
      </div>

      {/* Preview */}
      <div className="px-5 py-4 flex-1">
        <p className="font-cairo text-sm text-[var(--text2)] leading-relaxed line-clamp-3">
          {preview}
        </p>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(201,163,90,0.08)' }}
      >
        {/* Relative time */}
        <span className="font-cairo text-xs text-[var(--text3)]">
          {getRelativeTime(created_at)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={!isLoggedIn || loadingLike}
            title={isLoggedIn ? (liked ? 'Batalkan like' : 'Like') : 'Login untuk like'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              liked
                ? { background: 'rgba(239,68,68,0.12)', color: '#f87171' }
                : { background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }
            }
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={liked ? 'currentColor' : 'none'}
            />
            <span className="font-cairo text-xs font-bold">{likeCount}</span>
          </button>

          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            disabled={!isLoggedIn || loadingBookmark}
            title={isLoggedIn ? (bookmarked ? 'Hapus bookmark' : 'Simpan') : 'Login untuk bookmark'}
            className="p-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              bookmarked
                ? { background: 'rgba(201,163,90,0.15)', color: 'var(--gold)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }
            }
          >
            <Bookmark
              className="w-3.5 h-3.5"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>

          {/* Baca link */}
          <Link
            href={`/kultum/hasil/${kultum_id}`}
            className="font-cairo flex items-center gap-1 text-xs font-bold ml-2 transition-colors"
            style={{ color: 'var(--teal-200)' }}
          >
            Baca <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
