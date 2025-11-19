import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Briefcase, 
  Building2, 
  Network,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface NavbarProps {}

export const Navbar = ({}: NavbarProps) => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Association
          </Link>

          {/* Desktop Navigation - Mega Menu */}
          <div className="hidden lg:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Organisation Menu */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-background',
                        isActive('/') && 'text-primary'
                      )}
                    >
                      Organigramme
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Activités Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-background">
                    Activités
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px] bg-popover z-50">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/projects"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Briefcase className="h-4 w-4" />
                              Projets
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Gestion des projets et initiatives en cours
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/value-chains"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Network className="h-4 w-4" />
                              Chaînes de valeur
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Processus et flux opérationnels de l'organisation
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Direct link to Jobs */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/jobs"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-background',
                        isActive('/jobs') && 'text-primary'
                      )}
                    >
                      Offres d'emploi
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth buttons */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              {user ? (
                <>
                  {isAdmin && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

          {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Users className="h-4 w-4" />
                Organigramme
              </Link>
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/projects')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Briefcase className="h-4 w-4" />
                Projets
              </Link>
              <Link
                to="/value-chains"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/value-chains')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Network className="h-4 w-4" />
                Chaînes de valeur
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/jobs')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Briefcase className="h-4 w-4" />
                Offres d'emploi
              </Link>
            </div>

            <div className="pt-2 border-t">
              {user ? (
                <>
                  {isAdmin && (
                    <div className="px-3 py-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Admin
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
