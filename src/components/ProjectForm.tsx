import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Project } from '@/pages/Projects';
import { Section } from '@/types/organigramme';
import { Plus, X } from 'lucide-react';

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
    start_date: '',
    end_date: '',
    roadmap: '',
    documents: [],
  });

  const [newDocument, setNewDocument] = useState({ name: '', url: '' });

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData({
        title: '',
        description: '',
        section_id: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        roadmap: '',
        documents: [],
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddDocument = () => {
    if (newDocument.name && newDocument.url) {
      setFormData({
        ...formData,
        documents: [...(formData.documents || []), newDocument],
      });
      setNewDocument({ name: '', url: '' });
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData({
      ...formData,
      documents: formData.documents?.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section */}
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
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'planned' | 'in_progress' | 'completed') =>
                setFormData({ ...formData, status: value })
              }
              required
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Roadmap */}
          <div className="space-y-2">
            <Label htmlFor="roadmap">Feuille de route</Label>
            <Textarea
              id="roadmap"
              value={formData.roadmap}
              onChange={(e) => setFormData({ ...formData, roadmap: e.target.value })}
              rows={4}
              placeholder="Décrivez les étapes clés du projet..."
            />
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <Label>Documents</Label>
            
            {/* Existing documents */}
            {formData.documents && formData.documents.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                    <span className="flex-1 text-sm">{doc.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new document */}
            <div className="flex gap-2">
              <Input
                placeholder="Nom du document"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
              />
              <Input
                placeholder="URL"
                value={newDocument.url}
                onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
              />
              <Button type="button" onClick={handleAddDocument} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {project ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
