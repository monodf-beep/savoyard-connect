-- Create a table for section reassurance information
CREATE TABLE public.section_reassurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  on_site_required BOOLEAN DEFAULT false,
  flexible_commitment BOOLEAN DEFAULT true,
  flexible_hours BOOLEAN DEFAULT true,
  custom_info TEXT,
  location TEXT DEFAULT 'Annecy',
  commitment_details TEXT,
  availability_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_id)
);

-- Enable Row Level Security
ALTER TABLE public.section_reassurance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view section reassurance" 
ON public.section_reassurance 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert section reassurance" 
ON public.section_reassurance 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update section reassurance" 
ON public.section_reassurance 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete section reassurance" 
ON public.section_reassurance 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_section_reassurance_updated_at
BEFORE UPDATE ON public.section_reassurance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_section_reassurance_section_id ON public.section_reassurance(section_id);