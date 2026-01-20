-- Add new fields to associations table for enhanced profile
ALTER TABLE public.associations
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS public_email TEXT,
ADD COLUMN IF NOT EXISTS show_organigramme BOOLEAN DEFAULT true;