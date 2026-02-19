import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Project } from '@/pages/Projects';
import { Section } from '@/types/organigramme';
import { Loader2 } from 'lucide-react';

interface ProjectFormProps {
  project?: Project;
  sections: Section[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Partial<Project>) => void;
}

export const ProjectForm = ({ project, sections, open, onOpenChange, onSave }: ProjectFormProps) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    section_id: '',
    status: 'planned',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        section_id: project.section_id,
        status: project.status,
      });
    } else {
      setFormData({ title: '', description: '', section_id: '', status: 'planned' });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const buildOptions = (items: Section[], depth = 0): { id: string; label: string }[] => {
    return items.flatMap((s) => [
      { id: s.id, label: `${'\u2014 '.repeat(depth)}${s.title}` },
      ...(s.subsections ? buildOptions(s.subsections, depth + 1) : []),
    ]);
  };
  const sectionOptions = buildOptions(sections);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select
              value={formData.section_id}
              onValueChange={(value) => setFormData({ ...formData, section_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une section" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Organisation du festival d'été"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez brièvement votre projet..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'planned' | 'in_progress' | 'completed') =>
                setFormData({ ...formData, status: value })
              }
            >
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving || !formData.title?.trim() || !formData.section_id}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {project ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
