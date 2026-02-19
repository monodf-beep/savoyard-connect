import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!selectedZone) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scrape-associations', {
        body: { zone: selectedZone, source: selectedSource },
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setResult(data);
        toast.success(`${data.inserted} associations importées !`);
      } else {
        setError(data?.error || 'Erreur inconnue');
        toast.error(data?.error || 'Erreur lors du scraping');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      toast.error('Erreur lors du scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedZone(null);
    setResult(null);
    setError(null);
  };

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

        {!result && !error && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Zone géographique</p>
              <div className="flex flex-wrap gap-2">
                {ZONES.map((zone) => (
                  <Badge
                    key={zone.id}
                    variant={selectedZone === zone.id ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    {zone.flag} {zone.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Source</p>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((src) => (
                  <Badge
                    key={src.id}
                    variant={selectedSource === src.id ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedSource(src.id)}
                  >
                    {src.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {SOURCES.find(s => s.id === selectedSource)?.description}
              </p>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping en cours... Cela peut prendre 1-2 minutes.
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!selectedZone || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Scraping en cours...
                </>
              ) : (
                'Lancer le scraping'
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Import terminé !</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold">{result.total_found}</p>
                <p className="text-xs text-muted-foreground">Trouvées</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
                <p className="text-xs text-muted-foreground">Ajoutées</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-muted-foreground">{result.skipped}</p>
                <p className="text-xs text-muted-foreground">Ignorées</p>
              </div>
            </div>
            {result.associations.length > 0 && (
              <div className="max-h-40 overflow-y-auto text-xs space-y-1 border rounded p-2">
                {result.associations.map((a, i) => (
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
