-- Migration script to update legacy complaint statuses to new standardized values
-- Run this in your Supabase SQL Editor

-- 1. Temporarily drop or broaden the check constraint to allow new statuses
ALTER TABLE public.product_complaints 
DROP CONSTRAINT IF EXISTS product_complaints_status_check;

-- Add a temporary constraint that allows both old and new statuses
ALTER TABLE public.product_complaints 
ADD CONSTRAINT product_complaints_status_check 
CHECK (status IN ('received', 'under_review', 'finished', 'open', 'investigating', 'resolved'));

-- 2. Update 'open' to 'received'
UPDATE public.product_complaints
SET status = 'received'
WHERE status = 'open';

-- 3. Update 'investigating' to 'under_review'
UPDATE public.product_complaints
SET status = 'under_review'
WHERE status = 'investigating';

-- 4. Update 'resolved' to 'finished'
UPDATE public.product_complaints
SET status = 'finished'
WHERE status = 'resolved';

-- 5. Tighten the check constraint to ONLY allow new statuses
ALTER TABLE public.product_complaints 
DROP CONSTRAINT IF EXISTS product_complaints_status_check;

ALTER TABLE public.product_complaints 
ADD CONSTRAINT product_complaints_status_check 
CHECK (status IN ('received', 'under_review', 'finished'));

-- Verify the changes
SELECT status, count(*) 
FROM public.product_complaints 
GROUP BY status;
