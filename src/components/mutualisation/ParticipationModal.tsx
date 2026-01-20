import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, Euro, Calculator, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolType: "hr" | "project";
  poolTitle: string;
  hourlyRate?: number;
  minTicket?: number;
}

export function ParticipationModal({
  isOpen,
  onClose,
  poolType,
  poolTitle,
  hourlyRate = 18,
  minTicket = 500,
}: ParticipationModalProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // Calculate estimated cost
  useEffect(() => {
    const value = parseFloat(inputValue) || 0;
    if (poolType === "hr") {
      // HR: hours/week * hourly rate * 52 weeks
      const annualCost = value * hourlyRate * 52;
      setEstimatedCost(annualCost);
    } else {
      // Project: direct contribution
      setEstimatedCost(value);
    }
  }, [inputValue, poolType, hourlyRate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = () => {
    const value = parseFloat(inputValue) || 0;
    
    if (poolType === "hr" && value < 1) {
      toast.error(t("mutualisation.errorMinHours", "Veuillez réserver au moins 1 heure"));
      return;
    }
    
    if (poolType === "project" && value < minTicket) {
      toast.error(t("mutualisation.errorMinTicket", `Le montant minimum est de ${formatCurrency(minTicket)}`));
      return;
    }

    // TODO: Submit to backend
    toast.success(
      poolType === "hr"
        ? t("mutualisation.successHR", "Votre réservation a été enregistrée !")
        : t("mutualisation.successProject", "Votre contribution a été enregistrée !")
    );
    onClose();
    setInputValue("");
  };

  const handleClose = () => {
    onClose();
    setInputValue("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {poolType === "hr" ? (
              <Clock className="h-5 w-5 text-primary" />
            ) : (
              <Euro className="h-5 w-5 text-secondary" />
            )}
            {poolType === "hr"
              ? t("mutualisation.participateHR", "Réserver des heures")
              : t("mutualisation.participateProject", "Contribuer au projet")}
          </DialogTitle>
          <DialogDescription>{poolTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Input Section */}
          <div className="space-y-3">
            <Label htmlFor="participation-input" className="text-base">
              {poolType === "hr"
                ? t("mutualisation.hoursQuestion", "De combien d'heures/semaine avez-vous besoin ?")
                : t("mutualisation.amountQuestion", "Quel montant souhaitez-vous contribuer ?")}
            </Label>
            <div className="relative">
              <Input
                id="participation-input"
                type="number"
                min={poolType === "hr" ? 1 : minTicket}
                step={poolType === "hr" ? 1 : 100}
                placeholder={poolType === "hr" ? "ex: 7" : `min. ${minTicket}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-lg pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {poolType === "hr" ? "h/sem" : "€"}
              </span>
            </div>
            {poolType === "hr" && (
              <p className="text-sm text-muted-foreground">
                {t("mutualisation.hourlyRateInfo", "Taux horaire chargé")} : {formatCurrency(hourlyRate)}/h
              </p>
            )}
            {poolType === "project" && (
              <p className="text-sm text-muted-foreground">
                {t("mutualisation.minTicketInfo", "Ticket d'entrée minimum")} : {formatCurrency(minTicket)}
              </p>
            )}
          </div>

          <Separator />

          {/* Cost Summary */}
          {estimatedCost > 0 && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calculator className="h-4 w-4" />
                {t("mutualisation.costSummary", "Récapitulatif")}
              </div>
              
              <div className="space-y-2">
                {poolType === "hr" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {inputValue || 0}h × {formatCurrency(hourlyRate)} × 52 sem
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">
                    {poolType === "hr"
                      ? t("mutualisation.annualCost", "Coût estimé pour votre asso")
                      : t("mutualisation.yourContribution", "Votre contribution")}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(estimatedCost)}
                    {poolType === "hr" && <span className="text-sm font-normal text-muted-foreground">/an</span>}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel", "Annuler")}
          </Button>
          <Button onClick={handleSubmit} disabled={!inputValue} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t("mutualisation.confirm", "Confirmer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
