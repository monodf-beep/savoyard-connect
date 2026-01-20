import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HRPoolCardProps {
  id: string;
  title: string;
  region: string;
  contractType: string;
  hoursSecured: number;
  totalHours: number;
  percentage: number;
  associations: string[];
  hourlyRate: number;
  onParticipate: () => void;
  locked?: boolean;
}

export function HRPoolCard({
  title,
  region,
  contractType,
  hoursSecured,
  totalHours,
  percentage,
  associations,
  onParticipate,
  locked = false,
}: HRPoolCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Calculate stroke dasharray for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get color based on percentage
  const getProgressColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-primary";
    return "text-amber-500";
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{region}</span>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {contractType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Circular Progress Gauge */}
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <svg width="120" height="120" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getProgressColor()} transition-all duration-1000 ease-out`}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getProgressColor()}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Hours info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="h-4 w-4" />
          <span>
            <span className="font-semibold text-foreground">{hoursSecured}h</span>
            /{totalHours}h {t("mutualisation.secured", "sécurisées")}
          </span>
        </div>

        {/* Social proof */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {associations.length} {t("mutualisation.associationsEngaged", "associations engagées")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {associations.slice(0, 3).map((asso, index) => (
              <Avatar key={index} className="h-7 w-7 border-2 border-background -ml-2 first:ml-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {asso.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))}
            {associations.length > 3 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{associations.length - 3}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {locked ? (
          <div className="w-full space-y-2">
            <Button className="w-full gap-2 opacity-60" disabled>
              <Lock className="h-4 w-4" />
              {t("mutualisation.reserveHours", "Réserver des heures")}
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
          <Button className="w-full" onClick={onParticipate}>
            {t("mutualisation.reserveHours", "Réserver des heures")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
