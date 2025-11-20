-- Add leader_id column to sections table
ALTER TABLE public.sections
ADD COLUMN leader_id uuid REFERENCES public.people(id) ON DELETE SET NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.sections.leader_id IS 'ID of the person who is the leader/responsible for this section';