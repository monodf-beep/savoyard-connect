
-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  google_event_id TEXT UNIQUE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  attendees JSONB DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  transcript_filename TEXT,
  association_id UUID REFERENCES public.associations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Everyone can view meetings (same as projects)
CREATE POLICY "Public can view meetings"
  ON public.meetings FOR SELECT
  USING (true);

-- Admins can manage meetings
CREATE POLICY "Admins can manage meetings"
  ON public.meetings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add source_meeting_id to projects
ALTER TABLE public.projects
  ADD COLUMN source_meeting_id UUID REFERENCES public.meetings(id);

-- Trigger for updated_at
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
