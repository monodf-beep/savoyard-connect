import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FolderKanban, 
  BookOpen, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HubSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const HubSidebar = ({ collapsed, onToggle }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { 
      path: "/dashboard", 
      labelKey: "nav.dashboard", 
      icon: LayoutDashboard, 
      active: true 
    },
    { 
      path: "#", 
      labelKey: "nav.directory", 
      icon: Users, 
      disabled: true,
      tooltip: t("dashboard.quickActions.comingSoon"),
    },
    { 
      path: "#", 
      labelKey: "nav.resources", 
      icon: Package, 
      disabled: true,
      tooltip: t("dashboard.quickActions.comingSoon"),
    },
    { 
      path: "#", 
      labelKey: "nav.projects", 
      icon: FolderKanban, 
      disabled: true,
      tooltip: t("dashboard.quickActions.comingSoon"),
    },
    { 
      path: "#", 
      labelKey: "nav.documentation", 
      icon: BookOpen, 
      disabled: true,
      tooltip: t("dashboard.quickActions.comingSoon"),
    },
    { 
      path: "/settings", 
      labelKey: "nav.settings", 
      icon: Settings, 
      active: true 
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
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
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
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
                    <span className={item.disabled ? "opacity-50" : ""}>
                      {t(item.labelKey)}
                    </span>
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
                      <p>{item.disabled ? item.tooltip : t(item.labelKey)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.path + item.labelKey}>{linkContent}</div>;
            })}
          </nav>

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
                  <LogOut className="h-5 w-5" />
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
    </TooltipProvider>
  );
};
