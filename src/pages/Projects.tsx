import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganigramme } from '@/hooks/useOrganigramme';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectForm } from '@/components/ProjectForm';
import { TutorialDialog } from '@/components/TutorialDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';

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
}

const Projects = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { data } = useOrganigramme();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();

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
        })));
      }
    };

    window.addEventListener('aiAssistantSuccess', handleAISuccess);
    return () => {
      window.removeEventListener('aiAssistantSuccess', handleAISuccess);
    };
  }, []);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    // Basic validation (Select required isn't enforced by the Radix Select)
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
      // Convert empty strings to null for optional date columns to avoid Postgres errors
      start_date: data.start_date ? data.start_date : null,
      end_date: data.end_date ? data.end_date : null,
      // Ensure documents is always an array
      documents: (data.documents ?? []) as any,
    });

    try {
      if (editingProject) {
        // Update
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
        // Create
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
          },
          ...projects,
        ]);
        toast({ title: 'Succès', description: 'Projet créé' });
      }

      setShowForm(false);
      setEditingProject(undefined);
      setSelectedSectionId(undefined);
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: 'Erreur',
        description: error?.message || "Impossible d’enregistrer le projet",
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le projet',
        variant: 'destructive',
      });
      return;
    }

    setProjects(projects.filter(p => p.id !== projectId));
    toast({
      title: 'Succès',
      description: 'Projet supprimé',
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleAddProject = () => {
    setEditingProject(undefined);
    setShowForm(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Group projects by section
  const projectsBySection = projects.reduce((acc, project) => {
    const sectionId = project.section_id;
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">Projets</h1>
              <p className="text-muted-foreground mt-1">
                Découvrez les projets en cours et à venir des groupes et commissions
              </p>
            </div>
            <TutorialDialog
              title="Gérer les projets"
              description="Suivez et organisez les projets de votre organisation par section."
              benefits={[
                "Centraliser tous les projets de l'organisation",
                "Suivre l'avancement de chaque projet (planifié, en cours, terminé)",
                "Associer les projets aux bonnes sections/commissions",
                "Partager des documents et feuilles de route",
                "Maintenir un historique des réalisations"
              ]}
              steps={[
                {
                  title: "Créer un projet",
                  description: "Cliquez sur 'Nouveau projet' pour ajouter un projet à une section. Remplissez les informations de base.",
                  tips: ["Choisissez un titre clair et descriptif"]
                },
                {
                  title: "Définir le statut",
                  description: "Indiquez si le projet est planifié, en cours ou terminé pour suivre sa progression.",
                  tips: ["Mettez à jour le statut régulièrement"]
                },
                {
                  title: "Ajouter dates et documents",
                  description: "Précisez les dates de début et fin, et joignez des documents pertinents (rapports, plans, etc.).",
                  tips: ["Les documents restent accessibles à tous les membres"]
                },
                {
                  title: "Décrire la feuille de route",
                  description: "Utilisez le champ 'Roadmap' pour détailler les étapes et jalons du projet.",
                  tips: ["Une feuille de route claire facilite la coordination"]
                }
              ]}
            />
          </div>
          {isAdmin && (
            <Button onClick={handleAddProject}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          )}
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun projet pour le moment</p>
          </div>
        ) : (
        <div className="space-y-8">
            {Object.entries(projectsBySection).map(([sectionId, sectionProjects]) => {
              const section = data.sections.find(s => s.id === sectionId);
              
              return (
                <div key={sectionId}>
                  <h2 className="text-2xl font-semibold mb-4">
                    {section?.title || 'Section inconnue'}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sectionProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isAdmin={isAdmin}
                        onEdit={() => handleEditProject(project)}
                        onDelete={() => handleDeleteProject(project.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                setSelectedSectionId(undefined);
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
