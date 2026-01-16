import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Globe, X } from 'lucide-react';
import { GEOGRAPHIC_ZONES, GeographicZone, SILO_INFO, SiloType } from '@/types/directory';

interface DirectoryFiltersProps {
  selectedZones: GeographicZone[];
  onZonesChange: (zones: GeographicZone[]) => void;
  selectedSilo: string;
  onSiloChange: (silo: string) => void;
  ignoreBorders: boolean;
  onIgnoreBordersChange: (ignore: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function DirectoryFilters({
  selectedZones,
  onZonesChange,
  selectedSilo,
  onSiloChange,
  ignoreBorders,
  onIgnoreBordersChange,
  searchQuery,
  onSearchChange,
  userLocation,
}: DirectoryFiltersProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';

  const handleZoneToggle = (zone: GeographicZone) => {
    if (selectedZones.includes(zone)) {
      onZonesChange(selectedZones.filter((z) => z !== zone));
    } else {
      onZonesChange([...selectedZones, zone]);
    }
  };

  const clearFilters = () => {
    onZonesChange([]);
    onSiloChange('all');
    onIgnoreBordersChange(false);
    onSearchChange('');
  };

  const hasActiveFilters = selectedZones.length > 0 || selectedSilo !== 'all' || ignoreBorders || searchQuery;

  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('directory.filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Geographic Zones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <Label className="font-semibold text-sm">{t('directory.filters.zones')}</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GEOGRAPHIC_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={zone.id}
                  checked={selectedZones.includes(zone.id)}
                  onCheckedChange={() => handleZoneToggle(zone.id)}
                  disabled={ignoreBorders}
                />
                <Label
                  htmlFor={zone.id}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  {zone.name[lang]}
                  <span className="text-muted-foreground text-xs">({zone.country})</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Ignore Borders Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-secondary" />
            <Label htmlFor="ignore-borders" className="text-sm font-medium cursor-pointer">
              {t('directory.filters.ignoreBorders')}
            </Label>
          </div>
          <Switch
            id="ignore-borders"
            checked={ignoreBorders}
            onCheckedChange={onIgnoreBordersChange}
          />
        </div>

        {/* Silo Filter */}
        <div className="space-y-3">
          <Label className="font-semibold text-sm">{t('directory.filters.domain')}</Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedSilo === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => onSiloChange('all')}
            >
              {t('directory.filters.allDomains')}
            </Badge>
            {Object.entries(SILO_INFO).map(([key, info]) => (
              <Badge
                key={key}
                variant={selectedSilo === key ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                style={selectedSilo === key ? { backgroundColor: info.color } : undefined}
                onClick={() => onSiloChange(key)}
              >
                {lang === 'it' ? info.labelIt : info.labelFr}
              </Badge>
            ))}
          </div>
        </div>

        {/* Geolocation Status */}
        {userLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-secondary" />
            <span>{t('directory.filters.locationActive')}</span>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            {t('directory.filters.clearAll')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
