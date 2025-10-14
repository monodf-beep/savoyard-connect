-- Create enum for project status
CREATE TYPE project_status AS ENUM ('planned', 'in_progress', 'completed');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  documents JSONB DEFAULT '[]'::jsonb,
  roadmap TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view projects"
  ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();