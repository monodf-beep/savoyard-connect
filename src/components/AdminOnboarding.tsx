import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OnboardingSlide {
  title: string;
  description: string;
  image?: string;
  content: React.ReactNode;
}

interface AdminOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminOnboarding: React.FC<AdminOnboardingProps> = ({ open, onOpenChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: "Bienvenue dans l'interface d'administration",
      description: "Découvrez les principales fonctionnalités pour gérer votre organisation",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">Tableau de bord admin</h3>
              <p className="text-muted-foreground">
                Accédez à tous les outils de gestion en un seul endroit
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">👥 Gestion des membres</div>
              <p className="text-muted-foreground text-xs">Ajoutez, modifiez et organisez vos bénévoles</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">📊 Chaînes de valeur</div>
              <p className="text-muted-foreground text-xs">Visualisez et gérez les processus</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">🎯 Projets</div>
              <p className="text-muted-foreground text-xs">Suivez l'avancement des initiatives</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold mb-1">💼 Recrutement</div>
              <p className="text-muted-foreground text-xs">Gérez les offres et candidatures</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Gérer l'organigramme",
      description: "Ajoutez et organisez les membres de votre organisation",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 text-center p-8">
              <div className="inline-block mb-4 p-4 bg-background rounded-lg shadow-lg">
                <div className="text-sm font-mono text-left space-y-2">
                  <div>📁 Bureau</div>
                  <div className="pl-4">├─ 👤 Président</div>
                  <div className="pl-4">├─ 👤 Secrétaire</div>
                  <div className="pl-4">└─ 👤 Trésorier</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">1</Badge>
              <div>
                <div className="font-semibold">Cliquez sur "Ajouter une personne"</div>
                <p className="text-muted-foreground text-xs">Dans le menu Organisation en haut à gauche</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">2</Badge>
              <div>
                <div className="font-semibold">Remplissez les informations</div>
                <p className="text-muted-foreground text-xs">Nom, rôle, section, compétences, LinkedIn, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">3</Badge>
              <div>
                <div className="font-semibold">Utilisez l'import LinkedIn</div>
                <p className="text-muted-foreground text-xs">Remplissage automatique depuis un profil public</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Assistant IA intégré",
      description: "Gagnez du temps avec l'assistant intelligent",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-lg mb-4 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">Assistant IA actif</span>
              </div>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">💬 "Ajoute Rodolphe Simon comme secrétaire"</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">✅ Modification proposée et confirmée</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-semibold mb-1">💡 Commandes vocales</div>
              <p className="text-muted-foreground text-xs">Dictez vos modifications à haute voix</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-semibold mb-1">🖼️ Analyse d'images</div>
              <p className="text-muted-foreground text-xs">Uploadez des photos de trombinoscope</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-semibold mb-1">✨ Suggestions intelligentes</div>
              <p className="text-muted-foreground text-xs">L'IA propose des améliorations contextuelles</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Chaînes de valeur",
      description: "Visualisez et gérez les processus de votre organisation",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 p-6">
              <div className="px-4 py-2 bg-primary/20 rounded-lg border-2 border-primary font-medium">Édition</div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/15 rounded-lg border-2 border-primary/60 font-medium">Relecture</div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/10 rounded-lg border-2 border-primary/40 font-medium">Publication</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">1</Badge>
              <div>
                <div className="font-semibold">Créez des chaînes de processus</div>
                <p className="text-muted-foreground text-xs">Définissez les étapes de vos workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">2</Badge>
              <div>
                <div className="font-semibold">Assignez des acteurs</div>
                <p className="text-muted-foreground text-xs">Personnes ou sections responsables de chaque segment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">3</Badge>
              <div>
                <div className="font-semibold">Visualisation graphique</div>
                <p className="text-muted-foreground text-xs">Vue esthétique avec flèches et connexions</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Gestion des projets",
      description: "Suivez et organisez les projets de votre organisation",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-background p-3 rounded-lg shadow-lg">
                  <div className="text-xs font-semibold mb-1">Planifié</div>
                  <div className="text-2xl">📋</div>
                </div>
                <div className="bg-background p-3 rounded-lg shadow-lg">
                  <div className="text-xs font-semibold mb-1">En cours</div>
                  <div className="text-2xl">⚡</div>
                </div>
                <div className="bg-background p-3 rounded-lg shadow-lg">
                  <div className="text-xs font-semibold mb-1">Terminé</div>
                  <div className="text-2xl">✅</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">1</Badge>
              <div>
                <div className="font-semibold">Créez des projets par section</div>
                <p className="text-muted-foreground text-xs">Chaque projet est rattaché à une section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">2</Badge>
              <div>
                <div className="font-semibold">Suivez l'avancement</div>
                <p className="text-muted-foreground text-xs">Statut, dates, description, roadmap et documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">3</Badge>
              <div>
                <div className="font-semibold">Vue d'ensemble</div>
                <p className="text-muted-foreground text-xs">Visualisez tous les projets en cours</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Recrutement et offres",
      description: "Gérez les postes vacants et les candidatures",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="inline-block bg-background p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-2">💼</div>
                <div className="text-sm font-semibold mb-1">Postes vacants</div>
                <div className="text-xs text-muted-foreground">Publiez et gérez vos offres</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">1</Badge>
              <div>
                <div className="font-semibold">Créez des postes vacants</div>
                <p className="text-muted-foreground text-xs">Définissez les postes recherchés par section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">2</Badge>
              <div>
                <div className="font-semibold">Recevez des candidatures</div>
                <p className="text-muted-foreground text-xs">Les candidats postulent directement via l'organigramme</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5">3</Badge>
              <div>
                <div className="font-semibold">Publiez des offres détaillées</div>
                <p className="text-muted-foreground text-xs">Page Jobs pour offres d'emploi complètes</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Vous êtes prêt !",
      description: "Commencez à gérer votre organisation efficacement",
      content: (
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Tout est prêt !</h3>
              <p className="text-muted-foreground">
                Explorez l'interface et n'hésitez pas à utiliser l'assistant IA
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-semibold mb-1">Besoin d'aide ?</div>
              <p className="text-muted-foreground text-xs">Cliquez sur les boutons (i) pour les tutoriels</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold mb-1">Revoir ce guide</div>
              <p className="text-muted-foreground text-xs">Accessible depuis le menu Organisation</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('admin-onboarding-completed', 'true');
    onOpenChange(false);
    setCurrentSlide(0);
  };

  const handleSkip = () => {
    localStorage.setItem('admin-onboarding-completed', 'true');
    onOpenChange(false);
    setCurrentSlide(0);
  };

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
    }
  }, [open]);

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle>{slides[currentSlide].title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{slides[currentSlide].description}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 px-1">
          {slides[currentSlide].content}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstSlide}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            {isLastSlide ? (
              <Button onClick={handleFinish}>
                Terminer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
