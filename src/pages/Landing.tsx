import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Mail, 
  FileText, 
  GitBranch, 
  CheckSquare, 
  Map, 
  Play, 
  Menu, 
  X,
  Check,
  ArrowRight,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import dashboardMockup from "@/assets/landing-dashboard-mockup.jpg";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    { 
      number: 1, 
      title: "Inscrivez-vous", 
      duration: "10s", 
      icon: Mail,
      description: "Créez votre compte en quelques clics"
    },
    { 
      number: 2, 
      title: "Créez votre 1ère asso", 
      duration: "3min", 
      icon: FileText,
      description: "Renseignez les informations de base"
    },
    { 
      number: 3, 
      title: "Organigramme drag-drop", 
      duration: "5min", 
      icon: GitBranch,
      description: "Organisez visuellement vos équipes"
    },
    { 
      number: 4, 
      title: "Admin auto", 
      duration: "Instant", 
      icon: CheckSquare,
      description: "Automatisez les tâches récurrentes"
    },
    { 
      number: 5, 
      title: "Réseau régional", 
      duration: "∞", 
      icon: Map,
      description: "Connectez-vous avec les Alpes"
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
              Accueil
            </Link>
            <a href="#fonctionnalites" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Tarifs
            </a>
            <a href="#reseau" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Réseau
            </a>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all animate-pulse"
              asChild
            >
              <Link to="/signup">
                Créer espace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                Accueil
              </Link>
              <a 
                href="#fonctionnalites" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a 
                href="#tarifs" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </a>
              <a 
                href="#reseau" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Réseau
              </a>
              <Link 
                to="/auth" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white mt-4"
                asChild
              >
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Créer mon espace GRATUIT
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <div className="container relative px-4 md:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium w-fit mx-auto lg:mx-0">
                <Zap className="h-4 w-4" />
                Nouveau : Réseau Savoie-Piémont
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Structurez votre association{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  en 5 min
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Organigramme interactif + administration automatisée + réseau régional Savoie-Piémont. 
                Tout ce dont votre association a besoin, enfin réuni.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-8"
                  asChild
                >
                  <Link to="/signup">
                    Créer mon espace GRATUIT
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 border-muted-foreground/30"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Démo vidéo
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                ✓ Gratuit pour commencer · ✓ Pas de carte bancaire · ✓ Setup en 5 min
              </p>
            </div>
            
            {/* Right content - Dashboard mockup */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={dashboardMockup} 
                  alt="Dashboard associacion.eu" 
                  className="w-full h-auto"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="fonctionnalites" className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              De l'inscription à la gestion complète de votre association en 5 étapes simples
            </p>
          </div>
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card className="h-full text-center hover:shadow-lg transition-all hover:-translate-y-1 border-border/50 bg-card">
                  <CardHeader className="pb-2">
                    <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-2">
                      {step.duration}
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mx-auto mb-3 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector (hidden on mobile, last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-white"
              asChild
            >
              <Link to="/signup">
                Commencer étape 1
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Des tarifs adaptés à chaque association
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  plan.highlighted 
                    ? 'border-2 border-primary shadow-lg scale-105 z-10' 
                    : 'border-border/50 hover:-translate-y-1'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-1 text-xs font-medium">
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
                    className={`w-full ${
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

      {/* Network teaser section */}
      <section id="reseau" className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Map className="h-4 w-4" />
            Bientôt disponible
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rejoignez le réseau Alpes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Connectez-vous avec les associations de Savoie, Haute-Savoie, Val d'Aoste, Piémont et Alpes-Maritimes. 
            Partagez ressources, bonnes pratiques et opportunités.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            En savoir plus
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-primary">associacion</span>
              <span className="text-xl font-semibold text-muted-foreground">.eu</span>
            </div>
            
            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Accueil
              </Link>
              <a href="#fonctionnalites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Fonctionnalités
              </a>
              <a href="#tarifs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Tarifs
              </a>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Login
              </Link>
            </nav>
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2025 associacion.eu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
