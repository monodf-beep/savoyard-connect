import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAssociation } from "@/hooks/useAssociation";
import { 
  Home, 
  Building2, 
  LayoutDashboard, 
  Menu,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MobileBottomNav = ({ onMenuClick }: MobileBottomNavProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentContext } = useAssociation();

  // Navigation items change based on context
  const getNavItems = (): NavItem[] => {
    if (currentContext === 'hub') {
      return [
        { path: "/hub", labelKey: "nav.hubHome", icon: Home },
        { path: "/annuaire", labelKey: "nav.directoryB2B", icon: Building2 },
        { path: "/projets-reseau", labelKey: "nav.networkProjects", icon: FolderKanban },
      ];
    }
    return [
      { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { path: "/projects", labelKey: "nav.internalProjects", icon: FolderKanban },
      { path: "/hub", labelKey: "nav.hubHome", icon: Home },
    ];
  };

  const navItems = getNavItems();

  // Context indicator color
  const contextColor = currentContext === 'hub' 
    ? 'bg-primary' 
    : 'bg-secondary';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-area-inset-bottom">
      {/* Context indicator bar at top */}
      <div className={cn("h-0.5 w-full", contextColor)} />
      
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive 
                  ? currentContext === 'hub' 
                    ? "text-primary bg-primary/10" 
                    : "text-secondary bg-secondary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate max-w-full">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
        
        {/* Menu button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};
