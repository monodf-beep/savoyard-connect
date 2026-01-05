import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinancialReport {
  id: string;
  year: number;
  report_name: string;
  total_charges: number;
  total_produits: number;
  resultat: number;
  achats: number;
  services_exterieurs: number;
  autres_services: number;
  charges_personnel: number;
  charges_financieres: number;
  dotations_amortissements: number;
  ventes_prestations: number;
  subventions: number;
  dons_cotisations: number;
  produits_financiers: number;
  autres_produits: number;
  total_actif: number;
  total_passif: number;
  reserves: number;
  tresorerie: number;
  documents: Array<{ name: string; url: string }>;
  notes: string | null;
  is_provisional: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useFinancialReports = () => {
  return useQuery({
    queryKey: ['financial-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(report => ({
        ...report,
        documents: (report.documents as any) || [],
        total_charges: Number(report.total_charges) || 0,
        total_produits: Number(report.total_produits) || 0,
        resultat: Number(report.resultat) || 0,
        achats: Number(report.achats) || 0,
        services_exterieurs: Number(report.services_exterieurs) || 0,
        autres_services: Number(report.autres_services) || 0,
        charges_personnel: Number(report.charges_personnel) || 0,
        charges_financieres: Number(report.charges_financieres) || 0,
        dotations_amortissements: Number(report.dotations_amortissements) || 0,
        ventes_prestations: Number(report.ventes_prestations) || 0,
        subventions: Number(report.subventions) || 0,
        dons_cotisations: Number(report.dons_cotisations) || 0,
        produits_financiers: Number(report.produits_financiers) || 0,
        autres_produits: Number(report.autres_produits) || 0,
        total_actif: Number(report.total_actif) || 0,
        total_passif: Number(report.total_passif) || 0,
        reserves: Number(report.reserves) || 0,
        tresorerie: Number(report.tresorerie) || 0,
      })) as FinancialReport[];
    },
  });
};
