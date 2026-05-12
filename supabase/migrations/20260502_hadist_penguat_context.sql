-- Add has_tafsir_context column to hadist_penguat table
-- Allows regeneration of old rows that were generated without tafsir context

ALTER TABLE hadist_penguat
  ADD COLUMN IF NOT EXISTS has_tafsir_context BOOLEAN DEFAULT false;
