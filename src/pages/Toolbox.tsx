import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink, Star, Puzzle, CreditCard, Users, PenTool,
  ArrowRight, Zap, MessageSquare, Briefcase, Settings2, Check, Webhook,
} from "lucide-react";
import { WebhookConfigDialog } from "@/components/toolbox/WebhookConfigDialog";
import { useWebhooks } from "@/hooks/useWebhooks";

// --- Types ---
interface Integration {
  name: string;
  description: string;
  color: string;
  recommended?: boolean;
  isNew?: boolean;
  type: "webhook" | "external" | "existing";
  service?: string; // webhook service key
  action: string;
  actionUrl?: string;
  note?: string;
  guidePlaceholder?: string;
}

interface Category {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  integrations: Integration[];
}

// --- Data ---
const categories: Category[] = [
  {
    title: "Communication",
    subtitle: "Recevez des notifications de votre association dans vos canaux",
    icon: MessageSquare,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    integrations: [
      {
        name: "Slack",
        description: "Recevez des notifications en temps réel dans vos canaux Slack quand un événement se produit.",
        color: "bg-[#4A154B]",
        recommended: true,
        type: "webhook",
        service: "slack",
        action: "Configurer",
        note: "Nouveau membre, nouveau projet… tout arrive dans Slack.",
        guidePlaceholder: "https://hooks.slack.com/services/T.../B.../...",
      },
      {
        name: "Discord",
        description: "Notifications automatiques dans vos salons Discord pour garder votre communauté informée.",
        color: "bg-[#5865F2]",
        type: "webhook",
        service: "discord",
        action: "Configurer",
        note: "Idéal pour les communautés bénévoles actives.",
        guidePlaceholder: "https://discord.com/api/webhooks/...",
      },
      {
        name: "Microsoft Teams",
        description: "Intégrez vos flux de travail avec Microsoft Teams pour une collaboration unifiée.",
        color: "bg-[#6264A7]",
        isNew: true,
        type: "external",
        action: "Voir le guide",
        actionUrl: "https://learn.microsoft.com/fr-fr/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook",
        note: "Suivez le guide pour créer un webhook Teams.",
      },
    ],
  },
  {
    title: "Productivité",
    subtitle: "Documentation, gestion de projet et collaboration",
    icon: Briefcase,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-500/10",
    integrations: [
      {
        name: "Notion",
        description: "Centralisez votre documentation et vos bases de données complémentaires dans Notion.",
        color: "bg-[#000000]",
        recommended: true,
        type: "external",
        action: "Utiliser avec Associacion",
        actionUrl: "https://www.notion.so",
        note: "Associacion gère l'opérationnel, Notion la documentation.",
      },
      {
        name: "Google Workspace",
        description: "Drive, Docs, Sheets, Calendar — utilisez la suite Google en complément d'Associacion.",
        color: "bg-[#4285F4]",
        type: "external",
        action: "Accéder",
        actionUrl: "https://workspace.google.com",
        note: "Stockez vos fichiers sur Drive, pilotez vos projets ici.",
      },
      {
        name: "Trello",
        description: "Gestion de projet visuelle en kanban, complémentaire à la vue projets d'Associacion.",
        color: "bg-[#0079BF]",
        type: "external",
        action: "Utiliser Trello",
        actionUrl: "https://trello.com",
      },
    ],
  },
  {
    title: "Financement & Paiement",
    subtitle: "Collectez vos adhésions et dons facilement",
    icon: CreditCard,
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
    integrations: [
      {
        name: "HelloAsso",
        description: "La référence gratuite pour votre billetterie, adhésions et dons en ligne.",
        color: "bg-[#49D38A]",
        recommended: true,
        type: "existing",
        action: "Connecter mon compte",
        actionUrl: "https://www.helloasso.com",
        note: "Importez vos paiements HelloAsso directement dans votre onglet Finance.",
      },
      {
        name: "Stripe",
        description: "Acceptez les paiements en ligne par carte bancaire pour vos événements et services.",
        color: "bg-[#635BFF]",
        isNew: true,
        type: "external",
        action: "Découvrir Stripe",
        actionUrl: "https://stripe.com/fr",
        note: "Solution de paiement professionnelle à tarif préférentiel pour les assos.",
      },
      {
        name: "PayPal",
        description: "Alternative de paiement internationale, facile à intégrer pour les dons et cotisations.",
        color: "bg-[#003087]",
        type: "external",
        action: "Créer un compte",
        actionUrl: "https://www.paypal.com/fr/webapps/mpp/account-selection",
      },
    ],
  },
  {
    title: "Bénévolat & Ressources",
    subtitle: "Trouvez des bénévoles et des ressources à prix réduit",
    icon: Users,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-500/10",
    integrations: [
      {
        name: "JeVeuxAider",
        description: "Trouvez des bénévoles grâce à la plateforme publique de l'État.",
        color: "bg-[#000091]",
        type: "existing",
        action: "Publier une mission",
        actionUrl: "https://www.jeveuxaider.gouv.fr",
        note: "Gérez ensuite vos nouvelles recrues dans l'onglet RH d'Associacion.",
      },
      {
        name: "Solidatech",
        description: "Logiciels pro (Zoom, Adobe, Office 365) à tarifs solidaires jusqu'à -80%.",
        color: "bg-[#E31937]",
        type: "existing",
        action: "Voir les offres",
        actionUrl: "https://www.solidatech.fr",
      },
    ],
  },
  {
    title: "Graphisme & Design",
    subtitle: "Créez des visuels professionnels pour votre communication",
    icon: PenTool,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-500/10",
    integrations: [
      {
        name: "Canva Pro",
        description: "Accès gratuit à Canva Pro pour les associations éligibles.",
        color: "bg-gradient-to-br from-[#00C4CC] to-[#7B2FF7]",
        type: "existing",
        action: "Demander l'accès",
        actionUrl: "https://www.canva.com/canva-for-nonprofits/",
        recommended: true,
      },
      {
        name: "Figma",
        description: "Outil de design collaboratif gratuit pour concevoir vos supports numériques.",
        color: "bg-[#F24E1E]",
        type: "external",
        action: "Essayer Figma",
        actionUrl: "https://www.figma.com/education/",
        isNew: true,
      },
    ],
  },
  {
    title: "Automatisation",
    subtitle: "Connectez Associacion à des centaines d'autres outils",
    icon: Settings2,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    integrations: [
      {
        name: "Zapier",
        description: "Automatisez vos flux de travail en connectant Associacion à 5000+ applications.",
        color: "bg-[#FF4A00]",
        recommended: true,
        type: "webhook",
        service: "zapier",
        action: "Configurer",
        note: "Déclenchez des actions automatiques quand un événement se produit.",
        guidePlaceholder: "https://hooks.zapier.com/hooks/catch/...",
      },
      {
        name: "n8n",
        description: "Automatisation open source et auto-hébergeable. Alternative gratuite à Zapier.",
        color: "bg-[#EA4B71]",
        type: "webhook",
        service: "n8n",
        action: "Configurer",
        note: "Parfait pour les associations tech-savvy qui veulent tout contrôler.",
        guidePlaceholder: "https://your-n8n.example.com/webhook/...",
      },
      {
        name: "Make",
        description: "Plateforme d'automatisation visuelle puissante avec un plan gratuit généreux.",
        color: "bg-[#6D00CC]",
        isNew: true,
        type: "external",
        action: "Découvrir Make",
        actionUrl: "https://www.make.com",
      },
    ],
  },
];

// --- Sub-components ---
const ToolLogo = ({ name, color }: { name: string; color: string }) => (
  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${color}`}>
    {name.slice(0, 2).toUpperCase()}
  </div>
);

function IntegrationCard({
  integration,
  isConnected,
  onConfigure,
}: {
  integration: Integration;
  isConnected: boolean;
  onConfigure: () => void;
}) {
  const { name, description, color, recommended, isNew, type, action, actionUrl, note } = integration;

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow border-border group">
      <div className="absolute top-3 right-3 flex gap-1.5">
        {isConnected && (
          <Badge className="bg-green-500/90 text-white text-xs">
            <Check className="h-3 w-3 mr-1" />
            Connecté
          </Badge>
        )}
        {recommended && !isConnected && (
          <Badge className="bg-amber-500 text-white text-xs">
            <Star className="h-3 w-3 mr-1" />
            Recommandé
          </Badge>
        )}
        {isNew && !isConnected && (
          <Badge variant="secondary" className="text-xs">Nouveau</Badge>
        )}
      </div>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <ToolLogo name={name} color={color} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {note && (
              <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                <Zap className="h-3 w-3 shrink-0" />
                {note}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          {type === "webhook" ? (
            <Button variant={isConnected ? "outline" : "default"} className="w-full gap-2" onClick={onConfigure}>
              <Webhook className="h-4 w-4" />
              {isConnected ? "Modifier la configuration" : action}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => actionUrl && window.open(actionUrl, "_blank")}
            >
              {action}
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const ReassuranceColumn = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="text-center p-6">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// --- Main Component ---
export default function Toolbox() {
  const { t } = useTranslation();
  const { webhooks } = useWebhooks();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    service: string;
    serviceName: string;
    guidePlaceholder?: string;
  }>({ open: false, service: "", serviceName: "" });

  const isServiceConnected = (service?: string) =>
    service ? webhooks.some((w) => w.service === service && w.is_active) : false;

  return (
    <HubPageLayout breadcrumb={t("nav.toolbox", "Boîte à Outils & Intégrations")}>
      <div className="space-y-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Puzzle className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Philosophie</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Associacion ne remplace pas vos outils. Il les connecte.
            </h1>
            <p className="text-lg text-muted-foreground">
              Gardez vos habitudes. Connectez Slack, Discord, Notion ou Zapier pour centraliser les notifications
              et piloter votre association depuis un seul endroit.
              <span className="font-medium text-foreground"> Nous sommes complémentaires.</span>
            </p>
          </div>
        </div>

        {/* Categories */}
        {categories.map((cat) => (
          <section key={cat.title}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg ${cat.iconBg} flex items-center justify-center`}>
                <cat.icon className={`h-5 w-5 ${cat.iconColor}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{cat.title}</h2>
                <p className="text-sm text-muted-foreground">{cat.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.integrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  integration={integration}
                  isConnected={isServiceConnected(integration.service)}
                  onConfigure={() =>
                    setDialogState({
                      open: true,
                      service: integration.service || "",
                      serviceName: integration.name,
                      guidePlaceholder: integration.guidePlaceholder,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ))}

        {/* Reassurance */}
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

      {/* Webhook Config Dialog */}
      <WebhookConfigDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        service={dialogState.service}
        serviceName={dialogState.serviceName}
        guidePlaceholder={dialogState.guidePlaceholder}
      />
    </HubPageLayout>
  );
}
