-- ============================================================
-- Mementa — Supabase Setup
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Programs table
CREATE TABLE IF NOT EXISTS programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deceased_name   text NOT NULL,
  birth_year      text NOT NULL DEFAULT '',
  death_year      text NOT NULL DEFAULT '',
  event_date      text,
  event_location  text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  views           integer NOT NULL DEFAULT 0
);

-- 2. Row-Level Security
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Anyone can read any program (needed for public QR viewer)
CREATE POLICY "Public read" ON programs
  FOR SELECT USING (true);

-- Authenticated users can insert their own programs
CREATE POLICY "Authenticated insert" ON programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own programs
CREATE POLICY "Owner update" ON programs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own programs
CREATE POLICY "Owner delete" ON programs
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('programs', 'programs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'programs' AND auth.role() = 'authenticated'
  );

-- Allow anyone to read PDFs (public viewer)
CREATE POLICY "Public read PDFs" ON storage.objects
  FOR SELECT USING (bucket_id = 'programs');

-- Allow owners to delete their PDFs
CREATE POLICY "Owner delete PDF" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'programs' AND auth.uid()::text = (storage.foldername(name))[1]
  );
