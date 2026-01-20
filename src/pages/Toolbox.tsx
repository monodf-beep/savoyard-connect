import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Puzzle, CreditCard, Users, PenTool, Check, ArrowRight, Zap } from "lucide-react";

// Logos as simple colored badges for now - could be replaced with actual images
const ToolLogo = ({ name, color }: { name: string; color: string }) => (
  <div 
    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${color}`}
  >
    {name.slice(0, 2).toUpperCase()}
  </div>
);

interface ToolCardProps {
  name: string;
  description: string;
  color: string;
  recommended?: boolean;
  action: string;
  actionUrl?: string;
  note?: string;
}

const ToolCard = ({ name, description, color, recommended, action, actionUrl, note }: ToolCardProps) => (
  <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-border">
    {recommended && (
      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
        <Star className="h-3 w-3 mr-1" />
        Recommandé
      </Badge>
    )}
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <ToolLogo name={name} color={color} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {note && (
            <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {note}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => actionUrl && window.open(actionUrl, '_blank')}
        >
          {action}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ReassuranceColumn = ({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string 
}) => (
  <div className="text-center p-6">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default function Toolbox() {
  const { t } = useTranslation();

  const financingTools = [
    {
      name: "HelloAsso",
      description: "La référence gratuite pour votre billetterie, adhésions et dons en ligne.",
      color: "bg-[#49D38A]",
      recommended: true,
      action: "Connecter mon compte",
      actionUrl: "https://www.helloasso.com",
      note: "Importez vos paiements HelloAsso directement dans votre onglet Finance.",
    },
  ];

  const volunteeringTools = [
    {
      name: "JeVeuxAider",
      description: "Trouvez des bénévoles grâce à la plateforme publique de l'État et ses nombreuses intégrations.",
      color: "bg-[#000091]",
      action: "Publier une mission",
      actionUrl: "https://www.jeveuxaider.gouv.fr",
      note: "Gérez ensuite vos nouvelles recrues dans l'onglet RH d'Associacion.",
    },
    {
      name: "Solidatech",
      description: "Logiciels professionnels (Zoom, Adobe, Office 365) à tarifs solidaires jusqu'à -80%.",
      color: "bg-[#E31937]",
      action: "Voir les offres",
      actionUrl: "https://www.solidatech.fr",
    },
  ];

  const dailyTools = [
    {
      name: "Canva Pro",
      description: "Accès gratuit à Canva Pro pour les associations éligibles. Créez des visuels professionnels.",
      color: "bg-gradient-to-br from-[#00C4CC] to-[#7B2FF7]",
      action: "Demander l'accès",
      actionUrl: "https://www.canva.com/canva-for-nonprofits/",
    },
  ];

  return (
    <HubPageLayout
      breadcrumb={t("nav.toolbox", "Boîte à Outils & Intégrations")}
    >
      <div className="space-y-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Puzzle className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Philosophie
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Le meilleur du marché, centralisé ici.
            </h1>
            <p className="text-lg text-muted-foreground">
              Ne changez pas vos habitudes. Connectez vos outils préférés pour piloter votre association depuis un seul endroit. 
              <span className="font-medium text-foreground"> Nous sommes complémentaires.</span>
            </p>
          </div>
        </div>

        {/* Financing Category */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Financement & Paiement</h2>
              <p className="text-sm text-muted-foreground">Collectez vos adhésions et dons facilement</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financingTools.map(tool => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </section>

        {/* Volunteering Category */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Bénévolat & Ressources</h2>
              <p className="text-sm text-muted-foreground">Trouvez des bénévoles et des ressources à prix réduit</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteeringTools.map(tool => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </section>

        {/* Daily Tools Category */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <PenTool className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Outils du Quotidien</h2>
              <p className="text-sm text-muted-foreground">Graphisme, bureautique et productivité</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyTools.map(tool => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </section>

        {/* Reassurance Section */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Pourquoi utiliser Associacion en plus ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              <ReassuranceColumn
                icon={Puzzle}
                title="Centralisation"
                description="Plus besoin de 10 mots de passe. Accédez à tout depuis un seul endroit."
              />
              <ReassuranceColumn
                icon={ArrowRight}
                title="Continuité"
                description="HelloAsso encaisse, Associacion met à jour automatiquement votre fichier adhérent."
              />
              <ReassuranceColumn
                icon={Users}
                title="Coopération"
                description="Vos outils servent votre asso, Associacion vous connecte au réseau."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </HubPageLayout>
  );
}
