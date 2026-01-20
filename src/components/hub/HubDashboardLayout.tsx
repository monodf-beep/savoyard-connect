import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { HubSidebar } from "./HubSidebar";
import { GlobalHeader } from "./GlobalHeader";
import { HubKPICards } from "./HubKPICards";
import { HubActivityTimeline } from "./HubActivityTimeline";
import { HubQuickActions } from "./HubQuickActions";
import { HubOnboardingCard } from "./HubOnboardingCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr, it } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, ArrowLeft, ChevronRight } from "lucide-react";

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
          {/* Sidebar Skeleton */}
          <div className="hidden md:block w-56 h-screen border-r border-border">
            <Skeleton className="h-full w-full" />
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header */}
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

        {/* Mobile Sidebar - Enhanced with context switcher */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent 
            side="left" 
            className="p-0 w-72 flex flex-col bg-background border-r border-border"
          >
            {/* Mobile Sheet Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-background">
              <Link to="/hub" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-lg font-bold text-primary">Alliance</span>
              </Link>
            </div>

            {/* Context Switcher for Mobile */}
            <div className="px-3 py-3 border-b border-border bg-muted/30">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {t("nav.currentContext")}
              </p>
              
              {/* Current Context Display */}
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

              {/* Return to Hub Button (when in association) */}
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

              {/* Quick Association Switcher */}
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

            {/* Navigation */}
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
          {/* Welcome Header */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {t("dashboard.welcome", { orgName: welcomeName })}
              </h1>
              {isLabeled && (
                <Badge className="bg-secondary text-secondary-foreground">
                  {t("dashboard.labelBadge")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground capitalize">{today}</p>
          </div>

          {/* KPI Cards */}
          <HubKPICards />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <HubActivityTimeline />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <HubQuickActions />
              <HubOnboardingCard accountCreatedAt={new Date()} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
