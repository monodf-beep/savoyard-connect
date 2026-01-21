import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SimpleProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    description: string;
    section_id: string;
    status: 'planned' | 'in_progress' | 'completed';
  }) => Promise<void>;
  sections: Array<{ id: string; title: string }>;
  defaultSectionId?: string;
}

export const SimpleProjectForm: React.FC<SimpleProjectFormProps> = ({
  open,
  onOpenChange,
  onSave,
  sections,
  defaultSectionId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sectionId, setSectionId] = useState(defaultSectionId || '');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed'>('planned');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sectionId) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        section_id: sectionId,
        status,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('planned');
      if (!defaultSectionId) setSectionId('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Ajoutez rapidement un projet pour votre commission
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section - only show if no default */}
          {!defaultSectionId && (
            <div className="space-y-2">
              <Label htmlFor="section">Commission / Section *</Label>
              <Select value={sectionId} onValueChange={setSectionId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Organisation du festival d'été"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre projet..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planifié</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !sectionId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
