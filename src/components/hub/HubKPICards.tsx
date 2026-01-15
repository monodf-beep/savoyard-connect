import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  FolderKanban, 
  Euro,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  badge?: string;
  badgePositive?: boolean;
  iconColor?: string;
}

const KPICard = ({ icon: Icon, value, label, badge, badgePositive = true, iconColor }: KPICardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", iconColor || "bg-primary/10")}>
          <Icon className={cn("h-4 w-4", iconColor ? "text-white" : "text-primary")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {badge && (
          <Badge 
            variant="secondary" 
            className={cn(
              "mt-2 text-xs font-normal",
              badgePositive 
                ? "bg-secondary/20 text-secondary-foreground" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {badgePositive && <TrendingUp className="h-3 w-3 mr-1" />}
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const HubKPICards = () => {
  const { t } = useTranslation();

  const kpis = [
    {
      icon: Users,
      value: 12,
      label: t("dashboard.kpi.connections.label"),
      badge: `+3 ${t("common.thisMonth")}`,
      badgePositive: true,
      iconColor: "bg-primary",
    },
    {
      icon: Package,
      value: 5,
      label: t("dashboard.kpi.resources.label"),
      badge: `2 ${t("dashboard.kpi.resources.badge")}`,
      badgePositive: false,
      iconColor: "bg-secondary",
    },
    {
      icon: FolderKanban,
      value: 3,
      label: t("dashboard.kpi.projects.label"),
      badge: `1 ${t("common.new")} ${t("dashboard.kpi.projects.badge")}`,
      badgePositive: true,
      iconColor: "bg-accent",
    },
    {
      icon: Euro,
      value: "€2,450",
      label: t("dashboard.kpi.savings.label"),
      badge: `+€340 ${t("common.thisMonth")}`,
      badgePositive: true,
      iconColor: "bg-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KPICard
          key={index}
          icon={kpi.icon}
          value={kpi.value}
          label={kpi.label}
          badge={kpi.badge}
          badgePositive={kpi.badgePositive}
          iconColor={kpi.iconColor}
        />
      ))}
    </div>
  );
};
