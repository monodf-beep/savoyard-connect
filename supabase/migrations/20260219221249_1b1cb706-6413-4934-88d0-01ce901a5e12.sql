
-- 1. Add federation columns to associations
ALTER TABLE public.associations ADD COLUMN IF NOT EXISTS is_federation_member boolean DEFAULT false;
ALTER TABLE public.associations ADD COLUMN IF NOT EXISTS federation_joined_at timestamptz;
ALTER TABLE public.associations ADD COLUMN IF NOT EXISTS helloasso_slug text;

-- 2. Create federation_members table
CREATE TABLE public.federation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  association_id uuid REFERENCES public.associations(id) ON DELETE CASCADE NOT NULL,
  helloasso_member_id uuid REFERENCES public.helloasso_members(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.federation_members ENABLE ROW LEVEL SECURITY;

-- 4. Unique index: one record per email + association
CREATE UNIQUE INDEX idx_federation_members_email_asso ON public.federation_members (email, association_id);

-- 5. RLS policies

-- Global admins can do everything
CREATE POLICY "Admins can manage federation members"
ON public.federation_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Association admins can view their own association's federation members
CREATE POLICY "Association admins can view their federation members"
ON public.federation_members
FOR SELECT
USING (is_association_admin(auth.uid(), association_id));

-- 6. Trigger for updated_at
CREATE TRIGGER update_federation_members_updated_at
BEFORE UPDATE ON public.federation_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
