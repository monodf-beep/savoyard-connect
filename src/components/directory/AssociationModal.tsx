import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Mail, 
  Linkedin, 
  Instagram,
  Send,
  LogIn,
  Globe,
  Loader2,
} from 'lucide-react';
import { DirectoryAssociation, GEOGRAPHIC_ZONES, SILO_INFO, SiloType, calculateDistance } from '@/types/directory';
import { Link } from 'react-router-dom';

interface AssociationModalProps {
  association: DirectoryAssociation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function AssociationModal({ association, open, onOpenChange, userLocation }: AssociationModalProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!association) return null;

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
      // Get user's association
      const { data: userAssoc } = await supabase
        .from('associations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      // Create contact record
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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-border/50">
              <AvatarImage src={association.logo_url || undefined} alt={association.name} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-left">
                {association.name}
              </DialogTitle>
              {association.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{association.city}</span>
                  {distance !== null && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {distance} km
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {association.description && (
            <p className="text-sm text-muted-foreground">
              {association.description}
            </p>
          )}

          {/* Zones & Silo */}
          <div className="flex flex-wrap gap-2">
            {primaryZoneInfo && (
              <Badge
                variant="outline"
                style={{ borderColor: primaryZoneInfo.color, color: primaryZoneInfo.color }}
              >
                {primaryZoneInfo.name[lang]}
              </Badge>
            )}
            {secondaryZoneInfo && (
              <Badge
                variant="outline"
                style={{ borderColor: secondaryZoneInfo.color, color: secondaryZoneInfo.color }}
              >
                + {secondaryZoneInfo.name[lang]}
              </Badge>
            )}
            {siloInfo && (
              <Badge
                className="text-white"
                style={{ backgroundColor: siloInfo.color }}
              >
                {lang === 'it' ? siloInfo.labelIt : siloInfo.labelFr}
              </Badge>
            )}
          </div>

          {/* Cross-border notice */}
          {isCrossBorder && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>{t('directory.modal.crossBorderNotice')}</span>
            </div>
          )}

          {/* Social Links */}
          {(association.linkedin_url || association.instagram_url) && (
            <div className="flex items-center gap-4">
              {association.linkedin_url && (
                <a
                  href={association.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {association.instagram_url && (
                <a
                  href={association.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              )}
            </div>
          )}

          <Separator />

          {/* Contact Form */}
          {user ? (
            <div className="space-y-4">
              <Label className="font-semibold">{t('directory.modal.contactTitle')}</Label>
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
            <div className="text-center space-y-4 py-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('directory.modal.loginRequired')}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
