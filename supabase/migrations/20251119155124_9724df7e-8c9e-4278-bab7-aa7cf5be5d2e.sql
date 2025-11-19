-- Créer une table pour lier les sections aux segments de chaîne de valeur
CREATE TABLE public.segment_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES public.value_chain_segments(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(segment_id, section_id)
);

-- Activer RLS
ALTER TABLE public.segment_sections ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Public can view segment sections"
  ON public.segment_sections
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert segment sections"
  ON public.segment_sections
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update segment sections"
  ON public.segment_sections
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete segment sections"
  ON public.segment_sections
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));