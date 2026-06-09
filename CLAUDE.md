# Tafsir Digital (Quranic Life Hacking v2)
Aplikasi web konten Islam komersial untuk Muslim Indonesia.

## Tech Stack
- Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion
- Supabase (pgvector), project ref: crrcijfzujegmeuaffvl
- OpenAI: gpt-4o-mini (generation), text-embedding-3-small (embedding)

## Database
- hadits_master: 39.309 hadits, kolom: id, nomor, perawi, kitab, bab, arab, matan, terjemah, topik_nama, tags, intisari, embedding vector(1536). Semua sudah punya topik_nama, intisari, embedding.
- RPC: match_hadits_master (HNSW index), bulk_label_hadits, bulk_intisari_hadits, bulk_embedding_hadits

## Aturan Kerja
- SELALU npx tsc --noEmit sebelum selesai
- Test localhost sebelum push
- Supabase query selalu pagination (default limit 1000)
- Pakai maybeSingle() bukan single()
- JANGAN hardcode API key (pakai process.env / os.environ)

## Git
- Branch main, repo agoestblogger-netizen/tafsir-digital-app
- Production tafsir-digital.vercel.app (auto-deploy dari main)
