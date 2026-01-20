import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  GraduationCap, 
  FolderKanban, 
  Sparkles, 
  Package, 
  Dribbble,
  Palette,
  ArrowRight,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";

const Hub = () => {
  const { t } = useTranslation();

  const networkStats = [
    { label: t("hub.stats.associations"), value: "150+", icon: Building2 },
    { label: t("hub.stats.countries"), value: "4", icon: Globe },
    { label: t("hub.stats.projects"), value: "25+", icon: FolderKanban },
    { label: t("hub.stats.members"), value: "1,200+", icon: Users },
  ];

  const quickLinks = [
    {
      title: t("nav.directoryB2B"),
      description: t("hub.links.directory"),
      icon: Building2,
      path: "/annuaire",
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("nav.experts"),
      description: t("hub.links.experts"),
      icon: GraduationCap,
      path: "/experts",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: t("nav.siloSport"),
      description: t("hub.links.siloSport"),
      icon: Dribbble,
      path: "/silos/sport",
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      title: t("nav.siloCulture"),
      description: t("hub.links.siloCulture"),
      icon: Palette,
      path: "/silos/culture",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  const comingSoon = [
    {
      title: t("nav.projectsNetwork"),
      description: t("hub.links.projectsNetwork"),
      icon: FolderKanban,
    },
    {
      title: t("nav.opportunities"),
      description: t("hub.links.opportunities"),
      icon: Sparkles,
    },
    {
      title: t("nav.resourcesShared"),
      description: t("hub.links.resources"),
      icon: Package,
    },
  ];

  return (
    <HubPageLayout breadcrumb={t("nav.hubHome")}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("hub.welcome.title")}</h1>
        <p className="text-muted-foreground text-lg">{t("hub.welcome.subtitle")}</p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {networkStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("hub.explore.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-2`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {link.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                  <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("common.explore")} <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("hub.comingSoon.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comingSoon.map((item, index) => (
            <Card key={index} className="opacity-60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary">{t("nav.comingSoon")}</Badge>
                </div>
                <CardTitle className="text-base mt-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Network Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("hub.activity.title")}
          </CardTitle>
          <CardDescription>{t("hub.activity.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("hub.activity.newAssociation")}</p>
                <p className="text-xs text-muted-foreground">{t("hub.activity.today")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("hub.activity.newProject")}</p>
                <p className="text-xs text-muted-foreground">{t("hub.activity.yesterday")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("hub.activity.newPartnership")}</p>
                <p className="text-xs text-muted-foreground">{t("hub.activity.twoDaysAgo")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </HubPageLayout>
  );
};

export default Hub;
