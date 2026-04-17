-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status               text NOT NULL DEFAULT 'trial',
  trial_ends_at        timestamptz NOT NULL,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sub"   ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own sub" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Insert subscription"  ON subscriptions FOR INSERT WITH CHECK (true);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read self" ON admin_users FOR SELECT USING (auth.uid() = user_id);

-- Admin: read all subscriptions
CREATE POLICY "Admin read all subs" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Admin: read all programs
CREATE POLICY "Admin read all programs" ON programs FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
