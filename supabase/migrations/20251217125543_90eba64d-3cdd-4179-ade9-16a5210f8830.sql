-- Table for community milestones configuration
CREATE TABLE public.community_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target integer NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for community settings (current progress, manual count, etc.)
CREATE TABLE public.community_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Table for membership options
CREATE TABLE public.membership_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price numeric NOT NULL,
  benefits text[] DEFAULT '{}',
  helloasso_link text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for HelloAsso members (synced from API)
CREATE TABLE public.helloasso_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  helloasso_id text UNIQUE,
  first_name text,
  last_name text,
  email text,
  city text,
  postal_code text,
  country text,
  membership_date date,
  membership_type text,
  amount numeric,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for HelloAsso donors (synced from API)
CREATE TABLE public.helloasso_donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  helloasso_id text UNIQUE,
  first_name text,
  last_name text,
  email text,
  total_donated numeric DEFAULT 0,
  donation_count integer DEFAULT 0,
  last_donation_date date,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helloasso_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helloasso_donors ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view milestones" ON public.community_milestones FOR SELECT USING (true);
CREATE POLICY "Public can view community settings" ON public.community_settings FOR SELECT USING (true);
CREATE POLICY "Public can view membership options" ON public.membership_options FOR SELECT USING (true);
CREATE POLICY "Public can view visible members" ON public.helloasso_members FOR SELECT USING (is_hidden = false);
CREATE POLICY "Public can view visible donors" ON public.helloasso_donors FOR SELECT USING (is_hidden = false);

-- Admin policies
CREATE POLICY "Admins can manage milestones" ON public.community_milestones FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage community settings" ON public.community_settings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage membership options" ON public.membership_options FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all members" ON public.helloasso_members FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all donors" ON public.helloasso_donors FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default milestones
INSERT INTO public.community_milestones (title, target, description, display_order) VALUES
  ('Ancrage Local', 50, 'Reconnaissance auprès des associations culturelles locales.', 1),
  ('Rayonnement Régional', 100, 'Collaboration avec des festivals et MJC.', 2),
  ('Poids Académique', 500, 'Dialogue avec le rectorat de Grenoble.', 3),
  ('Influence Institutionnelle', 1000, 'Intégration dans des organismes consultatifs.', 4),
  ('Reconnaissance Nationale', 2500, 'Lancement de campagnes d''envergure.', 5);

-- Insert default community settings
INSERT INTO public.community_settings (key, value) VALUES
  ('current_members', '{"count": 0, "manual_addition": 0}'),
  ('mapbox_token', '""');

-- Insert default membership options
INSERT INTO public.membership_options (title, price, benefits, display_order, is_featured) VALUES
  ('Individuelle', 15, ARRAY['Accès aux événements', 'Newsletter mensuelle', 'Vote aux assemblées'], 1, false),
  ('Famille', 40, ARRAY['Jusqu''à 4 membres', 'Accès aux événements', 'Newsletter mensuelle', 'Vote aux assemblées'], 2, true),
  ('Ambassadeur', 150, ARRAY['Tous les avantages Famille', 'Mention sur le site', 'Invitations VIP', 'Goodies exclusifs'], 3, false);