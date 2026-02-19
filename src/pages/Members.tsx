import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssociation } from "@/hooks/useAssociation";
import { useAuth } from "@/hooks/useAuth";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, Download, CheckCircle2, XCircle, Clock, Filter, RefreshCw, Loader2, Shield, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface HelloAssoMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  city: string | null;
  membership_date: string | null;
  membership_type: string | null;
  amount: number | null;
  is_hidden: boolean | null;
}

interface FederationMember {
  id: string;
  email: string;
  status: string;
  helloasso_member_id: string | null;
}

type MemberStatus = "active" | "expiring" | "expired";

function computeStatus(membershipDate: string | null): MemberStatus {
  if (!membershipDate) return "expired";
  const expiration = new Date(membershipDate);
  expiration.setFullYear(expiration.getFullYear() + 1);
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  if (expiration < now) return "expired";
  if (expiration <= in30Days) return "expiring";
  return "active";
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function exportCSV(members: (HelloAssoMember & { status: MemberStatus })[]) {
  const headers = ["Prénom", "Nom", "Email", "Ville", "Type", "Date adhésion", "Statut"];
  const rows = members.map(m => [
    m.first_name || "", m.last_name || "", m.email || "", m.city || "",
    m.membership_type || "", m.membership_date || "",
    m.status === "active" ? "Actif" : m.status === "expiring" ? "Expire bientôt" : "Expiré",
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `membres_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const Members = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentAssociation } = useAssociation();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [slugDialogOpen, setSlugDialogOpen] = useState(false);
  const [slugInput, setSlugInput] = useState("");

  const associationId = currentAssociation?.id;

  // Fetch helloasso_slug from association
  const { data: assoData } = useQuery({
    queryKey: ["association-details", associationId],
    queryFn: async () => {
      if (!associationId) return null;
      const { data, error } = await supabase
        .from("associations")
        .select("*")
        .eq("id", associationId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!associationId,
  });

  const helloassoSlug = assoData?.helloasso_slug as string | null;
  const isFederationMember = assoData?.is_federation_member as boolean | false;

  // Fetch members from Supabase
  const { data: rawMembers = [], isLoading } = useQuery({
    queryKey: ["helloasso-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helloasso_members")
        .select("*")
        .order("membership_date", { ascending: false });
      if (error) throw error;
      return data as HelloAssoMember[];
    },
  });

  // Fetch federation_members for this association
  const { data: federationMembers = [] } = useQuery({
    queryKey: ["federation-members", associationId],
    queryFn: async () => {
      if (!associationId) return [];
      const { data, error } = await (supabase as any)
        .from("federation_members")
        .select("id, email, status, helloasso_member_id")
        .eq("association_id", associationId);
      if (error) throw error;
      return (data || []) as FederationMember[];
    },
    enabled: !!associationId,
  });

  // Build a lookup: helloasso_member_id -> federation status
  const fedStatusByMemberId = new Map<string, string>();
  for (const fm of federationMembers) {
    if (fm.helloasso_member_id) {
      fedStatusByMemberId.set(fm.helloasso_member_id, fm.status);
    }
  }

  // Enrich with computed status
  const members = rawMembers
    .filter(m => !m.is_hidden)
    .map(m => ({ ...m, status: computeStatus(m.membership_date) }));

  // Available years
  const years = [...new Set(
    members.map(m => m.membership_date ? new Date(m.membership_date).getFullYear() : null).filter(Boolean)
  )].sort((a, b) => (b || 0) - (a || 0));

  // Filters
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      (member.first_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.last_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesYear = yearFilter === "all" || 
      (member.membership_date && new Date(member.membership_date).getFullYear().toString() === yearFilter);
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Stats
  const activeCount = members.filter(m => m.status === "active").length;
  const expiringCount = members.filter(m => m.status === "expiring").length;
  const fedActiveCount = federationMembers.filter(fm => fm.status === "active").length;

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (slug: string) => {
      const { data, error } = await supabase.functions.invoke("sync-helloasso-members", {
        body: { organizationSlug: slug },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Synchronisé : ${data.members_synced} membres, ${data.donors_synced} donateurs`);
      queryClient.invalidateQueries({ queryKey: ["helloasso-members"] });
      queryClient.invalidateQueries({ queryKey: ["helloasso-donors"] });
    },
    onError: (error: any) => {
      toast.error(`Erreur de synchronisation : ${error.message}`);
    },
  });

  // Save slug to DB mutation
  const saveSlugMutation = useMutation({
    mutationFn: async (slug: string) => {
      if (!associationId) throw new Error("Aucune association sélectionnée");
      const { error } = await supabase
        .from("associations")
        .update({ helloasso_slug: slug } as any)
        .eq("id", associationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["association-details", associationId] });
    },
  });

  // Toggle federation membership (admin only)
  const toggleFederationMutation = useMutation({
    mutationFn: async () => {
      if (!associationId) throw new Error("Aucune association sélectionnée");
      const newValue = !isFederationMember;
      const { error } = await supabase
        .from("associations")
        .update({
          is_federation_member: newValue,
          federation_joined_at: newValue ? new Date().toISOString() : null,
        } as any)
        .eq("id", associationId);
      if (error) throw error;
      return newValue;
    },
    onSuccess: (newValue) => {
      toast.success(newValue ? "Association conventionnée avec la fédération" : "Convention retirée");
      queryClient.invalidateQueries({ queryKey: ["association-details", associationId] });
    },
    onError: (error: any) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleSync = () => {
    if (helloassoSlug) {
      syncMutation.mutate(helloassoSlug);
    } else {
      setSlugInput("");
      setSlugDialogOpen(true);
    }
  };

  const confirmSlugAndSync = () => {
    if (!slugInput.trim()) return;
    const slug = slugInput.trim();
    saveSlugMutation.mutate(slug);
    setSlugDialogOpen(false);
    syncMutation.mutate(slug);
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("members.status.active")}
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            {t("members.status.expiring")}
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            {t("members.status.expired")}
          </Badge>
        );
    }
  };

  const getFederationBadge = (memberId: string) => {
    const fedStatus = fedStatusByMemberId.get(memberId);
    if (!fedStatus) return <span className="text-muted-foreground text-xs">—</span>;
    if (fedStatus === "active") {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Actif
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Shield className="h-3 w-3 mr-1" />
        {fedStatus === "pending" ? "En attente" : fedStatus}
      </Badge>
    );
  };

  return (
    <HubPageLayout breadcrumb={t("nav.membersSubscriptions")} loading={isLoading}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("members.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} actifs / {members.length} total
            {expiringCount > 0 && ` — ${expiringCount} expirent ${t("common.thisMonth")}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Federation convention toggle - admin only */}
          {isAdmin && (
            <Button
              variant={isFederationMember ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFederationMutation.mutate()}
              disabled={toggleFederationMutation.isPending}
            >
              {toggleFederationMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              {isFederationMember ? "Conventionnée" : "Non conventionnée"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync HelloAsso
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(filteredMembers)}
            disabled={filteredMembers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("members.export")}
          </Button>
        </div>
      </div>

      {/* Federation info card */}
      {isFederationMember && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-sm">Association conventionnée avec la fédération</p>
                <p className="text-xs text-muted-foreground">
                  {fedActiveCount} adhérent{fedActiveCount > 1 ? "s" : ""} ont activé leur adhésion fédération
                  {assoData?.federation_joined_at && ` — Convention depuis le ${formatDate(assoData.federation_joined_at)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("members.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("members.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("members.filters.all")}</SelectItem>
                <SelectItem value="active">{t("members.filters.active")}</SelectItem>
                <SelectItem value="expiring">{t("members.filters.expiring")}</SelectItem>
                <SelectItem value="expired">{t("members.filters.expired")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("members.listTitle")}</CardTitle>
          <CardDescription>
            {filteredMembers.length} {t("members.membersCount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("members.table.name")}</TableHead>
                <TableHead>{t("members.table.type")}</TableHead>
                <TableHead>{t("members.table.status")}</TableHead>
                {isFederationMember && <TableHead>Fédération</TableHead>}
                <TableHead>{t("members.table.endDate")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const expirationDate = member.membership_date
                  ? (() => { const d = new Date(member.membership_date); d.setFullYear(d.getFullYear() + 1); return d.toISOString(); })()
                  : null;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.first_name} {member.last_name}</p>
                          <p className="text-sm text-muted-foreground">{member.email || member.city || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.membership_type || "Adhésion"}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    {isFederationMember && (
                      <TableCell>{getFederationBadge(member.id)}</TableCell>
                    )}
                    <TableCell>{formatDate(expirationDate)}</TableCell>
                  </TableRow>
                );
              })}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isFederationMember ? 5 : 4} className="text-center py-8 text-muted-foreground">
                    {members.length === 0
                      ? "Synchronisez HelloAsso pour importer vos membres"
                      : t("members.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Slug Dialog */}
      <Dialog open={slugDialogOpen} onOpenChange={setSlugDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer HelloAsso</DialogTitle>
            <DialogDescription>
              Entrez le slug de votre organisation HelloAsso (visible dans l'URL de votre page).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Slug de l'organisation</Label>
              <Input
                placeholder="mon-association"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmSlugAndSync()}
              />
              <p className="text-xs text-muted-foreground">
                Ex: helloasso.com/associations/<strong>mon-association</strong>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSlugDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={confirmSlugAndSync} disabled={!slugInput.trim()}>
                Synchroniser
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </HubPageLayout>
  );
};

export default Members;
