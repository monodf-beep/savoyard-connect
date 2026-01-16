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
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <div className="space-y-4">
          <div className="h-36 sm:h-40 rounded-xl overflow-hidden relative">
            <img 
              src={adminOnboardingHero} 
              alt="Tableau de bord admin" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end justify-center pb-4">
              <h3 className="text-xl font-bold text-foreground">Tableau de bord admin</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border rounded-xl bg-card">
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>👥</span> Gestion des membres
              </div>
              <p className="text-muted-foreground text-sm mt-1">Ajoutez et organisez vos bénévoles</p>
            </div>
            <div className="p-3 border rounded-xl bg-card">
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>📊</span> Chaînes de valeur
              </div>
              <p className="text-muted-foreground text-sm mt-1">Visualisez les processus</p>
            </div>
            <div className="p-3 border rounded-xl bg-card">
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>🎯</span> Projets
              </div>
              <p className="text-muted-foreground text-sm mt-1">Suivez l'avancement</p>
            </div>
            <div className="p-3 border rounded-xl bg-card">
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>💼</span> Bénévolat
              </div>
              <p className="text-muted-foreground text-sm mt-1">Gérez les offres</p>
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
          <div className="h-32 sm:h-36 bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 p-4 bg-background rounded-xl shadow-lg">
              <div className="text-sm sm:text-base font-mono text-left space-y-1.5">
                <div>📁 Bureau</div>
                <div className="pl-4">├─ 👤 Président</div>
                <div className="pl-4">├─ 👤 Secrétaire</div>
                <div className="pl-4">└─ 👤 Trésorier</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">1</Badge>
              <div>
                <div className="font-semibold text-base">Cliquez sur "Ajouter une personne"</div>
                <p className="text-muted-foreground text-sm">Dans le menu Organisation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">2</Badge>
              <div>
                <div className="font-semibold text-base">Remplissez les informations</div>
                <p className="text-muted-foreground text-sm">Nom, rôle, section, compétences</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">3</Badge>
              <div>
                <div className="font-semibold text-base">Utilisez l'import LinkedIn</div>
                <p className="text-muted-foreground text-sm">Remplissage automatique</p>
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
          <div className="h-36 sm:h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
            <div className="text-center p-4 w-full max-w-sm">
              <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-lg mb-4 border border-primary/20">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">Assistant IA actif</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <p className="text-sm">💬 "Ajoute Rodolphe Simon comme secrétaire"</p>
                </div>
                <div className="bg-muted p-3 rounded-xl">
                  <p className="text-sm">✅ Modification proposée et confirmée</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <div className="text-2xl mb-1">💡</div>
              <div className="font-semibold text-sm">Vocales</div>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="font-semibold text-sm">Images</div>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <div className="text-2xl mb-1">✨</div>
              <div className="font-semibold text-sm">Suggestions</div>
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
          <div className="h-28 sm:h-32 bg-muted rounded-xl flex items-center justify-center overflow-x-auto">
            <div className="flex items-center gap-2 px-4">
              <div className="px-4 py-2 bg-primary/20 rounded-xl border border-primary text-sm font-medium whitespace-nowrap">Édition</div>
              <div className="text-xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/15 rounded-xl border border-primary/60 text-sm font-medium whitespace-nowrap">Relecture</div>
              <div className="text-xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/40 text-sm font-medium whitespace-nowrap">Publication</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">1</Badge>
              <div>
                <div className="font-semibold text-base">Créez des chaînes de processus</div>
                <p className="text-muted-foreground text-sm">Définissez les étapes de vos workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">2</Badge>
              <div>
                <div className="font-semibold text-base">Assignez des acteurs</div>
                <p className="text-muted-foreground text-sm">Personnes ou sections responsables</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">3</Badge>
              <div>
                <div className="font-semibold text-base">Visualisation graphique</div>
                <p className="text-muted-foreground text-sm">Vue avec flèches et connexions</p>
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
          <div className="h-28 sm:h-32 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background p-3 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm font-semibold">Planifié</div>
              </div>
              <div className="bg-background p-3 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-semibold">En cours</div>
              </div>
              <div className="bg-background p-3 rounded-xl shadow text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-semibold">Terminé</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">1</Badge>
              <div>
                <div className="font-semibold text-base">Créez des projets par section</div>
                <p className="text-muted-foreground text-sm">Chaque projet est rattaché à une section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">2</Badge>
              <div>
                <div className="font-semibold text-base">Suivez l'avancement</div>
                <p className="text-muted-foreground text-sm">Statut, dates, description, roadmap</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">3</Badge>
              <div>
                <div className="font-semibold text-base">Vue d'ensemble</div>
                <p className="text-muted-foreground text-sm">Visualisez tous les projets</p>
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
        <div className="space-y-4">
          <div className="h-28 sm:h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
            <div className="bg-background p-5 rounded-xl shadow-lg text-center">
              <div className="text-4xl mb-2">💼</div>
              <div className="text-base font-semibold">Recherche bénévoles</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">1</Badge>
              <div>
                <div className="font-semibold text-base">Créez des postes vacants</div>
                <p className="text-muted-foreground text-sm">Postes recherchés par section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">2</Badge>
              <div>
                <div className="font-semibold text-base">Recevez des candidatures</div>
                <p className="text-muted-foreground text-sm">Via l'organigramme ou page dédiée</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold text-sm h-7 w-7 flex items-center justify-center p-0 shrink-0">3</Badge>
              <div>
                <div className="font-semibold text-base">Publiez des offres détaillées</div>
                <p className="text-muted-foreground text-sm">Page Bénévolat complète</p>
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
        <div className="space-y-4">
          <div className="h-32 sm:h-36 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-6xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold">Tout est prêt !</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 border rounded-xl text-center bg-card">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-semibold text-sm">Besoin d'aide ?</div>
              <p className="text-muted-foreground text-sm mt-1">Boutons (i) pour tutoriels</p>
            </div>
            <div className="p-4 border rounded-xl text-center bg-card">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-sm">Revoir ce guide</div>
              <p className="text-muted-foreground text-sm mt-1">Menu Organisation</p>
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
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <button
          onClick={handleSkip}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-xl sm:text-2xl pr-8">{slides[currentSlide].title}</DialogTitle>
          <p className="text-sm sm:text-base text-muted-foreground">{slides[currentSlide].description}</p>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="py-2 pr-2">
            {slides[currentSlide].content}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-2">
          <div className="flex items-center gap-1.5 order-2 sm:order-1">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-6 sm:w-8 bg-primary' 
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstSlide}
              className="flex-1 sm:flex-initial h-11"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            {isLastSlide ? (
              <Button onClick={handleFinish} className="flex-1 sm:flex-initial h-11">
                Terminer
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1 sm:flex-initial h-11">
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
