-- ─────────────────────────────────────────────────────────────────
-- Migration: programme expiry (48 h live, deleted after 7 days)
--            + contact_submissions table
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────

-- 1. Add expires_at column to programs table
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Back-fill existing rows: treat them as expiring 48 h from now
UPDATE programs
SET expires_at = NOW() + INTERVAL '48 hours'
WHERE expires_at IS NULL;

-- ─────────────────────────────────────────────────────────────────
-- 2. Cleanup function: delete programmes that expired > 7 days ago
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_expired_programs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM programs
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Optional: schedule via pg_cron (enable pg_cron extension first if needed)
-- SELECT cron.schedule('delete-expired-programs', '0 3 * * *', 'SELECT delete_expired_programs()');

-- ─────────────────────────────────────────────────────────────────
-- 3. contact_submissions table
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  country     TEXT NOT NULL,
  province    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow anyone to INSERT (public contact form)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_insert" ON contact_submissions;
CREATE POLICY "allow_public_insert"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins (service role) can read submissions
DROP POLICY IF EXISTS "allow_admin_select" ON contact_submissions;
CREATE POLICY "allow_admin_select"
  ON contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );
