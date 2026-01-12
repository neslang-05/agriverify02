-- supabase/reset_public_schema.sql
-- Drop and recreate the public schema to remove all tables, views, sequences, functions and other objects
-- WARNING: This permanently removes all objects and data in the public schema. Backup first if needed.

-- Ensure normal constraint triggers behavior
SET session_replication_role = 'origin';

-- Drop and recreate public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Re-grant typical privileges (adjust owner name if your DB uses a different role)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Optional: recreate common extensions used by Supabase local dev (uncomment if you need them)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
-- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

SET session_replication_role = 'replica';

-- End of file
