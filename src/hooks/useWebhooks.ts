import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssociation } from "@/hooks/useAssociation";
import { toast } from "sonner";

export interface Webhook {
  id: string;
  association_id: string;
  service: string;
  webhook_url: string;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export const WEBHOOK_EVENTS = [
  { key: "new_member", label: "Nouveau membre" },
  { key: "new_project", label: "Nouveau projet" },
  { key: "project_status_change", label: "Changement de statut de projet" },
  { key: "new_meeting", label: "Nouvelle réunion" },
  { key: "new_application", label: "Nouvelle candidature spontanée" },
  { key: "new_idea", label: "Nouvelle idée soumise" },
] as const;

export function useWebhooks() {
  const { currentAssociation } = useAssociation();
  const queryClient = useQueryClient();
  const associationId = currentAssociation?.id;

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["webhooks", associationId],
    queryFn: async () => {
      if (!associationId) return [];
      const { data, error } = await supabase
        .from("association_webhooks" as any)
        .select("*")
        .eq("association_id", associationId);
      if (error) throw error;
      return (data || []) as unknown as Webhook[];
    },
    enabled: !!associationId,
  });

  const upsertWebhook = useMutation({
    mutationFn: async (webhook: {
      id?: string;
      service: string;
      webhook_url: string;
      events: string[];
      is_active?: boolean;
    }) => {
      if (!associationId) throw new Error("No association selected");
      const payload = {
        association_id: associationId,
        service: webhook.service,
        webhook_url: webhook.webhook_url,
        events: webhook.events,
        is_active: webhook.is_active ?? true,
        updated_at: new Date().toISOString(),
      };

      if (webhook.id) {
        const { error } = await supabase
          .from("association_webhooks" as any)
          .update(payload)
          .eq("id", webhook.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("association_webhooks" as any)
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", associationId] });
      toast.success("Webhook enregistré avec succès");
    },
    onError: (err: Error) => {
      toast.error("Erreur lors de l'enregistrement du webhook: " + err.message);
    },
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("association_webhooks" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", associationId] });
      toast.success("Webhook supprimé");
    },
  });

  const testWebhook = async (webhookUrl: string, service: string) => {
    try {
      const payload = {
        text: `✅ Test de connexion depuis Associacion — service: ${service}`,
        content: `✅ Test de connexion depuis Associacion — service: ${service}`,
      };
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      toast.success("Message de test envoyé ! Vérifiez votre canal.");
    } catch {
      toast.error("Erreur lors de l'envoi du test. Vérifiez l'URL du webhook.");
    }
  };

  const getWebhookForService = (service: string) =>
    webhooks.find((w) => w.service === service);

  return {
    webhooks,
    isLoading,
    upsertWebhook,
    deleteWebhook,
    testWebhook,
    getWebhookForService,
  };
}
