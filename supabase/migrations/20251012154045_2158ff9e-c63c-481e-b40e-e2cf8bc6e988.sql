-- Create table for spontaneous applications
CREATE TABLE public.spontaneous_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  cv_url TEXT,
  message TEXT,
  location TEXT DEFAULT 'Annecy',
  commitment TEXT,
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.spontaneous_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all applications"
ON public.spontaneous_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit application"
ON public.spontaneous_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update applications"
ON public.spontaneous_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
ON public.spontaneous_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_spontaneous_applications_updated_at
BEFORE UPDATE ON public.spontaneous_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_spontaneous_applications_section_id ON public.spontaneous_applications(section_id);
CREATE INDEX idx_spontaneous_applications_status ON public.spontaneous_applications(status);