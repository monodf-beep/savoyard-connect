import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolGuideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
}

const guides: Record<string, { steps: string[]; tip?: string; link?: string }> = {
  Slack: {
    steps: [
      "Ouvrez votre espace Slack et allez dans Paramètres → Gérer les applications.",
      "Recherchez « Incoming Webhooks » et ajoutez-le.",
      "Cliquez sur « Add New Webhook to Workspace ».",
      "Choisissez le canal où envoyer les notifications.",
      "Copiez l'URL du webhook générée.",
      "Collez-la dans le champ de configuration Associacion.",
    ],
    tip: "Créez un canal dédié #associacion-notifs pour ne pas polluer vos canaux existants.",
    link: "https://api.slack.com/messaging/webhooks",
  },
  Discord: {
    steps: [
      "Ouvrez les paramètres du serveur Discord.",
      "Allez dans Intégrations → Webhooks.",
      "Cliquez sur « Nouveau webhook ».",
      "Choisissez le salon cible et personnalisez le nom.",
      "Cliquez sur « Copier l'URL du webhook ».",
      "Collez-la dans le champ de configuration Associacion.",
    ],
    tip: "Vous pouvez personnaliser l'avatar et le nom du webhook pour qu'il apparaisse comme « Associacion ».",
    link: "https://support.discord.com/hc/fr/articles/228383668",
  },
  "Microsoft Teams": {
    steps: [
      "Ouvrez Microsoft Teams et accédez au canal souhaité.",
      "Cliquez sur ••• → Connecteurs → Incoming Webhook.",
      "Donnez un nom au connecteur et uploadez une image.",
      "Copiez l'URL du webhook générée.",
      "Vous pouvez utiliser cette URL avec Zapier ou n8n.",
    ],
    link: "https://learn.microsoft.com/fr-fr/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook",
  },
  Notion: {
    steps: [
      "Associacion ne se connecte pas directement à Notion.",
      "Utilisez Notion comme base documentaire complémentaire.",
      "Créez un lien vers votre page Notion depuis vos projets Associacion.",
      "Pour synchroniser automatiquement, utilisez Zapier ou n8n comme pont.",
    ],
    tip: "Notion est idéal pour les comptes-rendus, Associacion pour la gestion opérationnelle.",
    link: "https://www.notion.so",
  },
  "Google Workspace": {
    steps: [
      "Google Workspace fonctionne en complément d'Associacion.",
      "Stockez vos fichiers sur Google Drive, rattachez les liens dans vos projets.",
      "Utilisez Google Calendar pour vos événements, synchronisez via Zapier si besoin.",
      "Google Sheets peut être alimenté automatiquement via un webhook n8n/Zapier.",
    ],
    link: "https://workspace.google.com",
  },
  Zapier: {
    steps: [
      "Créez un compte sur zapier.com (plan gratuit disponible).",
      "Créez un nouveau Zap → Trigger : « Webhooks by Zapier » → « Catch Hook ».",
      "Copiez l'URL webhook fournie par Zapier.",
      "Collez-la dans le champ de configuration Associacion.",
      "Configurez l'action de votre Zap (ex: envoyer un email, créer une tâche…).",
      "Testez en cliquant sur « Tester » dans Associacion.",
    ],
    tip: "Zapier permet de connecter Associacion à 5000+ apps sans coder.",
    link: "https://zapier.com/apps/webhook/integrations",
  },
  n8n: {
    steps: [
      "Installez n8n (auto-hébergé) ou créez un compte sur n8n.cloud.",
      "Créez un nouveau workflow → Ajoutez un nœud « Webhook ».",
      "Configurez-le en mode « POST » et copiez l'URL de production.",
      "Collez-la dans le champ de configuration Associacion.",
      "Ajoutez des nœuds en sortie (email, Slack, Google Sheets…).",
      "Activez le workflow et testez depuis Associacion.",
    ],
    tip: "n8n est open source et gratuit en auto-hébergement. Idéal pour les associations tech.",
    link: "https://n8n.io",
  },
};

export function ToolGuideSheet({ open, onOpenChange, toolName }: ToolGuideSheetProps) {
  const guide = guides[toolName];

  if (!guide) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Guide : {toolName}
          </SheetTitle>
          <SheetDescription>
            Suivez ces étapes pour configurer {toolName} avec Associacion.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </Badge>
              <p className="text-sm text-foreground leading-relaxed">{step}</p>
            </div>
          ))}

          {guide.tip && (
            <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-primary font-medium">💡 Astuce</p>
              <p className="text-sm text-muted-foreground mt-1">{guide.tip}</p>
            </div>
          )}

          {guide.link && (
            <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => window.open(guide.link, "_blank")}>
              Documentation officielle
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
