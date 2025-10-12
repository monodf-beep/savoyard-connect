-- Create invites table for onboarding emails
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  person_id uuid references public.people(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

alter table public.invites enable row level security;

-- RLS: Only admins can manage invites
create policy "Admins can insert invites"
  on public.invites for insert
  with check (has_role(auth.uid(), 'admin'));

create policy "Admins can update invites"
  on public.invites for update
  using (has_role(auth.uid(), 'admin'));

create policy "Admins can delete invites"
  on public.invites for delete
  using (has_role(auth.uid(), 'admin'));

create policy "Admins can view invites"
  on public.invites for select
  using (has_role(auth.uid(), 'admin'));