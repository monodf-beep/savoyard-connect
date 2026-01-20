import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Rocket, Users, Euro, Calendar, Filter, Building2 } from "lucide-react";

interface NetworkProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  funding_goal: number | null;
  funded_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  is_funding_project: boolean;
  association_name?: string;
  silo?: string;
}

const NetworkProjects = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<NetworkProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [siloFilter, setSiloFilter] = useState<string>("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          status,
          funding_goal,
          funded_amount,
          start_date,
          end_date,
          is_funding_project
        `)
        .eq("is_funding_project", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(p => ({ ...p, funding_current: p.funded_amount }));
      setProjects(mapped as any);
    } catch (error) {
      console.error("Error fetching network projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      planifié: { label: t("networkProjects.status.planned"), className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      en_cours: { label: t("networkProjects.status.inProgress"), className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      terminé: { label: t("networkProjects.status.completed"), className: "bg-green-500/10 text-green-600 border-green-500/20" },
      annulé: { label: t("networkProjects.status.cancelled"), className: "bg-red-500/10 text-red-600 border-red-500/20" },
    };
    const config = statusConfig[status] || { label: status, className: "bg-muted" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "en_cours").length,
    totalFunding: projects.reduce((sum, p) => sum + (p.funding_goal || 0), 0),
  };

  return (
    <HubPageLayout
      title={t("networkProjects.title")}
      subtitle={t("networkProjects.subtitle")}
      breadcrumb={t("networkProjects.breadcrumb")}
    >
      <div className="space-y-6">
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t("networkProjects.stats.totalProjects")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">{t("networkProjects.stats.inProgress")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalFunding.toLocaleString()}€</p>
                  <p className="text-sm text-muted-foreground">{t("networkProjects.stats.totalFunding")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("networkProjects.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("networkProjects.filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("networkProjects.allStatuses")}</SelectItem>
              <SelectItem value="planifié">{t("networkProjects.status.planned")}</SelectItem>
              <SelectItem value="en_cours">{t("networkProjects.status.inProgress")}</SelectItem>
              <SelectItem value="terminé">{t("networkProjects.status.completed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">{project.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  {project.association_name && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {project.association_name}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {project.description || t("networkProjects.noDescription")}
                  </p>
                  {project.funding_goal && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("networkProjects.funding")}</span>
                        <span className="font-medium text-foreground">
                          {(project.funded_amount || 0).toLocaleString()}€ / {project.funding_goal.toLocaleString()}€
                        </span>
                      </div>
                      <Progress
                        value={((project.funded_amount || 0) / project.funding_goal) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  {project.start_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.start_date).toLocaleDateString()}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Rocket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t("networkProjects.noProjects")}</h3>
            <p className="text-muted-foreground">{t("networkProjects.noProjectsDesc")}</p>
          </div>
        )}

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t("networkProjects.cta.title")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("networkProjects.cta.description")}
            </p>
            <Button disabled>
              <Rocket className="mr-2 h-4 w-4" />
              {t("networkProjects.cta.button")}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{t("networkProjects.cta.comingSoon")}</p>
          </CardContent>
        </Card>
      </div>
    </HubPageLayout>
  );
};

export default NetworkProjects;
