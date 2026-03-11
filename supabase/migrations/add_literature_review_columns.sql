-- ============================================================
-- Migration: Arsitektur Tinjauan Pustaka (Literature Review)
-- Tambahkan kolom sumber akademis ke tabel encyclopedia_articles
-- ============================================================

-- Kolom referensi ayat (jika belum ada)
ALTER TABLE encyclopedia_articles
  ADD COLUMN IF NOT EXISTS surah_reference TEXT;

-- Kolom nama tokoh/ilmuwan yang membahas korelasi ini
ALTER TABLE encyclopedia_articles
  ADD COLUMN IF NOT EXISTS source_scholar TEXT;

-- Kolom judul buku/jurnal/karya referensi
ALTER TABLE encyclopedia_articles
  ADD COLUMN IF NOT EXISTS reference_book TEXT;

-- Tambahkan komentar untuk dokumentasi
COMMENT ON COLUMN encyclopedia_articles.surah_reference IS 'Referensi ayat Al-Qur''an, contoh: QS. Al-Anbiya: 30';
COMMENT ON COLUMN encyclopedia_articles.source_scholar IS 'Nama tokoh/ilmuwan yang membahas korelasi sains-Qur''an ini (contoh: Dr. Maurice Bucaille, Dr. Zaghloul El-Naggar)';
COMMENT ON COLUMN encyclopedia_articles.reference_book IS 'Judul buku/jurnal/karya tempat korelasi ini dibahas (contoh: The Bible, The Qur''an and Science)';
