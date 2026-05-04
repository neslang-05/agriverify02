-- Update status for existing records
UPDATE product_complaints SET status = 'received' WHERE status = 'open';
UPDATE product_complaints SET status = 'under_review' WHERE status = 'investigating';
UPDATE product_complaints SET status = 'finished' WHERE status = 'resolved';

-- Drop the existing constraint if it exists. Postgres automatically names it table_column_check if not explicitly named.
-- We can find the constraint name dynamically and drop it.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.product_complaints'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%status%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.product_complaints DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Add the new constraint
ALTER TABLE public.product_complaints
  ADD CONSTRAINT product_complaints_status_check
  CHECK (status IN ('received', 'under_review', 'finished'));

-- Update the default value
ALTER TABLE public.product_complaints
  ALTER COLUMN status SET DEFAULT 'received';
