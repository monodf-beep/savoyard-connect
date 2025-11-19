import React, { useState } from 'react';
import { JobPosting } from '../types/organigramme';
import { JobPostingCard } from '../components/JobPostingCard';
import { JobPostingForm } from '../components/JobPostingForm';
import { TutorialDialog } from '../components/TutorialDialog';
import { Button } from '../components/ui/button';
import { Plus, Briefcase, Settings, Info } from 'lucide-react';
import { useIsWordPressAdmin } from '../utils/wordpress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Navbar } from '../components/Navbar';

// Données de démonstration
const initialJobPostings: JobPosting[] = [
  {
    id: 'dev-fullstack-1',
    title: 'Développeur Full-Stack Senior',
    department: 'Tech',
    description: 'Nous recherchons un développeur expérimenté pour rejoindre notre équipe technique et contribuer au développement de nos applications web.',
    requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    location: 'Paris / Remote',
    type: 'CDI',
    applicationUrl: 'https://example.com/apply/dev-fullstack',
    publishedDate: '2024-01-15',
    isActive: true
  },
  {
    id: 'marketing-manager-1',
    title: 'Chef de projet Marketing Digital',
    department: 'Marketing',
    description: 'Poste de chef de projet pour développer et exécuter nos stratégies marketing digital.',
    requirements: ['Marketing Digital', 'Google Ads', 'SEO', 'Analytics', 'Gestion de projet'],
    location: 'Lyon',
    type: 'CDI',
    applicationUrl: 'https://example.com/apply/marketing-manager',
    publishedDate: '2024-01-10',
    isActive: true
  },
  {
    id: 'stage-design-1',
    title: 'Stage UX/UI Designer',
    department: 'Design',
    description: 'Stage de 6 mois pour apprendre et contribuer à la création d\'interfaces utilisateur innovantes.',
    requirements: ['Figma', 'Adobe Creative Suite', 'UX Research', 'Prototypage'],
    location: 'Paris',
    type: 'Stage',
    applicationUrl: 'https://example.com/apply/stage-design',
    publishedDate: '2024-01-05',
    isActive: true
  }
];

const Jobs = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(initialJobPostings);
  const [isAdmin, setIsAdmin] = useState(false);
  const isWPAdmin = useIsWordPressAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);

  const activeJobPostings = jobPostings.filter(job => job.isActive);

  const handleSaveJobPosting = (jobPosting: JobPosting) => {
    if (selectedJobPosting) {
      setJobPostings(prev => prev.map(job => 
        job.id === jobPosting.id ? jobPosting : job
      ));
    } else {
      setJobPostings(prev => [...prev, jobPosting]);
    }
    setSelectedJobPosting(null);
  };

  const handleDeleteJobPosting = (jobPostingId: string) => {
    setJobPostings(prev => prev.filter(job => job.id !== jobPostingId));
  };

  const handleEditJobPosting = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setIsFormOpen(true);
  };

  const handleAddJobPosting = () => {
    setSelectedJobPosting(null);
    setIsFormOpen(true);
  };

  const toggleAdminMode = () => {
    setIsAdmin(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Postes Vacants</h1>
              <p className="text-muted-foreground">
                {activeJobPostings.length} poste{activeJobPostings.length > 1 ? 's' : ''} disponible{activeJobPostings.length > 1 ? 's' : ''}
              </p>
            </div>
            <TutorialDialog
              title="Gérer les offres d'emploi"
              description="Publiez et gérez les offres d'emploi externes de votre organisation."
              benefits={[
                "Centraliser toutes les offres d'emploi au même endroit",
                "Rendre visibles les opportunités de recrutement",
                "Faciliter le processus de candidature avec des liens directs",
                "Suivre les postes actifs et archivés",
                "Attirer de nouveaux talents vers votre organisation"
              ]}
              steps={[
                {
                  title: "Activer le mode admin",
                  description: "Cliquez sur le bouton 'Admin' pour activer les fonctionnalités de gestion des offres.",
                  tips: ["Seuls les administrateurs peuvent créer et modifier les offres"]
                },
                {
                  title: "Créer une offre",
                  description: "Cliquez sur 'Ajouter un poste' pour créer une nouvelle offre d'emploi. Renseignez tous les détails importants.",
                  tips: [
                    "Soyez précis sur les compétences requises",
                    "Indiquez clairement le type de contrat (CDI, CDD, Stage)"
                  ]
                },
                {
                  title: "Ajouter un lien de candidature",
                  description: "Fournissez l'URL où les candidats peuvent postuler (formulaire externe, email, etc.).",
                  tips: ["Testez le lien pour vous assurer qu'il fonctionne"]
                },
                {
                  title: "Publier ou désactiver",
                  description: "Marquez l'offre comme active ou inactive selon vos besoins. Les offres inactives ne sont pas visibles publiquement.",
                  tips: ["Désactivez les offres pourvues plutôt que de les supprimer"]
                }
              ]}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Mode Admin activé</p>
                    <p className="text-sm">• Cliquez sur "Ajouter un poste" pour créer une offre</p>
                    <p className="text-sm">• Cliquez sur une carte pour modifier/supprimer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button
              onClick={toggleAdminMode}
              variant={isAdmin ? "default" : "outline"}
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            
            {isAdmin && (
              <Button onClick={handleAddJobPosting}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un poste
              </Button>
            )}
          </div>
        </div>

        {/* Liste des postes */}
        {activeJobPostings.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun poste disponible</h3>
            <p className="text-muted-foreground">
              Il n'y a actuellement aucun poste vacant.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeJobPostings.map((jobPosting) => (
              <JobPostingCard
                key={jobPosting.id}
                jobPosting={jobPosting}
                isAdmin={isAdmin}
                onEdit={handleEditJobPosting}
              />
            ))}
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        <JobPostingForm
          jobPosting={selectedJobPosting}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedJobPosting(null);
          }}
          onSave={handleSaveJobPosting}
          onDelete={handleDeleteJobPosting}
        />
      </div>
    </div>
  );
};

export default Jobs;