import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserGeolocation } from '@/hooks/useDirectory';
import { 
  MapPin, 
  Linkedin, 
  Instagram,
  Globe,
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  FolderKanban,
  Users,
} from 'lucide-react';
import { GEOGRAPHIC_ZONES, SILO_INFO, SiloType, calculateDistance, GeographicZone } from '@/types/directory';

interface AssociationData {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  public_email: string | null;
  show_organigramme: boolean | null;
  primary_zone: string | null;
  secondary_zone: string | null;
  silo: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  created_at: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  cover_image_url: string | null;
  is_funding_project: boolean | null;
  funding_goal: number | null;
  funded_amount: number | null;
}

interface SectionData {
  id: string;
  title: string;
  leader_id: string | null;
  is_hidden: boolean | null;
}

interface PersonData {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  avatar_url: string | null;
}

export default function AssociationProfile() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';
  const { data: userLocation } = useUserGeolocation();
  const [activeTab, setActiveTab] = useState('about');

  // Fetch association data
  const { data: association, isLoading } = useQuery({
    queryKey: ['association-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .single();
      
      if (error) throw error;
      return data as AssociationData;
    },
    enabled: !!id,
  });

  // Fetch public projects (approved ones)
  const { data: projects } = useQuery({
    queryKey: ['association-projects', id],
    queryFn: async () => {
      // For now, we'll fetch projects that are public 
      // In real implementation, you'd filter by association_id
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, status, cover_image_url, is_funding_project, funding_goal, funded_amount')
        .eq('approval_status', 'approved')
        .limit(6);
      
      if (error) throw error;
      return data as ProjectData[];
    },
    enabled: !!id,
  });

  // Fetch sections for organigramme preview
  const { data: sections } = useQuery({
    queryKey: ['association-sections', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('id, title, leader_id, is_hidden')
        .eq('is_hidden', false)
        .order('display_order')
        .limit(10);
      
      if (error) throw error;
      return data as SectionData[];
    },
    enabled: !!id && association?.show_organigramme !== false,
  });

  const breadcrumbContent = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/annuaire" className="hover:text-foreground">{t('hub.nav.directory')}</Link>
      <span>/</span>
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <span className="text-foreground font-medium truncate max-w-[200px]">{association?.name || t('directory.profile.notFound')}</span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <HubPageLayout breadcrumb={breadcrumbContent}>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </HubPageLayout>
    );
  }

  if (!association) {
    return (
      <HubPageLayout breadcrumb={breadcrumbContent}>
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('directory.profile.notFoundTitle')}</h2>
              <p className="text-muted-foreground mb-6">{t('directory.profile.notFoundDescription')}</p>
              <Button asChild>
                <Link to="/annuaire">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('directory.profile.backToDirectory')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </HubPageLayout>
    );
  }

  const primaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.primary_zone as GeographicZone);
  const secondaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.secondary_zone as GeographicZone);
  const siloInfo = association.silo ? SILO_INFO[association.silo as SiloType] : null;

  const distance = userLocation && association.latitude && association.longitude
    ? calculateDistance(userLocation.lat, userLocation.lng, Number(association.latitude), Number(association.longitude))
    : null;

  const isCrossBorder = primaryZoneInfo && secondaryZoneInfo && primaryZoneInfo.country !== secondaryZoneInfo.country;

  const initials = association.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();



  return (
    <HubPageLayout breadcrumb={breadcrumbContent}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link to="/annuaire">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('directory.profile.backToDirectory')}
          </Link>
        </Button>

        {/* Hero Header with Cover */}
        <Card className="overflow-hidden">
          {/* Cover Image */}
          <div 
            className="h-40 md:h-56 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 relative"
            style={association.cover_image_url ? {
              backgroundImage: `url(${association.cover_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar - positioned to overlap cover */}
            <div className="-mt-12 md:-mt-16 mb-4">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background shadow-xl">
                <AvatarImage src={association.logo_url || undefined} alt={association.name} />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-2xl md:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {association.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  {association.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{association.city}</span>
                    </div>
                  )}
                  {distance !== null && (
                    <Badge variant="secondary" className="text-sm">
                      {distance} km
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{t('directory.profile.memberSince')} {new Date(association.created_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Zones & Silo badges */}
                <div className="flex flex-wrap gap-2">
                  {primaryZoneInfo && (
                    <Badge
                      variant="outline"
                      className="text-sm"
                      style={{ borderColor: primaryZoneInfo.color, color: primaryZoneInfo.color }}
                    >
                      {primaryZoneInfo.name[lang]}
                    </Badge>
                  )}
                  {secondaryZoneInfo && (
                    <Badge
                      variant="outline"
                      className="text-sm"
                      style={{ borderColor: secondaryZoneInfo.color, color: secondaryZoneInfo.color }}
                    >
                      + {secondaryZoneInfo.name[lang]}
                    </Badge>
                  )}
                  {siloInfo && (
                    <Badge
                      className="text-sm text-white"
                      style={{ backgroundColor: siloInfo.color }}
                    >
                      {lang === 'it' ? siloInfo.labelIt : siloInfo.labelFr}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2">
                {association.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={association.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      {t('directory.profile.website')}
                    </a>
                  </Button>
                )}
                {association.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={association.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {association.instagram_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={association.instagram_url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {association.public_email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${association.public_email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('directory.profile.about')}</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">{t('directory.profile.projects')}</span>
            </TabsTrigger>
            {association.show_organigramme !== false && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t('directory.profile.team')}</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('directory.profile.about')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {association.description ? (
                      <p className="text-muted-foreground whitespace-pre-wrap">{association.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">{t('directory.profile.noDescription')}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Cross-border notice */}
                {isCrossBorder && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Globe className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        {t('directory.profile.crossBorderTitle')}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {t('directory.modal.crossBorderNotice')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Links */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {t('directory.modal.contactTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {association.public_email && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={`mailto:${association.public_email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          {association.public_email}
                        </a>
                      </Button>
                    )}
                    {association.website_url && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={association.website_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          {t('directory.profile.website')}
                        </a>
                      </Button>
                    )}
                    {association.linkedin_url && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={association.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {association.instagram_url && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={association.instagram_url} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {!association.public_email && !association.website_url && !association.linkedin_url && !association.instagram_url && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t('directory.profile.noDescription')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  {t('directory.profile.publicProjects')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects && projects.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        {project.cover_image_url && (
                          <div 
                            className="h-32 bg-cover bg-center"
                            style={{ backgroundImage: `url(${project.cover_image_url})` }}
                          />
                        )}
                        <CardContent className={project.cover_image_url ? "pt-4" : "pt-6"}>
                          <h4 className="font-semibold mb-2 line-clamp-1">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {project.description}
                            </p>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {project.status}
                          </Badge>
                          {project.is_funding_project && project.funding_goal && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{Math.round(((project.funded_amount || 0) / project.funding_goal) * 100)}%</span>
                                <span>{project.funding_goal}€</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${Math.min(((project.funded_amount || 0) / project.funding_goal) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('directory.profile.noProjects')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team/Organigramme Tab */}
          {association.show_organigramme !== false && (
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('directory.profile.teamStructure')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sections && sections.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sections.map((section) => (
                        <Card key={section.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{section.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {t('directory.profile.sectionLabel')}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('directory.profile.noTeamInfo')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </HubPageLayout>
  );
}
