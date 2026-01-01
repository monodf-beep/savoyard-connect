-- Add city column to helloasso_donors table
ALTER TABLE public.helloasso_donors ADD COLUMN IF NOT EXISTS city text;