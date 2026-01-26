import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { useAssociationStats, useAssociationTasks } from "@/hooks/useAssociationStats";
import { HubSidebar } from "./HubSidebar";
import { GlobalHeader } from "./GlobalHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr, it } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  ArrowLeft, 
  ChevronRight, 
  Users, 
  FolderKanban, 
  Euro, 
  TrendingUp,
  Zap,
  Settings,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

interface HubDashboardLayoutProps {
  orgName?: string;
  orgLogo?: string;
  isLabeled?: boolean;
  loading?: boolean;
}

export const HubDashboardLayout = ({ 
  orgName, 
  orgLogo,
  isLabeled = false,
  loading = false 
}: HubDashboardLayoutProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { 
    currentContext, 
    currentAssociation, 
    associations,
    selectHubContext,
    selectAssociationContext 
  } = useAssociation();

  // Fetch real stats
  const { data: stats, isLoading: statsLoading } = useAssociationStats(currentAssociation?.id);
  const { data: realTasks, isLoading: tasksLoading } = useAssociationTasks(currentAssociation?.id);

  const dateLocale = i18n.language === "it" ? it : fr;
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: dateLocale });
  
  // Priority: user's first name from metadata, then association name
  const userFirstName = user?.user_metadata?.first_name || user?.user_metadata?.name?.split(' ')[0];
  const welcomeName = userFirstName || orgName || t("dashboard.defaultOrg");

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleContextSwitch = (type: 'hub' | 'association', asso?: any) => {
    if (type === 'hub') {
      selectHubContext();
      navigate('/hub');
    } else if (asso) {
      selectAssociationContext(asso.association);
      navigate('/dashboard');
    }
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <div className="hidden md:block w-56 h-screen border-r border-border">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // KPI Data - Dynamic
  const kpis = [
    { 
      icon: Users, 
      value: statsLoading ? null : (stats?.membersCount || 0), 
      label: t("dashboard.kpi.members", "Membres"), 
      trend: null, 
      color: "text-primary", 
      bg: "bg-primary/10" 
    },
    { 
      icon: FolderKanban, 
      value: statsLoading ? null : (stats?.projectsCount || 0), 
      label: t("dashboard.kpi.projects.label"), 
      trend: null, 
      color: "text-secondary", 
      bg: "bg-secondary/10" 
    },
    { 
      icon: ClipboardList, 
      value: statsLoading ? null : (stats?.tasksCount || 0), 
      label: t("dashboard.kpi.tasks", "Tâches"), 
      trend: null, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
    { 
      icon: Clock, 
      value: statsLoading ? null : (stats?.pendingTasksCount || 0), 
      label: t("dashboard.kpi.pending", "En attente"), 
      trend: null, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10" 
    },
  ];

  // Quick Actions
  const quickActions = [
    { icon: FileText, label: t("dashboard.quickActions.addDocument", "Ajouter un document"), href: "/projects" },
    { icon: Users, label: t("dashboard.quickActions.manageMembers", "Gérer les membres"), href: "/members" },
    { icon: Settings, label: t("dashboard.quickActions.settings", "Paramètres"), href: "/settings" },
  ];

  // Real tasks or fallback
  const displayTasks = realTasks && realTasks.length > 0 
    ? realTasks.map(task => ({
        title: task.title,
        status: task.status,
        dueDate: task.due_date ? format(new Date(task.due_date), "d MMM", { locale: dateLocale }) : t("common.noDate", "Non défini"),
      }))
    : [
        { title: t("dashboard.tasks.sample.orgChart", "Mettre à jour l'organigramme"), status: "pending", dueDate: t("common.today", "Aujourd'hui") },
        { title: t("dashboard.tasks.sample.finance", "Valider le rapport financier"), status: "pending", dueDate: t("common.tomorrow", "Demain") },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader 
        breadcrumb={t("nav.dashboard")}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <HubSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent 
            side="left" 
            className="p-0 w-72 flex flex-col bg-background border-r border-border"
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-background">
              <Link to="/hub" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-lg font-bold text-primary">Alliance</span>
              </Link>
            </div>

            <div className="px-3 py-3 border-b border-border bg-muted/30">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {t("nav.currentContext")}
              </p>
              
              <div className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg mb-2",
                currentContext === 'hub' ? "bg-primary/10" : "bg-secondary/10"
              )}>
                {currentContext === 'hub' ? (
                  <>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-sm flex-1">{t("nav.hubNetwork")}</span>
                  </>
                ) : (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentAssociation?.logo_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                        {currentAssociation ? getInitials(currentAssociation.name) : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm flex-1 truncate">{currentAssociation?.name}</span>
                  </>
                )}
              </div>

              {currentContext === 'association' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-secondary border-secondary/30 hover:bg-secondary/10"
                  onClick={() => handleContextSwitch('hub')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("nav.returnToHub")}
                </Button>
              )}

              {associations.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {t("nav.sections.myAssociations")}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {associations.slice(0, 3).map((membership) => (
                      <button
                        key={membership.id}
                        className={cn(
                          "flex items-center gap-2 w-full p-2 rounded-md text-left transition-colors",
                          currentAssociation?.id === membership.association_id
                            ? "bg-secondary/10 text-secondary"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                        onClick={() => handleContextSwitch('association', membership)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={membership.association.logo_url || undefined} />
                          <AvatarFallback className="bg-secondary/20 text-secondary text-[8px]">
                            {getInitials(membership.association.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate flex-1">{membership.association.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <HubSidebar 
                collapsed={false} 
                onToggle={() => setMobileMenuOpen(false)}
                isMobile={true}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8 space-y-6",
            sidebarCollapsed ? "md:ml-14" : "md:ml-56"
          )}
        >
          {/* Welcome Header - Simplified */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t("dashboard.welcome", { orgName: welcomeName })}
                </h1>
                {isLabeled && (
                  <Badge className="bg-secondary text-secondary-foreground">
                    {t("dashboard.labelBadge")}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground capitalize mt-1">{today}</p>
            </div>
            {orgLogo && (
              <Avatar className="h-12 w-12 border-2 border-border hidden sm:flex">
                <AvatarImage src={orgLogo} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {orgName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* KPI Cards - Dynamic */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((kpi, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2 rounded-lg", kpi.bg)}>
                      <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                    </div>
                  </div>
                  {kpi.value === null ? (
                    <Skeleton className="h-7 w-12 mt-3" />
                  ) : (
                    <p className="text-2xl font-bold mt-3">{kpi.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks / Todo */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t("dashboard.tasks.title", "Tâches à faire")}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                    {t("common.viewAll", "Voir tout")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayTasks.map((task, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      task.status === 'completed' 
                        ? "bg-muted/30 border-border/50" 
                        : "bg-background border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={cn(
                        "text-sm",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      <Calendar className="h-3 w-3 mr-1" />
                      {task.dueDate}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  {t("dashboard.quickActions.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => navigate(action.href)}
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Checklist - Dynamic */}
          <OnboardingChecklist
            association={currentAssociation}
            membersCount={stats?.membersCount || 0}
            projectsCount={stats?.projectsCount || 0}
            onActionClick={(path) => navigate(path)}
          />

          {/* Bottom padding for mobile nav */}
          <div className="h-20 md:hidden" />
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  );
};
