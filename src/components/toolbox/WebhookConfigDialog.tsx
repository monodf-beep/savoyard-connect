import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2, Zap, AlertCircle } from "lucide-react";
import { useWebhooks, WEBHOOK_EVENTS } from "@/hooks/useWebhooks";
import { useIsMobile } from "@/hooks/use-mobile";

interface WebhookConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: string;
  serviceName: string;
  guidePlaceholder?: string;
}

// URL validation patterns per service
const URL_PATTERNS: Record<string, { pattern: RegExp; hint: string }> = {
  slack: {
    pattern: /^https:\/\/hooks\.slack\.com\/services\/.+/,
    hint: "L'URL doit commencer par https://hooks.slack.com/services/",
  },
  discord: {
    pattern: /^https:\/\/discord\.com\/api\/webhooks\/.+/,
    hint: "L'URL doit commencer par https://discord.com/api/webhooks/",
  },
  zapier: {
    pattern: /^https:\/\/hooks\.zapier\.com\/.+/,
    hint: "L'URL doit commencer par https://hooks.zapier.com/",
  },
  n8n: {
    pattern: /^https?:\/\/.+\/webhook.*/,
    hint: "L'URL doit contenir /webhook dans le chemin",
  },
};

function validateUrl(service: string, url: string): string | null {
  if (!url.trim()) return null;
  try {
    new URL(url);
  } catch {
    return "URL invalide";
  }
  const rule = URL_PATTERNS[service];
  if (rule && !rule.pattern.test(url)) {
    return rule.hint;
  }
  return null;
}

function WebhookForm({
  service,
  serviceName,
  guidePlaceholder,
  onClose,
}: {
  service: string;
  serviceName: string;
  guidePlaceholder?: string;
  onClose: () => void;
}) {
  const { getWebhookForService, upsertWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const existing = getWebhookForService(service);

  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setUrl(existing.webhook_url);
      setEvents(existing.events);
      setIsActive(existing.is_active);
    } else {
      setUrl("");
      setEvents(WEBHOOK_EVENTS.map((e) => e.key));
      setIsActive(true);
    }
    setUrlError(null);
  }, [existing, service]);

  const toggleEvent = (key: string) => {
    setEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (val.trim()) {
      setUrlError(validateUrl(service, val));
    } else {
      setUrlError(null);
    }
  };

  const isValid = url.trim() && !urlError;

  const handleSave = () => {
    if (!isValid) return;
    upsertWebhook.mutate(
      { id: existing?.id, service, webhook_url: url.trim(), events, is_active: isActive },
      { onSuccess: onClose }
    );
  };

  const handleTest = async () => {
    if (!isValid) return;
    setIsTesting(true);
    await testWebhook(url.trim(), service);
    setIsTesting(false);
  };

  const handleDelete = () => {
    if (existing) {
      deleteWebhook.mutate(existing.id, { onSuccess: onClose });
    }
  };

  return (
    <>
      <div className="space-y-6 py-4 px-1">
        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL du Webhook</Label>
          <Input
            id="webhook-url"
            placeholder={guidePlaceholder || "https://hooks.slack.com/services/..."}
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={urlError ? "border-destructive" : ""}
          />
          {urlError ? (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {urlError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {service === "slack" && "Créez un Incoming Webhook dans votre espace Slack → Apps → Incoming Webhooks."}
              {service === "discord" && "Paramètres du serveur → Intégrations → Webhooks → Nouveau webhook."}
              {service === "zapier" && "Créez un Zap avec le trigger 'Webhooks by Zapier' → Catch Hook."}
              {service === "n8n" && "Ajoutez un nœud 'Webhook' dans votre workflow n8n."}
            </p>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="webhook-active">Webhook actif</Label>
          <Switch id="webhook-active" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {/* Events */}
        <div className="space-y-3">
          <Label>Événements à notifier</Label>
          <div className="grid grid-cols-1 gap-2">
            {WEBHOOK_EVENTS.map((evt) => (
              <label
                key={evt.key}
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={events.includes(evt.key)}
                  onCheckedChange={() => toggleEvent(evt.key)}
                />
                <span className="text-sm">{evt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 px-1 pb-2">
        <div className="flex gap-2 flex-1">
          {existing && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleTest} disabled={!isValid || isTesting}>
            {isTesting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            Tester
          </Button>
        </div>
        <Button onClick={handleSave} disabled={!isValid || upsertWebhook.isPending}>
          {upsertWebhook.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          {existing ? "Mettre à jour" : "Enregistrer"}
        </Button>
      </div>
    </>
  );
}

export function WebhookConfigDialog({
  open,
  onOpenChange,
  service,
  serviceName,
  guidePlaceholder,
}: WebhookConfigDialogProps) {
  const isMobile = useIsMobile();

  const title = (
    <span className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-primary" />
      Configurer {serviceName}
    </span>
  );
  const desc = `Collez l'URL de votre webhook ${serviceName} pour recevoir des notifications depuis Associacion.`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{desc}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[70vh]">
            <WebhookForm
              service={service}
              serviceName={serviceName}
              guidePlaceholder={guidePlaceholder}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <WebhookForm
          service={service}
          serviceName={serviceName}
          guidePlaceholder={guidePlaceholder}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
