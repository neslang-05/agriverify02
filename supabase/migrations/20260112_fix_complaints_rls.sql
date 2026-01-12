-- Fix RLS policies for product_complaints table
-- This migration updates the RLS policies to work correctly with Supabase auth

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own complaints" ON product_complaints;
DROP POLICY IF EXISTS "Officers can view all complaints" ON product_complaints;
DROP POLICY IF EXISTS "Users can insert complaints" ON product_complaints;
DROP POLICY IF EXISTS "Officers can update complaint status" ON product_complaints;

-- Create corrected RLS policies

-- Policy: Users can view their own complaints
CREATE POLICY "Users can view own complaints"
  ON product_complaints FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Officers can view all complaints (check role from profiles table)
CREATE POLICY "Officers can view all complaints"
  ON product_complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'officer'
    )
  );

-- Policy: Authenticated users can insert their own complaints
CREATE POLICY "Users can insert complaints"
  ON product_complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Officers can update complaint status
CREATE POLICY "Officers can update complaint status"
  ON product_complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'officer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'officer'
    )
  );

-- Ensure batch_risk_registry is accessible to all authenticated users
ALTER TABLE batch_risk_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view batch registry" ON batch_risk_registry;
CREATE POLICY "Anyone can view batch registry"
  ON batch_risk_registry FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Officers can manage batch registry
DROP POLICY IF EXISTS "Officers can manage batch registry" ON batch_risk_registry;
CREATE POLICY "Officers can manage batch registry"
  ON batch_risk_registry FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'officer'
    )
  );
