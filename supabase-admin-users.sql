-- ─────────────────────────────────────────────────────────────────
-- Admin helper: fetch user names from auth.users
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS TABLE (
  user_id   UUID,
  email     TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as the function owner (has access to auth schema)
AS $$
BEGIN
  -- Only admins may call this
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
