-- Ajouter le rôle admin à l'utilisateur franck.monod@langue-savoyarde.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('4f2c45d7-4283-49c1-bf5d-44a962cd9987', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;