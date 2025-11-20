import React from 'react';
import { Organigramme } from '../components/Organigramme';
import { Navbar } from '../components/Navbar';
import { TutorialDialog } from '../components/TutorialDialog';
import { useAuth } from '@/hooks/useAuth';
import { Info, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAdmin } = useAuth();
  const [orgStats, setOrgStats] = React.useState({ totalMembers: 0, vacantPositionsCount: 0 });
  
  const handleAddPerson = () => {
    const event = new CustomEvent('openPersonForm');
    window.dispatchEvent(event);
  };

  const handleAddSection = () => {
    const event = new CustomEvent('openSectionForm');
    window.dispatchEvent(event);
  };

  const handleAddVacantPosition = () => {
    const event = new CustomEvent('openVacantPositionForm');
    window.dispatchEvent(event);
  };

  const handleImport = () => {
    const event = new CustomEvent('openImportDialog');
    window.dispatchEvent(event);
  };

  const handleVacantPositionsClick = () => {
    const event = new CustomEvent('openVacantPositions');
    window.dispatchEvent(event);
  };

  // Écouter les stats de l'organigramme
  React.useEffect(() => {
    const handleStats = (event: CustomEvent) => {
      setOrgStats(event.detail);
    };

    window.addEventListener('organigrammeStats', handleStats as EventListener);
    return () => {
      window.removeEventListener('organigrammeStats', handleStats as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onAddPerson={handleAddPerson}
        onAddSection={handleAddSection}
        onAddVacantPosition={handleAddVacantPosition}
        onImport={handleImport}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Organigramme</h1>
              <TutorialDialog
                title="Comprendre l'organigramme"
                description="L'organigramme est l'outil central pour gérer votre organisation."
                benefits={[
                  "Visualiser toute la structure de l'organisation en un coup d'œil",
                  "Gérer les membres, leurs rôles et compétences",
                  "Organiser les sections et sous-sections hiérarchiques",
                  "Publier des postes vacants pour recruter de nouveaux talents",
                  "Faciliter la communication interne et externe"
                ]}
                steps={[
                  {
                    title: "Naviguer dans les vues",
                    description: "Utilisez les boutons Ligne, Tuiles et Membres pour changer de vue. Chaque vue offre une perspective différente sur votre organisation.",
                    tips: [
                      "Vue Ligne : hiérarchie complète",
                      "Vue Tuiles : sections en cartes",
                      "Vue Membres : focus sur les personnes"
                    ]
                  },
                  {
                    title: "Ajouter des membres",
                    description: "Cliquez sur 'Ajouter une personne' dans le menu Organisation. Remplissez les informations (nom, titre, compétences, etc.).",
                    tips: ["Utilisez l'import LinkedIn pour gagner du temps"]
                  },
                  {
                    title: "Créer des sections",
                    description: "Organisez votre structure avec des sections (Bureau, Commissions, Groupes). Créez des hiérarchies en définissant des parents.",
                    tips: ["Une bonne structure facilite la navigation"]
                  },
                  {
                    title: "Gérer les postes vacants",
                    description: "Publiez des postes à pourvoir pour attirer de nouveaux bénévoles. Ils apparaîtront dans l'organigramme et pourront recevoir des candidatures spontanées.",
                    tips: ["Soyez précis sur le rôle et les attentes"]
                  }
                ]}
              />
            </div>
            <p className="text-muted-foreground">Vue complète de la structure organisationnelle</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-primary/10 text-primary font-medium px-3 py-1 rounded-full border border-primary/20">
              {orgStats.totalMembers} membres
            </span>
            <Button
              onClick={handleVacantPositionsClick}
              variant="outline"
              size="sm"
              className="text-xs h-8"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Postes vacants
            </Button>
          </div>
        </div>
      </div>

      <Organigramme isAdminMode={false} />
    </div>
  );
};

export default Index;
