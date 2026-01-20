import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  CheckSquare, 
  Star, 
  BookOpen, 
  Plus,
  Calendar,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

interface DiagnosticResultProps {
  category: string;
  answers: Record<string, string>;
}

// Mock data that would come from API in production
const getResultsForCategory = (category: string, answers: Record<string, string>) => {
  // This would be fetched from an API/AI endpoint
  const results: Record<string, {
    immediateAction: {
      title: string;
      description: string;
      buttonLabel: string;
    };
    expertRecommendation: {
      title: string;
      description: string;
      expertName: string;
      discount: string;
      buttonLabel: string;
    };
    resource: {
      title: string;
      description: string;
      readTime: string;
      buttonLabel: string;
    };
  }> = {
    communication: {
      immediateAction: {
        title: "Centraliser vos photos",
        description: "Créez un dossier partagé pour réunir la matière première de votre communication (photos d'événements, portraits de bénévoles, logo...).",
        buttonLabel: "➕ Ajouter à mon Kanban",
      },
      expertRecommendation: {
        title: "Identité Visuelle avec Nina",
        description: "Nina Moretti connaît les codes alpins et propose un tarif préférentiel réseau. Elle a déjà accompagné 12 associations du réseau.",
        expertName: "Nina Moretti",
        discount: "-20% tarif réseau",
        buttonLabel: "📅 Prendre RDV avec Nina",
      },
      resource: {
        title: "Guide : Communiquer sans budget",
        description: "Apprenez les bases de la communication associative avec des outils gratuits et des méthodes simples.",
        readTime: "10 min",
        buttonLabel: "📖 Lire le guide",
      },
    },
    treasury: {
      immediateAction: {
        title: "Établir un budget prévisionnel",
        description: "Utilisez notre modèle Excel préconfiguré pour créer votre prévisionnel 2026 en moins de 30 minutes.",
        buttonLabel: "➕ Ajouter à mon Kanban",
      },
      expertRecommendation: {
        title: "Comptabilité avec Marco",
        description: "Marco Dubois est expert-comptable spécialisé ESS. Il peut auditer vos comptes et vous proposer des optimisations.",
        expertName: "Marco Dubois",
        discount: "-20% tarif réseau",
        buttonLabel: "📅 Prendre RDV avec Marco",
      },
      resource: {
        title: "Guide : Gérer sa trésorerie",
        description: "Les fondamentaux de la gestion financière associative, du plan de trésorerie aux demandes de subventions.",
        readTime: "15 min",
        buttonLabel: "📖 Lire le guide",
      },
    },
    volunteers: {
      immediateAction: {
        title: "Créer des fiches de poste",
        description: "Définissez clairement les rôles et missions de chaque bénévole pour éviter les confusions et le surmenage.",
        buttonLabel: "➕ Ajouter à mon Kanban",
      },
      expertRecommendation: {
        title: "Formation RH avec Sophie",
        description: "Sophie Laurent forme les associations à la gestion des bénévoles et à la prévention du burn-out associatif.",
        expertName: "Sophie Laurent",
        discount: "-20% tarif réseau",
        buttonLabel: "📅 Prendre RDV avec Sophie",
      },
      resource: {
        title: "Guide : Fidéliser ses bénévoles",
        description: "Techniques éprouvées pour maintenir l'engagement de vos équipes sur le long terme.",
        readTime: "12 min",
        buttonLabel: "📖 Lire le guide",
      },
    },
    admin: {
      immediateAction: {
        title: "Mettre à jour vos statuts",
        description: "Vérifiez que vos statuts reflètent bien l'activité actuelle de votre association et les obligations légales récentes.",
        buttonLabel: "➕ Ajouter à mon Kanban",
      },
      expertRecommendation: {
        title: "Conseil juridique avec Luca",
        description: "Luca Fontana est avocat spécialisé droit des associations. Il peut relire vos statuts et vous conseiller.",
        expertName: "Luca Fontana",
        discount: "-20% tarif réseau",
        buttonLabel: "📅 Prendre RDV avec Luca",
      },
      resource: {
        title: "Guide : Obligations légales 2026",
        description: "Tout ce que votre association doit savoir sur les nouvelles réglementations cette année.",
        readTime: "8 min",
        buttonLabel: "📖 Lire le guide",
      },
    },
  };

  return results[category] || results.communication;
};

export function DiagnosticResult({ category, answers }: DiagnosticResultProps) {
  const { t } = useTranslation();
  const results = getResultsForCategory(category, answers);

  const handleAddToKanban = () => {
    toast.success(t("accompagnateur.addedToKanban", "Tâche ajoutée à votre Kanban !"), {
      description: results.immediateAction.title,
    });
  };

  const handleBookExpert = () => {
    toast.success(t("accompagnateur.rdvRequested", "Demande de RDV envoyée !"), {
      description: `Nous transmettons votre demande à ${results.expertRecommendation.expertName}`,
    });
  };

  const handleReadGuide = () => {
    toast.info(t("accompagnateur.guideOpening", "Ouverture du guide..."), {
      description: results.resource.title,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">
            {t("accompagnateur.ordonnanceTitle", "Votre Plan d'Action Personnalisé")}
          </span>
        </div>
        <p className="text-muted-foreground">
          {t("accompagnateur.ordonnanceSubtitle", "Basé sur votre diagnostic, voici nos recommandations")}
        </p>
      </div>

      {/* Three Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Immediate Action */}
        <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {t("accompagnateur.cardLabels.immediate", "Action Immédiate")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-lg">{results.immediateAction.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {results.immediateAction.description}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              onClick={handleAddToKanban}
            >
              <Plus className="h-4 w-4" />
              {results.immediateAction.buttonLabel}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Expert Recommendation */}
        <Card className="relative overflow-hidden border-2 border-secondary/20 hover:border-secondary/40 transition-colors group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-secondary/50" />
          {/* Featured badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-secondary text-secondary-foreground gap-1">
              <Zap className="h-3 w-3" />
              {results.expertRecommendation.discount}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-secondary" />
              </div>
              <Badge variant="outline" className="text-xs uppercase tracking-wider border-secondary/50 text-secondary">
                {t("accompagnateur.cardLabels.expert", "Expert Recommandé")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-lg">{results.expertRecommendation.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {results.expertRecommendation.description}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary"
              className="w-full gap-2" 
              onClick={handleBookExpert}
            >
              <Calendar className="h-4 w-4" />
              {results.expertRecommendation.buttonLabel}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3: Resource */}
        <Card className="relative overflow-hidden border-2 border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20" />
          {/* Read time badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="text-xs">
              ⏱️ {results.resource.readTime}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {t("accompagnateur.cardLabels.resource", "Auto-Formation")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-lg">{results.resource.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {results.resource.description}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              className="w-full gap-2" 
              onClick={handleReadGuide}
            >
              <ExternalLink className="h-4 w-4" />
              {results.resource.buttonLabel}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* CTA to get more help */}
      <div className="text-center pt-4">
        <Button variant="link" className="gap-2 text-muted-foreground hover:text-primary">
          {t("accompagnateur.needMoreHelp", "Besoin d'un accompagnement plus poussé ?")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
