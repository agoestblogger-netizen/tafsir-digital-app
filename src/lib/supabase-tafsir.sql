-- =============================================
-- Supabase Schema: tafsir_cache (v2 — with tafsir_kemenag)
-- =============================================
-- Jalankan SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- Jika tabel sudah ada dari v1, jalankan ALTER TABLE di bagian bawah.

CREATE TABLE IF NOT EXISTS public.tafsir_cache (
  id                    SERIAL PRIMARY KEY,
  surah_number          INTEGER NOT NULL,
  verse_number          INTEGER NOT NULL,
  tafsir_kemenag        TEXT,
  asbabun_nuzul         TEXT,
  perspektif_sains      TEXT,
  perspektif_psikologi  TEXT,
  perspektif_sosial     TEXT,
  hadith                TEXT,
  todo_list             JSONB,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(surah_number, verse_number)
);

CREATE INDEX IF NOT EXISTS idx_tafsir_cache_lookup
  ON public.tafsir_cache (surah_number, verse_number);

-- ─── MIGRATION: Jika tabel v1 sudah ada ─────────────────────────
-- Jalankan query berikut jika tabel sudah dibuat sebelumnya tanpa kolom tafsir_kemenag:
-- ALTER TABLE public.tafsir_cache ADD COLUMN IF NOT EXISTS tafsir_kemenag TEXT;
