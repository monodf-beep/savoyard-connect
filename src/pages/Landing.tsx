import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LanguageToggle } from "@/components/LanguageToggle";
import { GeometricShapes, HeroGeometricShapes } from "@/components/GeometricShapes";
import { 
  Users, 
  Share2, 
  FolderKanban, 
  BookOpen,
  Globe,
  PiggyBank,
  Shield,
  Menu, 
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pillars = [
    { 
      icon: Users, 
      titleKey: "pillars.directory.title",
      descKey: "pillars.directory.description",
      color: "primary",
    },
    { 
      icon: Share2, 
      titleKey: "pillars.resources.title",
      descKey: "pillars.resources.description",
      color: "secondary",
    },
    { 
      icon: FolderKanban, 
      titleKey: "pillars.projects.title",
      descKey: "pillars.projects.description",
      color: "accent",
    },
    { 
      icon: BookOpen, 
      titleKey: "pillars.knowledge.title",
      descKey: "pillars.knowledge.description",
      color: "primary",
    },
  ];

  const benefits = [
    { 
      icon: Globe, 
      titleKey: "benefits.transborder.title",
      descKey: "benefits.transborder.description",
    },
    { 
      icon: PiggyBank, 
      titleKey: "benefits.savings.title",
      descKey: "benefits.savings.description",
    },
    { 
      icon: Shield, 
      titleKey: "benefits.network.title",
      descKey: "benefits.network.description",
    },
  ];

  const pricingPlans = [
    {
      name: "STARTER",
      price: "Gratuit",
      priceNote: "Pour toujours",
      associations: "1 association",
      members: "10 membres",
      features: ["Organigramme basique", "Gestion des bénévoles", "Support communauté"],
      highlighted: false,
    },
    {
      name: "PRO",
      price: "29€",
      priceNote: "/mois",
      associations: "Illimité",
      members: "200 membres",
      features: ["Tout Starter +", "Chaînes de valeur", "Projets & financement", "Support prioritaire"],
      highlighted: true,
    },
    {
      name: "PREMIUM",
      price: "79€",
      priceNote: "/mois",
      associations: "Illimité + équipes",
      members: "Illimité",
      features: ["Tout Pro +", "Multi-associations", "API & Intégrations", "Account manager dédié"],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-primary">associacion</span>
              <span className="text-xl font-semibold text-muted-foreground">.eu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.home")}
            </Link>
            <a href="#pillars" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("nav.features")}
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("nav.pricing")}
            </a>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t("nav.login")}
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Button 
              className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all text-sm font-semibold uppercase tracking-wide"
              asChild
            >
              <Link to="/signup">
                {t("hero.cta.start")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button 
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-50 bg-background">
            <nav className="flex flex-col items-center justify-center gap-8 h-full">
              <Link 
                to="/" 
                className="text-2xl font-medium text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <a 
                href="#pillars" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.features")}
              </a>
              <a 
                href="#pricing" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.pricing")}
              </a>
              <Link 
                to="/login" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.login")}
              </Link>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white mt-4 uppercase font-semibold"
                asChild
              >
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  {t("hero.cta.start")}
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <HeroGeometricShapes />
        <GeometricShapes />
        
        <div className="container relative px-4 md:px-8 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-tight">
              {t("hero.title")}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t("hero.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold uppercase tracking-wide px-8 py-6 rounded-lg"
                asChild
              >
                <Link to="/signup">
                  {t("hero.cta.start")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-sm font-semibold uppercase tracking-wide px-8 py-6 rounded-lg border-primary text-primary hover:bg-primary/5"
              >
                {t("hero.cta.learnMore")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section id="pillars" className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-[32px] font-semibold text-foreground mb-4">
              {t("pillars.title")}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {pillars.map((pillar, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card rounded-xl"
              >
                <CardHeader className="pb-2">
                  <div className={`w-14 h-14 rounded-xl bg-${pillar.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <pillar.icon className={`h-7 w-7 text-${pillar.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{t(pillar.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(pillar.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-[32px] font-semibold text-foreground mb-4">
              {t("benefits.title")}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(benefit.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-[32px] font-semibold text-foreground mb-4">
              Tarifs
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all hover:shadow-xl rounded-xl ${
                  plan.highlighted 
                    ? 'border-2 border-primary shadow-lg scale-105 z-10' 
                    : 'border-border/50 hover:-translate-y-1'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-1 text-xs font-medium uppercase tracking-wide">
                    Le plus populaire
                  </div>
                )}
                <CardHeader className={plan.highlighted ? 'pt-8' : ''}>
                  <CardTitle className="text-lg font-bold text-muted-foreground">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.priceNote}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{plan.associations}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{plan.members}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-secondary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full rounded-lg font-semibold uppercase text-sm ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                    asChild
                  >
                    <Link to="/signup">
                      Choisir {plan.name}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <GeometricShapes />
        <div className="container px-4 md:px-8 text-center relative">
          <h2 className="text-2xl md:text-[32px] font-semibold text-foreground mb-8">
            {t("cta.title")}
          </h2>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold uppercase tracking-wide px-8 py-6 rounded-lg btn-pulse"
            asChild
          >
            <Link to="/signup">
              {t("cta.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-6 text-muted-foreground">
            {t("cta.alreadyMember")} <Link to="/login" className="text-primary hover:underline">{t("cta.login")}</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {t("footer.copyright")}
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
              <a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
