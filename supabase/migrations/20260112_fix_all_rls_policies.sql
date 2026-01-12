-- Fix RLS policies for all tables to work with Supabase auth
-- This migration ensures all tables have correct RLS policies using auth.uid()

-- =====================================================
-- VERIFICATION_HISTORY TABLE RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own verification history" ON verification_history;
DROP POLICY IF EXISTS "Users can insert own verification history" ON verification_history;
DROP POLICY IF EXISTS "Users can update own verification history" ON verification_history;
DROP POLICY IF EXISTS "Users can delete own verification history" ON verification_history;
DROP POLICY IF EXISTS "Users can manage own verification history" ON verification_history;

-- Create corrected policies
CREATE POLICY "Users can view own verification history"
  ON verification_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification history"
  ON verification_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification history"
  ON verification_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own verification history"
  ON verification_history FOR DELETE
  USING (auth.uid() = user_id);

-- Officers can view all verification history
CREATE POLICY "Officers can view all verification history"
  ON verification_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'officer'
    )
  );

-- =====================================================
-- CHAT_MESSAGES TABLE RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;

-- Create corrected policies
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PROFILES TABLE RLS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Officers can view all profiles" ON profiles;

-- Create corrected policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Officers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'officer'
    )
  );

-- =====================================================
-- PRODUCTS TABLE RLS (if exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can insert own products" ON products;
    DROP POLICY IF EXISTS "Users can view own products" ON products;
    DROP POLICY IF EXISTS "Officers can view all products" ON products;

    -- Create corrected policies
    CREATE POLICY "Users can insert own products"
      ON products FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own products"
      ON products FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Officers can view all products"
      ON products FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'officer'
        )
      );
  END IF;
END $$;

-- =====================================================
-- SEED_REGISTRY TABLE RLS
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seed_registry') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anyone can view seed registry" ON seed_registry;
    DROP POLICY IF EXISTS "Officers can manage seed registry" ON seed_registry;

    -- Create corrected policies
    CREATE POLICY "Anyone can view seed registry"
      ON seed_registry FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Officers can manage seed registry"
      ON seed_registry FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'officer'
        )
      );
  END IF;
END $$;

-- =====================================================
-- BLACKLISTED_BRANDS TABLE RLS
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blacklisted_brands') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anyone can view blacklisted brands" ON blacklisted_brands;
    DROP POLICY IF EXISTS "Officers can manage blacklisted brands" ON blacklisted_brands;

    -- Create corrected policies
    CREATE POLICY "Anyone can view blacklisted brands"
      ON blacklisted_brands FOR SELECT
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Officers can manage blacklisted brands"
      ON blacklisted_brands FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'officer'
        )
      );
  END IF;
END $$;
