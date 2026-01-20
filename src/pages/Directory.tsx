import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GeometricShapes } from '@/components/GeometricShapes';
import { DirectoryFilters } from '@/components/directory/DirectoryFilters';
import { AssociationCard } from '@/components/directory/AssociationCard';
import { AssociationModal } from '@/components/directory/AssociationModal';
import { DirectoryMap } from '@/components/directory/DirectoryMap';
import { PublicFooter } from '@/components/PublicFooter';
import { useDirectory, useUserGeolocation } from '@/hooks/useDirectory';
import { DirectoryAssociation, GeographicZone } from '@/types/directory';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Menu, 
  X, 
  ArrowRight,
  MapPin,
  Building2,
  Filter,
  LayoutGrid,
  Map,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Directory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedZones, setSelectedZones] = useState<GeographicZone[]>([]);
  const [selectedSilo, setSelectedSilo] = useState('all');
  const [ignoreBorders, setIgnoreBorders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<DirectoryAssociation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-primary">associacion</span>
              <span className="text-xl font-semibold text-muted-foreground">.eu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/annuaire" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t('nav.directory')}
            </Link>
            <Link to="/experts" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('experts.navTitle')}
            </Link>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {t('nav.login')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  {t('nav.dashboard')}
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all text-sm font-semibold uppercase tracking-wide"
                asChild
              >
                <Link to="/signup">
                  {t('hero.cta.start')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button 
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[100] border-t border-border"
            style={{ backgroundColor: 'hsl(0 0% 100%)' }}
          >
            <nav className="flex flex-col items-center justify-center gap-8 h-full px-6 bg-white">
              <Link 
                to="/" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/annuaire" 
                className="text-2xl font-medium text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.directory')}
              </Link>
              <Link 
                to="/login" 
                className="text-2xl font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              {user ? (
                <>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full max-w-xs"
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.dashboard')}
                  </Button>
                  <Button 
                    size="lg"
                    variant="ghost"
                    className="w-full max-w-xs"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary text-white mt-4 uppercase font-semibold w-full max-w-xs"
                  asChild
                >
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    {t('hero.cta.start')}
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <GeometricShapes />
        <div className="container relative px-4 md:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-6 w-6 text-primary" />
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                {t('directory.hero.badge')}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {t('directory.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t('directory.hero.subtitle')}
            </p>
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-secondary">
                <MapPin className="h-4 w-4" />
                <span>{t('directory.hero.locationActive')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
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

            {/* Filters - Mobile Sheet */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {associations?.length || 0} {t('directory.results')}
              </p>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
                  <TabsList className="h-9">
                    <TabsTrigger value="grid" className="h-7 px-3">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="map" className="h-7 px-3">
                      <Map className="h-4 w-4" />
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

            {/* Results */}
            <main className="flex-1 min-w-0">
              {/* Desktop view mode toggle & stats */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {associations?.length || 0} {t('directory.results')}
                </p>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
                  <TabsList>
                    <TabsTrigger value="grid">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      {t('directory.viewModes.grid')}
                    </TabsTrigger>
                    <TabsTrigger value="map">
                      <Map className="h-4 w-4 mr-2" />
                      {t('directory.viewModes.map')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {associations && associations.length > 0 ? (
                    associations.map((assoc) => (
                      <AssociationCard
                        key={assoc.id}
                        association={assoc}
                        userLocation={userLocation || null}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-16">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('directory.noResults')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <DirectoryMap
                  associations={associations || []}
                  userLocation={userLocation || null}
                  onMarkerClick={handleContactAssociation}
                />
              )}
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            {t('directory.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('directory.cta.subtitle')}
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold uppercase tracking-wide px-8"
            asChild
          >
            <Link to="/signup">
              {t('directory.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Association Modal */}
      <AssociationModal
        association={selectedAssociation}
        open={modalOpen}
        onOpenChange={setModalOpen}
        userLocation={userLocation || null}
      />
    </div>
  );
};

export default Directory;
