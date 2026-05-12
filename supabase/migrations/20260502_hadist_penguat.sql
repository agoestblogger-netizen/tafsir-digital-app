-- Migration: hadist_penguat table
-- Generate-once, cache-forever pattern for AI-generated hadist penguat per ayat

CREATE TABLE IF NOT EXISTS hadist_penguat (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_id      INTEGER      NOT NULL,
  ayat_number   INTEGER      NOT NULL,
  teks_hadist   TEXT         NOT NULL,
  referensi_lengkap TEXT,                    -- "(HR. Bukhari No. 6018, Muslim No. 47)"
  perawi        TEXT,                        -- primary slug: 'bukhari'
  perawi_name   TEXT,                        -- "Shahih Bukhari"
  nomor_hadits  INTEGER,                     -- primary nomor
  all_refs      JSONB,                       -- full ParsedHaditsRef[] array as JSON
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (surah_id, ayat_number)
);

-- Fast lookup by surah + ayat
CREATE INDEX IF NOT EXISTS idx_hadist_penguat_surah_ayat
  ON hadist_penguat (surah_id, ayat_number);

-- RLS: public read, service-role write
ALTER TABLE hadist_penguat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hadist penguat"
  ON hadist_penguat FOR SELECT USING (true);

CREATE POLICY "Service role can insert hadist penguat"
  ON hadist_penguat FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update hadist penguat"
  ON hadist_penguat FOR UPDATE USING (true);
