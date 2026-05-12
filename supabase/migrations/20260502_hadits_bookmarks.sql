-- Migration: add hadits bookmarks table
CREATE TABLE IF NOT EXISTS hadits_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  perawi TEXT NOT NULL,
  nomor_hadits INTEGER NOT NULL,
  arab_preview TEXT,
  terjemah_preview TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, perawi, nomor_hadits)
);

ALTER TABLE hadits_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hadits bookmarks"
ON hadits_bookmarks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
