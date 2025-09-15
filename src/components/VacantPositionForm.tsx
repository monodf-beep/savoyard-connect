import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, UserPlus, ExternalLink } from 'lucide-react';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { Section } from '../types/organigramme';

interface VacantPosition {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  externalLink?: string;
}

interface VacantPositionFormProps {
  position?: VacantPosition | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: Omit<VacantPosition, 'id'>) => Promise<void>;
  onDelete?: (positionId: string) => Promise<void>;
}

export const VacantPositionForm: React.FC<VacantPositionFormProps> = ({
  position,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { data } = useOrganigramme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    externalLink: ''
  });

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title || '',
        description: position.description || '',
        sectionId: position.sectionId || '',
        externalLink: position.externalLink || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sectionId: '',
        externalLink: ''
      });
    }
  }, [position, isOpen]);

  // Fonction récursive pour récupérer toutes les sections
  const getAllSections = (sections: Section[]): Section[] => {
    let allSections: Section[] = [];
    
    sections.forEach(section => {
      allSections.push(section);
      if (section.subsections) {
        allSections = allSections.concat(getAllSections(section.subsections));
      }
    });
    
    return allSections;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.sectionId) {
      return;
    }

    try {
      await onSave({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        sectionId: formData.sectionId,
        externalLink: formData.externalLink.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async () => {
    if (position && onDelete) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce poste vacant ?')) {
        try {
          await onDelete(position.id);
          onClose();
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
        }
      }
    }
  };

  if (!isOpen) return null;

  const allSections = getAllSections(data.sections);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">
                {position ? 'Modifier le poste vacant' : 'Nouveau poste vacant'}
              </h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                Titre du poste *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Responsable communication"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="section" className="text-sm font-semibold">
                Section *
              </Label>
              <Select value={formData.sectionId} onValueChange={(value) => setFormData({ ...formData, sectionId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisir une section" />
                </SelectTrigger>
                <SelectContent>
                  {allSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du poste et des missions..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="externalLink" className="text-sm font-semibold flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Lien externe
              </Label>
              <Input
                id="externalLink"
                type="url"
                value={formData.externalLink}
                onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                placeholder="https://www.jeveuxaider.gouv.fr/missions-benevolat/..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lien vers une plateforme de bénévolat (jeveuxaider.gouv.fr, etc.)
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {position && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.title.trim() || !formData.sectionId}
                >
                  {position ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};