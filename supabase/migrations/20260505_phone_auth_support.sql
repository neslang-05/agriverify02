-- Update profiles table to support phone auth (where email might be missing)
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Update the handle_new_user trigger function to handle missing emails
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
    NEW.email, -- Can be NULL for phone auth
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    'Not specified'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE profiles.full_name 
    END;
  RETURN NEW;
END;
$$;
