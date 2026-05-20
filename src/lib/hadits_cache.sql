CREATE TABLE IF NOT EXISTS hadits_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  perawi TEXT NOT NULL,
  nomor INTEGER NOT NULL,
  arab TEXT,
  terjemah TEXT,
  grade TEXT,
  resume TEXT,              -- AI generate, 2-3 kalimat inti
  penjelasan_ulama TEXT,    -- AI generate, whitelist ulama
  topik TEXT[],             -- array topik terkait
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(perawi, nomor)
);

ALTER TABLE hadits_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua bisa baca hadits cache" ON hadits_cache FOR SELECT USING (true);
CREATE POLICY "Service role bisa insert" ON hadits_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role bisa update" ON hadits_cache FOR UPDATE USING (true);
