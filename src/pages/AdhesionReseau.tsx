import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  Sparkles, 
  Users, 
  Briefcase, 
  PiggyBank,
  Calculator,
  ArrowRight,
  Crown,
  Zap,
  ShieldCheck,
  BadgePercent
} from "lucide-react";
import { toast } from "sonner";
import { useMembership } from "@/hooks/useMembership";
import { cn } from "@/lib/utils";

const features = [
  { 
    key: "internalManagement", 
    labelKey: "membership.features.internalManagement",
    free: true, 
    member: true 
  },
  { 
    key: "orgChart", 
    labelKey: "membership.features.orgChart",
    free: true, 
    member: true 
  },
  { 
    key: "projectKanban", 
    labelKey: "membership.features.projectKanban",
    free: true, 
    member: true 
  },
  { 
    key: "financeTracking", 
    labelKey: "membership.features.financeTracking",
    free: true, 
    member: true 
  },
  { 
    key: "b2bDirectory", 
    labelKey: "membership.features.b2bDirectory",
    free: "limited", 
    member: true 
  },
  { 
    key: "sharedEmployment", 
    labelKey: "membership.features.sharedEmployment",
    free: false, 
    member: true 
  },
  { 
    key: "coFundedProjects", 
    labelKey: "membership.features.coFundedProjects",
    free: false, 
    member: true 
  },
  { 
    key: "expertDiscounts", 
    labelKey: "membership.features.expertDiscounts",
    free: false, 
    member: true 
  },
  { 
    key: "grantAlerts", 
    labelKey: "membership.features.grantAlerts",
    free: false, 
    member: true 
  },
  { 
    key: "prioritySupport", 
    labelKey: "membership.features.prioritySupport",
    free: false, 
    member: true 
  },
];

export default function AdhesionReseau() {
  const { t } = useTranslation();
  const { tier, setTier, canAccessMutualisation } = useMembership();
  const [annualBudget, setAnnualBudget] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const calculateMembership = () => {
    const budget = parseFloat(annualBudget.replace(/\s/g, "").replace(",", "."));
    if (isNaN(budget) || budget <= 0) {
      toast.error(t("membership.invalidBudget", "Veuillez entrer un budget valide"));
      return;
    }
    
    // 1% of annual budget, minimum 50€, maximum 500€
    const price = Math.min(Math.max(budget * 0.01, 50), 500);
    setCalculatedPrice(Math.round(price));
  };

  const handleSubscribe = () => {
    // In production, this would initiate Stripe checkout
    setTier("member");
    toast.success(t("membership.subscribeSuccess", "Bienvenue parmi les membres cotisants !"), {
      description: t("membership.subscribeSuccessDesc", "Vous avez maintenant accès à toutes les fonctionnalités de mutualisation."),
    });
  };

  const handleDemoToggle = () => {
    setTier(tier === "free" ? "member" : "free");
    toast.info(tier === "free" ? "Mode Membre activé (démo)" : "Mode Gratuit activé (démo)");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <HubPageLayout breadcrumb={t("membership.title", "Adhésion Réseau")}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="gap-1 px-4 py-1 text-primary border-primary">
            <Sparkles className="h-4 w-4" />
            {t("membership.badge", "Économie Collaborative")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("membership.heroTitle", "Rejoignez le réseau, mutualisez vos moyens")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("membership.heroSubtitle", "En devenant membre cotisant, accédez aux emplois partagés, aux tarifs négociés et aux opportunités de financement.")}
          </p>
        </div>

        {/* Demo Toggle (for testing) */}
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleDemoToggle} className="text-xs">
            🔧 Démo: Basculer {tier === "free" ? "→ Membre" : "→ Gratuit"}
          </Button>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={cn(
            "relative overflow-hidden transition-all",
            tier === "free" && "border-2 border-primary"
          )}>
            {tier === "free" && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary">{t("membership.currentPlan", "Plan actuel")}</Badge>
              </div>
            )}
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">{t("membership.freePlan.title", "Compte Gratuit")}</CardTitle>
              <CardDescription>
                {t("membership.freePlan.description", "Gestion interne de votre association")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                0€
                <span className="text-base font-normal text-muted-foreground">/an</span>
              </div>
              <Separator />
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature.key} className="flex items-center gap-3 text-sm">
                    {feature.free === true ? (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    ) : feature.free === "limited" ? (
                      <span className="h-4 w-4 shrink-0 text-amber-500 text-xs font-bold">~</span>
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={cn(
                      feature.free === false && "text-muted-foreground/70"
                    )}>
                      {t(feature.labelKey, feature.key)}
                      {feature.free === "limited" && (
                        <span className="text-xs text-amber-600 ml-1">(limité)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier === "free" ? (
                <Button variant="outline" className="w-full" disabled>
                  {t("membership.currentlyActive", "Actuellement actif")}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setTier("free")}>
                  {t("membership.downgrade", "Revenir au gratuit")}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Member Plan */}
          <Card className={cn(
            "relative overflow-hidden transition-all border-2",
            tier === "member" ? "border-primary" : "border-secondary/50"
          )}>
            {/* Recommended badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1 rounded-bl-lg flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {t("membership.recommended", "Recommandé")}
              </div>
            </div>
            {tier === "member" && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary">{t("membership.currentPlan", "Plan actuel")}</Badge>
              </div>
            )}
            <CardHeader className="pt-10">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">{t("membership.memberPlan.title", "Compte Membre")}</CardTitle>
              <CardDescription>
                {t("membership.memberPlan.description", "Accès complet à la mutualisation")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {calculatedPrice ? formatCurrency(calculatedPrice) : "~1%"}
                <span className="text-base font-normal text-muted-foreground">
                  {calculatedPrice ? "/an" : " du budget"}
                </span>
              </div>
              <Separator />
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature.key} className="flex items-center gap-3 text-sm">
                    <Check className={cn(
                      "h-4 w-4 shrink-0",
                      feature.member && !feature.free ? "text-secondary" : "text-green-500"
                    )} />
                    <span className={cn(
                      feature.member && !feature.free && "font-medium"
                    )}>
                      {t(feature.labelKey, feature.key)}
                      {feature.member && !feature.free && (
                        <Sparkles className="h-3 w-3 inline ml-1 text-secondary" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier === "member" ? (
                <Button className="w-full gap-2" disabled>
                  <ShieldCheck className="h-4 w-4" />
                  {t("membership.alreadyMember", "Vous êtes membre")}
                </Button>
              ) : (
                <Button 
                  className="w-full gap-2 bg-secondary hover:bg-secondary/90" 
                  onClick={handleSubscribe}
                >
                  <Sparkles className="h-4 w-4" />
                  {t("membership.subscribe", "Devenir membre")}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Calculator Section */}
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {t("membership.calculator.title", "Calculez votre cotisation")}
                </CardTitle>
                <CardDescription>
                  {t("membership.calculator.description", "Basée sur 1% de votre budget annuel (min. 50€, max. 500€)")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="budget">
                  {t("membership.calculator.budgetLabel", "Budget annuel de votre association")}
                </Label>
                <div className="relative">
                  <Input
                    id="budget"
                    type="text"
                    placeholder="ex: 15000"
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>
              <Button onClick={calculateMembership} className="gap-2">
                <Calculator className="h-4 w-4" />
                {t("membership.calculator.calculate", "Calculer")}
              </Button>
            </div>
            
            {calculatedPrice !== null && (
              <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("membership.calculator.yourContribution", "Votre cotisation annuelle")}
                  </span>
                  <span className="text-2xl font-bold text-secondary">
                    {formatCurrency(calculatedPrice)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("membership.calculator.savingsHint", "Soit moins de {{monthly}}€/mois pour accéder à tous les services mutualisés", { monthly: Math.round(calculatedPrice / 12) })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Briefcase className="h-10 w-10 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">
              {t("membership.benefits.sharedJobs.title", "Emplois Partagés")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("membership.benefits.sharedJobs.description", "Divisez les coûts salariaux avec d'autres associations")}
            </p>
          </Card>
          <Card className="text-center p-6">
            <BadgePercent className="h-10 w-10 mx-auto text-secondary mb-4" />
            <h3 className="font-semibold mb-2">
              {t("membership.benefits.discounts.title", "Tarifs Négociés")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("membership.benefits.discounts.description", "-20% sur les experts partenaires du réseau")}
            </p>
          </Card>
          <Card className="text-center p-6">
            <PiggyBank className="h-10 w-10 mx-auto text-accent mb-4" />
            <h3 className="font-semibold mb-2">
              {t("membership.benefits.funding.title", "Opportunités")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("membership.benefits.funding.description", "Alertes subventions et appels à projets ciblés")}
            </p>
          </Card>
        </div>

        {/* CTA Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {t("membership.questions", "Des questions sur l'adhésion ?")}
          </p>
          <Button variant="link" className="gap-2">
            {t("membership.contactUs", "Contactez-nous")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </HubPageLayout>
  );
}
