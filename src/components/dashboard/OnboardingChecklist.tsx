import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Circle, 
  Building2, 
  Image, 
  Users, 
  FolderKanban,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Association } from "@/hooks/useAssociation";

interface OnboardingChecklistProps {
  association: Association | null;
  membersCount: number;
  projectsCount: number;
  onActionClick?: (step: string) => void;
}

interface OnboardingStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  actionPath?: string;
}

export const OnboardingChecklist = ({ 
  association, 
  membersCount,
  projectsCount,
  onActionClick 
}: OnboardingChecklistProps) => {
  const { t } = useTranslation();

  // Calculate completion status for each step
  const steps: OnboardingStep[] = [
    {
      id: "profile",
      titleKey: "onboarding.steps.profile.title",
      descriptionKey: "onboarding.steps.profile.description",
      icon: Building2,
      isComplete: !!(association?.name && association?.description),
      actionPath: "/settings",
    },
    {
      id: "logo",
      titleKey: "onboarding.steps.logo.title",
      descriptionKey: "onboarding.steps.logo.description",
      icon: Image,
      isComplete: !!association?.logo_url,
      actionPath: "/settings",
    },
    {
      id: "members",
      titleKey: "onboarding.steps.members.title",
      descriptionKey: "onboarding.steps.members.description",
      icon: Users,
      isComplete: membersCount >= 3,
      actionPath: "/members",
    },
    {
      id: "project",
      titleKey: "onboarding.steps.project.title",
      descriptionKey: "onboarding.steps.project.description",
      icon: FolderKanban,
      isComplete: projectsCount >= 1,
      actionPath: "/projects",
    },
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Don't show if all steps are complete
  if (completedSteps === steps.length) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("onboarding.title", "Démarrage rapide")}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {completedSteps}/{steps.length}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                step.isComplete 
                  ? "bg-secondary/10 opacity-70" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                step.isComplete ? "bg-secondary text-white" : "bg-muted-foreground/20"
              )}>
                {step.isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  step.isComplete && "line-through text-muted-foreground"
                )}>
                  {t(step.titleKey, step.id)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t(step.descriptionKey, "")}
                </p>
              </div>
              {!step.isComplete && step.actionPath && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="shrink-0 h-8 w-8 p-0"
                  onClick={() => onActionClick?.(step.actionPath!)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
