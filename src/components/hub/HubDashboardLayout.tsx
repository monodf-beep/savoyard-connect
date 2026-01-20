import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dateLocale = i18n.language === "it" ? it : fr;
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: dateLocale });
  
  // Priority: user's first name from metadata, then association name
  const userFirstName = user?.user_metadata?.first_name || user?.user_metadata?.name?.split(' ')[0];
  const welcomeName = userFirstName || orgName || t("dashboard.defaultOrg");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="hidden md:block w-64 h-screen border-r border-border">
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

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <HubSidebar 
              collapsed={false} 
              onToggle={() => setMobileMenuOpen(false)} 
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8 space-y-6",
            sidebarCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          {/* Welcome Header */}
          <div className="space-y-1">
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
            <p className="text-muted-foreground capitalize">{today}</p>
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
