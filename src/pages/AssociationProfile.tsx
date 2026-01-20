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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserGeolocation } from '@/hooks/useDirectory';
import { 
  MapPin, 
  Linkedin, 
  Instagram,
  Globe,
  Send,
  LogIn,
  Loader2,
  ArrowLeft,
  Building2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { DirectoryAssociation, GEOGRAPHIC_ZONES, SILO_INFO, SiloType, calculateDistance } from '@/types/directory';

export default function AssociationProfile() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: userLocation } = useUserGeolocation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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
      return data as DirectoryAssociation;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <HubPageLayout
        breadcrumb={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/annuaire" className="hover:text-foreground">{t('hub.nav.directory')}</Link>
            <span>/</span>
            <Skeleton className="h-4 w-24" />
          </div>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </HubPageLayout>
    );
  }

  if (!association) {
    return (
      <HubPageLayout
        breadcrumb={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/annuaire" className="hover:text-foreground">{t('hub.nav.directory')}</Link>
            <span>/</span>
            <span>{t('directory.profile.notFound')}</span>
          </div>
        }
      >
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

  const primaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.primary_zone);
  const secondaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.secondary_zone);
  const siloInfo = association.silo ? SILO_INFO[association.silo as SiloType] : null;

  const distance = userLocation && association.latitude && association.longitude
    ? calculateDistance(userLocation.lat, userLocation.lng, association.latitude, association.longitude)
    : null;

  const isCrossBorder = primaryZoneInfo && secondaryZoneInfo && primaryZoneInfo.country !== secondaryZoneInfo.country;

  const initials = association.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      const { data: userAssoc } = await supabase
        .from('associations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      const { error } = await supabase
        .from('directory_contacts')
        .insert({
          requester_association_id: userAssoc?.id || null,
          target_association_id: association.id,
          message: message,
          contact_type: 'message',
        });

      if (error) throw error;

      toast({
        title: t('directory.modal.messageSent'),
        description: t('directory.modal.messageSuccess'),
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('directory.modal.error'),
        description: t('directory.modal.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <HubPageLayout
      breadcrumb={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/annuaire" className="hover:text-foreground">{t('hub.nav.directory')}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{association.name}</span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/annuaire">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('directory.profile.backToDirectory')}
          </Link>
        </Button>

        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-lg">
                <AvatarImage src={association.logo_url || undefined} alt={association.name} />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {association.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
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
                <div className="flex flex-wrap gap-2 pt-2">
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
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            {(association.linkedin_url || association.instagram_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('directory.profile.socialLinks')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {association.linkedin_url && (
                    <a
                      href={association.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                  {association.instagram_url && (
                    <a
                      href={association.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-[#E4405F]" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('directory.modal.contactTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder={t('directory.modal.messagePlaceholder')}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sending}
                      className="w-full"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {t('directory.modal.sendMessage')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      {t('directory.modal.loginRequired')}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link to="/signup">
                          {t('directory.modal.createAccount')}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('directory.modal.login')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HubPageLayout>
  );
}
