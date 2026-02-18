import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { useModules } from "@/hooks/useModules";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, FolderKanban, Briefcase, PiggyBank, Settings, 
  ChevronLeft, ChevronRight, GraduationCap, Sparkles, Globe, Building2,
  UserCheck, Kanban, Handshake, GitBranch, TrendingUp, Rocket, Package,
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
  { path: "/annuaire", labelKey: "nav.directoryB2B", icon: Building2 },
  { path: "/experts", labelKey: "nav.experts", icon: GraduationCap },
  { path: "/mutualisation", labelKey: "nav.mutualisation", icon: Handshake },
  { path: "/projets-reseau", labelKey: "nav.projectsNetwork", icon: Rocket },
  { path: "/opportunites", labelKey: "nav.opportunities", icon: TrendingUp },
  { path: "/module-store", labelKey: "nav.moduleStore", icon: Package, adminOnly: true },
  { path: "/settings", labelKey: "nav.settings", icon: Settings, adminOnly: true },
];

export const HubSidebar = ({ collapsed, onToggle, isMobile = false }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { currentAssociation, isOwnerOrAdmin, isGestionnaire } = useAssociation();
  const { isModuleVisibleInSidebar } = useModules();

  const isCollapsed = isMobile ? false : collapsed;

  const navigationItems = associationItems.filter(item => {
    if (item.adminOnly && !isOwnerOrAdmin && !isAdmin) return false;
    if (item.gestionnaireOnly && !isGestionnaire && !isAdmin) return false;
    if (!isModuleVisibleInSidebar(item.path)) return false;
    return true;
  });

  const renderNavItem = (item: NavItem) => {
    if (item.isSeparator) {
      if (isCollapsed) return null;
      return (
        <div key={item.labelKey} className="pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
            {t(item.labelKey)}
          </p>
        </div>
      );
    }

    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    const linkContent = (
      <Link
        to={item.disabled ? "#" : item.path}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
          isActive && !item.disabled
            ? "bg-primary/10 text-primary"
            : item.disabled
            ? "text-muted-foreground/50 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isCollapsed && "justify-center px-2 py-2"
        )}
        onClick={(e) => {
          if (item.disabled) e.preventDefault();
          if (isMobile) onToggle();
        }}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", item.disabled && "opacity-50")} />
        {!isCollapsed && (
          <span className={cn("flex-1 text-[13px]", item.disabled && "opacity-50")}>
            {t(item.labelKey)}
          </span>
        )}
        {!isCollapsed && item.canBePublic && (
          <Globe className="h-3 w-3 text-secondary opacity-60" />
        )}
      </Link>
    );

    if (isCollapsed || item.disabled) {
      return (
        <Tooltip key={item.path + item.labelKey}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="bg-popover border border-border shadow-lg">
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
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card transition-all duration-300",
        "border-l-4 border-l-secondary",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex h-full flex-col">
        {!isCollapsed && (
          <div className="px-3 py-2.5 border-b border-border bg-secondary/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              {t("nav.sections.myAssociation")}
            </p>
            {currentAssociation && (
              <p className="text-sm font-medium text-foreground truncate mt-0.5">
                {currentAssociation.name}
              </p>
            )}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">{navigationItems.map(renderNavItem)}</div>
        </nav>

        {!isCollapsed && (
          <div className="px-3 py-1.5 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Globe className="h-2.5 w-2.5 text-secondary" />
              <span>{t("nav.publicIndicator")}</span>
            </div>
          </div>
        )}

        <div className="border-t border-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 text-muted-foreground hover:text-foreground",
                  isCollapsed ? "w-full justify-center" : "w-full justify-start gap-2 px-2"
                )}
                onClick={onToggle}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-xs">{t("common.collapse")}</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-popover border border-border shadow-lg">
                <p>{t("common.expand")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
