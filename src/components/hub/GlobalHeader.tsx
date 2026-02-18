import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation, AssociationRole } from "@/hooks/useAssociation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, ChevronDown, Building2, LogOut, Menu, User, Plus, Check, Settings,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface GlobalHeaderProps {
  breadcrumb?: React.ReactNode;
  onMobileMenuToggle: () => void;
}

const getRoleBadgeColor = (role: AssociationRole): string => {
  switch (role) {
    case 'owner': return 'bg-primary text-primary-foreground';
    case 'admin': return 'bg-destructive text-destructive-foreground';
    case 'gestionnaire': return 'bg-secondary text-secondary-foreground';
    case 'contributeur': return 'bg-accent text-accent-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRoleLabel = (role: AssociationRole): string => {
  const labels: Record<AssociationRole, string> = {
    owner: 'Propriétaire', admin: 'Admin', gestionnaire: 'Gestionnaire',
    contributeur: 'Contributeur', membre: 'Membre',
  };
  return labels[role];
};

export const GlobalHeader = ({ breadcrumb, onMobileMenuToggle }: GlobalHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { associations, currentAssociation, setCurrentAssociation } = useAssociation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) =>
    name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

  const userFirstName = user?.user_metadata?.first_name || 
    user?.user_metadata?.name?.split(' ')[0] || 
    user?.email?.split('@')[0] || 'Utilisateur';

  const userFullName = user?.user_metadata?.name || 
    `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||
    user?.email?.split('@')[0] || 'Utilisateur';

  const handleSelectAssociation = (membership: any) => {
    setCurrentAssociation(membership.association);
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-primary hidden sm:block">Alliance</span>
        </Link>

        {/* Association Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2 gap-2 px-3 py-2 h-9 border-secondary/30 bg-secondary/5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={currentAssociation?.logo_url || undefined} />
                <AvatarFallback className="bg-secondary/20 text-secondary text-[8px]">
                  {currentAssociation ? getInitials(currentAssociation.name) : 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[150px] truncate hidden sm:block">
                {currentAssociation?.name || t("nav.selectContext")}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-popover">
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav.sections.myAssociations")}
              </p>
            </div>
            
            {associations.map((membership) => (
              <DropdownMenuItem 
                key={membership.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer",
                  currentAssociation?.id === membership.association_id && "bg-secondary/10"
                )}
                onClick={() => handleSelectAssociation(membership)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={membership.association.logo_url || undefined} />
                  <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                    {getInitials(membership.association.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{membership.association.name}</p>
                  <Badge className={cn("text-[9px] px-1.5 py-0 mt-0.5", getRoleBadgeColor(membership.role))}>
                    {getRoleLabel(membership.role)}
                  </Badge>
                </div>
                {currentAssociation?.id === membership.association_id && (
                  <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 cursor-pointer text-muted-foreground"
              onClick={() => navigate("/onboarding-asso")}
            >
              <div className="h-8 w-8 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span>{t("nav.createAssociation")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {breadcrumb && (
          <div className="hidden md:flex items-center gap-2 ml-4">
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{breadcrumb}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <div className="hidden sm:block"><LanguageToggle /></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">2</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80 bg-popover border border-border shadow-lg">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-semibold text-sm">{t("notifications.title")}</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <p className="text-sm font-medium">{t("notifications.newProject")}</p>
                <p className="text-xs text-muted-foreground">{t("notifications.yesterday")}</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 md:gap-2 px-1.5 md:px-2 h-9">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials(userFirstName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">{userFullName}</span>
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 md:w-64 bg-popover border border-border shadow-lg">
            <div className="px-3 py-2">
              <p className="font-medium text-sm">{userFullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profil" className="flex items-center gap-2">
                <User className="h-4 w-4" />{t("nav.profile")}
              </Link>
            </DropdownMenuItem>
            <div className="sm:hidden px-2 py-1.5"><LanguageToggle /></div>
            <DropdownMenuSeparator />
            
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {t("nav.sections.myAssociations")}
                {associations.length > 1 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{associations.length}</Badge>
                )}
              </p>
            </div>
            {associations.map((membership) => (
              <DropdownMenuItem 
                key={membership.id}
                className="flex items-center gap-2 p-2 cursor-pointer"
                onClick={() => handleSelectAssociation(membership)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={membership.association.logo_url || undefined} />
                  <AvatarFallback className="bg-secondary/20 text-secondary text-[8px]">
                    {getInitials(membership.association.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm">{membership.association.name}</span>
                {currentAssociation?.id === membership.association_id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/onboarding-asso" className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />{t("nav.createAssociation")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />{t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
