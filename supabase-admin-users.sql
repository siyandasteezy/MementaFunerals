-- ─────────────────────────────────────────────────────────────────
-- Admin helper functions — run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- 1. List all users (name + email) — callable only by admins
CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS TABLE (
  user_id    UUID,
  email      TEXT,
  full_name  TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    u.id                                          AS user_id,
    u.email::TEXT                                 AS email,
    (u.raw_user_meta_data->>'full_name')::TEXT    AS full_name,
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 2. Add a new admin by user_id — callable only by existing admins
CREATE OR REPLACE FUNCTION add_admin_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only existing admins may promote others
  IF NOT EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Idempotent insert — silently succeeds if already an admin
  INSERT INTO admin_users (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;
