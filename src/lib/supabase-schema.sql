-- Supabase Schema Prep for Quranic Life-Hacking

-- Users Table (Extended from Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  level_iman INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Surahs Library (If not using external API)
CREATE TABLE public.surahs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  arab TEXT NOT NULL,
  translation TEXT,
  revelation_type TEXT,
  total_verses INTEGER,
  pitch TEXT, -- Elevator pitch 1 paragraf
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ayat & Tafsir Data
CREATE TABLE public.verses (
  id SERIAL PRIMARY KEY,
  surah_id INTEGER REFERENCES public.surahs,
  verse_number INTEGER NOT NULL,
  text_arab TEXT NOT NULL,
  text_translation TEXT,
  tafsir_spiritual TEXT,
  tafsir_science TEXT,
  tafsir_history TEXT,
  action_items JSONB -- Array of strings for "Aksi Nyata Hari Ini"
);

-- Habit Trackers (Jalur Hijrah)
CREATE TABLE public.hijrah_programs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL, -- "Detox Ghibah"
  description TEXT,
  duration_days INTEGER DEFAULT 21,
  is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.user_hijrah_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles,
  program_id INTEGER REFERENCES public.hijrah_programs,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, completed, failed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_checkin TIMESTAMP WITH TIME ZONE
);

-- Ensiklopedia Semesta: Keajaiban Hari Ini (AI-generated daily)
CREATE TABLE public.daily_wonders (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  surah       TEXT NOT NULL,
  teaser      TEXT NOT NULL,
  full_article JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_wonders_created_at
  ON public.daily_wonders (created_at DESC);

-- Ensiklopedia Semesta: Artikel per Kategori (AI-generated daily via cron)
CREATE TABLE public.encyclopedia_articles (
  id           SERIAL PRIMARY KEY,
  category     TEXT NOT NULL,
  title        TEXT NOT NULL,
  teaser       TEXT,
  full_article JSONB,           -- NULL at first, filled on-demand when user clicks
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encyclopedia_articles_category
  ON public.encyclopedia_articles (category);
