import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation, AssociationRole } from "@/hooks/useAssociation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  User,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

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

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const getRoleBadgeColor = (role: AssociationRole): string => {
  switch (role) {
    case 'owner':
      return 'bg-primary text-primary-foreground';
    case 'admin':
      return 'bg-destructive text-destructive-foreground';
    case 'gestionnaire':
      return 'bg-secondary text-secondary-foreground';
    case 'contributeur':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getRoleLabel = (role: AssociationRole): string => {
  const labels: Record<AssociationRole, string> = {
    owner: 'Propriétaire',
    admin: 'Admin',
    gestionnaire: 'Gestionnaire',
    contributeur: 'Contributeur',
    membre: 'Membre',
  };
  return labels[role];
};

export const HubSidebar = ({ collapsed, onToggle }: HubSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, user } = useAuth();
  const { 
    associations, 
    currentAssociation, 
    currentMembership,
    setCurrentAssociation, 
    isOwnerOrAdmin, 
    isGestionnaire 
  } = useAssociation();
  
  const [associationsOpen, setAssociationsOpen] = useState(true);

  // Get user display name
  const userFirstName = user?.user_metadata?.first_name || 
    user?.user_metadata?.name?.split(' ')[0] || 
    user?.email?.split('@')[0] || 
    'Utilisateur';

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
      gestionnaireOnly: true,
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
      gestionnaireOnly: true,
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

  // Filter items based on role
  const filterItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.adminOnly && !isOwnerOrAdmin && !isAdmin) return false;
      if (item.gestionnaireOnly && !isGestionnaire && !isAdmin) return false;
      return true;
    });
  };

  const sections: NavSection[] = [
    {
      titleKey: "nav.sections.myAssociation",
      items: filterItems(myAssociationItems),
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

        {/* User Profile Section */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-border">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(userFirstName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userFirstName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <User className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        )}

        {/* Associations List */}
        {!collapsed && associations.length > 0 && (
          <div className="px-3 py-2 border-b border-border">
            <Collapsible open={associationsOpen} onOpenChange={setAssociationsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  !associationsOpen && "-rotate-90"
                )} />
                <span>{t("nav.sections.myAssociations")}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  {associations.length}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {associations.map((membership) => (
                  <button
                    key={membership.id}
                    onClick={() => setCurrentAssociation(membership.association)}
                    className={cn(
                      "flex items-center gap-2 w-full p-2 rounded-lg text-left transition-colors",
                      currentAssociation?.id === membership.association_id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={membership.association.logo_url || undefined} />
                      <AvatarFallback className="bg-secondary/20 text-secondary text-[10px]">
                        {getInitials(membership.association.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {membership.association.name}
                      </p>
                    </div>
                    <Badge className={cn("text-[9px] px-1.5 py-0", getRoleBadgeColor(membership.role))}>
                      {getRoleLabel(membership.role)}
                    </Badge>
                    {currentAssociation?.id === membership.association_id && (
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
                <button
                  onClick={() => navigate("/onboarding-asso")}
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="h-7 w-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm">{t("nav.createOrJoin")}</span>
                </button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Current Association Header (collapsed mode) */}
        {collapsed && currentAssociation && (
          <div className="p-2 border-b border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentAssociation.logo_url || undefined} />
                    <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                      {getInitials(currentAssociation.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover">
                <p className="font-medium">{currentAssociation.name}</p>
                {currentMembership && (
                  <Badge className={cn("text-[9px] mt-1", getRoleBadgeColor(currentMembership.role))}>
                    {getRoleLabel(currentMembership.role)}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

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
