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
import adminOnboardingHero from '@/assets/admin-onboarding-hero.jpg';

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
        <div className="space-y-3">
          <div className="h-32 rounded-lg overflow-hidden relative">
            <img 
              src={adminOnboardingHero} 
              alt="Tableau de bord admin" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-3">
              <h3 className="text-lg font-bold text-foreground">Tableau de bord admin</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 border rounded-lg">
              <div className="font-semibold text-xs">👥 Gestion des membres</div>
              <p className="text-muted-foreground text-xs">Ajoutez et organisez vos bénévoles</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold text-xs">📊 Chaînes de valeur</div>
              <p className="text-muted-foreground text-xs">Visualisez les processus</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold text-xs">🎯 Projets</div>
              <p className="text-muted-foreground text-xs">Suivez l'avancement</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold text-xs">💼 Bénévolat</div>
              <p className="text-muted-foreground text-xs">Gérez les offres</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Gérer l'organigramme",
      description: "Ajoutez et organisez les membres de votre organisation",
      content: (
        <div className="space-y-3">
          <div className="h-28 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 p-3 bg-background rounded-lg shadow-lg">
              <div className="text-xs font-mono text-left space-y-1">
                <div>📁 Bureau</div>
                <div className="pl-3">├─ 👤 Président</div>
                <div className="pl-3">├─ 👤 Secrétaire</div>
                <div className="pl-3">└─ 👤 Trésorier</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">1</Badge>
              <div>
                <div className="font-semibold text-sm">Cliquez sur "Ajouter une personne"</div>
                <p className="text-muted-foreground text-xs">Dans le menu Organisation</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">2</Badge>
              <div>
                <div className="font-semibold text-sm">Remplissez les informations</div>
                <p className="text-muted-foreground text-xs">Nom, rôle, section, compétences</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">3</Badge>
              <div>
                <div className="font-semibold text-sm">Utilisez l'import LinkedIn</div>
                <p className="text-muted-foreground text-xs">Remplissage automatique</p>
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
        <div className="space-y-3">
          <div className="h-28 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <div className="inline-flex items-center gap-2 bg-background px-3 py-1.5 rounded-full shadow-lg mb-3 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-medium text-primary">Assistant IA actif</span>
              </div>
              <div className="space-y-1.5 text-left max-w-xs mx-auto">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <p className="text-xs">💬 "Ajoute Rodolphe Simon comme secrétaire"</p>
                </div>
                <div className="bg-muted p-2 rounded-lg">
                  <p className="text-xs">✅ Modification proposée et confirmée</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <div className="text-lg mb-1">💡</div>
              <div className="font-semibold text-xs">Vocales</div>
            </div>
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <div className="text-lg mb-1">🖼️</div>
              <div className="font-semibold text-xs">Images</div>
            </div>
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <div className="text-lg mb-1">✨</div>
              <div className="font-semibold text-xs">Suggestions</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Chaînes de valeur",
      description: "Visualisez et gérez les processus de votre organisation",
      content: (
        <div className="space-y-3">
          <div className="h-24 bg-muted rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-1.5 px-4">
              <div className="px-3 py-1.5 bg-primary/20 rounded-lg border border-primary text-sm font-medium">Édition</div>
              <div className="text-lg text-muted-foreground">→</div>
              <div className="px-3 py-1.5 bg-primary/15 rounded-lg border border-primary/60 text-sm font-medium">Relecture</div>
              <div className="text-lg text-muted-foreground">→</div>
              <div className="px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/40 text-sm font-medium">Publication</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">1</Badge>
              <div>
                <div className="font-semibold text-sm">Créez des chaînes de processus</div>
                <p className="text-muted-foreground text-xs">Définissez les étapes de vos workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">2</Badge>
              <div>
                <div className="font-semibold text-sm">Assignez des acteurs</div>
                <p className="text-muted-foreground text-xs">Personnes ou sections responsables</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">3</Badge>
              <div>
                <div className="font-semibold text-sm">Visualisation graphique</div>
                <p className="text-muted-foreground text-xs">Vue avec flèches et connexions</p>
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
        <div className="space-y-3">
          <div className="h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-background p-2 rounded-lg shadow text-center">
                <div className="text-lg">📋</div>
                <div className="text-xs font-semibold">Planifié</div>
              </div>
              <div className="bg-background p-2 rounded-lg shadow text-center">
                <div className="text-lg">⚡</div>
                <div className="text-xs font-semibold">En cours</div>
              </div>
              <div className="bg-background p-2 rounded-lg shadow text-center">
                <div className="text-lg">✅</div>
                <div className="text-xs font-semibold">Terminé</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">1</Badge>
              <div>
                <div className="font-semibold text-sm">Créez des projets par section</div>
                <p className="text-muted-foreground text-xs">Chaque projet est rattaché à une section</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">2</Badge>
              <div>
                <div className="font-semibold text-sm">Suivez l'avancement</div>
                <p className="text-muted-foreground text-xs">Statut, dates, description, roadmap</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">3</Badge>
              <div>
                <div className="font-semibold text-sm">Vue d'ensemble</div>
                <p className="text-muted-foreground text-xs">Visualisez tous les projets</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Bénévolat et offres",
      description: "Gérez les recherches de bénévoles et candidatures",
      content: (
        <div className="space-y-3">
          <div className="h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
            <div className="bg-background p-4 rounded-lg shadow-lg text-center">
              <div className="text-3xl mb-1">💼</div>
              <div className="text-sm font-semibold">Recherche bénévoles</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">1</Badge>
              <div>
                <div className="font-semibold text-sm">Créez des postes vacants</div>
                <p className="text-muted-foreground text-xs">Postes recherchés par section</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">2</Badge>
              <div>
                <div className="font-semibold text-sm">Recevez des candidatures</div>
                <p className="text-muted-foreground text-xs">Via l'organigramme ou page dédiée</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-xs">3</Badge>
              <div>
                <div className="font-semibold text-sm">Publiez des offres détaillées</div>
                <p className="text-muted-foreground text-xs">Page Bénévolat complète</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Vous êtes prêt !",
      description: "Commencez à gérer votre organisation",
      content: (
        <div className="space-y-3">
          <div className="h-28 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">Tout est prêt !</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xl mb-1">❓</div>
              <div className="font-semibold text-xs">Besoin d'aide ?</div>
              <p className="text-muted-foreground text-xs">Boutons (i) pour tutoriels</p>
            </div>
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xl mb-1">🔄</div>
              <div className="font-semibold text-xs">Revoir ce guide</div>
              <p className="text-muted-foreground text-xs">Menu Organisation</p>
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

  // Handle dialog close (click outside, escape, etc.) - always mark as seen
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      localStorage.setItem('admin-onboarding-completed', 'true');
      setCurrentSlide(0);
    }
    onOpenChange(isOpen);
  };

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
    }
  }, [open]);

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">{slides[currentSlide].title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{slides[currentSlide].description}</p>
        </DialogHeader>

        <div className="flex-1 py-2 px-1">
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
