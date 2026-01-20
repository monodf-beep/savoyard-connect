import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Briefcase,
  PiggyBank,
  Settings, 
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  Sparkles,
  Package,
  Globe,
  Home,
  UserCheck,
  ArrowLeft,
  Kanban,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HubSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  tooltip?: string;
  canBePublic?: boolean;
  adminOnly?: boolean;
  gestionnaireOnly?: boolean;
}

// Hub Network navigation items
const hubNetworkItems: NavItem[] = [
  { 
    path: "/hub", 
    labelKey: "nav.hubHome", 
    icon: Home, 
  },
  { 
    path: "/annuaire", 
    labelKey: "nav.directoryB2B", 
    icon: Building2, 
  },
  { 
    path: "/experts", 
    labelKey: "nav.experts", 
    icon: GraduationCap, 
  },
  { 
    path: "/mutualisation", 
    labelKey: "nav.mutualisation", 
    icon: Handshake, 
  },
  { 
    path: "/projects-network", 
    labelKey: "nav.projectsNetwork", 
    icon: FolderKanban, 
    disabled: true,
    tooltip: "nav.comingSoon",
  },
  { 
    path: "/opportunites", 
    labelKey: "nav.opportunities", 
    icon: Sparkles, 
    disabled: true,
    tooltip: "nav.comingSoon",
  },
  { 
    path: "/ressources", 
    labelKey: "nav.resourcesShared", 
    icon: Package, 
    disabled: true,
    tooltip: "nav.comingSoon",
  },
];

// Association ERP navigation items - Refactored structure
const associationItems: NavItem[] = [
  { 
    path: "/accompagnateur", 
    labelKey: "nav.accompagnateur", 
    icon: Sparkles, 
  },
  { 
    path: "/dashboard", 
    labelKey: "nav.dashboard", 
    icon: LayoutDashboard, 
  },
  { 
    path: "/members", 
    labelKey: "nav.membersSubscriptions", 
    icon: UserCheck,
    gestionnaireOnly: true,
  },
  { 
    path: "/finance", 
    labelKey: "nav.finance", 
    icon: PiggyBank, 
    canBePublic: true,
  },
  { 
    path: "/organigramme", 
    labelKey: "nav.hrVolunteering", 
    icon: Users, 
    canBePublic: true,
  },
  { 
    path: "/jobs", 
    labelKey: "nav.volunteering", 
    icon: Briefcase, 
    canBePublic: true,
  },
  { 
    path: "/projects", 
    labelKey: "nav.internalProjects", 
    icon: FolderKanban, 
    canBePublic: true,
  },
  { 
    path: "/admin", 
    labelKey: "nav.taskManagement", 
    icon: Kanban, 
    gestionnaireOnly: true,
  },
  { 
    path: "/settings", 
    labelKey: "nav.settings", 
    icon: Settings, 
    adminOnly: true,
  },
];

export const HubSidebar = ({ collapsed, onToggle }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { currentContext, isOwnerOrAdmin, isGestionnaire, selectHubContext } = useAssociation();

  // Get navigation items based on context
  const getNavigationItems = (): NavItem[] => {
    if (currentContext === 'hub') {
      return hubNetworkItems;
    }

    // Filter association items based on role
    return associationItems.filter(item => {
      if (item.adminOnly && !isOwnerOrAdmin && !isAdmin) return false;
      if (item.gestionnaireOnly && !isGestionnaire && !isAdmin) return false;
      return true;
    });
  };

  const navigationItems = getNavigationItems();

  const handleReturnToHub = () => {
    selectHubContext();
    navigate('/hub');
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    const linkContent = (
      <Link
        to={item.disabled ? "#" : item.path}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive && !item.disabled
            ? "bg-primary/10 text-primary"
            : item.disabled
            ? "text-muted-foreground/50 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
        onClick={(e) => item.disabled && e.preventDefault()}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", item.disabled && "opacity-50")} />
        {!collapsed && (
          <span className={cn("flex-1", item.disabled && "opacity-50")}>
            {t(item.labelKey)}
          </span>
        )}
        {!collapsed && item.canBePublic && (
          <Globe className="h-3 w-3 text-secondary opacity-60" />
        )}
      </Link>
    );

    if (collapsed || item.disabled) {
      return (
        <Tooltip key={item.path + item.labelKey}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover">
            <p className="flex items-center gap-2">
              {item.disabled ? t(item.tooltip || "nav.comingSoon") : t(item.labelKey)}
              {item.canBePublic && <Globe className="h-3 w-3 text-secondary" />}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.path + item.labelKey}>{linkContent}</div>;
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Context Indicator */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {currentContext === 'hub' ? t("nav.hubNetwork") : t("nav.sections.myAssociation")}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navigationItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Return to Hub Button - Only in association context */}
        {currentContext === 'association' && (
          <div className="px-3 py-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20 hover:text-secondary",
                    collapsed ? "px-2" : "justify-start gap-2"
                  )}
                  onClick={handleReturnToHub}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {!collapsed && t("nav.returnToHub")}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover">
                  <p>{t("nav.returnToHub")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        )}

        {/* Public indicator legend */}
        {!collapsed && currentContext === 'association' && (
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3 text-secondary" />
              <span>{t("nav.publicIndicator")}</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="border-t border-border p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-9"
                onClick={onToggle}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover">
                <p>{t("common.expand")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
