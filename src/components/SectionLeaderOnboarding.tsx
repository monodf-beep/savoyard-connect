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
  content: React.ReactNode;
}

interface SectionLeaderOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SectionLeaderOnboarding: React.FC<SectionLeaderOnboardingProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: "Bienvenue, Responsable de Section !",
      description: "Découvrez vos droits et responsabilités en tant que leader",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold mb-4">Vous êtes responsable de section</h3>
              <p className="text-muted-foreground max-w-md">
                Vous avez maintenant des droits spéciaux pour gérer votre section et contribuer à l'organisation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-semibold mb-2 text-primary">✅ Vous pouvez</div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• Gérer votre section</li>
                <li>• Créer des projets</li>
                <li>• Recruter des bénévoles</li>
              </ul>
            </div>
            <div className="p-4 bg-muted border rounded-lg">
              <div className="font-semibold mb-2">ℹ️ À savoir</div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• Validation admin requise</li>
                <li>• Accès limité à votre section</li>
                <li>• Données sensibles protégées</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Gérer votre section",
      description: "Modifiez les informations et gérez les membres",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 text-center p-8">
              <div className="inline-block mb-4 p-6 bg-background rounded-lg shadow-lg">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-lg font-semibold">Ma Section</div>
                <div className="text-sm text-muted-foreground">Contrôle total</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">1</Badge>
              <div>
                <div className="font-semibold">Modifier les informations de la section</div>
                <p className="text-muted-foreground text-xs">Titre, description, localisation des réunions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">2</Badge>
              <div>
                <div className="font-semibold">Ajouter/retirer des membres</div>
                <p className="text-muted-foreground text-xs">Gérez qui fait partie de votre section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">3</Badge>
              <div>
                <div className="font-semibold">Éditer les profils des membres</div>
                <p className="text-muted-foreground text-xs">Mettre à jour les rôles et informations</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Créer des projets",
      description: "Proposez des projets qui nécessitent validation admin",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="space-y-4">
                <div className="inline-block p-4 bg-background rounded-lg shadow-lg">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-sm font-semibold">Nouveau projet</div>
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <div className="text-2xl">→</div>
                </div>
                <div className="inline-block p-4 bg-orange-500/20 rounded-lg border-2 border-orange-500/40">
                  <div className="text-2xl mb-2">⏳</div>
                  <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">En attente d'approbation</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">1</Badge>
              <div>
                <div className="font-semibold">Créez des projets pour votre section</div>
                <p className="text-muted-foreground text-xs">Proposez de nouvelles initiatives</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 font-bold">!</Badge>
              <div>
                <div className="font-semibold">Validation admin requise</div>
                <p className="text-muted-foreground text-xs">Un administrateur doit approuver avant publication</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">2</Badge>
              <div>
                <div className="font-semibold">Modifiez vos projets approuvés</div>
                <p className="text-muted-foreground text-xs">Une fois approuvés, vous gardez le contrôle</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Gérer le recrutement",
      description: "Créez des recherches de bénévoles et gérez les candidatures",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="inline-block bg-background p-6 rounded-lg shadow-lg">
                <div className="text-5xl mb-3">🤝</div>
                <div className="text-lg font-semibold mb-1">Recrutement</div>
                <div className="text-xs text-muted-foreground">Trouvez de nouveaux bénévoles</div>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">1</Badge>
              <div>
                <div className="font-semibold">Créer des recherches de bénévoles</div>
                <p className="text-muted-foreground text-xs">Publiez les postes vacants dans votre section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">2</Badge>
              <div>
                <div className="font-semibold">Consulter les candidatures spontanées</div>
                <p className="text-muted-foreground text-xs">Accédez aux candidatures pour votre section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">3</Badge>
              <div>
                <div className="font-semibold">Inviter à compléter le profil</div>
                <p className="text-muted-foreground text-xs">Envoyez des invitations aux nouveaux membres</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Créer des chaînes de valeur",
      description: "Proposez des processus pour votre section",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 p-6">
              <div className="px-4 py-2 bg-primary/20 rounded-lg border-2 border-primary font-medium text-sm">Étape 1</div>
              <div className="text-xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/15 rounded-lg border-2 border-primary/60 font-medium text-sm">Étape 2</div>
              <div className="text-xl text-muted-foreground">→</div>
              <div className="px-4 py-2 bg-primary/10 rounded-lg border-2 border-primary/40 font-medium text-sm">Étape 3</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">1</Badge>
              <div>
                <div className="font-semibold">Définir des processus</div>
                <p className="text-muted-foreground text-xs">Créez des chaînes de valeur pour votre section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30 font-bold">!</Badge>
              <div>
                <div className="font-semibold">Validation admin requise</div>
                <p className="text-muted-foreground text-xs">Comme les projets, nécessite approbation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary border-primary/30 font-bold">2</Badge>
              <div>
                <div className="font-semibold">Assignez des acteurs</div>
                <p className="text-muted-foreground text-xs">Désignez qui est responsable de chaque segment</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Limites et permissions",
      description: "Ce que vous ne pouvez pas faire",
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Accès restreint</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Votre accès est limité à votre section pour protéger les données de l'organisation
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="font-semibold mb-2 text-red-700 dark:text-red-300">❌ Vous ne pouvez pas :</div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• Modifier les paramètres globaux de l'organisation</li>
                <li>• Gérer d'autres sections que la vôtre</li>
                <li>• Approuver les projets d'autres responsables</li>
                <li>• Accéder aux données sensibles (emails, téléphones) sauf vos membres</li>
                <li>• Supprimer des membres de l'organisation (seulement de votre section)</li>
              </ul>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-semibold mb-2 text-primary">💡 Besoin de plus ?</div>
              <p className="text-muted-foreground text-xs">
                Contactez un administrateur pour obtenir des permissions supplémentaires ou pour signaler un besoin spécifique.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Vous êtes prêt !",
      description: "Commencez à gérer votre section efficacement",
      content: (
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">C'est parti !</h3>
              <p className="text-muted-foreground max-w-md">
                Vous avez maintenant toutes les clés pour gérer votre section et contribuer à l'organisation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-semibold mb-1">Besoin d'aide ?</div>
              <p className="text-muted-foreground text-xs">Contactez un administrateur</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold mb-1">Assistant IA</div>
              <p className="text-muted-foreground text-xs">Utilisez l'assistant pour vous aider</p>
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
    localStorage.setItem('section-leader-onboarding-completed', 'true');
    onOpenChange(false);
    setCurrentSlide(0);
  };

  const handleSkip = () => {
    localStorage.setItem('section-leader-onboarding-completed', 'true');
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
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
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
