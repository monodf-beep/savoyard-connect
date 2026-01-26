import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HubSidebar } from "./HubSidebar";
import { GlobalHeader } from "./GlobalHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAssociation } from "@/hooks/useAssociation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowLeft, ChevronRight, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface HubPageLayoutProps {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  headerActions?: React.ReactNode;
  fullWidth?: boolean;
}

export const HubPageLayout = ({ 
  children, 
  breadcrumb,
  title,
  subtitle,
  loading,
  headerActions,
  fullWidth,
}: HubPageLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { 
    currentContext, 
    currentAssociation, 
    associations,
    selectHubContext,
    selectAssociationContext 
  } = useAssociation();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header - Fixed at top */}
      <GlobalHeader 
        breadcrumb={breadcrumb || title}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />

      {/* Body: Sidebar + Content */}
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
            "flex-1 transition-all duration-300 overflow-auto",
            sidebarCollapsed ? "md:ml-14" : "md:ml-56"
          )}
        >
          <div className={cn("p-4 md:p-6 lg:p-8", fullWidth && "max-w-none")}>
            {/* Page Header */}
            {(title || subtitle || headerActions) && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    {title && <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>}
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                  </div>
                  {headerActions && <div className="flex-shrink-0">{headerActions}</div>}
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="space-y-6">
                {/* Skeleton loader for page content */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-52 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-36 bg-muted/60 animate-pulse rounded" />
                  </div>
                </div>
                
                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-1 flex-1">
                          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-16 w-full bg-muted/40 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              children
            )}
          </div>
          {/* Bottom padding for mobile nav */}
          <div className="h-20 md:hidden" />
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  );
};
