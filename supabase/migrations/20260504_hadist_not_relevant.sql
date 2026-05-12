-- Tambah kolom not_relevant untuk mencatat ayat tanpa hadits relevan
ALTER TABLE hadist_penguat
ADD COLUMN IF NOT EXISTS not_relevant BOOLEAN DEFAULT false;

-- Hapus semua data lama agar cache lama tidak mengganggu
DELETE FROM hadist_penguat;
