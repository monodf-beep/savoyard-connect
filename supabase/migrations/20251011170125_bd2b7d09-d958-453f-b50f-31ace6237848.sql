-- Fix PUBLIC_DATA_EXPOSURE: Protect sensitive PII in people table

-- 1. Drop the current overly permissive public policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.people;

-- 2. Create admin-only policy for direct table access
CREATE POLICY "Only admins can view people table directly"
ON public.people
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create a public view with only non-sensitive fields
CREATE VIEW public.people_public 
WITH (security_invoker=true) AS
SELECT 
  id,
  first_name,
  last_name,
  title,
  bio,
  avatar_url,
  linkedin,
  created_at,
  updated_at
FROM public.people;

-- 4. Grant public access to the view
GRANT SELECT ON public.people_public TO anon, authenticated;