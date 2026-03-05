import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2, Zap } from "lucide-react";
import { useWebhooks, WEBHOOK_EVENTS, type Webhook } from "@/hooks/useWebhooks";

interface WebhookConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: string;
  serviceName: string;
  guidePlaceholder?: string;
}

export function WebhookConfigDialog({
  open,
  onOpenChange,
  service,
  serviceName,
  guidePlaceholder,
}: WebhookConfigDialogProps) {
  const { getWebhookForService, upsertWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const existing = getWebhookForService(service);

  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

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
  }, [existing, open]);

  const toggleEvent = (key: string) => {
    setEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    if (!url.trim()) return;
    upsertWebhook.mutate(
      { id: existing?.id, service, webhook_url: url.trim(), events, is_active: isActive },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleTest = async () => {
    if (!url.trim()) return;
    setIsTesting(true);
    await testWebhook(url.trim(), service);
    setIsTesting(false);
  };

  const handleDelete = () => {
    if (existing) {
      deleteWebhook.mutate(existing.id, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Configurer {serviceName}
          </DialogTitle>
          <DialogDescription>
            Collez l'URL de votre webhook {serviceName} pour recevoir des notifications depuis Associacion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL du Webhook</Label>
            <Input
              id="webhook-url"
              placeholder={guidePlaceholder || "https://hooks.slack.com/services/..."}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {service === "slack" && "Créez un Incoming Webhook dans votre espace Slack → Apps → Incoming Webhooks."}
              {service === "discord" && "Paramètres du serveur → Intégrations → Webhooks → Nouveau webhook."}
              {service === "zapier" && "Créez un Zap avec le trigger 'Webhooks by Zapier' → Catch Hook."}
              {service === "n8n" && "Ajoutez un nœud 'Webhook' dans votre workflow n8n."}
            </p>
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            {existing && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleTest} disabled={!url.trim() || isTesting}>
              {isTesting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Tester
            </Button>
          </div>
          <Button onClick={handleSave} disabled={!url.trim() || upsertWebhook.isPending}>
            {upsertWebhook.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {existing ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
