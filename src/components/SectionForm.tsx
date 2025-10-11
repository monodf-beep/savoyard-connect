import React, { useState } from 'react';
import { Section } from '../types/organigramme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Trash2 } from 'lucide-react';
import { sectionSchema } from '../lib/validations';
import { toast } from 'sonner';

interface SectionFormProps {
  section?: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Omit<Section, 'members' | 'subsections'>) => void;
  onDelete?: (sectionId: string) => void;
}

export const SectionForm: React.FC<SectionFormProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    id: section?.id || '',
    title: section?.title || '',
    type: section?.type || 'commission' as Section['type'],
    isExpanded: section?.isExpanded ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      sectionSchema.parse({
        title: formData.title,
        type: formData.type
      });
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || 'Erreur de validation');
      return;
    }

    const sectionData = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/\s+/g, '-')
    };

    onSave(sectionData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {section ? 'Modifier la section' : 'Ajouter une section'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: Section['type']) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bureau">Bureau</SelectItem>
                <SelectItem value="conseil">Conseil</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="groupe">Groupe de travail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {section && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
                      onDelete(section.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {section ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};