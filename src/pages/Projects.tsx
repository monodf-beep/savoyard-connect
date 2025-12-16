import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganigramme } from '@/hooks/useOrganigramme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { ProjectForm } from '@/components/ProjectForm';
import { ProjectGridCard } from '@/components/projects/ProjectGridCard';
import { ProjectDetailDrawer } from '@/components/projects/ProjectDetailDrawer';
import { IdeaBox } from '@/components/projects/IdeaBox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  // Funding fields
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
  const { isAdmin, isSectionLeader, user, loading: authLoading } = useAuth();
  const { data } = useOrganigramme();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch projects
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

  // Écouter les événements de succès de l'assistant IA pour rafraîchir automatiquement
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
    return () => {
      window.removeEventListener('aiAssistantSuccess', handleAISuccess);
    };
  }, []);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!projectData.title || !projectData.title.trim()) {
      toast({
        title: 'Champ manquant',
        description: 'Le titre est requis',
        variant: 'destructive',
      });
      return;
    }
    if (!projectData.section_id) {
      toast({
        title: 'Champ manquant',
        description: 'La section est requise',
        variant: 'destructive',
      });
      return;
    }

    const sanitize = (data: Partial<Project>) => ({
      ...data,
      start_date: data.start_date ? data.start_date : null,
      end_date: data.end_date ? data.end_date : null,
      funding_deadline: data.funding_deadline ? data.funding_deadline : null,
      documents: (data.documents ?? []) as any,
    });

    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(sanitize(projectData) as any)
          .eq('id', editingProject.id);

        if (error) throw error;

        setProjects(
          projects.map((p) =>
            p.id === editingProject.id ? ({ ...p, ...sanitize(projectData) } as Project) : p
          )
        );
        toast({ title: 'Succès', description: 'Projet mis à jour' });
      } else {
        const { data: newData, error } = await supabase
          .from('projects')
          .insert([sanitize(projectData) as any])
          .select()
          .single();

        if (error) throw error;

        setProjects([
          {
            ...newData,
            documents: (newData.documents as any) || [],
            approval_status: (newData.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
          },
          ...projects,
        ]);
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

  const handleAddProject = () => {
    setEditingProject(undefined);
    setShowForm(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowDetail(true);
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    // Only show approved projects to public
    if (p.approval_status !== 'approved' && !isAdmin) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(query) && 
          !(p.description?.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Status filter
    if (filterStatus !== 'all' && p.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Projects */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">Projets & Idées</h1>
                {(isAdmin || isSectionLeader) && (
                  <Button onClick={handleAddProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">
                Financez les projets et partagez vos idées
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="planned">Planifiés</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground">Aucun projet trouvé</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredProjects.map(project => (
                  <ProjectGridCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Idea Box */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <IdeaBox />
          </div>
        </div>

        {/* Project Detail Drawer */}
        <ProjectDetailDrawer
          project={selectedProject}
          open={showDetail}
          onOpenChange={setShowDetail}
        />

        {/* Project Form Dialog */}
        {showForm && (
          <ProjectForm
            project={editingProject}
            sections={data.sections}
            open={showForm}
            onOpenChange={(open) => {
              setShowForm(open);
              if (!open) {
                setEditingProject(undefined);
              }
            }}
            onSave={handleSaveProject}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;
