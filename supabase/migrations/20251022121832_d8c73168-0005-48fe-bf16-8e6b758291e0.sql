-- Add is_hidden column to sections table
ALTER TABLE public.sections 
ADD COLUMN is_hidden boolean DEFAULT false;

-- Update existing sections to be visible by default
UPDATE public.sections 
SET is_hidden = false 
WHERE is_hidden IS NULL;