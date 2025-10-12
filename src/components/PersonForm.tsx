import React, { useState, useEffect } from 'react';
import { Person } from '../types/organigramme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Plus, Trash2, ImageIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { ImageEditor } from './ImageEditor';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { personSchema } from '../lib/validations';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

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
    missionDescription: person?.missionDescription || '',
    linkedin: person?.linkedin || '',
    instagram: person?.instagram || '',
    missions: person?.missions || [],
    photo: person?.photo || '',
    sectionId: person?.sectionId || '',
    email: person?.email || '',
    phone: person?.phone || '',
    formation: person?.formation || '',
    experience: person?.experience || '',
    competences: person?.competences || [],
    dateEntree: person?.dateEntree || '',
    adresse: person?.adresse || '',
    specialite: person?.specialite || '',
    langues: person?.langues || [],
    hobbies: person?.hobbies || ''
  });

  const [newMission, setNewMission] = useState('');
  const [newCompetence, setNewCompetence] = useState('');
  const [newLangue, setNewLangue] = useState('');
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const { data } = useOrganigramme();
  const { isAdmin } = useAuth();

  // Mettre à jour le formulaire quand les données de la personne changent
  useEffect(() => {
    if (person) {
      setFormData({
        id: person.id || '',
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        role: person.role || '',
        description: person.description || '',
        missionDescription: person.missionDescription || '',
        linkedin: person.linkedin || '',
        instagram: person.instagram || '',
        missions: person.missions || [],
        photo: person.photo || '',
        sectionId: person.sectionId || '',
        email: person.email || '',
        phone: person.phone || '',
        formation: person.formation || '',
        experience: person.experience || '',
        competences: person.competences || [],
        dateEntree: person.dateEntree || '',
        adresse: person.adresse || '',
        specialite: person.specialite || '',
        langues: person.langues || [],
        hobbies: person.hobbies || ''
      });
    } else {
      // Réinitialiser le formulaire pour une nouvelle personne
      setFormData({
        id: '',
        firstName: '',
        lastName: '',
        role: '',
        description: '',
        missionDescription: '',
        linkedin: '',
        instagram: '',
        missions: [],
        photo: '',
        sectionId: '',
        email: '',
        phone: '',
        formation: '',
        experience: '',
        competences: [],
        dateEntree: '',
        adresse: '',
        specialite: '',
        langues: [],
        hobbies: ''
      });
    }
  }, [person]);

  // Fonction pour récupérer toutes les sections (y compris sous-sections)
  const getAllSections = () => {
    const sections: { id: string; title: string; level: number }[] = [];
    
    const addSectionsRecursively = (sectionList: any[], level = 0) => {
      sectionList.forEach(section => {
        sections.push({
          id: section.id,
          title: section.title,
          level
        });
        if (section.subsections) {
          addSectionsRecursively(section.subsections, level + 1);
        }
      });
    };
    
    addSectionsRecursively(data.sections);
    return sections;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      personSchema.parse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        description: formData.description,
        linkedin: formData.linkedin,
        adresse: formData.adresse,
        photo: formData.photo
      });
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || 'Erreur de validation');
      return;
    }

    const personData: Person = {
      id: formData.id || crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName || '',
      role: formData.role,
      description: formData.description,
      photo: formData.photo,
      sectionId: formData.sectionId,
      adresse: formData.adresse,
      competences: formData.competences || [],
      dateEntree: formData.dateEntree,
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedin
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

  const addCompetence = () => {
    if (newCompetence.trim()) {
      setFormData(prev => ({
        ...prev,
        competences: [...(prev.competences || []), newCompetence.trim()]
      }));
      setNewCompetence('');
    }
  };

  const removeCompetence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences?.filter((_, i) => i !== index) || []
    }));
  };

  const sendInvite = async () => {
    const email = (formData.email || '').trim();
    const emailSchema = z.string().email();
    if (!emailSchema.safeParse(email).success) {
      toast.error('Email invalide');
      return;
    }
    try {
      const { error } = await supabase.functions.invoke('send-invite', {
        body: { email, baseUrl: window.location.origin },
      });
      if (error) throw error;
      toast.success("Invitation envoyée");
    } catch (e) {
      console.error(e);
      toast.error("Échec de l'envoi de l'invitation");
    }
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
            <Label htmlFor="section">Section</Label>
            <Select 
              value={formData.sectionId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une section..." />
              </SelectTrigger>
              <SelectContent>
                {getAllSections().map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {"  ".repeat(section.level)}{section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 3. À propos / Mission */}
          <div>
            <Label htmlFor="description">À propos / Mission au sein de l'institut</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Décrivez le rôle et la mission de cette personne au sein de l'institut..."
            />
          </div>

          {/* 1. Lieu */}
          <div>
            <Label htmlFor="adresse">Lieu</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
              placeholder="Ville, département..."
            />
          </div>
 
           {/* Contact */}
           <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="mt-2">
              <Button type="button" variant="outline" onClick={sendInvite} disabled={!formData.email}>
                Envoyer une invitation à compléter son profil
              </Button>
            </div>
          )}
 
           <div>
             <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/nom-prenom ou nom-prenom"
            />
          </div>

          {/* 4. Compétences */}
          <div>
            <Label>Compétences</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newCompetence}
                  onChange={(e) => setNewCompetence(e.target.value)}
                  placeholder="Ajouter une compétence..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
                />
                <Button type="button" onClick={addCompetence} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.competences?.map((competence, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {competence}
                    <button
                      type="button"
                      onClick={() => removeCompetence(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Membre depuis */}
          <div>
            <Label htmlFor="dateEntree">Membre depuis</Label>
            <Input
              id="dateEntree"
              type="date"
              value={formData.dateEntree}
              onChange={(e) => setFormData(prev => ({ ...prev, dateEntree: e.target.value }))}
            />
          </div>

          {/* Photo (optionnel) */}
          <div>
            <Label htmlFor="photo">Photo (optionnel)</Label>
            <div className="space-y-2">
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                placeholder="URL de l'image ou utilisez l'éditeur..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImageEditorOpen(true)}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Ouvrir l'éditeur d'image
              </Button>
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Aperçu"
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
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
                {person ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ImageEditor
        isOpen={isImageEditorOpen}
        onClose={() => setIsImageEditorOpen(false)}
        onSave={(imageUrl) => {
          setFormData(prev => ({ ...prev, photo: imageUrl }));
          setIsImageEditorOpen(false);
        }}
        initialImageUrl={formData.photo}
      />
    </div>
  );
};