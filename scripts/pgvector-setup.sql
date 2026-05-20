-- Aktifkan ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tambah kolom embedding ke ayat_quran_index
ALTER TABLE ayat_quran_index 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Buat HNSW index untuk similarity search yang cepat
CREATE INDEX IF NOT EXISTS ayat_embedding_idx 
ON ayat_quran_index 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Verifikasi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ayat_quran_index' 
AND column_name = 'embedding';

-- Buat Supabase RPC function untuk similarity search
CREATE OR REPLACE FUNCTION match_ayat_quran(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  surah_id int,
  surah_nama text,
  nomor_ayat int,
  teks_arab text,
  teks_latin text,
  terjemah text,
  tags text[],
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    surah_id,
    surah_nama,
    nomor_ayat,
    teks_arab,
    teks_latin,
    terjemah,
    tags,
    1 - (embedding <=> query_embedding) AS similarity
  FROM ayat_quran_index
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
