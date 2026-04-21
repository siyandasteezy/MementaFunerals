-- Add siyandaedwana@gmail.com to admin_users
-- Run this in: Supabase Dashboard → SQL Editor → New query

INSERT INTO admin_users (user_id)
SELECT id
FROM auth.users
WHERE email = 'siyandaedwana@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify it worked
SELECT au.user_id, u.email, au.created_at
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id;
