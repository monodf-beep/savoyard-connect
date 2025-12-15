import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFundingProjects } from '@/hooks/useFundingProjects';
import { Navbar } from '@/components/Navbar';
import { FundingStats } from '@/components/funding/FundingStats';
import { FundingProjectCard } from '@/components/funding/FundingProjectCard';
import { HelloAssoSyncDialog } from '@/components/funding/HelloAssoSyncDialog';
import { ManualFundForm } from '@/components/funding/ManualFundForm';
import { TutorialDialog } from '@/components/TutorialDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, RefreshCw, Banknote, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { fundingProjects, manualFunds, loading, stats, syncHelloAsso, addManualFund } = useFundingProjects();
  
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ id: string; title: string } | null>(null);
  const [manualFundFormOpen, setManualFundFormOpen] = useState(false);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);

  const handleOpenSync = (projectId: string, projectTitle: string) => {
    setSelectedProject({ id: projectId, title: projectTitle });
    setSyncDialogOpen(true);
  };

  const handleSync = async (organizationSlug: string, formSlug: string) => {
    if (!selectedProject) return;
    setSyncingProjectId(selectedProject.id);
    try {
      await syncHelloAsso(selectedProject.id, organizationSlug, formSlug);
    } finally {
      setSyncingProjectId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Separate active and completed projects
  const activeProjects = fundingProjects.filter(p => 
    p.funded_amount < p.funding_goal || p.status !== 'completed'
  );
  const completedProjects = fundingProjects.filter(p => 
    p.funded_amount >= p.funding_goal && p.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="text-muted-foreground mt-1">
                Suivi des financements et collectes de l'association
              </p>
            </div>
            <TutorialDialog
              title="Dashboard de financement"
              description="Visualisez et gérez les collectes de fonds de votre association en toute transparence."
              benefits={[
                "Suivre les objectifs de financement en temps réel",
                "Synchroniser automatiquement les dons HelloAsso",
                "Enregistrer les dons manuels (chèques, virements, espèces)",
                "Offrir une transparence totale aux membres et donateurs",
              ]}
              steps={[
                {
                  title: "Créer un projet de financement",
                  description: "Allez dans la page Projets et cochez 'Projet de financement' lors de la création.",
                },
                {
                  title: "Synchroniser HelloAsso",
                  description: "Cliquez sur l'icône de synchronisation pour connecter un formulaire HelloAsso.",
                },
                {
                  title: "Ajouter des fonds manuels",
                  description: "Enregistrez les dons reçus par chèque, virement ou espèces.",
                },
              ]}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setManualFundFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un fonds
            </Button>
          )}
        </div>

        {/* Stats */}
        <FundingStats stats={stats} />

        {/* Main Content */}
        <Tabs defaultValue="projects" className="mt-8">
          <TabsList>
            <TabsTrigger value="projects">Projets en cours</TabsTrigger>
            <TabsTrigger value="completed">Projets financés</TabsTrigger>
            <TabsTrigger value="ledger">Journal des dons</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            {activeProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun projet de financement en cours.
                  </p>
                  {isAdmin && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Créez un projet et cochez "Projet de financement" pour commencer.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <FundingProjectCard
                    key={project.id}
                    project={project}
                    isAdmin={isAdmin}
                    onSync={() => handleOpenSync(project.id, project.title)}
                    isSyncing={syncingProjectId === project.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Aucun projet financé pour le moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedProjects.map((project) => (
                  <FundingProjectCard
                    key={project.id}
                    project={project}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ledger" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Journal des fonds manuels
                </CardTitle>
                <CardDescription>
                  Historique des dons et contributions reçus en dehors de HelloAsso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {manualFunds.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Aucun fonds manuel enregistré.
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {manualFunds.map((fund) => {
                      const project = fundingProjects.find(p => p.id === fund.project_id);
                      return (
                        <AccordionItem key={fund.id} value={fund.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-4 text-left">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(fund.created_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                              <span className="font-medium">
                                {fund.amount.toLocaleString('fr-FR')}€
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {fund.source}
                              </span>
                              {project && (
                                <span className="text-sm text-primary">
                                  → {project.title}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm pl-4">
                              {fund.donor_name && (
                                <p><strong>Donateur :</strong> {fund.donor_name}</p>
                              )}
                              {fund.note && (
                                <p><strong>Note :</strong> {fund.note}</p>
                              )}
                              <p className="text-muted-foreground">
                                {fund.is_public ? 'Visible publiquement' : 'Privé'}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {selectedProject && (
        <HelloAssoSyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          onSync={handleSync}
        />
      )}

      <ManualFundForm
        open={manualFundFormOpen}
        onOpenChange={setManualFundFormOpen}
        projects={fundingProjects}
        onSubmit={addManualFund}
      />
    </div>
  );
};

export default Dashboard;
