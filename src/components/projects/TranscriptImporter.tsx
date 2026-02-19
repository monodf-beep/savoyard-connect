import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FileText, Loader2, Check, Copy, Settings, Sparkles, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExtractedAction {
  title: string;
  description: string;
  responsible_person_id: string | null;
  responsible_name: string;
  section_id: string | null;
  section_name: string;
  selected?: boolean;
}

interface TranscriptImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectsCreated: () => void;
  sectionMap: Record<string, string>;
}

export const TranscriptImporter = ({
  open,
  onOpenChange,
  onProjectsCreated,
  sectionMap,
}: TranscriptImporterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState('');
  const [actions, setActions] = useState<ExtractedAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [copied, setCopied] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-transcript`;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Format non supporté', description: 'Veuillez sélectionner un fichier PDF', variant: 'destructive' });
      return;
    }
    setIsLoadingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: { pdf_base64: base64, filename: file.name },
      });
      if (error) throw error;
      if (data?.text) {
        setTranscript(data.text);
        toast({ title: 'PDF importé', description: `${file.name} — texte extrait avec succès` });
      } else {
        toast({ title: 'Aucun texte trouvé', description: 'Le PDF ne contient pas de texte extractible', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('PDF extract error:', error);
      toast({ title: 'Erreur', description: error?.message || "Impossible d'extraire le texte du PDF", variant: 'destructive' });
    } finally {
      setIsLoadingPdf(false);
      e.target.value = '';
    }
  };

  const gasScript = `// Google Apps Script — Coller dans Extensions > Apps Script
// Déclencheur : onFileCreated sur le dossier Drive des transcriptions

function onFileCreated(e) {
  var file = DriveApp.getFileById(e.source.getId());
  var text = file.getBlob().getDataAsString();
  
  UrlFetchApp.fetch("${webhookUrl}", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      transcript: text,
      filename: file.getName(),
      secret: "REMPLACEZ_PAR_VOTRE_SECRET"
    })
  });
}

// INSTRUCTIONS :
// 1. Ouvrez Google Drive > votre dossier de transcriptions
// 2. Clic droit > Plus > Google Apps Script
// 3. Collez ce code
// 4. Remplacez REMPLACEZ_PAR_VOTRE_SECRET par votre token secret
//    (le même que celui configuré dans Supabase)
// 5. Allez dans Déclencheurs (icône horloge à gauche)
// 6. Ajoutez un déclencheur :
//    - Fonction : onFileCreated
//    - Source : Drive
//    - Type d'événement : Lors de la création d'un fichier
// 7. Autorisez l'accès quand demandé
// C'est tout ! Les nouvelles transcriptions seront traitées automatiquement.`;

  const handleAnalyze = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) {
      toast({
        title: 'Texte trop court',
        description: 'Collez au moins 20 caractères de transcription',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-transcript', {
        body: { transcript: transcript.trim() },
      });

      if (error) throw error;

      if (data?.actions && data.actions.length > 0) {
        setActions(data.actions.map((a: ExtractedAction) => ({ ...a, selected: true })));
        setStep('preview');
      } else {
        toast({
          title: 'Aucune action trouvée',
          description: "L'IA n'a pas identifié d'actions concrètes dans cette transcription",
        });
      }
    } catch (error: any) {
      console.error('Analyze error:', error);
      toast({
        title: 'Erreur',
        description: error?.message || "Impossible d'analyser la transcription",
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateProjects = async () => {
    const selected = actions.filter((a) => a.selected && a.section_id);
    if (selected.length === 0) {
      toast({
        title: 'Aucun projet sélectionné',
        description: 'Sélectionnez au moins un projet avec une section identifiée',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('projects').insert(
        selected.map((a) => ({
          title: a.title,
          description: a.description,
          section_id: a.section_id!,
          status: 'planned' as const,
          approval_status: 'pending',
          created_by: user?.id,
        }))
      );

      if (error) throw error;

      toast({
        title: 'Projets créés',
        description: `${selected.length} projet(s) créé(s) en attente d'approbation`,
      });

      onProjectsCreated();
      handleClose();
    } catch (error: any) {
      console.error('Create projects error:', error);
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible de créer les projets',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTranscript('');
    setActions([]);
    setStep('input');
    onOpenChange(false);
  };

  const toggleAction = (index: number) => {
    setActions((prev) =>
      prev.map((a, i) => (i === index ? { ...a, selected: !a.selected } : a))
    );
  };

  const copyScript = () => {
    navigator.clipboard.writeText(gasScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copié !', description: 'Script copié dans le presse-papier' });
  };

  const selectedCount = actions.filter((a) => a.selected && a.section_id).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Import de transcription
          </DialogTitle>
          <DialogDescription>
            Analysez une transcription de visio pour créer automatiquement des projets
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Import manuel
            </TabsTrigger>
            <TabsTrigger value="auto" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Configuration auto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4 space-y-4">
            {step === 'input' ? (
              <>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      disabled={isLoadingPdf}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      disabled={isLoadingPdf}
                    >
                      <span>
                        {isLoadingPdf ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Extraction du PDF...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Téléverser un PDF</>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                <Textarea
                  placeholder="Collez ici le texte de la transcription de votre visio (Google Meet, Zoom, etc.)..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] text-sm"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || transcript.trim().length < 20}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyser la transcription
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {actions.length} action(s) identifiée(s). Décochez celles que vous ne souhaitez pas créer.
                  </p>
                  {actions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Checkbox
                        checked={action.selected}
                        onCheckedChange={() => toggleAction(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {action.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {action.section_id ? (
                            <Badge variant="secondary" className="text-xs">
                              {sectionMap[action.section_id] || action.section_name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              Section non identifiée
                            </Badge>
                          )}
                          {action.responsible_name && (
                            <Badge variant="outline" className="text-xs">
                              {action.responsible_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                    Retour
                  </Button>
                  <Button
                    onClick={handleCreateProjects}
                    disabled={isCreating || selectedCount === 0}
                    className="flex-1"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Créer {selectedCount} projet(s)
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="auto" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Configuration automatique (Google Drive)</h3>
              <p className="text-sm text-muted-foreground">
                Pour que les transcriptions de vos visios soient automatiquement transformées en
                projets, configurez un script Google Apps Script sur votre dossier Drive.
              </p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Étapes :</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Ouvrez le dossier Google Drive où Gemini sauvegarde les transcriptions</li>
                  <li>Clic droit → Plus → Google Apps Script</li>
                  <li>Collez le script ci-dessous</li>
                  <li>
                    Remplacez <code className="text-xs bg-muted px-1 rounded">REMPLACEZ_PAR_VOTRE_SECRET</code> par
                    le token secret que vous avez configuré
                  </li>
                  <li>Ajoutez un déclencheur "Lors de la création d'un fichier"</li>
                  <li>Autorisez l'accès</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-[250px]">
                  {gasScript}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={copyScript}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copier
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>💡 Comment ça marche :</strong> Quand un nouveau fichier apparaît dans le
                  dossier (ex: transcription Gemini après une visio), le script l'envoie
                  automatiquement à votre app. L'IA analyse le contenu et crée les projets en
                  attente d'approbation. Vous les retrouvez dans le Kanban avec le badge "En attente".
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
