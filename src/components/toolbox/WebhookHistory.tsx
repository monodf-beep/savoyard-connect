import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssociation } from "@/hooks/useAssociation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WebhookLog {
  id: string;
  event: string;
  service: string;
  status_code: number | null;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  new_member: "Nouveau membre",
  new_project: "Nouveau projet",
  project_status_change: "Statut projet",
  new_meeting: "Nouvelle réunion",
  new_application: "Candidature",
  new_idea: "Nouvelle idée",
  test: "Test",
};

export function WebhookHistory() {
  const { currentAssociation } = useAssociation();
  const associationId = currentAssociation?.id;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["webhook-logs", associationId],
    queryFn: async () => {
      if (!associationId) return [];
      const { data, error } = await supabase
        .from("webhook_logs" as any)
        .select("id, event, service, status_code, created_at")
        .eq("association_id", associationId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as unknown as WebhookLog[];
    },
    enabled: !!associationId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" />Historique</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun webhook déclenché pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Derniers webhooks déclenchés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                {log.status_code && log.status_code >= 200 && log.status_code < 300 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">{EVENT_LABELS[log.event] || log.event}</p>
                  <p className="text-xs text-muted-foreground capitalize">{log.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.status_code && (
                  <Badge variant={log.status_code < 300 ? "default" : "destructive"} className="text-xs">
                    {log.status_code}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "dd MMM HH:mm", { locale: fr })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
