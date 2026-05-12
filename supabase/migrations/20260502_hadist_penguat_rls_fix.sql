-- Hapus policy lama jika ada konflik
DROP POLICY IF EXISTS "Service role can insert hadist penguat" ON hadist_penguat;
DROP POLICY IF EXISTS "Anyone can read hadist penguat" ON hadist_penguat;
DROP POLICY IF EXISTS "Service role can update hadist penguat" ON hadist_penguat;

-- Buat ulang policy yang benar
CREATE POLICY "Enable read for all users"
  ON hadist_penguat FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON hadist_penguat FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"  
  ON hadist_penguat FOR UPDATE
  USING (true);
