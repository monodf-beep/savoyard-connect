import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface HelloAssoSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSync: (organizationSlug: string, formSlug: string) => Promise<void>;
}

export const HelloAssoSyncDialog = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSync,
}: HelloAssoSyncDialogProps) => {
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!organizationSlug.trim() || !formSlug.trim()) return;

    setIsSyncing(true);
    try {
      await onSync(organizationSlug.trim(), formSlug.trim());
      onOpenChange(false);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Synchroniser HelloAsso</DialogTitle>
          <DialogDescription>
            Connectez le projet "{projectTitle}" à un formulaire HelloAsso pour importer automatiquement les dons.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Comment trouver ces informations ?</p>
            <p className="text-muted-foreground">
              Allez sur votre tableau de bord HelloAsso. L'URL de votre formulaire ressemble à :
            </p>
            <code className="block mt-2 bg-background p-2 rounded text-xs">
              helloasso.com/<span className="text-primary font-bold">[organization-slug]</span>/formulaires/<span className="text-primary font-bold">[form-slug]</span>
            </code>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug de l'organisation</Label>
            <Input
              id="org-slug"
              placeholder="institut-langue-savoyarde"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-slug">Slug du formulaire</Label>
            <Input
              id="form-slug"
              placeholder="soutenir-notre-projet"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <a 
              href="https://www.helloasso.com/associations" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir HelloAsso
            </a>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing || !organizationSlug.trim() || !formSlug.trim()}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Synchroniser
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
