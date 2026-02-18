import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Calendar, Euro } from "lucide-react";
import { Link } from "react-router-dom";

const opportunities = [
  {
    title: "Appel à projets — Ministère de la Culture",
    badge: "National",
    tag: "Patrimoine",
    deadline: "30 mars 2025",
    budget: "Jusqu'à 50 000 €",
    description: "Soutien aux projets de valorisation du patrimoine immatériel portés par des associations.",
    locked: false,
  },
  {
    title: "Fonds de soutien — Région AURA",
    badge: "Régional",
    tag: "Vie associative",
    deadline: "15 avril 2025",
    budget: "Jusqu'à 20 000 €",
    description: "Accompagnement des associations culturelles en milieu rural.",
    locked: true,
  },
  {
    title: "Programme européen — Creative Europe",
    badge: "Européen",
    tag: "Coopération",
    deadline: "1er mai 2025",
    budget: "Jusqu'à 200 000 €",
    description: "Financement de projets de coopération culturelle transfrontalière.",
    locked: true,
  },
];

const SubventionsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
            Nouveau
          </Badge>
          <h2 className="text-2xl md:text-[32px] font-semibold text-foreground mb-4">
            Trouvez des financements pour votre association
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chaque semaine, nous sélectionnons les appels à projets et subventions culturelles disponibles en France et en région Auvergne-Rhône-Alpes.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {opportunities.map((opp, index) => (
            <div key={index} className="relative">
              <Card className={`h-full border-border/50 transition-all ${opp.locked ? "" : "hover:shadow-lg hover:-translate-y-1"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {opp.badge}
                    </span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {opp.tag}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug">
                    {opp.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opp.description}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{opp.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{opp.budget}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-muted-foreground cursor-not-allowed"
                    disabled
                  >
                    Voir l'appel →
                  </Button>
                </CardContent>
              </Card>

              {/* Locked overlay */}
              {opp.locked && (
                <Link
                  to="/signup"
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm bg-background/60"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-sm">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Conversion block */}
        <div className="text-center max-w-xl mx-auto">
          <p className="text-lg font-semibold text-foreground mb-2">
            🔒 12 nouveaux appels à projets cette semaine
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Créez un compte gratuit pour accéder à toutes les subventions, recevoir la newsletter hebdomadaire et filtrer par région, thématique et deadline.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold uppercase tracking-wide px-8 py-6 rounded-lg"
            asChild
          >
            <Link to="/signup">
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-4">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Me connecter
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubventionsSection;
