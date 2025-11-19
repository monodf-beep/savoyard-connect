import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { TutorialDialog } from './TutorialDialog';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Briefcase, 
  Building2, 
  Network,
  Plus,
  UserPlus,
  PlusSquare,
  Upload,
  Info,
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

interface NavbarProps {
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onAddPerson?: () => void;
  onAddSection?: () => void;
  onAddVacantPosition?: () => void;
  onImport?: () => void;
}

export const Navbar = ({ 
  onExpandAll,
  onCollapseAll,
  onAddPerson,
  onAddSection,
  onAddVacantPosition,
  onImport
}: NavbarProps) => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isOrgPage = location.pathname === '/';

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
                  <NavigationMenuTrigger className="bg-background">
                    Organisation
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px] bg-popover z-50">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Users className="h-4 w-4" />
                              Organigramme
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Vue complète de la structure organisationnelle
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              <Info className="h-4 w-4" />
                              Guide d'utilisation
                            </div>
                            <TutorialDialog
                              title="Comprendre l'organigramme"
                              description="L'organigramme est l'outil central pour gérer votre organisation."
                              benefits={[
                                "Visualiser toute la structure de l'organisation en un coup d'œil",
                                "Gérer les membres, leurs rôles et compétences",
                                "Organiser les sections et sous-sections hiérarchiques",
                                "Publier des postes vacants pour recruter de nouveaux talents",
                                "Faciliter la communication interne et externe"
                              ]}
                              steps={[
                                {
                                  title: "Naviguer dans les vues",
                                  description: "Utilisez les boutons Ligne, Tuiles et Membres pour changer de vue. Chaque vue offre une perspective différente sur votre organisation.",
                                  tips: [
                                    "Vue Ligne : hiérarchie complète",
                                    "Vue Tuiles : sections en cartes",
                                    "Vue Membres : focus sur les personnes"
                                  ]
                                },
                                {
                                  title: "Ajouter des membres",
                                  description: "Cliquez sur 'Ajouter une personne' dans le menu Organisation. Remplissez les informations (nom, titre, compétences, etc.).",
                                  tips: ["Utilisez l'import LinkedIn pour gagner du temps"]
                                },
                                {
                                  title: "Créer des sections",
                                  description: "Organisez votre structure avec des sections (Bureau, Commissions, Groupes). Créez des hiérarchies en définissant des parents.",
                                  tips: ["Une bonne structure facilite la navigation"]
                                },
                                {
                                  title: "Gérer les postes vacants",
                                  description: "Publiez des postes à pourvoir pour attirer de nouveaux bénévoles. Ils apparaîtront dans l'organigramme et pourront recevoir des candidatures spontanées.",
                                  tips: ["Soyez précis sur le rôle et les attentes"]
                                }
                              ]}
                            />
                          </div>
                          <p className="text-sm leading-snug text-muted-foreground">
                            Apprenez à utiliser toutes les fonctionnalités
                          </p>
                        </div>
                      </li>
                      {isOrgPage && isAdmin && (
                        <>
                          <li>
                            <button
                              onClick={onAddPerson}
                              className="w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <UserPlus className="h-4 w-4" />
                                Ajouter une personne
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Ajouter un nouveau membre à l'organisation
                              </p>
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={onAddSection}
                              className="w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <PlusSquare className="h-4 w-4" />
                                Ajouter une section
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Créer une nouvelle section ou sous-section
                              </p>
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={onAddVacantPosition}
                              className="w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Plus className="h-4 w-4" />
                                Ajouter un poste vacant
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Créer une nouvelle position à pourvoir
                              </p>
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={onImport}
                              className="w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Upload className="h-4 w-4" />
                                Importer des données
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Importer en masse depuis LinkedIn ou autres sources
                              </p>
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </NavigationMenuContent>
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
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organisation
              </div>
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
              {isOrgPage && isAdmin && (
                <>
                  <button
                    onClick={() => {
                      onAddPerson?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted text-left"
                  >
                    <UserPlus className="h-4 w-4" />
                    Ajouter une personne
                  </button>
                  <button
                    onClick={() => {
                      onAddSection?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted text-left"
                  >
                    <PlusSquare className="h-4 w-4" />
                    Ajouter une section
                  </button>
                  <button
                    onClick={() => {
                      onAddVacantPosition?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted text-left"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un poste vacant
                  </button>
                  <button
                    onClick={() => {
                      onImport?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted text-left"
                  >
                    <Upload className="h-4 w-4" />
                    Importer
                  </button>
                </>
              )}
            </div>

            <div className="space-y-1 pt-2 border-t">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Activités
              </div>
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
