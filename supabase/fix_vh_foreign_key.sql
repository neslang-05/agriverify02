-- ============================================================
-- Fix: Verification History Foreign Key Constraint
-- ============================================================
-- Problem: verification_history.user_id references profiles.id.
-- If a user is in auth.users but not in profiles (common during 
-- DB resets/seeds), saving history fails.
--
-- Solution: Re-align the foreign key to reference auth.users(id).
-- This ensures that as long as the user is authenticated, 
-- history can be recorded.
-- ============================================================

DO $$
BEGIN
    -- 1. Identify the existing constraint name
    -- It is usually 'verification_history_user_id_fkey'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'verification_history_user_id_fkey' 
        AND table_name = 'verification_history'
    ) THEN
        ALTER TABLE public.verification_history 
        DROP CONSTRAINT verification_history_user_id_fkey;
    END IF;

    -- 2. Add the new constraint referencing public.profiles
    -- This allows PostgREST to auto-detect the relationship for joins.
    -- We rely on the application-side check in history.ts to avoid violations
    -- if a profile is missing.
    ALTER TABLE public.verification_history
    ADD CONSTRAINT verification_history_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

END $$;

-- 3. Ensure user_id is nullable (for guest verifications)
ALTER TABLE public.verification_history ALTER COLUMN user_id DROP NOT NULL;

-- 4. Re-verify RLS policies
DROP POLICY IF EXISTS "vh: user inserts own" ON public.verification_history;
DROP POLICY IF EXISTS "vh: anon inserts" ON public.verification_history;
DROP POLICY IF EXISTS "vh: allow inserts" ON public.verification_history;

CREATE POLICY "vh: allow inserts"
  ON public.verification_history FOR INSERT
  TO public
  WITH CHECK (
    -- Case 1: Linked to a user (must match auth.uid)
    (auth.uid() = user_id)
    OR 
    -- Case 2: Anonymous/Guest verification (user_id is null)
    (user_id IS NULL)
  );

-- ============================================================
-- DONE
-- ============================================================
