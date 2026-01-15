import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Handshake, 
  FolderPlus, 
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  type: "resource" | "partnership" | "project" | "reservation";
  description: string;
  time: string;
}

const eventIcons = {
  resource: Package,
  partnership: Handshake,
  project: FolderPlus,
  reservation: Calendar,
};

const eventColors = {
  resource: "bg-secondary/20 text-secondary",
  partnership: "bg-primary/20 text-primary",
  project: "bg-accent/20 text-accent",
  reservation: "bg-muted text-muted-foreground",
};

export const HubActivityTimeline = () => {
  const { t } = useTranslation();

  // Sample data - in real app, this would come from props or API
  const activities: ActivityEvent[] = [
    {
      id: "1",
      type: "resource",
      description: t("dashboard.activity.events.newResource", { org: "Association Alpine" }),
      time: "Il y a 2 heures",
    },
    {
      id: "2",
      type: "partnership",
      description: t("dashboard.activity.events.partnershipAccepted"),
      time: "Il y a 5 heures",
    },
    {
      id: "3",
      type: "project",
      description: t("dashboard.activity.events.newProject"),
      time: "Hier",
    },
    {
      id: "4",
      type: "reservation",
      description: t("dashboard.activity.events.reservationConfirmed", { resource: "Salle de conférence" }),
      time: "Il y a 2 jours",
    },
  ];

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t("dashboard.activity.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t("dashboard.activity.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("dashboard.activity.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {activities.map((activity) => {
            const Icon = eventIcons[activity.type];
            const colorClass = eventColors[activity.type];

            return (
              <div key={activity.id} className="relative flex gap-4 pl-10">
                {/* Icon */}
                <div 
                  className={cn(
                    "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center",
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full mt-4">
          {t("dashboard.activity.viewAll")}
        </Button>
      </CardContent>
    </Card>
  );
};
