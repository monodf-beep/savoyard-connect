import { useState } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Person } from '@/types/organigramme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePersonDragDropProps {
  onReorganize: () => void;
}

export const usePersonDragDrop = ({ onReorganize }: UsePersonDragDropProps) => {
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const person = event.active.data.current?.person as Person;
    setActivePerson(person);
  };

  const handleDragOver = (event: any) => {
    if (event.over?.data?.current?.type === 'section') {
      setOverSectionId(event.over.id as string);
    } else {
      setOverSectionId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActivePerson(null);
    setOverSectionId(null);

    if (!over || !over.data?.current?.type) return;

    const person = active.data.current?.person as Person;
    const targetSectionId = over.id as string;
    const currentSectionId = active.data.current?.sectionId as string;

    if (!person || targetSectionId === currentSectionId) return;

    try {
      // Vérifier si la personne est déjà dans cette section
      const { data: existing } = await supabase
        .from('section_members')
        .select('id')
        .eq('person_id', person.id)
        .eq('section_id', targetSectionId)
        .maybeSingle();

      if (existing) {
        toast.info('Cette personne est déjà dans cette section');
        return;
      }

      // Ajouter à la nouvelle section
      const { error } = await supabase
        .from('section_members')
        .insert({
          person_id: person.id,
          section_id: targetSectionId,
          role: person.role || null
        });

      if (error) throw error;

      toast.success(`${person.firstName} ${person.lastName} déplacé(e) vers la nouvelle section`);
      onReorganize();
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      toast.error('Erreur lors du déplacement de la personne');
    }
  };

  const handleDragCancel = () => {
    setActivePerson(null);
    setOverSectionId(null);
  };

  return {
    activePerson,
    overSectionId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
};
