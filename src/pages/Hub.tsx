import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAssociation, Association } from "@/hooks/useAssociation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building2, 
  GraduationCap, 
  FolderKanban, 
  Dribbble,
  Palette,
  ArrowRight,
  Users,
  Globe,
  Plus,
  Settings,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const Hub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { associations, selectAssociationContext } = useAssociation();

  // Get user's first name
  const userFirstName = user?.user_metadata?.first_name 
    || user?.user_metadata?.name?.split(' ')[0] 
    || 'Utilisateur';

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

  const handleManageAssociation = (association: Association) => {
    selectAssociationContext(association);
    navigate('/dashboard');
  };

  // Mock recent network activity
  const recentActivity = [
    {
      type: 'new_association',
      name: 'Club Alpin de Savoie',
      time: t("hub.activity.today"),
      icon: Building2,
      color: 'bg-primary/10 text-primary',
    },
    {
      type: 'new_project',
      name: 'Festival des Montagnes',
      time: t("hub.activity.yesterday"),
      icon: FolderKanban,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      type: 'new_association',
      name: 'Orchestra Valle d\'Aosta',
      time: t("hub.activity.twoDaysAgo"),
      icon: Building2,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <HubPageLayout breadcrumb={t("nav.hubHome")}>
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("hub.welcome.titlePersonalized", { name: userFirstName })}
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Mes Associations Widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("hub.myAssociations.title")}
            </CardTitle>
            <CardDescription>{t("hub.myAssociations.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {associations && associations.length > 0 ? (
              <>
                {associations.map((membership) => (
                  <div 
                    key={membership.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={membership.association.logo_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {membership.association.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{membership.association.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {t(`roles.${membership.role}`)}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageAssociation(membership.association)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {t("hub.myAssociations.manage")}
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("hub.myAssociations.empty")}</p>
              </div>
            )}
            
            {/* CTA Create Association */}
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary text-white"
              onClick={() => navigate('/onboarding-asso')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("hub.myAssociations.create")}
            </Button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("hub.activity.title")}
            </CardTitle>
            <CardDescription>{t("hub.activity.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.type === 'new_association' 
                        ? t("hub.activity.newAssociationName", { name: activity.name })
                        : t("hub.activity.newProjectName", { name: activity.name })
                      }
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("hub.comingSoon.title")}
          </CardTitle>
          <CardDescription>{t("hub.comingSoon.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("nav.projectsNetwork")}</p>
                <Badge variant="secondary" className="text-xs">{t("nav.comingSoon")}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("nav.opportunities")}</p>
                <Badge variant="secondary" className="text-xs">{t("nav.comingSoon")}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("nav.resourcesShared")}</p>
                <Badge variant="secondary" className="text-xs">{t("nav.comingSoon")}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </HubPageLayout>
  );
};

export default Hub;
