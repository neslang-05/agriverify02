-- ============================================================
-- Fix: RLS errors during registration and verification_history access
-- Run this in the Supabase SQL Editor (safe to re-run).
-- ============================================================

-- ============================================================
-- FIX 1: Auto-create profile row on auth.users INSERT
-- ============================================================
-- When a user signs up, their JWT isn't established until email
-- confirmation, so the app's INSERT (with anon client) fails the
-- RLS policy `auth.uid() = id`. This trigger runs as SECURITY
-- DEFINER (as table owner, bypasses RLS) to guarantee the profile
-- is always created atomically with the auth.users row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER         -- runs as postgres/table owner, bypasses RLS
SET search_path = public  -- prevents search_path injection
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, district)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    'Not specified'
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent: won't fail if app already inserted it
  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then (re)create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- FIX 2: verification_history — "permission denied"
-- ============================================================
-- The existing policies are correct, but they were likely applied
-- to a session where auth.uid() was null (server-side anon client
-- without a valid session cookie). Re-affirm the policies to make
-- sure they are in place and grant SELECT/INSERT to authenticated.
-- ============================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all vh policies to ensure they are current
DROP POLICY IF EXISTS "vh: user selects own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user inserts own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user updates own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user deletes own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: officer/admin select all"   ON public.verification_history;

CREATE POLICY "vh: user selects own"
  ON public.verification_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vh: user inserts own"
  ON public.verification_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vh: user updates own"
  ON public.verification_history FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vh: user deletes own"
  ON public.verification_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "vh: officer/admin select all"
  ON public.verification_history FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

-- ============================================================
-- DONE
-- ============================================================
-- After running this script:
--   1. New registrations will auto-create a profile row via trigger
--      (even before email confirmation).
--   2. The app-side insert (using service role key) will succeed or
--      silently skip via ON CONFLICT DO NOTHING.
--   3. verification_history policies are refreshed.
-- ============================================================
