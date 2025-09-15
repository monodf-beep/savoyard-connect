-- Créer la table pour les postes vacants
CREATE TABLE IF NOT EXISTS public.vacant_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vacant_positions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Vacant positions are publicly accessible" 
ON public.vacant_positions 
FOR ALL 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_vacant_positions_updated_at
BEFORE UPDATE ON public.vacant_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();