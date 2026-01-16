import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  ExternalLink, 
  Linkedin, 
  Instagram,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { DirectoryAssociation, GEOGRAPHIC_ZONES, SILO_INFO, SiloType, calculateDistance } from '@/types/directory';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssociationCardProps {
  association: DirectoryAssociation;
  userLocation?: { lat: number; lng: number } | null;
  onContact?: (association: DirectoryAssociation) => void;
}

export function AssociationCard({ association, userLocation, onContact }: AssociationCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';

  const primaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.primary_zone);
  const secondaryZoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === association.secondary_zone);
  const siloInfo = association.silo ? SILO_INFO[association.silo as SiloType] : null;

  // Calculate distance if user location is available
  const distance = userLocation && association.latitude && association.longitude
    ? calculateDistance(userLocation.lat, userLocation.lng, association.latitude, association.longitude)
    : null;

  // Check if cross-border (primary and secondary zones from different countries)
  const isCrossBorder = primaryZoneInfo && secondaryZoneInfo && primaryZoneInfo.country !== secondaryZoneInfo.country;

  const initials = association.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 rounded-xl border-2 border-border/50">
            <AvatarImage src={association.logo_url || undefined} alt={association.name} />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {association.name}
            </h3>
            {association.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{association.city}</span>
                {distance !== null && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {distance} km
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {association.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {association.description}
          </p>
        )}

        {/* Zones */}
        <div className="flex flex-wrap gap-2">
          {primaryZoneInfo && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: primaryZoneInfo.color, color: primaryZoneInfo.color }}
            >
              {primaryZoneInfo.name[lang]}
            </Badge>
          )}
          {secondaryZoneInfo && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: secondaryZoneInfo.color, color: secondaryZoneInfo.color }}
            >
              + {secondaryZoneInfo.name[lang]}
            </Badge>
          )}
          {siloInfo && (
            <Badge
              className="text-xs text-white"
              style={{ backgroundColor: siloInfo.color }}
            >
              {lang === 'it' ? siloInfo.labelIt : siloInfo.labelFr}
            </Badge>
          )}
        </div>

        {/* Cross-border indicator */}
        {isCrossBorder && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded-md">
                <Globe className="h-3.5 w-3.5" />
                <span>{t('directory.card.crossBorder')}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">{t('directory.card.crossBorderTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Social Links & Contact */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            {association.linkedin_url && (
              <a
                href={association.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            )}
            {association.instagram_url && (
              <a
                href={association.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContact?.(association)}
            className="text-xs"
          >
            {t('directory.card.viewProfile')}
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
