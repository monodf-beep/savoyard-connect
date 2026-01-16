-- Add geographic zone fields to associations table for cross-border geolocation
ALTER TABLE public.associations
ADD COLUMN IF NOT EXISTS primary_zone text,
ADD COLUMN IF NOT EXISTS secondary_zone text,
ADD COLUMN IF NOT EXISTS silo text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Create an index for faster filtering by zone
CREATE INDEX IF NOT EXISTS idx_associations_primary_zone ON public.associations(primary_zone);
CREATE INDEX IF NOT EXISTS idx_associations_silo ON public.associations(silo);

-- Add a policy for public read access to public associations
CREATE POLICY "Anyone can view public associations"
ON public.associations
FOR SELECT
USING (is_public = true);

-- Create a table for tracking association views/contacts (for analytics)
CREATE TABLE IF NOT EXISTS public.directory_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_association_id uuid REFERENCES public.associations(id),
  target_association_id uuid REFERENCES public.associations(id) NOT NULL,
  message text,
  contact_type text DEFAULT 'view',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on directory_contacts
ALTER TABLE public.directory_contacts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create contact requests
CREATE POLICY "Users can create contact requests"
ON public.directory_contacts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own contact requests
CREATE POLICY "Users can view their contact requests"
ON public.directory_contacts
FOR SELECT
USING (
  requester_association_id IN (
    SELECT id FROM associations WHERE owner_id = auth.uid()
  )
  OR target_association_id IN (
    SELECT id FROM associations WHERE owner_id = auth.uid()
  )
);