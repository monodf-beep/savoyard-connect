-- Fix people_public returning empty due to RLS on people
-- 1) Create a SECURITY DEFINER function that returns only non-sensitive columns
create or replace function public.people_public_fn()
returns table (
  id uuid,
  first_name text,
  last_name text,
  title text,
  bio text,
  avatar_url text,
  linkedin text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, first_name, last_name, title, bio, avatar_url, linkedin, created_at, updated_at
  from public.people;
$$;

-- 2) Recreate the view to select from the definer function (bypasses people RLS safely)
drop view if exists public.people_public cascade;
create view public.people_public as
select * from public.people_public_fn();

-- 3) Grants for anon/authenticated
grant usage on schema public to anon, authenticated;
grant select on public.people_public to anon, authenticated;
grant execute on function public.people_public_fn() to anon, authenticated;