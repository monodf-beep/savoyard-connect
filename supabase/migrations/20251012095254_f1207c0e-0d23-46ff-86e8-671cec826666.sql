-- Add silvrollin@gmail.com as admin
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'silvrollin@gmail.com'
on conflict (user_id, role) do nothing;