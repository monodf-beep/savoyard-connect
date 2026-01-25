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
  ChevronRight,
  Sparkles,
  TrendingUp,
  Handshake,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Hub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { associations, selectAssociationContext } = useAssociation();

  // Get user's first name
  const userFirstName = user?.user_metadata?.first_name 
    || user?.user_metadata?.name?.split(' ')[0] 
    || 'Utilisateur';

  const handleManageAssociation = (association: Association) => {
    selectAssociationContext(association);
    navigate('/dashboard');
  };

  return (
    <HubPageLayout breadcrumb={t("nav.hubHome")}>
      {/* Hero Section - More Modern */}
      <div className="relative mb-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background border border-border overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            {t("hub.welcome.badge", "Réseau Alpin")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t("hub.welcome.titlePersonalized", { name: userFirstName })}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t("hub.welcome.subtitle")}
          </p>
        </div>
      </div>

      {/* Quick Stats Row - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Building2, value: "150+", label: t("hub.stats.associations") },
          { icon: Globe, value: "4", label: t("hub.stats.countries") },
          { icon: FolderKanban, value: "25+", label: t("hub.stats.projects") },
          { icon: Users, value: "1,200+", label: t("hub.stats.members") },
        ].map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Mes Associations Widget - Enhanced */}
        <Card className="lg:col-span-1 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              {t("hub.myAssociations.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {associations && associations.length > 0 ? (
              <>
                {associations.map((membership) => (
                  <button 
                    key={membership.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors w-full text-left group"
                    onClick={() => handleManageAssociation(membership.association)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={membership.association.logo_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {membership.association.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {membership.association.name}
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {t(`roles.${membership.role}`)}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("hub.myAssociations.empty")}</p>
              </div>
            )}
            
            {/* CTA Create Association */}
            <Button 
              className="w-full mt-2"
              variant="outline"
              onClick={() => navigate('/onboarding-asso')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("hub.myAssociations.create")}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {[
            {
              title: t("nav.directoryB2B"),
              description: t("hub.links.directory"),
              icon: Building2,
              path: "/annuaire",
              gradient: "from-primary/20 to-primary/5",
              iconBg: "bg-primary/20",
              iconColor: "text-primary",
            },
            {
              title: t("nav.experts"),
              description: t("hub.links.experts"),
              icon: GraduationCap,
              path: "/experts",
              gradient: "from-secondary/20 to-secondary/5",
              iconBg: "bg-secondary/20",
              iconColor: "text-secondary",
            },
            {
              title: t("nav.networkProjects"),
              description: t("hub.links.projects", "Projets collaboratifs"),
              icon: Handshake,
              path: "/projets-reseau",
              gradient: "from-accent/20 to-accent/5",
              iconBg: "bg-accent/20",
              iconColor: "text-accent-foreground",
            },
            {
              title: t("nav.opportunities"),
              description: t("hub.links.opportunities", "Appels à projets"),
              icon: TrendingUp,
              path: "/opportunites",
              gradient: "from-orange-500/20 to-orange-500/5",
              iconBg: "bg-orange-500/20",
              iconColor: "text-orange-600",
            },
          ].map((link, index) => (
            <Link key={index} to={link.path}>
              <Card className={cn(
                "h-full hover:shadow-md transition-all cursor-pointer group border-0",
                `bg-gradient-to-br ${link.gradient}`
              )}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", link.iconBg)}>
                    <link.icon className={cn("h-5 w-5", link.iconColor)} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex-1">{link.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("common.explore")} <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Thematic Markets - Featured */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("hub.silos.title", "Nos marchés thématiques")}
          </CardTitle>
          <CardDescription>{t("hub.silos.subtitle", "Découvrez les offres adaptées à votre secteur")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/silos/sport" 
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-green-500/5 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                <Dribbble className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">{t("nav.siloSport")}</p>
                <p className="text-sm text-muted-foreground">{t("hub.silos.sport", "Clubs sportifs & associations de montagne")}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              to="/silos/culture" 
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20 hover:border-orange-500/40 hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Palette className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">{t("nav.siloCulture")}</p>
                <p className="text-sm text-muted-foreground">{t("hub.silos.culture", "Festivals, théâtres & patrimoine culturel")}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </HubPageLayout>
  );
};

export default Hub;
