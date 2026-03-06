-- webhook_logs table for tracking triggered webhooks
CREATE TABLE public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.association_webhooks(id) ON DELETE CASCADE,
  association_id uuid NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  event text NOT NULL,
  service text NOT NULL,
  status_code integer,
  response_body text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Association admins can manage webhook logs"
  ON public.webhook_logs FOR ALL
  USING (is_association_admin(auth.uid(), association_id))
  WITH CHECK (is_association_admin(auth.uid(), association_id));

CREATE POLICY "Association members can view webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (is_association_member(auth.uid(), association_id));

CREATE INDEX idx_webhook_logs_association ON public.webhook_logs(association_id);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);