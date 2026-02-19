import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ZONES = [
  { id: 'savoie', label: 'Savoie (73)', flag: '🇫🇷' },
  { id: 'haute-savoie', label: 'Haute-Savoie (74)', flag: '🇫🇷' },
  { id: 'alpes-maritimes', label: 'Nice / Alpes-Maritimes (06)', flag: '🇫🇷' },
  { id: 'vallee-aoste', label: "Vallée d'Aoste", flag: '🇮🇹' },
  { id: 'piemont', label: 'Piémont', flag: '🇮🇹' },
];

const SOURCES = [
  { id: 'search', label: 'Recherche web', description: 'Firecrawl Search' },
  { id: 'net1901', label: 'net1901.org', description: 'Annuaire FR uniquement' },
  { id: 'registri', label: 'Registres italiens', description: 'IT uniquement' },
];

interface ImportResult {
  zone: string;
  total_found: number;
  inserted: number;
  skipped: number;
  associations: { name: string; city: string | null }[];
}

export const ImportAssociationsDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>(['search']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentZone, setCurrentZone] = useState<string | null>(null);

  const toggleZone = (id: string) => {
    setSelectedZones(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
  };

  const toggleSource = (id: string) => {
    setSelectedSources(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      return next.length === 0 ? prev : next; // keep at least one
    });
  };

  const handleImport = async () => {
    if (selectedZones.length === 0) return;

    setIsLoading(true);
    setResults([]);
    setError(null);

    const allResults: ImportResult[] = [];

    try {
      for (const zone of selectedZones) {
        setCurrentZone(zone);
        for (const source of selectedSources) {
          const { data, error: fnError } = await supabase.functions.invoke('scrape-associations', {
            body: { zone, source },
          });

          if (fnError) throw fnError;

          if (data?.success) {
            allResults.push(data);
          }
        }
      }

      setResults(allResults);
      const totalInserted = allResults.reduce((sum, r) => sum + r.inserted, 0);
      toast.success(`${totalInserted} associations importées !`);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      toast.error('Erreur lors du scraping');
    } finally {
      setIsLoading(false);
      setCurrentZone(null);
    }
  };

  const reset = () => {
    setSelectedZones([]);
    setResults([]);
    setError(null);
  };

  const totalFound = results.reduce((s, r) => s + r.total_found, 0);
  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Importer des associations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des associations culturelles</DialogTitle>
        </DialogHeader>

        {results.length === 0 && !error && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Zones géographiques (multi-sélection)</p>
              <div className="flex flex-wrap gap-2">
                {ZONES.map((zone) => (
                  <Badge
                    key={zone.id}
                    variant={selectedZones.includes(zone.id) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleZone(zone.id)}
                  >
                    {zone.flag} {zone.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Sources (multi-sélection)</p>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((src) => (
                  <Badge
                    key={src.id}
                    variant={selectedSources.includes(src.id) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleSource(src.id)}
                  >
                    {src.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSources.map(id => SOURCES.find(s => s.id === id)?.description).filter(Boolean).join(' + ')}
              </p>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping {currentZone ? ZONES.find(z => z.id === currentZone)?.label : ''}... Cela peut prendre plusieurs minutes.
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={selectedZones.length === 0 || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Scraping en cours...
                </>
              ) : (
                `Lancer le scraping (${selectedZones.length} zone${selectedZones.length > 1 ? 's' : ''} × ${selectedSources.length} source${selectedSources.length > 1 ? 's' : ''})`
              )}
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Import terminé !</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold">{totalFound}</p>
                <p className="text-xs text-muted-foreground">Trouvées</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{totalInserted}</p>
                <p className="text-xs text-muted-foreground">Ajoutées</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-muted-foreground">{totalSkipped}</p>
                <p className="text-xs text-muted-foreground">Ignorées</p>
              </div>
            </div>
            {results.flatMap(r => r.associations).length > 0 && (
              <div className="max-h-40 overflow-y-auto text-xs space-y-1 border rounded p-2">
                {results.flatMap(r => r.associations).map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate">{a.name}</span>
                    {a.city && <span className="text-muted-foreground ml-2 shrink-0">{a.city}</span>}
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={reset} className="w-full">
              Nouveau scraping
            </Button>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={reset} className="w-full">
              Réessayer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
