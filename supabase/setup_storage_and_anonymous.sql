-- ============================================================
-- Supabase Storage & Anonymous Verifications Setup
-- ============================================================

-- 1. Make user_id nullable in verification_history
-- This allows guest/anonymous users to have their verifications recorded.
ALTER TABLE public.verification_history ALTER COLUMN user_id DROP NOT NULL;

-- 2. Update RLS policies for verification_history
-- Allow anonymous users to insert their verification records
DROP POLICY IF EXISTS "vh: anon inserts" ON public.verification_history;
CREATE POLICY "vh: anon inserts"
  ON public.verification_history FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.uid() IS NULL OR auth.uid() = user_id);

-- 3. Create Storage Bucket for verifications
-- Use the Supabase storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS Policies for 'verifications' bucket

-- Allow anyone (anon and authenticated) to upload images
-- Note: 'storage.objects' is the table where file metadata is stored
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'verifications');

-- Allow anyone to view images
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verifications');

-- Allow authenticated users to delete their own uploads (if we track owner_id)
-- For now, we'll keep it simple and just allow uploads and viewing.
