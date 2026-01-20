import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Calendar, Euro, Lock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ProjectPoolCardProps {
  id: string;
  title: string;
  region: string;
  category: string;
  amountCollected: number;
  goalAmount: number;
  percentage: number;
  minTicket: number;
  contributors: number;
  deadline: string;
  onParticipate: () => void;
  locked?: boolean;
}

export function ProjectPoolCard({
  title,
  region,
  category,
  amountCollected,
  goalAmount,
  percentage,
  minTicket,
  contributors,
  deadline,
  onParticipate,
  locked = false,
}: ProjectPoolCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get progress color based on percentage
  const getProgressColorClass = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-primary";
    return "bg-amber-500";
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{region}</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 border-secondary text-secondary">
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {/* Amount Progress */}
        <div className="space-y-3 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(amountCollected)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatCurrency(goalAmount)}
            </span>
          </div>
          
          {/* Custom Progress bar with dynamic color */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/20">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${getProgressColorClass()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">{percentage}% {t("mutualisation.collected", "collectés")}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Euro className="h-4 w-4" />
            <span>
              {t("mutualisation.minTicket", "Min")} : <span className="font-medium text-foreground">{formatCurrency(minTicket)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              <span className="font-medium text-foreground">{contributors}</span> {t("mutualisation.contributors", "contributeurs")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Calendar className="h-4 w-4" />
            <span>
              {t("mutualisation.deadline", "Échéance")} : <span className="font-medium text-foreground">
                {format(new Date(deadline), "d MMM yyyy", { locale: fr })}
              </span>
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {locked ? (
          <div className="w-full space-y-2">
            <Button variant="secondary" className="w-full gap-2 opacity-60" disabled>
              <Lock className="h-4 w-4" />
              {t("mutualisation.contribute", "Contribuer financièrement")}
            </Button>
            <button
              onClick={() => navigate("/adhesion-reseau")}
              className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors group flex items-center justify-center gap-1"
            >
              <Lock className="h-3 w-3" />
              {t("membership.lockedMessage", "Réservé aux membres Cotisants")}
              <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={onParticipate}>
            {t("mutualisation.contribute", "Contribuer financièrement")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
