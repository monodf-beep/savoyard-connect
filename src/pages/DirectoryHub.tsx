import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { DirectoryMap } from '@/components/directory/DirectoryMap';
import { ImportAssociationsDialog } from '@/components/directory/ImportAssociationsDialog';
import { useDirectory, useUserGeolocation, useCrossBorderSuggestions } from '@/hooks/useDirectory';
import { DirectoryAssociation, SILO_INFO, SiloType, GEOGRAPHIC_ZONES } from '@/types/directory';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Users, MapPin, ArrowRight } from 'lucide-react';
import { useAssociation } from '@/hooks/useAssociation';
import { useAuth } from '@/hooks/useAuth';

const DirectoryHub = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';
  const [selectedSilo, setSelectedSilo] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentAssociation } = useAssociation();
  const { isAdmin } = useAuth();

  const { data: userLocation } = useUserGeolocation();
  
  const { data: associations, isLoading } = useDirectory({
    silo: selectedSilo,
    searchQuery,
  });

  const { data: suggestions } = useCrossBorderSuggestions(
    currentAssociation?.silo,
    currentAssociation?.primary_zone
  );

  return (
    <HubPageLayout breadcrumb={t("nav.directory")}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('directory.hero.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('directory.hero.subtitle')}</p>
        </div>
        {isAdmin && <ImportAssociationsDialog />}
      </div>

      {/* Inline Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('directory.filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={selectedSilo === 'all' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 text-xs"
            onClick={() => setSelectedSilo('all')}
          >
            {t('directory.filters.allDomains')}
          </Badge>
          {Object.entries(SILO_INFO).map(([key, info]) => (
            <Badge
              key={key}
              variant={selectedSilo === key ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 text-xs"
              style={selectedSilo === key ? { backgroundColor: info.color } : undefined}
              onClick={() => setSelectedSilo(key)}
            >
              {lang === 'it' ? info.labelIt : info.labelFr}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {associations?.length || 0} {t('directory.results')}
          </span>
        </div>
      </div>

      {/* Map */}
      {isLoading ? (
        <Skeleton className="h-[500px] rounded-xl" />
      ) : (
        <div className="h-[500px] lg:h-[600px]">
          <DirectoryMap
            associations={associations || []}
            userLocation={userLocation || null}
          />
        </div>
      )}

      {/* Cross-border suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {lang === 'it' ? 'Associazioni suggerite per te' : 'Associations suggérées pour vous'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestions.map((assoc) => {
              const siloInfo = assoc.silo ? SILO_INFO[assoc.silo as SiloType] : null;
              const zoneInfo = GEOGRAPHIC_ZONES.find(z => z.id === assoc.primary_zone);
              const initials = assoc.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

              return (
                <Link key={assoc.id} to={`/annuaire/${assoc.id}`} className="block">
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Avatar className="h-10 w-10 rounded-lg flex-shrink-0">
                        <AvatarImage src={assoc.logo_url || undefined} alt={assoc.name} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{assoc.name}</p>
                        {assoc.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {assoc.city}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          {zoneInfo && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: zoneInfo.color, color: zoneInfo.color }}>
                              {zoneInfo.name[lang]}
                            </Badge>
                          )}
                          {siloInfo && (
                            <Badge className="text-[10px] px-1.5 py-0 text-white" style={{ backgroundColor: siloInfo.color }}>
                              {lang === 'it' ? siloInfo.labelIt : siloInfo.labelFr}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </HubPageLayout>
  );
};

export default DirectoryHub;
