-- Drop the people_public view (security definer views are not recommended)
-- The application will use the people_public_fn() function instead
DROP VIEW IF EXISTS public.people_public;