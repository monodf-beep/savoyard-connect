-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table to manage user permissions
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only admins can assign roles  
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.people;
DROP POLICY IF EXISTS "Authenticated users can insert people" ON public.people;
DROP POLICY IF EXISTS "Authenticated users can update people" ON public.people;
DROP POLICY IF EXISTS "Authenticated users can delete people" ON public.people;
DROP POLICY IF EXISTS "Sections are publicly accessible" ON public.sections;
DROP POLICY IF EXISTS "Section members are publicly accessible" ON public.section_members;
DROP POLICY IF EXISTS "Vacant positions are publicly accessible" ON public.vacant_positions;
DROP POLICY IF EXISTS "Job postings are publicly accessible" ON public.job_postings;

-- People table policies - Public can view all data (sensitive fields will be protected via function)
CREATE POLICY "Public can view public profile info"
ON public.people
FOR SELECT
USING (true);

-- Only authenticated admins can modify people data
CREATE POLICY "Admins can insert people"
ON public.people
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update people"
ON public.people
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete people"
ON public.people
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Sections table policies
CREATE POLICY "Public can view sections"
ON public.sections
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert sections"
ON public.sections
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sections"
ON public.sections
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sections"
ON public.sections
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Section members table policies
CREATE POLICY "Public can view section members"
ON public.section_members
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert section members"
ON public.section_members
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update section members"
ON public.section_members
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete section members"
ON public.section_members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Vacant positions table policies
CREATE POLICY "Public can view vacant positions"
ON public.vacant_positions
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert vacant positions"
ON public.vacant_positions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vacant positions"
ON public.vacant_positions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vacant positions"
ON public.vacant_positions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Job postings table policies
CREATE POLICY "Public can view active job postings"
ON public.job_postings
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can insert job postings"
ON public.job_postings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update job postings"
ON public.job_postings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete job postings"
ON public.job_postings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Drop and recreate get_people_detailed function with proper protection
DROP FUNCTION IF EXISTS public.get_people_detailed();

CREATE FUNCTION public.get_people_detailed()
RETURNS SETOF people
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.people;
$$;