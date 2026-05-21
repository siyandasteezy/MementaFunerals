-- ─────────────────────────────────────────────────────────────────
-- Payments history table — run in Supabase Dashboard → SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- ─────────────────────────────────────────────────────────────────

-- 1. Create the payments table
CREATE TABLE IF NOT EXISTS payments (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ozow_transaction_id  TEXT,
  ozow_transaction_ref TEXT,
  amount               NUMERIC(10, 2),
  months               INTEGER,
  status               TEXT        NOT NULL DEFAULT 'completed',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security — users can only see their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Admins (service role) can do everything — no extra policy needed
-- because service_role bypasses RLS automatically

-- 3. Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON payments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_ozow_ref
  ON payments (ozow_transaction_ref);
