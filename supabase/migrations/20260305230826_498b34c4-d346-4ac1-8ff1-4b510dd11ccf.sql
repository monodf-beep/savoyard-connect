
CREATE TABLE public.association_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  service text NOT NULL,
  webhook_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  events text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.association_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Association admins can manage webhooks"
  ON public.association_webhooks
  FOR ALL
  TO authenticated
  USING (is_association_admin(auth.uid(), association_id))
  WITH CHECK (is_association_admin(auth.uid(), association_id));

CREATE POLICY "Association members can view webhooks"
  ON public.association_webhooks
  FOR SELECT
  TO authenticated
  USING (is_association_member(auth.uid(), association_id));
