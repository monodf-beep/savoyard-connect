import React, { useState } from 'react';
import { Person, Section } from '@/types/organigramme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { MoreVertical, Trash2, Edit, UserPlus, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface PersonQuickActionsProps {
  person: Person;
  currentSectionId: string;
  currentSectionTitle: string;
  allSections: Section[];
  onEdit: () => void;
  onUpdate: () => void;
}

export const PersonQuickActions: React.FC<PersonQuickActionsProps> = ({
  person,
  currentSectionId,
  currentSectionTitle,
  allSections,
  onEdit,
  onUpdate
}) => {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState(person.role || '');
  const [isAddSectionsDialogOpen, setIsAddSectionsDialogOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const handleRemoveFromSection = async () => {
    try {
      const { error } = await supabase
        .from('section_members')
        .delete()
        .eq('person_id', person.id)
        .eq('section_id', currentSectionId);

      if (error) throw error;

      toast.success(`${person.firstName} retiré(e) de ${currentSectionTitle}`);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du retrait de la section');
    }
  };

  const handleUpdateRole = async () => {
    try {
      const { error } = await supabase
        .from('section_members')
        .update({ role: newRole || null })
        .eq('person_id', person.id)
        .eq('section_id', currentSectionId);

      if (error) throw error;

      toast.success('Rôle mis à jour');
      setIsRoleDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleAddToSections = async () => {
    try {
      const inserts = selectedSections.map(sectionId => ({
        person_id: person.id,
        section_id: sectionId,
        role: person.role || null
      }));

      const { error } = await supabase
        .from('section_members')
        .insert(inserts);

      if (error) throw error;

      toast.success(`${person.firstName} ajouté(e) à ${selectedSections.length} section(s)`);
      setIsAddSectionsDialogOpen(false);
      setSelectedSections([]);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout aux sections');
    }
  };

  const handleMoveToSection = async (targetSectionId: string) => {
    try {
      // Retirer de la section actuelle
      await supabase
        .from('section_members')
        .delete()
        .eq('person_id', person.id)
        .eq('section_id', currentSectionId);

      // Ajouter à la nouvelle section
      const { error } = await supabase
        .from('section_members')
        .insert({
          person_id: person.id,
          section_id: targetSectionId,
          role: person.role || null
        });

      if (error) throw error;

      toast.success('Personne déplacée avec succès');
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const handleSetAsLeader = async () => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ leader_id: person.id })
        .eq('id', currentSectionId);

      if (error) throw error;

      toast.success(`${person.firstName} défini(e) comme responsable de ${currentSectionTitle}`);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la définition du responsable');
    }
  };

  const getAvailableSections = () => {
    const flattenSections = (sections: Section[]): Section[] => {
      return sections.flatMap(s => [s, ...flattenSections(s.subsections || [])]);
    };
    
    const all = flattenSections(allSections);
    // Exclure la section actuelle
    return all.filter(s => s.id !== currentSectionId);
  };

  const availableSections = getAvailableSections();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
            title="Actions rapides"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card z-50">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Éditer le profil complet
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier le rôle
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsAddSectionsDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter à d'autres sections
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowRight className="w-4 h-4 mr-2" />
              Déplacer vers...
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-60 overflow-y-auto bg-card">
              {availableSections.map((section) => (
                <DropdownMenuItem
                  key={section.id}
                  onClick={() => handleMoveToSection(section.id)}
                >
                  {section.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {person.linkedin && (
            <DropdownMenuItem
              onClick={() => window.open(person.linkedin, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir LinkedIn
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleSetAsLeader}>
            <Star className="w-4 h-4 mr-2" />
            Définir comme responsable
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleRemoveFromSection}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Retirer de cette section
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog pour modifier le rôle */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role">Rôle dans {currentSectionTitle}</Label>
              <Input
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Ex: Coordinateur, Membre..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateRole}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter à d'autres sections */}
      <Dialog open={isAddSectionsDialogOpen} onOpenChange={setIsAddSectionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter à d'autres sections</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-60 overflow-y-auto">
            {availableSections.map((section) => (
              <div key={section.id} className="flex items-center space-x-2">
                <Checkbox
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSections([...selectedSections, section.id]);
                    } else {
                      setSelectedSections(selectedSections.filter(id => id !== section.id));
                    }
                  }}
                />
                <label
                  htmlFor={section.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {section.title}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSectionsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddToSections} disabled={selectedSections.length === 0}>
              Ajouter ({selectedSections.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
