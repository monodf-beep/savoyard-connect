import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  onProfileExtracted?: (profile: LinkedInProfile) => void;
}

export const LinkedInImporter = ({ onProfileExtracted }: LinkedInImporterProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<LinkedInProfile | null>(null);
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

      if (onProfileExtracted) {
        onProfileExtracted(profile);
      }
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

        {extractedProfile && (
          <div className="space-y-4 pt-4">
            <Separator />
            
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {extractedProfile.firstName} {extractedProfile.lastName}
                  </h3>
                  {extractedProfile.title && (
                    <p className="text-muted-foreground">{extractedProfile.title}</p>
                  )}
                  {extractedProfile.location && (
                    <p className="text-sm text-muted-foreground">{extractedProfile.location}</p>
                  )}
                </div>

                {extractedProfile.bio && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Bio</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {extractedProfile.bio}
                    </p>
                  </div>
                )}

                {extractedProfile.competences.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Compétences</h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedProfile.competences.slice(0, 10).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {extractedProfile.competences.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{extractedProfile.competences.length - 10} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {extractedProfile.langues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Langues</h4>
                    <div className="flex flex-wrap gap-1">
                      {extractedProfile.langues.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {extractedProfile.experience && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Expérience</h4>
                    <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
                      {extractedProfile.experience}
                    </p>
                  </div>
                )}

                {extractedProfile.formation && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Formation</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {extractedProfile.formation}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Les données extraites sont basées sur le profil public LinkedIn. 
                    Vérifiez et complétez les informations avant de les sauvegarder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
