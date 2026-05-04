-- ============================================================
-- Add Admin User Script
-- Email: admin@mail.com
-- Password: 1234567890
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Ensure pgcrypto is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  new_email TEXT := 'admin@mail.com';
  -- '1234567890' hashed with bcrypt
  new_password TEXT := '1234567890';
BEGIN
  -- 1. Check if user already exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    
    -- 2. Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      last_sign_in_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      new_email,
      crypt(new_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin", "full_name":"System Administrator"}',
      false,
      'authenticated',
      now(),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- 3. Insert into public.profiles
    -- Note: Ensure the profiles table exists first (run setup_database.sql)
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role, 
      district, 
      created_at, 
      updated_at
    )
    VALUES (
      new_user_id, 
      new_email, 
      'System Administrator', 
      'admin', 
      'Imphal West', 
      now(), 
      now()
    );

    RAISE NOTICE 'Admin user % created successfully with ID %', new_email, new_user_id;
  ELSE
    -- If user exists, ensure profile has admin role
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE email = new_email;
    
    -- Update metadata in auth.users as well
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
    WHERE email = new_email;

    RAISE NOTICE 'User % already exists. Updated role to admin in profile and metadata.', new_email;
  END IF;
END $$;
