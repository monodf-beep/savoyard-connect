import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FundingProject {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed';
  start_date?: string;
  end_date?: string;
  documents?: Array<{ name: string; url: string }>;
  roadmap?: string;
  created_at: string;
  updated_at: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  // Funding fields
  is_funding_project: boolean;
  funding_goal: number;
  funded_amount: number;
  ha_net_total: number;
  manual_cash_total: number;
  supporter_count: number;
  funding_deadline?: string;
  cover_image_url?: string;
}

export interface ManualFund {
  id: string;
  project_id?: string;
  amount: number;
  source: string;
  donor_name?: string;
  note?: string;
  is_public: boolean;
  created_at: string;
}

export const useFundingProjects = () => {
  const { toast } = useToast();
  const [fundingProjects, setFundingProjects] = useState<FundingProject[]>([]);
  const [manualFunds, setManualFunds] = useState<ManualFund[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch funding projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_funding_project', true)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      setFundingProjects((projectsData || []).map(p => ({
        ...p,
        documents: (p.documents as any) || [],
        approval_status: (p.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
        is_funding_project: p.is_funding_project ?? false,
        funding_goal: p.funding_goal ?? 0,
        funded_amount: p.funded_amount ?? 0,
        ha_net_total: p.ha_net_total ?? 0,
        manual_cash_total: p.manual_cash_total ?? 0,
        supporter_count: p.supporter_count ?? 0,
      })));

      // Fetch manual funds
      const { data: fundsData, error: fundsError } = await supabase
        .from('manual_funds')
        .select('*')
        .order('created_at', { ascending: false });

      if (fundsError) throw fundsError;

      setManualFunds(fundsData || []);
    } catch (error: any) {
      console.error('Error loading funding data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de financement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const syncHelloAsso = async (projectId: string, organizationSlug: string, formSlug: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const { data, error } = await supabase.functions.invoke('sync-helloasso', {
        body: { projectId, organizationSlug, formSlug },
      });

      if (error) throw error;

      toast({
        title: 'Synchronisation réussie',
        description: `${data.supporter_count} donateurs, ${data.ha_net_total}€ collectés`,
      });

      // Refresh data
      await loadData();

      return data;
    } catch (error: any) {
      console.error('Error syncing HelloAsso:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: error.message || 'Impossible de synchroniser HelloAsso',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addManualFund = async (fund: Omit<ManualFund, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manual_funds')
        .insert([fund])
        .select()
        .single();

      if (error) throw error;

      // Update project manual_cash_total if linked to a project
      if (fund.project_id) {
        const project = fundingProjects.find(p => p.id === fund.project_id);
        if (project) {
          const newManualTotal = (project.manual_cash_total || 0) + fund.amount;
          await supabase
            .from('projects')
            .update({ 
              manual_cash_total: newManualTotal,
              funded_amount: (project.ha_net_total || 0) + newManualTotal,
            })
            .eq('id', fund.project_id);
        }
      }

      toast({
        title: 'Fonds ajouté',
        description: `${fund.amount}€ ajouté avec succès`,
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error adding manual fund:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le fonds',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Calculate totals
  const totalCollected = fundingProjects.reduce((sum, p) => sum + (p.funded_amount || 0), 0);
  const totalGoal = fundingProjects.reduce((sum, p) => sum + (p.funding_goal || 0), 0);
  const totalSupporters = fundingProjects.reduce((sum, p) => sum + (p.supporter_count || 0), 0);
  const fundedProjectsCount = fundingProjects.filter(p => 
    p.funding_goal > 0 && p.funded_amount >= p.funding_goal
  ).length;

  return {
    fundingProjects,
    manualFunds,
    loading,
    syncHelloAsso,
    addManualFund,
    refetch: loadData,
    stats: {
      totalCollected,
      totalGoal,
      totalSupporters,
      fundedProjectsCount,
      totalProjects: fundingProjects.length,
    },
  };
};
