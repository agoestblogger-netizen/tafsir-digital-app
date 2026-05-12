CREATE TABLE kaum_lampau (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  nama_arab TEXT,
  kategori TEXT NOT NULL,
  -- 'kaum_diazab' | 'kisah_pilihan' | 'kisah_nabi'
  periode TEXT,
  lokasi TEXT,
  nabi_diutus TEXT,
  ringkasan TEXT NOT NULL,
  latar_belakang TEXT,
  kondisi_kaum TEXT,
  kisah_lengkap TEXT NOT NULL,
  azab_atau_kejadian TEXT,
  pelajaran TEXT NOT NULL,
  ayat_utama JSONB DEFAULT '[]',
  -- [{surah_id, surah_nama, nomor_ayat, teks_arab, terjemah, link}]
  semua_surah JSONB DEFAULT '[]',
  -- [{surah_id, surah_nama, ayat_range, konteks}]
  referensi TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kaum_lampau_slug ON kaum_lampau(slug);
CREATE INDEX idx_kaum_lampau_kategori ON kaum_lampau(kategori);

ALTER TABLE kaum_lampau ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kaum lampau"
  ON kaum_lampau FOR SELECT USING (true);

CREATE POLICY "Service role can insert kaum lampau"
  ON kaum_lampau FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update kaum lampau"
  ON kaum_lampau FOR UPDATE USING (true);
