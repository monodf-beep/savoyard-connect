import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  labelKey: string;
  completed: boolean;
  route?: string;
  action?: string;
}

interface HubOnboardingCardProps {
  accountCreatedAt?: Date;
}

export const HubOnboardingCard = ({ accountCreatedAt }: HubOnboardingCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if account is less than 7 days old
  const isNewAccount = accountCreatedAt 
    ? (Date.now() - accountCreatedAt.getTime()) < 7 * 24 * 60 * 60 * 1000
    : true;

  // Don't show if account is older than 7 days
  if (!isNewAccount) {
    return null;
  }

  // Sample onboarding state - in real app, this would come from user data
  const steps: OnboardingStep[] = [
    { 
      labelKey: "dashboard.onboarding.steps.accountCreated", 
      completed: true 
    },
    { 
      labelKey: "dashboard.onboarding.steps.logoAdded", 
      completed: true,
      route: "/settings"
    },
    { 
      labelKey: "dashboard.onboarding.steps.domainsAdded", 
      completed: false,
      route: "/settings",
      action: "domains"
    },
    { 
      labelKey: "dashboard.onboarding.steps.firstConnection", 
      completed: false,
      route: "/contributors"
    },
    { 
      labelKey: "dashboard.onboarding.steps.resourceAdded", 
      completed: false,
      route: "/projects"
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  
  // Find first incomplete step
  const nextStep = steps.find(s => !s.completed);

  const handleStepClick = (step: OnboardingStep) => {
    if (!step.completed && step.route) {
      navigate(step.route);
    }
  };

  const handleCompleteProfile = () => {
    if (nextStep?.route) {
      navigate(nextStep.route);
    } else {
      navigate("/settings");
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          {t("dashboard.onboarding.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount}/{steps.length} {t("dashboard.onboarding.completed")}
            </span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Checklist - clickable items */}
        <ul className="space-y-2">
          {steps.map((step, index) => (
            <li 
              key={index}
              onClick={() => handleStepClick(step)}
              className={cn(
                "flex items-center gap-3 text-sm rounded-lg p-2 -mx-2 transition-colors",
                step.completed 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:bg-primary/10 cursor-pointer"
              )}
            >
              {step.completed ? (
                <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
              )}
              <span className={cn(
                "flex-1",
                step.completed ? "line-through opacity-70" : ""
              )}>
                {t(step.labelKey)}
              </span>
              {!step.completed && step.route && (
                <ChevronRight className="h-4 w-4 text-primary" />
              )}
            </li>
          ))}
        </ul>

        {/* CTA - goes to next incomplete step */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90 gap-2" 
          onClick={handleCompleteProfile}
        >
          <Sparkles className="h-4 w-4" />
          {nextStep 
            ? t(nextStep.labelKey)
            : t("dashboard.onboarding.completeProfile")
          }
        </Button>
      </CardContent>
    </Card>
  );
};
