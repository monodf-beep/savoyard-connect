import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ExpertCard } from '@/components/experts/ExpertCard';
import { ExpertModal } from '@/components/experts/ExpertModal';
import { expertsData } from '@/data/expertsData';
import { Expert } from '@/types/experts';
import { useAuth } from '@/hooks/useAuth';

const Experts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#065f46] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-foreground hidden sm:block">Associacion</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/silos/sport" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sport & Montagne
              </Link>
              <Link to="/silos/culture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Culture
              </Link>
              <Link to="/experts" className="text-sm font-medium text-[#1e3a8a] flex items-center gap-1">
                <Star className="w-4 h-4" />
                {t('experts.navTitle')}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
                >
                  {t('nav.dashboard')}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="hidden sm:inline-flex"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-[#dc2626] hover:bg-[#dc2626]/90 text-white"
                  >
                    {t('nav.signup')}
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bottom-0 h-[calc(100vh-4rem)] bg-white z-[100]">
            <nav className="flex flex-col p-4 gap-4">
              <Link 
                to="/" 
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/silos/sport" 
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sport & Montagne
              </Link>
              <Link 
                to="/silos/culture" 
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Culture
              </Link>
              <Link 
                to="/experts" 
                className="text-lg font-medium text-[#1e3a8a] py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Star className="w-5 h-5" />
                {t('experts.navTitle')}
              </Link>
              {!user && (
                <Link 
                  to="/login" 
                  className="text-lg font-medium text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-[#1e3a8a]/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-[#065f46]/10 text-[#065f46] hover:bg-[#065f46]/20">
            {t('experts.hero.badge')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('experts.hero.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('experts.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t('nav.home')}</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{t('experts.navTitle')}</span>
        </nav>
      </div>

      {/* Experts Grid */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertsData.map((expert) => (
              <ExpertCard 
                key={expert.id} 
                expert={expert} 
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for non-logged users */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-[#1e3a8a] to-[#065f46]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('experts.cta.title')}
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              {t('experts.cta.subtitle')}
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold"
            >
              {t('experts.cta.button')}
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#1e3a8a] to-[#065f46] flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-bold">Associacion</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('experts.footer.tagline')}
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-background">{t('nav.home')}</Link>
            <Link to="/tarifs" className="hover:text-background">{t('nav.pricing')}</Link>
            <a href="mailto:contact@associacion.eu" className="hover:text-background">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Associacion. {t('footer.copyright')}
          </p>
        </div>
      </footer>

      {/* Expert Modal */}
      <ExpertModal 
        expert={selectedExpert}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Experts;
