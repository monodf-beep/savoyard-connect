import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Lightbulb, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { HeroCulture } from '@/components/silos/culture/HeroCulture';
import { BenefitCard } from '@/components/silos/culture/BenefitCard';
import { WhoCanJoinSection } from '@/components/silos/culture/WhoCanJoinSection';
import { TestimonialsCulture } from '@/components/silos/culture/TestimonialsCulture';
import { HowItWorksSection } from '@/components/silos/culture/HowItWorksSection';
import { CTABannerCulture } from '@/components/silos/culture/CTABannerCulture';

const CultureLanding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: Lightbulb,
      title: t('siloCulture.benefits.creative.title'),
      description: t('siloCulture.benefits.creative.description'),
    },
    {
      icon: Eye,
      title: t('siloCulture.benefits.visibility.title'),
      description: t('siloCulture.benefits.visibility.description'),
    },
    {
      icon: Share2,
      title: t('siloCulture.benefits.resources.title'),
      description: t('siloCulture.benefits.resources.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#d97706] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-foreground hidden sm:block">Associacion</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('siloCulture.nav.hub')}
              </Link>
              <Link to="/silos/sport" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('siloCulture.nav.sportSilo')}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex"
              >
                {t('siloCulture.nav.login')}
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                className="bg-[#d97706] hover:bg-[#d97706]/90 text-white"
              >
                {t('siloCulture.nav.signup')}
              </Button>

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
                {t('siloCulture.nav.hub')}
              </Link>
              <Link 
                to="/silos/sport" 
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('siloCulture.nav.sportSilo')}
              </Link>
              <Link 
                to="/login" 
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('siloCulture.nav.login')}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <HeroCulture />

      {/* Benefits Section */}
      <section 
        id="benefits" 
        className={`py-16 md:py-24 transition-all duration-700 ${
          visibleSections.has('benefits') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            {t('siloCulture.benefits.title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('siloCulture.benefits.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} {...benefit} />
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Join */}
      <WhoCanJoinSection />

      {/* Testimonials */}
      <TestimonialsCulture />

      {/* How it Works */}
      <HowItWorksSection />

      {/* CTA Banner */}
      <CTABannerCulture />

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#d97706] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-bold">Associacion</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('siloCulture.footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('siloCulture.footer.navigation')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-background transition-colors">
                    {t('siloCulture.footer.hubLink')}
                  </Link>
                </li>
                <li>
                  <Link to="/silos/sport" className="text-muted-foreground hover:text-background transition-colors">
                    {t('siloCulture.footer.sportLink')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('siloCulture.footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:contact@associacion.eu" className="text-muted-foreground hover:text-background transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('siloCulture.footer.legal')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/mentions-legales" className="text-muted-foreground hover:text-background transition-colors">
                    {t('siloCulture.footer.legalNotice')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Associacion. {t('siloCulture.footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CultureLanding;
