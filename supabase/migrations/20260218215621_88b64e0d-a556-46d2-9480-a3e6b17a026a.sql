
-- Table to store which modules are enabled per association
CREATE TABLE public.association_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  enabled_at timestamp with time zone,
  enabled_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(association_id, module_key)
);

-- Enable RLS
ALTER TABLE public.association_modules ENABLE ROW LEVEL SECURITY;

-- Members can view their association's modules
CREATE POLICY "Members can view association modules"
ON public.association_modules
FOR SELECT
USING (is_association_member(auth.uid(), association_id));

-- Admins can manage modules
CREATE POLICY "Admins can manage association modules"
ON public.association_modules
FOR ALL
USING (is_association_admin(auth.uid(), association_id))
WITH CHECK (is_association_admin(auth.uid(), association_id));

-- Trigger for updated_at
CREATE TRIGGER update_association_modules_updated_at
BEFORE UPDATE ON public.association_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
