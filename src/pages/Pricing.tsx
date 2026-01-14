import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 0,
    priceLabel: 'Gratuit',
    priceNote: 'Pour toujours',
    associations: '1 association',
    members: '10 membres',
    highlighted: false,
    features: [
      { name: 'Organigramme basique', included: true },
      { name: 'Gestion des bénévoles', included: true },
      { name: 'Support communauté', included: true },
      { name: 'Projets (max 3)', included: true },
      { name: 'Chaînes de valeur', included: false },
      { name: 'Financement participatif', included: false },
      { name: 'Import HelloAsso', included: false },
      { name: 'Export PDF personnalisé', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'API & Intégrations', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 29,
    priceLabel: '29€',
    priceNote: '/mois',
    associations: 'Illimité',
    members: '200 membres',
    highlighted: true,
    features: [
      { name: 'Organigramme avancé', included: true },
      { name: 'Gestion des bénévoles', included: true },
      { name: 'Support communauté', included: true },
      { name: 'Projets illimités', included: true },
      { name: 'Chaînes de valeur', included: true },
      { name: 'Financement participatif', included: true },
      { name: 'Import HelloAsso', included: true },
      { name: 'Export PDF personnalisé', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'API & Intégrations', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 79,
    priceLabel: '79€',
    priceNote: '/mois',
    associations: 'Illimité + équipes',
    members: 'Illimité',
    highlighted: false,
    features: [
      { name: 'Organigramme avancé', included: true },
      { name: 'Gestion des bénévoles', included: true },
      { name: 'Support communauté', included: true },
      { name: 'Projets illimités', included: true },
      { name: 'Chaînes de valeur', included: true },
      { name: 'Financement participatif', included: true },
      { name: 'Import HelloAsso', included: true },
      { name: 'Export PDF personnalisé', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'API & Intégrations', included: true },
    ],
  },
];

const COMPARISON_FEATURES = [
  { category: 'Organisation', features: [
    { name: 'Nombre d\'associations', starter: '1', pro: 'Illimité', premium: 'Illimité' },
    { name: 'Membres', starter: '10', pro: '200', premium: 'Illimité' },
    { name: 'Sections / Commissions', starter: '5', pro: 'Illimité', premium: 'Illimité' },
  ]},
  { category: 'Fonctionnalités', features: [
    { name: 'Organigramme interactif', starter: true, pro: true, premium: true },
    { name: 'Chaînes de valeur', starter: false, pro: true, premium: true },
    { name: 'Gestion de projets', starter: '3 max', pro: 'Illimité', premium: 'Illimité' },
    { name: 'Boîte à idées', starter: true, pro: true, premium: true },
    { name: 'Financement participatif', starter: false, pro: true, premium: true },
  ]},
  { category: 'Intégrations', features: [
    { name: 'HelloAsso', starter: false, pro: true, premium: true },
    { name: 'Mapbox (carte)', starter: false, pro: true, premium: true },
    { name: 'API personnalisée', starter: false, pro: false, premium: true },
    { name: 'Webhooks', starter: false, pro: false, premium: true },
  ]},
  { category: 'Support', features: [
    { name: 'Communauté Discord', starter: true, pro: true, premium: true },
    { name: 'Email prioritaire', starter: false, pro: true, premium: true },
    { name: 'Account manager dédié', starter: false, pro: false, premium: true },
    { name: 'Formation personnalisée', starter: false, pro: false, premium: true },
  ]},
];

const Pricing = () => {
  const handleSubscribe = (planId: string) => {
    // TODO: Integrate Stripe checkout
    if (planId === 'starter') {
      window.location.href = '/signup';
    } else {
      // For now, redirect to signup - Stripe integration would go here
      window.location.href = '/signup?plan=' + planId;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-primary">associacion</span>
            <span className="text-xl font-semibold text-muted-foreground">.eu</span>
          </Link>
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container px-4">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            14 jours d'essai gratuit
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Des tarifs adaptés à chaque association
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement, évoluez selon vos besoins. Sans engagement.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  plan.highlighted
                    ? "border-2 border-primary shadow-xl scale-105 z-10"
                    : "border-border hover:shadow-lg hover:-translate-y-1"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-1.5 text-sm font-medium">
                    Le plus populaire
                  </div>
                )}
                <CardHeader className={cn("text-center", plan.highlighted && "pt-10")}>
                  <CardTitle className="text-lg font-bold text-muted-foreground">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-5xl font-bold">{plan.priceLabel}</span>
                    <span className="text-muted-foreground">{plan.priceNote}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {plan.associations} • {plan.members}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-foreground" : "text-muted-foreground/50"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.price === 0 ? "Commencer gratuitement" : "Essayer 14 jours gratuit"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comparaison détaillée</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-5xl mx-auto">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Fonctionnalité</th>
                  <th className="text-center py-4 px-4 font-semibold">STARTER</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">PRO</th>
                  <th className="text-center py-4 px-4 font-semibold">PREMIUM</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((category, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-muted/50">
                      <td colSpan={4} className="py-3 px-4 font-semibold text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featIdx) => (
                      <tr key={featIdx} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm">{feature.name}</td>
                        {['starter', 'pro', 'premium'].map((plan) => {
                          const value = feature[plan as keyof typeof feature];
                          return (
                            <td key={plan} className="text-center py-3 px-4">
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                                )
                              ) : (
                                <span className="text-sm">{value}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. La différence sera calculée au prorata.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comment fonctionne l'essai gratuit de 14 jours ?</h3>
              <p className="text-muted-foreground text-sm">
                Vous avez accès à toutes les fonctionnalités Pro pendant 14 jours. Aucune carte bancaire n'est requise. À la fin de l'essai, vous pouvez choisir de continuer avec un plan payant ou rester sur le plan gratuit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quels moyens de paiement acceptez-vous ?</h3>
              <p className="text-muted-foreground text-sm">
                Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) ainsi que le prélèvement SEPA pour les plans annuels.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Y a-t-il des réductions pour les associations ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui ! Les associations reconnues d'utilité publique bénéficient d'une réduction de 20%. Contactez-nous avec votre numéro RNA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à moderniser votre association ?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Rejoignez des centaines d'associations qui utilisent déjà notre plateforme
          </p>
          <Button size="lg" variant="secondary" onClick={() => handleSubscribe('starter')}>
            Commencer gratuitement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2026 associacion.eu - Tous droits réservés
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
