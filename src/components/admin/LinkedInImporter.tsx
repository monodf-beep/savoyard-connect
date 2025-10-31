import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface LinkedInProfile {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  experience: string;
  formation: string;
  competences: string[];
  langues: string[];
  location: string;
}

interface LinkedInImporterProps {
  onProfileExtracted?: (profile: Partial<LinkedInProfile>) => void;
  currentData?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    description?: string;
    experience?: string;
    formation?: string;
    competences?: string[];
    langues?: string[];
    adresse?: string;
  };
}

interface FieldComparison {
  field: keyof LinkedInProfile;
  label: string;
  currentValue: string | string[];
  linkedInValue: string | string[];
  selected: 'current' | 'linkedin';
}

export const LinkedInImporter = ({ onProfileExtracted, currentData }: LinkedInImporterProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<LinkedInProfile | null>(null);
  const [comparisons, setComparisons] = useState<FieldComparison[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "URL manquante",
        description: "Veuillez entrer une URL LinkedIn",
        variant: "destructive"
      });
      return;
    }

    if (!linkedinUrl.includes('linkedin.com')) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL LinkedIn valide",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setExtractedProfile(null);

    try {
      const { data, error } = await supabase.functions.invoke('extract-linkedin', {
        body: { linkedinUrl }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Échec de l\'extraction du profil');
      }

      const profile = data.profile as LinkedInProfile;
      setExtractedProfile(profile);
      
      toast({
        title: "Profil extrait avec succès",
        description: `Données récupérées pour ${profile.firstName} ${profile.lastName}`,
      });

      // Créer les comparaisons champ par champ
      const fieldComparisons: FieldComparison[] = [];
      
      if (profile.firstName || currentData?.firstName) {
        fieldComparisons.push({
          field: 'firstName',
          label: 'Prénom',
          currentValue: currentData?.firstName || '',
          linkedInValue: profile.firstName || '',
          selected: currentData?.firstName ? 'current' : 'linkedin'
        });
      }
      
      if (profile.lastName || currentData?.lastName) {
        fieldComparisons.push({
          field: 'lastName',
          label: 'Nom',
          currentValue: currentData?.lastName || '',
          linkedInValue: profile.lastName || '',
          selected: currentData?.lastName ? 'current' : 'linkedin'
        });
      }
      
      if (profile.title || currentData?.role) {
        fieldComparisons.push({
          field: 'title',
          label: 'Rôle/Fonction',
          currentValue: currentData?.role || '',
          linkedInValue: profile.title || '',
          selected: currentData?.role ? 'current' : 'linkedin'
        });
      }
      
      if (profile.bio || currentData?.description) {
        fieldComparisons.push({
          field: 'bio',
          label: 'À propos / Mission',
          currentValue: currentData?.description || '',
          linkedInValue: profile.bio || '',
          selected: currentData?.description ? 'current' : 'linkedin'
        });
      }
      
      if (profile.formation || currentData?.formation) {
        fieldComparisons.push({
          field: 'formation',
          label: 'Formation',
          currentValue: currentData?.formation || '',
          linkedInValue: profile.formation || '',
          selected: currentData?.formation ? 'current' : 'linkedin'
        });
      }
      
      if (profile.experience || currentData?.experience) {
        fieldComparisons.push({
          field: 'experience',
          label: 'Expérience',
          currentValue: currentData?.experience || '',
          linkedInValue: profile.experience || '',
          selected: currentData?.experience ? 'current' : 'linkedin'
        });
      }
      
      if (profile.competences?.length > 0 || currentData?.competences?.length) {
        fieldComparisons.push({
          field: 'competences',
          label: 'Compétences',
          currentValue: currentData?.competences || [],
          linkedInValue: profile.competences || [],
          selected: currentData?.competences?.length ? 'current' : 'linkedin'
        });
      }
      
      if (profile.langues?.length > 0 || currentData?.langues?.length) {
        fieldComparisons.push({
          field: 'langues',
          label: 'Langues',
          currentValue: currentData?.langues || [],
          linkedInValue: profile.langues || [],
          selected: currentData?.langues?.length ? 'current' : 'linkedin'
        });
      }
      
      if (profile.location || currentData?.adresse) {
        fieldComparisons.push({
          field: 'location',
          label: 'Lieu',
          currentValue: currentData?.adresse || '',
          linkedInValue: profile.location || '',
          selected: currentData?.adresse ? 'current' : 'linkedin'
        });
      }
      
      setComparisons(fieldComparisons);
      setShowComparison(true);
    } catch (error) {
      console.error('Error extracting LinkedIn profile:', error);
      toast({
        title: "Erreur d'extraction",
        description: error instanceof Error ? error.message : "Impossible d'extraire le profil LinkedIn",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFieldSelection = (index: number) => {
    setComparisons(prev => prev.map((comp, i) => 
      i === index 
        ? { ...comp, selected: comp.selected === 'current' ? 'linkedin' : 'current' }
        : comp
    ));
  };

  const applySelectedFields = () => {
    if (!extractedProfile || !onProfileExtracted) return;

    const selectedData: Partial<LinkedInProfile> = {};
    
    comparisons.forEach(comp => {
      if (comp.selected === 'linkedin') {
        selectedData[comp.field] = comp.linkedInValue as any;
      }
    });

    onProfileExtracted(selectedData);
    setShowComparison(false);
    setComparisons([]);
    setExtractedProfile(null);
    setLinkedinUrl('');
    
    toast({
      title: "Données appliquées",
      description: "Les champs sélectionnés ont été mis à jour",
    });
  };

  const cancelComparison = () => {
    setShowComparison(false);
    setComparisons([]);
    setExtractedProfile(null);
  };

  const renderValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic text-sm">Aucune valeur</span>
      );
    }
    return value ? (
      <p className="text-sm whitespace-pre-line">{value}</p>
    ) : (
      <span className="text-muted-foreground italic text-sm">Aucune valeur</span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Importer depuis LinkedIn
        </CardTitle>
        <CardDescription>
          Entrez l'URL d'un profil LinkedIn public pour extraire automatiquement les informations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            onClick={handleExtract} 
            disabled={isLoading || !linkedinUrl.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extraction...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Extraire
              </>
            )}
          </Button>
        </div>

        {showComparison && comparisons.length > 0 && (
          <div className="space-y-4 pt-4">
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Choisissez les valeurs à conserver</h3>
                <div className="text-sm text-muted-foreground">
                  Cliquez sur une carte pour basculer entre les valeurs
                </div>
              </div>
              
              {comparisons.map((comp, index) => (
                <div key={comp.field} className="space-y-2">
                  <Label className="text-base font-medium">{comp.label}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Valeur actuelle */}
                    <div
                      onClick={() => toggleFieldSelection(index)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        comp.selected === 'current'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Valeur actuelle</span>
                        {comp.selected === 'current' && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {renderValue(comp.currentValue)}
                    </div>
                    
                    {/* Valeur LinkedIn */}
                    <div
                      onClick={() => toggleFieldSelection(index)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        comp.selected === 'linkedin'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Valeur LinkedIn</span>
                        {comp.selected === 'linkedin' && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {renderValue(comp.linkedInValue)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Seules les valeurs avec une coche verte seront appliquées au formulaire. 
                  Les champs non cochés conserveront leur valeur actuelle.
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelComparison}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={applySelectedFields}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Appliquer les modifications
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
