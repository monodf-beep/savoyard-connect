import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { OpportunitiesTable } from "@/components/opportunities/OpportunitiesTable";
import { useMembership } from "@/hooks/useMembership";
import { UpgradeCTA } from "@/components/membership/LockedFeatureButton";

export default function Opportunites() {
  const { t } = useTranslation();
  const { canAccessOpportunities } = useMembership();

  const isLocked = !canAccessOpportunities;

  return (
    <HubPageLayout
      breadcrumb={t("opportunities.title", "Appels à projets & Subventions")}
    >
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t("opportunities.heroTitle", "Financez vos projets")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "opportunities.heroSubtitle",
                "Retrouvez les appels à projets, subventions et financements disponibles pour votre association. Générez automatiquement des dossiers de candidature pré-remplis."
              )}
            </p>
          </div>
        </div>

        {/* Locked state */}
        {isLocked && <UpgradeCTA />}

        {/* Opportunities Table */}
        <OpportunitiesTable />
      </div>
    </HubPageLayout>
  );
}
