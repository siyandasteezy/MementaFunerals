-- ─────────────────────────────────────────────────────────────────
-- Ozow payment integration — run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. Add Ozow columns to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS ozow_transaction_ref TEXT,
  ADD COLUMN IF NOT EXISTS ozow_transaction_id  TEXT;

-- 2. Allow 'pending_payment' as a valid status
--    (if you used a CHECK constraint, update it; otherwise this is a no-op)
-- ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
-- ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
--   CHECK (status IN ('trial','active','expired','cancelled','pending_payment'));

-- 3. Index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_ozow_ref
  ON subscriptions (ozow_transaction_ref);
