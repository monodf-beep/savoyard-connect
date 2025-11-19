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
        <div className="space-y-3">
          <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            <div className="text-center px-4">
              <h3 className="text-xl font-bold mb-2">Tableau de bord admin</h3>
              <p className="text-sm text-muted-foreground">
                Accédez à tous les outils de gestion en un seul endroit
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 border rounded-lg">
              <div className="font-semibold mb-0.5">👥 Gestion membres</div>
              <p className="text-muted-foreground">Ajoutez et organisez</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold mb-0.5">📊 Chaînes valeur</div>
              <p className="text-muted-foreground">Gérez les processus</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold mb-0.5">🎯 Projets</div>
              <p className="text-muted-foreground">Suivez les initiatives</p>
            </div>
            <div className="p-2 border rounded-lg">
              <div className="font-semibold mb-0.5">💼 Recrutement</div>
              <p className="text-muted-foreground">Gérez les offres</p>
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
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 text-center">
              <div className="inline-block p-3 bg-background rounded-lg shadow-lg">
                <div className="text-xs font-mono text-left space-y-1">
                  <div>📁 Bureau</div>
                  <div className="pl-3">├─ 👤 Président</div>
                  <div className="pl-3">├─ 👤 Secrétaire</div>
                  <div className="pl-3">└─ 👤 Trésorier</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">1</Badge>
              <div>
                <div className="font-semibold">Cliquez "Ajouter une personne"</div>
                <p className="text-muted-foreground">Menu Organisation</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">2</Badge>
              <div>
                <div className="font-semibold">Remplissez les informations</div>
                <p className="text-muted-foreground">Nom, rôle, section, etc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">3</Badge>
              <div>
                <div className="font-semibold">Import LinkedIn automatique</div>
                <p className="text-muted-foreground">Depuis un profil public</p>
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
          <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center px-4">
              <div className="inline-flex items-center gap-2 bg-background px-3 py-1 rounded-full shadow-lg mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Assistant IA actif</span>
              </div>
              <div className="space-y-1.5 text-left max-w-xs mx-auto">
                <div className="bg-primary/10 p-2 rounded text-xs">
                  💬 "Ajoute Rodolphe Simon"
                </div>
                <div className="bg-muted p-2 rounded text-xs">
                  ✅ Modification confirmée
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="font-semibold">💡 Commandes vocales</div>
              <p className="text-muted-foreground">Dictez vos modifications</p>
            </div>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="font-semibold">🖼️ Analyse d'images</div>
              <p className="text-muted-foreground">Uploadez des photos</p>
            </div>
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="font-semibold">✨ Suggestions intelligentes</div>
              <p className="text-muted-foreground">Améliorations contextuelles</p>
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
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-1.5 px-4">
              <div className="px-3 py-1.5 bg-primary/20 rounded-lg border-2 border-primary text-xs font-semibold">Édition</div>
              <div className="text-lg">→</div>
              <div className="px-3 py-1.5 bg-accent/20 rounded-lg border-2 border-accent text-xs font-semibold">Relecture</div>
              <div className="text-lg">→</div>
              <div className="px-3 py-1.5 bg-green-500/20 rounded-lg border-2 border-green-500 text-xs font-semibold">Publication</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">1</Badge>
              <div>
                <div className="font-semibold">Créez des chaînes de processus</div>
                <p className="text-muted-foreground">Définissez les étapes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">2</Badge>
              <div>
                <div className="font-semibold">Assignez des acteurs</div>
                <p className="text-muted-foreground">Personnes ou sections</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="mt-0.5 text-xs h-5">3</Badge>
              <div>
                <div className="font-semibold">Visualisation graphique</div>
                <p className="text-muted-foreground">Vue avec flèches</p>
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
        <div className="space-y-3">
          <div className="h-32 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold mb-1">Tout est prêt !</h3>
              <p className="text-sm text-muted-foreground">
                Explorez l'interface et utilisez l'assistant IA
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xl mb-1">❓</div>
              <div className="font-semibold mb-0.5">Besoin d'aide ?</div>
              <p className="text-muted-foreground">Boutons (i) pour tutoriels</p>
            </div>
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xl mb-1">🔄</div>
              <div className="font-semibold mb-0.5">Revoir ce guide</div>
              <p className="text-muted-foreground">Menu Organisation</p>
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
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{slides[currentSlide].title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 px-2 text-muted-foreground"
            >
              Passer
              <X className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{slides[currentSlide].description}</p>
        </DialogHeader>

        <div className="py-4">
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
