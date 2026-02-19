import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useOrganigramme } from '@/hooks/useOrganigramme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Lightbulb, ChevronDown } from 'lucide-react';
import { ProjectForm } from '@/components/ProjectForm';
import { ProjectsKanban } from '@/components/projects/ProjectsKanban';
import { IdeaBox } from '@/components/projects/IdeaBox';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface Project {
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
  created_by?: string;
  approved_by?: string;
  funding_goal?: number;
  funded_amount?: number;
  ha_net_total?: number;
  manual_cash_total?: number;
  supporter_count?: number;
  funding_deadline?: string;
  is_funding_project?: boolean;
  cover_image_url?: string;
}

const Projects = () => {
  const { t } = useTranslation();
  const { isAdmin, isSectionLeader, user, loading: authLoading } = useAuth();
  const { data } = useOrganigramme();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [ideaBoxOpen, setIdeaBoxOpen] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les projets',
          variant: 'destructive',
        });
      } else {
        setProjects((data || []).map(p => ({
          ...p,
          documents: (p.documents as any) || [],
          approval_status: (p.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
        })));
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [toast]);

  useEffect(() => {
    const handleAISuccess = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(data.map(p => ({
          ...p,
          documents: (p.documents as any) || [],
          approval_status: (p.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
        })));
      }
    };

    window.addEventListener('aiAssistantSuccess', handleAISuccess);
    return () => window.removeEventListener('aiAssistantSuccess', handleAISuccess);
  }, []);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!projectData.title?.trim()) {
      toast({ title: 'Champ manquant', description: 'Le titre est requis', variant: 'destructive' });
      return;
    }
    if (!projectData.section_id) {
      toast({ title: 'Champ manquant', description: 'La section est requise', variant: 'destructive' });
      return;
    }

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData as any)
          .eq('id', editingProject.id);

        if (error) throw error;

        setProjects(projects.map(p =>
          p.id === editingProject.id ? { ...p, ...projectData } as Project : p
        ));
        toast({ title: 'Succès', description: 'Projet mis à jour' });
      } else {
        const insertData: any = {
          ...projectData,
          created_by: user?.id,
        };
        // Section leaders' projects need approval
        if (isSectionLeader && !isAdmin) {
          insertData.approval_status = 'pending';
        }

        const { data: newData, error } = await supabase
          .from('projects')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        setProjects([{
          ...newData,
          documents: (newData.documents as any) || [],
          approval_status: (newData.approval_status as any) || 'pending',
        }, ...projects]);
        toast({ title: 'Succès', description: 'Projet créé' });
      }

      setShowForm(false);
      setEditingProject(undefined);
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: 'Erreur',
        description: error?.message || "Impossible d'enregistrer le projet",
        variant: 'destructive',
      });
    }
  };

  const handleProjectClick = (project: Project) => {
    if (isAdmin) {
      setEditingProject(project);
      setShowForm(true);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (p.approval_status !== 'approved' && !isAdmin) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(query) &&
          !(p.description?.toLowerCase().includes(query))) {
        return false;
      }
    }
    return true;
  });

  const handleStatusChange = async (projectId: string, newStatus: 'planned' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      ));
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({ title: 'Erreur', description: "Impossible de modifier le statut", variant: 'destructive' });
    }
  };

  if (authLoading || isLoading) {
    return (
      <HubPageLayout breadcrumb={t('nav.projects')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </HubPageLayout>
    );
  }

  return (
    <HubPageLayout breadcrumb={t('nav.projects')}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">{t('nav.projects')}</h1>
          {(isAdmin || isSectionLeader) && (
            <Button onClick={() => { setEditingProject(undefined); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Suivez l'avancement des projets de l'association
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kanban - Full Width */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <p className="text-muted-foreground">Aucun projet trouvé</p>
        </div>
      ) : (
        <ProjectsKanban
          projects={filteredProjects}
          onStatusChange={handleStatusChange}
          onProjectClick={handleProjectClick}
          isAdmin={isAdmin}
        />
      )}

      {/* Idea Box - Collapsible section */}
      <Collapsible open={ideaBoxOpen} onOpenChange={setIdeaBoxOpen} className="mt-8">
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors group">
          <Lightbulb className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Boîte à Idées</span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground ml-auto transition-transform",
            ideaBoxOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <IdeaBox />
        </CollapsibleContent>
      </Collapsible>

      {/* Project Form Dialog (unified for all roles) */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          sections={data.sections}
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingProject(undefined);
          }}
          onSave={handleSaveProject}
        />
      )}
    </HubPageLayout>
  );
};

export default Projects;
