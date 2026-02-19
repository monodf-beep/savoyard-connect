import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { useModules } from "@/hooks/useModules";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, FolderKanban, Briefcase, PiggyBank, Settings, 
  ChevronLeft, ChevronRight, GraduationCap, Sparkles, Globe, Building2,
  UserCheck, Kanban, Handshake, GitBranch, TrendingUp, Rocket, Package, Pin, PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HubSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
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
  isSeparator?: boolean;
}

const associationItems: NavItem[] = [
  { path: "/accompagnateur", labelKey: "nav.accompagnateur", icon: Sparkles },
  { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/members", labelKey: "nav.membersSubscriptions", icon: UserCheck, gestionnaireOnly: true },
  { path: "/finance", labelKey: "nav.finance", icon: PiggyBank, canBePublic: true },
  { path: "/organigramme", labelKey: "nav.hrVolunteering", icon: Users, canBePublic: true },
  { path: "/value-chains", labelKey: "nav.valueChains", icon: GitBranch, canBePublic: true },
  { path: "/jobs", labelKey: "nav.volunteering", icon: Briefcase, canBePublic: true },
  { path: "/projects", labelKey: "nav.internalProjects", icon: FolderKanban, canBePublic: true },
  { path: "/admin", labelKey: "nav.taskManagement", icon: Kanban, gestionnaireOnly: true },
  { path: "/toolbox", labelKey: "nav.toolbox", icon: Briefcase },
  { path: "", labelKey: "nav.sections.network", icon: Globe, isSeparator: true },
  { path: "/annuaire", labelKey: "nav.directoryB2B", icon: Building2 },
  { path: "/experts", labelKey: "nav.experts", icon: GraduationCap },
  { path: "/mutualisation", labelKey: "nav.mutualisation", icon: Handshake },
  { path: "/projets-reseau", labelKey: "nav.projectsNetwork", icon: Rocket },
  { path: "/opportunites", labelKey: "nav.opportunities", icon: TrendingUp },
  { path: "", labelKey: "nav.sections.administration", icon: Settings, isSeparator: true },
  { path: "/module-store", labelKey: "nav.moduleStore", icon: Package, adminOnly: true },
  { path: "/settings", labelKey: "nav.settings", icon: Settings, adminOnly: true },
];

export const HubSidebar = ({ collapsed, onToggle, isMobile = false }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { currentAssociation, isOwnerOrAdmin, isGestionnaire } = useAssociation();
  const { isModuleVisibleInSidebar } = useModules();
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(false), 300);
  }, []);

  const isCollapsed = isMobile ? false : (collapsed && !hovered);

  const filteredItems = associationItems.filter(item => {
    if (item.isSeparator) return true;
    if (item.adminOnly && !isOwnerOrAdmin && !isAdmin) return false;
    if (item.gestionnaireOnly && !isGestionnaire && !isAdmin) return false;
    if (!isModuleVisibleInSidebar(item.path)) return false;
    return true;
  });

  const navigationItems = filteredItems.filter((item, index) => {
    if (!item.isSeparator) return true;
    for (let i = index + 1; i < filteredItems.length; i++) {
      if (filteredItems[i].isSeparator) return false;
      return true;
    }
    return false;
  });

  // Fixed height for every nav row = h-9 (36px). Separators = h-6 (24px).
  const renderNavItem = (item: NavItem) => {
    if (item.isSeparator) {
      // Fixed height separator — always 24px
      return (
        <div key={item.labelKey} className="h-6 flex items-center px-2.5 mt-1">
          <div className={cn(
            "border-t border-border transition-all duration-200",
            isCollapsed ? "w-full" : "w-0 opacity-0"
          )} />
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-200",
            isCollapsed ? "w-0 opacity-0" : "opacity-100"
          )}>
            {t(item.labelKey)}
          </p>
        </div>
      );
    }

    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    // Fixed height link — always h-9
    const linkContent = (
      <Link
        to={item.disabled ? "#" : item.path}
        className={cn(
          "flex items-center h-9 rounded-md text-sm font-medium transition-all duration-200 px-2.5 gap-2.5",
          isActive && !item.disabled
            ? "bg-primary/10 text-primary"
            : item.disabled
            ? "text-muted-foreground/50 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        onClick={(e) => {
          if (item.disabled) e.preventDefault();
          if (isMobile) onToggle();
        }}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", item.disabled && "opacity-50")} />
        <span className={cn(
          "flex-1 text-[13px] whitespace-nowrap overflow-hidden transition-all duration-200",
          item.disabled && "opacity-50",
          isCollapsed ? "w-0 opacity-0" : "opacity-100"
        )}>
          {t(item.labelKey)}
        </span>
      </Link>
    );

    const wrappedLink = isCollapsed || item.disabled ? (
      <Tooltip key={item.path + item.labelKey}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="bg-popover border border-border shadow-lg">
          <p className="flex items-center gap-2">
            {item.disabled ? t(item.tooltip || "nav.comingSoon") : t(item.labelKey)}
            {item.canBePublic && <Globe className="h-3 w-3 text-secondary" />}
          </p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <div key={item.path + item.labelKey}>{linkContent}</div>
    );

    return wrappedLink;
  };

  if (isMobile) {
    return (
      <div className="py-2 px-2">
        <div className="space-y-0.5">{navigationItems.map(renderNavItem)}</div>
        <div className="mt-4 px-2 py-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Globe className="h-2.5 w-2.5 text-secondary" />
            <span>{t("nav.publicIndicator")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card transition-[width] duration-200 ease-in-out overflow-hidden",
        "border-l-4 border-l-secondary",
        isCollapsed ? "w-14" : "w-56",
        hovered && collapsed && "shadow-xl"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full flex-col">
        {/* Association header — fixed height h-12 */}
        <div className="h-12 flex items-center gap-2.5 px-2.5 border-b border-border bg-secondary/5 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-shrink-0">
                <Building2 className="h-4 w-4 text-secondary" />
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-popover border border-border shadow-lg">
                <p>{currentAssociation?.name || t("nav.sections.myAssociation")}</p>
              </TooltipContent>
            )}
          </Tooltip>
          <div className={cn(
            "min-w-0 overflow-hidden transition-all duration-200",
            isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100"
          )}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary whitespace-nowrap">
              {t("nav.sections.myAssociation")}
            </p>
            {currentAssociation && (
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {currentAssociation.name}
              </p>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-1.5 py-1.5">
          <div className="space-y-0.5">{navigationItems.map(renderNavItem)}</div>
        </nav>

        {/* Public indicator removed per UX simplification */}

        {/* Pin/unpin button — fixed height h-10 */}
        <div className="h-10 flex items-center px-1.5 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-start gap-2 px-2.5 text-muted-foreground hover:text-foreground overflow-hidden"
                onClick={onToggle}
              >
                {collapsed ? <Pin className="h-4 w-4 flex-shrink-0" /> : <PinOff className="h-4 w-4 flex-shrink-0" />}
                <span className={cn(
                  "text-xs whitespace-nowrap overflow-hidden transition-all duration-200",
                  isCollapsed ? "w-0 opacity-0" : "opacity-100"
                )}>
                  {collapsed ? "Épingler" : "Désépingler"}
                </span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-popover border border-border shadow-lg">
                <p>Épingler</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
