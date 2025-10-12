-- Create a function to get people with full details (admin only)
create or replace function public.get_people_with_details()
returns table (
  id uuid,
  first_name text,
  last_name text,
  title text,
  bio text,
  avatar_url text,
  linkedin text,
  email text,
  phone text,
  adresse text,
  competences text[],
  date_entree date,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  -- Only return data if user is admin
  select 
    p.id,
    p.first_name,
    p.last_name,
    p.title,
    p.bio,
    p.avatar_url,
    p.linkedin,
    case when has_role(auth.uid(), 'admin') then p.email else null end as email,
    case when has_role(auth.uid(), 'admin') then p.phone else null end as phone,
    case when has_role(auth.uid(), 'admin') then p.adresse else null end as adresse,
    case when has_role(auth.uid(), 'admin') then p.competences else null end as competences,
    case when has_role(auth.uid(), 'admin') then p.date_entree else null end as date_entree,
    p.created_at,
    p.updated_at
  from public.people p;
$$;