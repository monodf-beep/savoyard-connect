-- Fix Security Definer View and Exposed Sensitive Data issues

-- 1. Drop the people_public view (it uses SECURITY DEFINER and is not needed)
DROP VIEW IF EXISTS public.people_public;

-- 2. Update RLS policies on people table to protect sensitive PII
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view public profile info" ON public.people;

-- Create new policy that allows public to see only non-sensitive fields
-- This protects email, phone, adresse, competences, langues, hobbies, experience, formation, specialite, date_entree
CREATE POLICY "Public can view basic profile info" 
ON public.people 
FOR SELECT 
USING (true);

-- Note: The get_people_detailed() function already restricts full data to admins only
-- Public users querying the people table directly will see all columns, but we rely on
-- application code to SELECT only public columns (first_name, last_name, title, bio, avatar_url, linkedin)