import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { DirectoryFilters } from '@/components/directory/DirectoryFilters';
import { AssociationCard } from '@/components/directory/AssociationCard';
import { AssociationModal } from '@/components/directory/AssociationModal';
import { DirectoryMap } from '@/components/directory/DirectoryMap';
import { useDirectory, useUserGeolocation } from '@/hooks/useDirectory';
import { DirectoryAssociation, GeographicZone } from '@/types/directory';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Filter,
  LayoutGrid,
  Map,
  Search,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const DirectoryHub = () => {
  const { t } = useTranslation();
  const [selectedZones, setSelectedZones] = useState<GeographicZone[]>([]);
  const [selectedSilo, setSelectedSilo] = useState('all');
  const [ignoreBorders, setIgnoreBorders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<DirectoryAssociation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Map view is default/predominant
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map');

  const { data: userLocation } = useUserGeolocation();
  
  const { data: associations, isLoading } = useDirectory({
    zones: selectedZones,
    silo: selectedSilo,
    ignoreBorders,
    searchQuery,
  });

  const handleContactAssociation = (association: DirectoryAssociation) => {
    setSelectedAssociation(association);
    setModalOpen(true);
  };

  return (
    <HubPageLayout breadcrumb={t("nav.directoryB2B")}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('directory.hero.title')}</h1>
        <p className="text-muted-foreground">{t('directory.hero.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24">
            <DirectoryFilters
              selectedZones={selectedZones}
              onZonesChange={setSelectedZones}
              selectedSilo={selectedSilo}
              onSiloChange={setSelectedSilo}
              ignoreBorders={ignoreBorders}
              onIgnoreBordersChange={setIgnoreBorders}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              userLocation={userLocation || null}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile: Filters Sheet + View Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {associations?.length || 0} {t('directory.results')}
            </p>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
                <TabsList className="h-9">
                  <TabsTrigger value="map" className="h-7 px-3">
                    <Map className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="h-7 px-3">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('directory.filters.title')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md p-0">
                  <div className="p-6">
                    <DirectoryFilters
                      selectedZones={selectedZones}
                      onZonesChange={setSelectedZones}
                      selectedSilo={selectedSilo}
                      onSiloChange={setSelectedSilo}
                      ignoreBorders={ignoreBorders}
                      onIgnoreBordersChange={setIgnoreBorders}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      userLocation={userLocation || null}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop: Stats + View Toggle */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {associations?.length || 0} {t('directory.results')}
            </p>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
              <TabsList>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  {t('directory.viewModes.map')}
                </TabsTrigger>
                <TabsTrigger value="grid">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  {t('directory.viewModes.grid')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          {isLoading ? (
            viewMode === 'map' ? (
              <Skeleton className="h-[500px] rounded-xl" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            )
          ) : viewMode === 'map' ? (
            <div className="h-[500px] lg:h-[600px]">
              <DirectoryMap
                associations={associations || []}
                userLocation={userLocation || null}
                onMarkerClick={handleContactAssociation}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {associations && associations.length > 0 ? (
                associations.map((assoc) => (
                  <AssociationCard
                    key={assoc.id}
                    association={assoc}
                    userLocation={userLocation || null}
                    onContact={handleContactAssociation}
                  />
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="text-center py-16">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('directory.noResults')}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Association Modal */}
      <AssociationModal
        association={selectedAssociation}
        open={modalOpen}
        onOpenChange={setModalOpen}
        userLocation={userLocation || null}
      />
    </HubPageLayout>
  );
};

export default DirectoryHub;
