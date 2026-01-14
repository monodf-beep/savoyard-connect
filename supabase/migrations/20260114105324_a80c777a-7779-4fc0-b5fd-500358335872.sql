-- Add viewport (camera) position fields to value_chains table
ALTER TABLE public.value_chains
ADD COLUMN IF NOT EXISTS viewport_x double precision DEFAULT 0,
ADD COLUMN IF NOT EXISTS viewport_y double precision DEFAULT 0,
ADD COLUMN IF NOT EXISTS viewport_zoom double precision DEFAULT 1;