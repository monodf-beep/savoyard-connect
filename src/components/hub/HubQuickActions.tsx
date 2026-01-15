import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  FolderPlus, 
  UserCog,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface QuickAction {
  labelKey: string;
  icon: React.ElementType;
  href?: string;
  disabled?: boolean;
}

export const HubQuickActions = () => {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      labelKey: "dashboard.quickActions.findPartner",
      icon: Users,
      disabled: true,
    },
    {
      labelKey: "dashboard.quickActions.addResource",
      icon: Package,
      disabled: true,
    },
    {
      labelKey: "dashboard.quickActions.createProject",
      icon: FolderPlus,
      disabled: true,
    },
    {
      labelKey: "dashboard.quickActions.editProfile",
      icon: UserCog,
      href: "/settings",
      disabled: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          {t("dashboard.quickActions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              
              const buttonContent = (
                <Button
                  variant={action.disabled ? "outline" : "default"}
                  className={cn(
                    "h-auto py-4 flex flex-col gap-2 w-full",
                    action.disabled 
                      ? "opacity-50 cursor-not-allowed border-dashed" 
                      : "bg-primary hover:bg-primary/90"
                  )}
                  disabled={action.disabled}
                  asChild={!action.disabled && !!action.href}
                >
                  {action.disabled ? (
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="text-xs text-center">{t(action.labelKey)}</span>
                    </div>
                  ) : (
                    <Link to={action.href || "#"} className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="text-xs text-center">{t(action.labelKey)}</span>
                    </Link>
                  )}
                </Button>
              );

              if (action.disabled) {
                return (
                  <Tooltip key={action.labelKey}>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover">
                      <p>{t("dashboard.quickActions.comingSoon")}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={action.labelKey}>{buttonContent}</div>;
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
