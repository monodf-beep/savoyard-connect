import { useState } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Section } from '@/types/organigramme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { findSectionById } from '@/utils/sectionUtils';

interface UseSectionDragDropProps {
  sections: Section[];
  onReorganize: () => void;
}

export const useSectionDragDrop = ({ sections, onReorganize }: UseSectionDragDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedSectionId = active.id as string;
    const targetSectionId = over.id as string;

    // Trouver la section déplacée et la cible
    const draggedSection = findSectionById(sections, draggedSectionId);
    const targetSection = findSectionById(sections, targetSectionId);

    if (!draggedSection || !targetSection) return;

    // Empêcher de déplacer une section dans ses propres enfants
    if (isDescendant(draggedSection, targetSection, sections)) {
      toast.error("Impossible de déplacer une section dans ses sous-sections");
      return;
    }

    try {
      // Déterminer le nouveau parent:
      // Si on drop sur une section de même niveau (sibling du parent actuel),
      // utiliser le parent de la cible pour mettre au même niveau
      // Sinon, la cible devient le nouveau parent (sous-section)
      
      const draggedParentId = draggedSection.parentId || null;
      const targetParentId = targetSection.parentId || null;
      
      let newParentId: string | null;
      let newDisplayOrder: number;
      
      // Si la cible a le même parent que la section déplacée, on reste au même niveau
      if (targetParentId === draggedParentId) {
        newParentId = targetParentId;
        // Calculer l'ordre d'affichage au même niveau
        const siblings = sections.filter(s => (s.parentId || null) === newParentId);
        newDisplayOrder = siblings.length;
      } else {
        // Sinon, la section devient une sous-section de la cible
        newParentId = targetSection.id;
        newDisplayOrder = (targetSection.subsections?.length || 0);
      }

      // Mettre à jour la section déplacée
      const { error } = await supabase
        .from('sections')
        .update({
          parent_id: newParentId,
          display_order: newDisplayOrder
        })
        .eq('id', draggedSectionId);

      if (error) throw error;

      toast.success('Section déplacée avec succès');
      onReorganize();
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      toast.error('Erreur lors du déplacement de la section');
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return {
    activeId,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
};

// Vérifier si targetSection est un descendant de draggedSection
const isDescendant = (
  draggedSection: Section,
  targetSection: Section,
  allSections: Section[]
): boolean => {
  if (!draggedSection.subsections) return false;
  
  for (const subsection of draggedSection.subsections) {
    if (subsection.id === targetSection.id) return true;
    if (isDescendant(subsection, targetSection, allSections)) return true;
  }
  
  return false;
};
