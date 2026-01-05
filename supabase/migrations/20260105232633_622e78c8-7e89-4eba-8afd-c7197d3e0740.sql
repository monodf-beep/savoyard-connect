-- Table pour stocker les rapports financiers annuels
CREATE TABLE public.financial_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  report_name TEXT NOT NULL DEFAULT 'Rapport annuel',
  
  -- Données du compte de résultat
  total_charges NUMERIC DEFAULT 0,
  total_produits NUMERIC DEFAULT 0,
  resultat NUMERIC DEFAULT 0,
  
  -- Détails des charges principales
  achats NUMERIC DEFAULT 0,
  services_exterieurs NUMERIC DEFAULT 0,
  autres_services NUMERIC DEFAULT 0,
  charges_personnel NUMERIC DEFAULT 0,
  charges_financieres NUMERIC DEFAULT 0,
  dotations_amortissements NUMERIC DEFAULT 0,
  
  -- Détails des produits principaux
  ventes_prestations NUMERIC DEFAULT 0,
  subventions NUMERIC DEFAULT 0,
  dons_cotisations NUMERIC DEFAULT 0,
  produits_financiers NUMERIC DEFAULT 0,
  autres_produits NUMERIC DEFAULT 0,
  
  -- Bilan
  total_actif NUMERIC DEFAULT 0,
  total_passif NUMERIC DEFAULT 0,
  reserves NUMERIC DEFAULT 0,
  tresorerie NUMERIC DEFAULT 0,
  
  -- Documents joints (PDF, etc)
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Notes et commentaires
  notes TEXT,
  
  -- Métadonnées
  is_provisional BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(year, is_provisional)
);

-- Enable RLS
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- Public read access for published reports
CREATE POLICY "Anyone can view published financial reports"
ON public.financial_reports
FOR SELECT
USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage financial reports"
ON public.financial_reports
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_financial_reports_updated_at
BEFORE UPDATE ON public.financial_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert data from the Excel file
INSERT INTO public.financial_reports (
  year, report_name, is_provisional,
  total_charges, total_produits, resultat,
  achats, services_exterieurs, autres_services, charges_financieres, dotations_amortissements,
  ventes_prestations, subventions, dons_cotisations, produits_financiers,
  total_actif, total_passif, reserves, tresorerie
) VALUES 
-- 2023 data
(2023, 'Comptes réalisés 2023', false,
  1483, 2031, 548,
  0, 0, 1483, 0, 0,
  1254, 0, 710, 67,
  0, 0, 0, 0),
-- 2024 data
(2024, 'Comptes réalisés 2024', false,
  10261, 9738, -523,
  2098, 4776, 3333, 54, 0,
  7807, 0, 1858, 64,
  13002, 9609, 3393, 5826),
-- 2026 previsionnel
(2026, 'Budget prévisionnel 2026', true,
  18086.33, 19130, 1043.67,
  3800, 7448, 3925, 80, 2833.33,
  8800, 9300, 1000, 30,
  0, 0, 0, 0);