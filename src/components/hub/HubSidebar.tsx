import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Briefcase,
  GitBranch,
  PiggyBank,
  Map,
  Settings, 
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  Sparkles,
  Package,
  BookOpen,
  Globe,
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
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

export const HubSidebar = ({ collapsed, onToggle }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();

  const myAssociationItems: NavItem[] = [
    { 
      path: "/dashboard", 
      labelKey: "nav.dashboard", 
      icon: LayoutDashboard, 
    },
    { 
      path: "/organigramme", 
      labelKey: "nav.organigramme", 
      icon: Users, 
      canBePublic: true,
    },
    { 
      path: "/projects", 
      labelKey: "nav.projects", 
      icon: FolderKanban, 
      canBePublic: true,
    },
    { 
      path: "/jobs", 
      labelKey: "nav.volunteering", 
      icon: Briefcase, 
      canBePublic: true,
    },
    { 
      path: "/value-chains", 
      labelKey: "nav.valueChains", 
      icon: GitBranch, 
    },
    { 
      path: "/finance", 
      labelKey: "nav.finance", 
      icon: PiggyBank, 
      canBePublic: true,
    },
    { 
      path: "/contributors", 
      labelKey: "nav.contributors", 
      icon: Map, 
    },
    { 
      path: "/settings", 
      labelKey: "nav.settings", 
      icon: Settings, 
      adminOnly: true,
    },
    { 
      path: "/admin", 
      labelKey: "nav.admin", 
      icon: ClipboardList, 
      adminOnly: true,
    },
  ];

  const networkItems: NavItem[] = [
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
      path: "/opportunites", 
      labelKey: "nav.opportunities", 
      icon: Sparkles, 
      disabled: true,
      tooltip: t("nav.comingSoon"),
    },
    { 
      path: "/ressources", 
      labelKey: "nav.resourcesShared", 
      icon: Package, 
      disabled: true,
      tooltip: t("nav.comingSoon"),
    },
    { 
      path: "/docs", 
      labelKey: "nav.docsNetwork", 
      icon: BookOpen, 
      disabled: true,
      tooltip: t("nav.comingSoon"),
    },
  ];

  const sections: NavSection[] = [
    {
      titleKey: "nav.sections.myAssociation",
      items: myAssociationItems.filter(item => !item.adminOnly || isAdmin),
    },
    {
      titleKey: "nav.sections.network",
      items: networkItems,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    const linkContent = (
      <Link
        to={item.disabled ? "#" : item.path}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive && !item.disabled
            ? "bg-primary/10 text-primary"
            : item.disabled
            ? "text-muted-foreground/50 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
        onClick={(e) => item.disabled && e.preventDefault()}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", item.disabled && "opacity-50")} />
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
              {item.disabled ? item.tooltip : t(item.labelKey)}
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
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-primary">associacion</span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hidden md:flex"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {sections.map((section, sectionIndex) => (
            <div key={section.titleKey} className={cn(sectionIndex > 0 && "mt-6")}>
              {/* Section Header */}
              {!collapsed && (
                <div className="flex items-center gap-2 px-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(section.titleKey)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              {collapsed && sectionIndex > 0 && (
                <div className="mx-2 my-3 h-px bg-border" />
              )}
              
              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map(renderNavItem)}
              </div>
            </div>
          ))}
        </nav>

        {/* Public indicator legend */}
        {!collapsed && (
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3 text-secondary" />
              <span>{t("nav.publicIndicator")}</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="border-t border-border p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                  collapsed && "justify-center px-2"
                )}
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>{t("nav.logout")}</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover">
                <p>{t("nav.logout")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
