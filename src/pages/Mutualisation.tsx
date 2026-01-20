import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, Briefcase, Plus, Rocket, Lock, Sparkles } from "lucide-react";
import { HRPoolCard } from "@/components/mutualisation/HRPoolCard";
import { ProjectPoolCard } from "@/components/mutualisation/ProjectPoolCard";
import { ParticipationModal } from "@/components/mutualisation/ParticipationModal";
import { useMembership } from "@/hooks/useMembership";
import { UpgradeCTA } from "@/components/membership/LockedFeatureButton";

// Mock data for HR pools
const hrPools = [
  {
    id: "1",
    title: "Secrétaire Administratif",
    region: "Savoie / Isère",
    contractType: "CDI Temps Partagé",
    hoursSecured: 21,
    totalHours: 35,
    percentage: 60,
    associations: ["Club Hand Chambéry", "Chorale Harmonie", "Asso Montagne Verte"],
    hourlyRate: 18,
  },
  {
    id: "2",
    title: "Comptable Associatif",
    region: "Vallée d'Aoste",
    contractType: "CDI Temps Partagé",
    hoursSecured: 28,
    totalHours: 35,
    percentage: 80,
    associations: ["Pro Loco Aoste", "Club Ski Courmayeur", "Festival Musique Alpes", "Asso Culture IT"],
    hourlyRate: 22,
  },
  {
    id: "3",
    title: "Community Manager",
    region: "Alpes-Maritimes",
    contractType: "CDD 12 mois",
    hoursSecured: 14,
    totalHours: 35,
    percentage: 40,
    associations: ["Nice Sport Ensemble", "Collectif Artistes 06"],
    hourlyRate: 16,
  },
];

// Mock data for co-funded projects
const projectPools = [
  {
    id: "1",
    title: "Achat Minibus 9 places",
    region: "Zone Aoste",
    category: "Investissement Matériel",
    amountCollected: 12000,
    goalAmount: 25000,
    percentage: 48,
    minTicket: 500,
    contributors: 8,
    deadline: "2026-04-15",
  },
  {
    id: "2",
    title: "Sono & Éclairage Mutualisé",
    region: "Savoie",
    category: "Équipement Événementiel",
    amountCollected: 8500,
    goalAmount: 15000,
    percentage: 57,
    minTicket: 250,
    contributors: 12,
    deadline: "2026-03-01",
  },
  {
    id: "3",
    title: "Local Partagé Centre-Ville",
    region: "Chambéry",
    category: "Immobilier",
    amountCollected: 45000,
    goalAmount: 120000,
    percentage: 38,
    minTicket: 1000,
    contributors: 15,
    deadline: "2026-06-30",
  },
];

type PoolType = "hr" | "project";

interface SelectedPool {
  type: PoolType;
  id: string;
  title: string;
  rate?: number; // hourly rate for HR
  minTicket?: number; // min contribution for projects
}

export default function Mutualisation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAccessMutualisation } = useMembership();
  const [activeTab, setActiveTab] = useState("hr");
  const [showNewCollectDialog, setShowNewCollectDialog] = useState(false);
  const [selectedPool, setSelectedPool] = useState<SelectedPool | null>(null);
  
  const isLocked = !canAccessMutualisation;

  const handleParticipate = (type: PoolType, id: string) => {
    if (type === "hr") {
      const pool = hrPools.find((p) => p.id === id);
      if (pool) {
        setSelectedPool({
          type: "hr",
          id: pool.id,
          title: pool.title,
          rate: pool.hourlyRate,
        });
      }
    } else {
      const pool = projectPools.find((p) => p.id === id);
      if (pool) {
        setSelectedPool({
          type: "project",
          id: pool.id,
          title: pool.title,
          minTicket: pool.minTicket,
        });
      }
    }
  };

  return (
    <HubPageLayout
      breadcrumb={t("mutualisation.title", "Espace Mutualisation")}
    >
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {t("mutualisation.badge", "Économie Collaborative")}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("mutualisation.heroTitle", "Ensemble, on va plus loin.")}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {t(
                "mutualisation.heroSubtitle",
                "Participez à des cagnottes pour embaucher des salariés partagés ou co-financer de gros projets."
              )}
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setShowNewCollectDialog(true)}
            >
              <Plus className="h-5 w-5" />
              {t("mutualisation.launchCollect", "Lancer une nouvelle collecte")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
            <TabsTrigger value="hr" className="gap-2">
              <Users className="h-4 w-4" />
              {t("mutualisation.tabHR", "Groupement d'Employeurs")}
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Briefcase className="h-4 w-4" />
              {t("mutualisation.tabProjects", "Projets Cofinancés")}
            </TabsTrigger>
          </TabsList>

          {/* HR Pools Tab */}
          <TabsContent value="hr" className="mt-0 space-y-6">
            {isLocked && <UpgradeCTA />}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hrPools.map((pool) => (
                <HRPoolCard
                  key={pool.id}
                  {...pool}
                  onParticipate={() => handleParticipate("hr", pool.id)}
                  locked={isLocked}
                />
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-0 space-y-6">
            {isLocked && <UpgradeCTA />}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projectPools.map((pool) => (
                <ProjectPoolCard
                  key={pool.id}
                  {...pool}
                  onParticipate={() => handleParticipate("project", pool.id)}
                  locked={isLocked}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Collect Dialog */}
      <Dialog open={showNewCollectDialog} onOpenChange={setShowNewCollectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("mutualisation.newCollectTitle", "Nouvelle collecte")}</DialogTitle>
            <DialogDescription>
              {t("mutualisation.newCollectDesc", "Quel type de besoin souhaitez-vous mutualiser ?")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => {
                setShowNewCollectDialog(false);
                // TODO: Navigate to HR form
              }}
            >
              <Users className="h-8 w-8 text-primary" />
              <span className="font-semibold">{t("mutualisation.needHR", "Besoin RH")}</span>
              <span className="text-xs text-muted-foreground">
                {t("mutualisation.needHRDesc", "Recruter un salarié partagé")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:border-secondary hover:bg-secondary/5"
              onClick={() => {
                setShowNewCollectDialog(false);
                // TODO: Navigate to Project form
              }}
            >
              <Briefcase className="h-8 w-8 text-secondary" />
              <span className="font-semibold">{t("mutualisation.needProject", "Projet d'investissement")}</span>
              <span className="text-xs text-muted-foreground">
                {t("mutualisation.needProjectDesc", "Co-financer un équipement ou local")}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participation Modal */}
      <ParticipationModal
        isOpen={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        poolType={selectedPool?.type || "hr"}
        poolTitle={selectedPool?.title || ""}
        hourlyRate={selectedPool?.rate}
        minTicket={selectedPool?.minTicket}
      />
    </HubPageLayout>
  );
}
