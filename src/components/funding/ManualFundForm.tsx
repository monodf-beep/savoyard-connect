import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FundingProject } from '@/hooks/useFundingProjects';

interface ManualFundFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: FundingProject[];
  onSubmit: (fund: {
    project_id?: string;
    amount: number;
    source: string;
    donor_name?: string;
    note?: string;
    is_public: boolean;
  }) => Promise<unknown>;
}

export const ManualFundForm = ({
  open,
  onOpenChange,
  projects,
  onSubmit,
}: ManualFundFormProps) => {
  const [formData, setFormData] = useState({
    project_id: '',
    amount: '',
    source: '',
    donor_name: '',
    note: '',
    is_public: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        project_id: formData.project_id || undefined,
        amount: parseFloat(formData.amount),
        source: formData.source,
        donor_name: formData.donor_name || undefined,
        note: formData.note || undefined,
        is_public: formData.is_public,
      });
      setFormData({
        project_id: '',
        amount: '',
        source: '',
        donor_name: '',
        note: '',
        is_public: true,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un fonds manuel</DialogTitle>
          <DialogDescription>
            Enregistrez un don ou une contribution reçue en dehors de HelloAsso (chèque, espèces, virement, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Projet (optionnel)</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => setFormData({ ...formData, project_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fonds général" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Fonds général (non affecté)</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Input
              id="source"
              placeholder="Chèque, Espèces, Virement..."
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor_name">Nom du donateur (optionnel)</Label>
            <Input
              id="donor_name"
              placeholder="Jean Dupont"
              value={formData.donor_name}
              onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              placeholder="Détails supplémentaires..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_public" className="cursor-pointer">
              Afficher publiquement dans le journal
            </Label>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
