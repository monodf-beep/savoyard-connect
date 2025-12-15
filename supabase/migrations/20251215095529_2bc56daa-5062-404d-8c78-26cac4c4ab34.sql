-- Extend projects table with funding capabilities
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS funding_goal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS funded_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ha_net_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS manual_cash_total numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS supporter_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS funding_deadline date,
ADD COLUMN IF NOT EXISTS is_funding_project boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create manual_funds table for tracking non-HelloAsso donations
CREATE TABLE IF NOT EXISTS public.manual_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  source text NOT NULL,
  donor_name text,
  note text,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Enable RLS on manual_funds
ALTER TABLE public.manual_funds ENABLE ROW LEVEL SECURITY;

-- RLS policies for manual_funds
CREATE POLICY "Public can view public manual funds"
ON public.manual_funds
FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can view all manual funds"
ON public.manual_funds
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert manual funds"
ON public.manual_funds
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update manual funds"
ON public.manual_funds
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete manual funds"
ON public.manual_funds
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create app_settings table for global settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_settings
CREATE POLICY "Everyone can view app settings"
ON public.app_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));