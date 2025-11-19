-- Create value chains table
CREATE TABLE public.value_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create value chain segments table
CREATE TABLE public.value_chain_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_chain_id UUID NOT NULL REFERENCES public.value_chains(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create segment actors table (links actors from people table to segments)
CREATE TABLE public.segment_actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES public.value_chain_segments(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(segment_id, person_id)
);

-- Enable RLS
ALTER TABLE public.value_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_chain_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_actors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for value_chains
CREATE POLICY "Public can view value chains"
  ON public.value_chains FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert value chains"
  ON public.value_chains FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update value chains"
  ON public.value_chains FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete value chains"
  ON public.value_chains FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for value_chain_segments
CREATE POLICY "Public can view segments"
  ON public.value_chain_segments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert segments"
  ON public.value_chain_segments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update segments"
  ON public.value_chain_segments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete segments"
  ON public.value_chain_segments FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for segment_actors
CREATE POLICY "Public can view segment actors"
  ON public.segment_actors FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert segment actors"
  ON public.segment_actors FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update segment actors"
  ON public.segment_actors FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete segment actors"
  ON public.segment_actors FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_value_chains_updated_at
  BEFORE UPDATE ON public.value_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_value_chain_segments_updated_at
  BEFORE UPDATE ON public.value_chain_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_segments_chain ON public.value_chain_segments(value_chain_id);
CREATE INDEX idx_segment_actors_segment ON public.segment_actors(segment_id);
CREATE INDEX idx_segment_actors_person ON public.segment_actors(person_id);