import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HeroSport } from '@/components/silos/sport/HeroSport';
import { ProblemCard } from '@/components/silos/sport/ProblemCard';
import { ServiceCard } from '@/components/silos/sport/ServiceCard';
import { TestimonialsCarousel } from '@/components/silos/sport/TestimonialsCarousel';
import { CTABanner } from '@/components/silos/sport/CTABanner';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const SportLanding = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const problems = [
    {
      icon: '🏔️',
      title: t('siloSport.problems.items.0.title'),
      description: t('siloSport.problems.items.0.description'),
    },
    {
      icon: '💰',
      title: t('siloSport.problems.items.1.title'),
      description: t('siloSport.problems.items.1.description'),
    },
    {
      icon: '⚠️',
      title: t('siloSport.problems.items.2.title'),
      description: t('siloSport.problems.items.2.description'),
    },
  ];

  const services = [
    {
      icon: '🤝',
      title: t('siloSport.services.items.0.title'),
      description: t('siloSport.services.items.0.description'),
      example: t('siloSport.services.items.0.example'),
      link: '/silos/sport/matchmaking',
    },
    {
      icon: '🎯',
      title: t('siloSport.services.items.1.title'),
      description: t('siloSport.services.items.1.description'),
      example: t('siloSport.services.items.1.example'),
      link: '/silos/sport/equipement',
    },
    {
      icon: '🛡️',
      title: t('siloSport.services.items.2.title'),
      description: t('siloSport.services.items.2.description'),
      example: t('siloSport.services.items.2.example'),
      link: '/silos/sport/assurance',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D084] flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-foreground">Alliance</span>
                <span className="text-[#FF3B30] font-bold ml-1">Sport</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#problems" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('siloSport.nav.problems')}
              </a>
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('siloSport.nav.services')}
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('siloSport.nav.testimonials')}
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link to="/login" className="hidden md:block">
                <Button variant="ghost">{t('nav.login')}</Button>
              </Link>
              <Link to="/signup" className="hidden md:block">
                <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D084] text-white hover:opacity-90">
                  {t('nav.signup')}
                </Button>
              </Link>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <nav className="flex flex-col gap-3">
                <a 
                  href="#problems" 
                  className="text-muted-foreground hover:text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('siloSport.nav.problems')}
                </a>
                <a 
                  href="#services" 
                  className="text-muted-foreground hover:text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('siloSport.nav.services')}
                </a>
                <a 
                  href="#testimonials" 
                  className="text-muted-foreground hover:text-foreground py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('siloSport.nav.testimonials')}
                </a>
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D084]">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <HeroSport />

      {/* Problems Section */}
      <section 
        id="problems" 
        data-animate
        className={`py-16 md:py-24 bg-background transition-all duration-700 ${
          isVisible['problems'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            {t('siloSport.problems.title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('siloSport.problems.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {problems.map((problem, index) => (
              <ProblemCard key={index} {...problem} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        id="services" 
        data-animate
        className={`py-16 md:py-24 bg-muted/30 transition-all duration-700 ${
          isVisible['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            {t('siloSport.services.title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('siloSport.services.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <div id="testimonials" data-animate className={`transition-all duration-700 ${
        isVisible['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <TestimonialsCarousel />
      </div>

      {/* CTA Banner */}
      <CTABanner />

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D084] flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-bold">Alliance Sport</span>
              <span className="text-muted-foreground text-sm ml-2">
                {t('footer.copyright')}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/cgu" className="text-sm text-muted-foreground hover:text-background transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/confidentiality" className="text-sm text-muted-foreground hover:text-background transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-background transition-colors">
                {t('footer.contact')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SportLanding;
