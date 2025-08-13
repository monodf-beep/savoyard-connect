import React, { useState } from 'react';
import { Person } from '../types/organigramme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Plus, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface PersonFormProps {
  person?: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  onDelete?: (personId: string) => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  person,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Person>>({
    id: person?.id || '',
    firstName: person?.firstName || '',
    lastName: person?.lastName || '',
    role: person?.role || '',
    description: person?.description || '',
    linkedin: person?.linkedin || '',
    instagram: person?.instagram || '',
    missions: person?.missions || [],
    photo: person?.photo || ''
  });

  const [newMission, setNewMission] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName) return;

    const personData: Person = {
      id: formData.id || formData.firstName.toLowerCase().replace(/\s+/g, '-'),
      firstName: formData.firstName,
      lastName: formData.lastName || '',
      role: formData.role,
      description: formData.description,
      linkedin: formData.linkedin,
      instagram: formData.instagram,
      missions: formData.missions || [],
      photo: formData.photo
    };

    onSave(personData);
    onClose();
  };

  const addMission = () => {
    if (newMission.trim()) {
      setFormData(prev => ({
        ...prev,
        missions: [...(prev.missions || []), newMission.trim()]
      }));
      setNewMission('');
    }
  };

  const removeMission = (index: number) => {
    setFormData(prev => ({
      ...prev,
      missions: prev.missions?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {person ? 'Modifier la personne' : 'Ajouter une personne'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Rôle/Fonction</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="photo">URL Photo</Label>
            <Input
              id="photo"
              value={formData.photo}
              onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <Label htmlFor="instagram">Code embed Instagram</Label>
            <Textarea
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              rows={3}
              placeholder="<blockquote class='instagram-media'..."
            />
          </div>

          <div>
            <Label>Missions & Responsabilités</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="Ajouter une mission..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMission())}
                />
                <Button type="button" onClick={addMission} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.missions?.map((mission, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {mission}
                    <button
                      type="button"
                      onClick={() => removeMission(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {person && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
                      onDelete(person.id);
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
                {person ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};