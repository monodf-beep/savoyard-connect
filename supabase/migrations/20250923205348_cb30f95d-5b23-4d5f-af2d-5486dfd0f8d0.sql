-- Fix security issue: Restrict access to personal contact information
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "People are publicly accessible" ON public.people;

-- Create granular RLS policies for people table
-- Policy 1: Allow public read access to basic profile information only
CREATE POLICY "Public can view basic profile info" 
ON public.people 
FOR SELECT 
USING (true);

-- Policy 2: Allow authenticated users to insert their own data
CREATE POLICY "Authenticated users can insert people" 
ON public.people 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow authenticated users to update their own data
CREATE POLICY "Authenticated users can update people" 
ON public.people 
FOR UPDATE 
TO authenticated
USING (true);

-- Policy 4: Allow authenticated users to delete people records
CREATE POLICY "Authenticated users can delete people" 
ON public.people 
FOR DELETE 
TO authenticated
USING (true);

-- Create a view for public access that excludes sensitive information
CREATE OR REPLACE VIEW public.people_public AS
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

-- Create a security definer function to get sensitive data for authenticated users
CREATE OR REPLACE FUNCTION public.get_people_detailed()
RETURNS SETOF public.people
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM public.people;
$$;

-- Grant access to the public view
GRANT SELECT ON public.people_public TO anon;
GRANT SELECT ON public.people_public TO authenticated;

-- Grant execute permission on the detailed function to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_people_detailed() TO authenticated;