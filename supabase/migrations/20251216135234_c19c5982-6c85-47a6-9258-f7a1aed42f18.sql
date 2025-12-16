-- Create ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_votes table to track individual votes
CREATE TABLE public.idea_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL, -- can be user_id or anonymous session id
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, voter_identifier)
);

-- Enable RLS on ideas
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Everyone can view ideas
CREATE POLICY "Public can view ideas"
ON public.ideas FOR SELECT
USING (true);

-- Anyone can submit ideas
CREATE POLICY "Anyone can submit ideas"
ON public.ideas FOR INSERT
WITH CHECK (true);

-- Admins can manage ideas
CREATE POLICY "Admins can update ideas"
ON public.ideas FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ideas"
ON public.ideas FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on idea_votes
ALTER TABLE public.idea_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can view votes
CREATE POLICY "Public can view idea votes"
ON public.idea_votes FOR SELECT
USING (true);

-- Anyone can vote
CREATE POLICY "Anyone can vote"
ON public.idea_votes FOR INSERT
WITH CHECK (true);

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
ON public.idea_votes FOR UPDATE
USING (true);

CREATE POLICY "Users can delete own votes"
ON public.idea_votes FOR DELETE
USING (true);

-- Create function to update votes count
CREATE OR REPLACE FUNCTION public.update_idea_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ideas SET votes_count = votes_count + NEW.points WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.ideas SET votes_count = votes_count - OLD.points + NEW.points WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ideas SET votes_count = votes_count - OLD.points WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER update_idea_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.idea_votes
FOR EACH ROW EXECUTE FUNCTION public.update_idea_votes_count();