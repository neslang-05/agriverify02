-- Fix infinite recursion and permission issues in RLS policies
-- We use the JWT claims directly to avoid querying ANY tables, completely fixing permissions and recursion.

-- 1. Function to check user role from JWT directly
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, 'farmer');
$$ LANGUAGE sql STABLE;

-- 2. Profiles
DROP POLICY IF EXISTS "Officers can view all profiles" ON profiles;
CREATE POLICY "Officers can view all profiles"
  ON profiles FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Product Complaints
DROP POLICY IF EXISTS "Officers can view all complaints" ON product_complaints;
CREATE POLICY "Officers can view all complaints" 
  ON product_complaints FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

DROP POLICY IF EXISTS "Users can view own complaints" ON product_complaints;
CREATE POLICY "Users can view own complaints"
  ON product_complaints FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert complaints" ON product_complaints;
CREATE POLICY "Users can insert complaints"
  ON product_complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Safely apply fixes to other tables if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seed_registry') THEN
    DROP POLICY IF EXISTS "Officers can manage seed registry" ON seed_registry;
    CREATE POLICY "Officers can manage seed registry"
      ON seed_registry FOR ALL
      USING (public.get_user_role() IN ('officer', 'admin'));
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blacklisted_brands') THEN
    DROP POLICY IF EXISTS "Officers can manage blacklisted brands" ON blacklisted_brands;
    CREATE POLICY "Officers can manage blacklisted brands"
      ON blacklisted_brands FOR ALL
      USING (public.get_user_role() IN ('officer', 'admin'));
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_history') THEN
    DROP POLICY IF EXISTS "Officers can view all verification history" ON verification_history;
    CREATE POLICY "Officers can view all verification history"
      ON verification_history FOR SELECT
      USING (public.get_user_role() IN ('officer', 'admin'));
      
    -- Ensure user policies exist for verification_history
    DROP POLICY IF EXISTS "Users can view own verification history" ON verification_history;
    CREATE POLICY "Users can view own verification history"
      ON verification_history FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own verification history" ON verification_history;
    CREATE POLICY "Users can insert own verification history"
      ON verification_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    DROP POLICY IF EXISTS "Users can update own verification history" ON verification_history;
    CREATE POLICY "Users can update own verification history"
      ON verification_history FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
    CREATE POLICY "Admins can view audit logs" 
      ON audit_logs FOR SELECT
      USING (public.get_user_role() = 'admin');
  END IF;
END $$;
