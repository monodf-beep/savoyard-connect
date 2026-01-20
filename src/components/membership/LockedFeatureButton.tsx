import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LockedFeatureButtonProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  featureType?: "mutualisation" | "experts" | "opportunities";
}

export function LockedFeatureButton({ 
  children, 
  variant = "default",
  className,
  featureType = "mutualisation"
}: LockedFeatureButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/adhesion-reseau");
  };

  return (
    <div className="space-y-2">
      <Button 
        variant={variant}
        className={cn(
          "w-full gap-2 opacity-60 cursor-not-allowed relative overflow-hidden",
          className
        )}
        disabled
      >
        <Lock className="h-4 w-4" />
        {children}
      </Button>
      <button
        onClick={handleClick}
        className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors group"
      >
        <span className="flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          {t("membership.lockedMessage", "Réservé aux membres Cotisants")}
          <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
    </div>
  );
}

interface LockedBadgeProps {
  className?: string;
}

export function LockedBadge({ className }: LockedBadgeProps) {
  const { t } = useTranslation();
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 text-xs border-amber-500/50 text-amber-600 bg-amber-50",
        className
      )}
    >
      <Lock className="h-3 w-3" />
      {t("membership.premiumOnly", "Premium")}
    </Badge>
  );
}

interface UpgradeCTAProps {
  compact?: boolean;
}

export function UpgradeCTA({ compact = false }: UpgradeCTAProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (compact) {
    return (
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => navigate("/adhesion-reseau")}
        className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <Sparkles className="h-4 w-4" />
        {t("membership.upgrade", "Devenir membre")}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center space-y-3">
      <div className="flex items-center justify-center gap-2 text-primary">
        <Lock className="h-5 w-5" />
        <span className="font-medium">
          {t("membership.upgradeTitle", "Fonctionnalité réservée aux membres")}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("membership.upgradeDesc", "Mutualisez pour économiser ! Accédez aux emplois partagés, tarifs experts et opportunités.")}
      </p>
      <Button 
        onClick={() => navigate("/adhesion-reseau")}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {t("membership.seeOffers", "Voir les offres")}
      </Button>
    </div>
  );
}
