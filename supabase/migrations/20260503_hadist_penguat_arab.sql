-- Tambahkan kolom arab untuk menyimpan teks Arab dari API Hadis
ALTER TABLE hadist_penguat
ADD COLUMN IF NOT EXISTS arab TEXT;
