import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { 
  Bell, 
  Settings, 
  LogOut,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HubTopbarProps {
  breadcrumb: string;
  onMobileMenuToggle: () => void;
  orgName?: string;
  orgLogo?: string;
}

export const HubTopbar = ({ breadcrumb, onMobileMenuToggle, orgName, orgLogo }: HubTopbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (orgName) {
      return orgName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {breadcrumb}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Toggle */}
        <LanguageToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                2
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-semibold text-sm">{t("notifications.title")}</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <p className="text-sm font-medium">{t("notifications.newProject")}</p>
                <p className="text-xs text-muted-foreground">{t("notifications.yesterday")}</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <p className="text-sm font-medium">{t("notifications.reservation")}</p>
                <p className="text-xs text-muted-foreground">{t("notifications.twoDaysAgo")}</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              {t("notifications.viewAll")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User/Org Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={orgLogo} alt={orgName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <div className="px-3 py-2">
              <p className="font-medium text-sm truncate">{orgName || user?.email}</p>
              {orgName && (
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
