import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface PublicNavbarProps {
  variant?: 'default' | 'transparent';
}

export const PublicNavbar = ({ variant = 'default' }: PublicNavbarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/annuaire', label: t('nav.directory') },
    { path: '/experts', label: t('experts.navTitle') },
  ];

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60",
        variant === 'transparent' 
          ? "border-border/40 bg-background/95" 
          : "border-border bg-background"
      )}>
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">associacion</span>
            <span className="text-xl font-semibold text-muted-foreground hidden sm:inline">.eu</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(link.path) 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link 
                to="/login" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {t('nav.dashboard')}
              </Button>
            ) : (
              <Button 
                className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all text-sm font-semibold uppercase tracking-wide"
                asChild
              >
                <Link to="/signup">
                  {t('hero.cta.start')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile: Language + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            {user && (
              <Button 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {t('nav.dashboard')}
              </Button>
            )}
            <button 
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full screen overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[9999] bg-background"
          style={{ top: '64px' }}
        >
          <nav className="flex flex-col p-6 gap-4 bg-background h-full">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={cn(
                  "text-lg font-medium py-2 transition-colors",
                  isActive(link.path) 
                    ? "text-primary" 
                    : "text-foreground hover:text-primary"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {!user && (
              <>
                <Link 
                  to="/login"
                  className="text-lg font-medium py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <div className="pt-4 mt-4 border-t border-border">
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white uppercase font-semibold"
                    asChild
                  >
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      {t('hero.cta.start')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
};
