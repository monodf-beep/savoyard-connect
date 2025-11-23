-- Add embeds column to people table to store embedded content (Instagram posts, YouTube videos, etc.)
ALTER TABLE public.people 
ADD COLUMN IF NOT EXISTS embeds jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.people.embeds IS 'Array of embedded content URLs (Instagram, YouTube, etc.)';
