-- Add position columns to value_chain_segments for saving node positions
ALTER TABLE public.value_chain_segments 
ADD COLUMN IF NOT EXISTS position_x numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS position_y numeric DEFAULT NULL;