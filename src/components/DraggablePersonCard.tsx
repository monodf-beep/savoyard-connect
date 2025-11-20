import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Person, Section } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { GripVertical } from 'lucide-react';

interface DraggablePersonCardProps {
  person: Person;
  sectionId: string;
  sectionTitle: string;
  allSections: Section[];
  onClick: (person: Person) => void;
  isAdmin: boolean;
  onEdit?: (person: Person) => void;
  compact?: boolean;
  isBureau?: boolean;
  onUpdate: () => void;
  isDragging?: boolean;
}

export const DraggablePersonCard: React.FC<DraggablePersonCardProps> = ({
  person,
  sectionId,
  sectionTitle,
  allSections,
  onClick,
  isAdmin,
  onEdit,
  compact = false,
  isBureau = false,
  onUpdate,
  isDragging = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `person-${person.id}-${sectionId}`,
    data: {
      person,
      sectionId,
      type: 'person'
    },
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/drag ${isDragging ? 'z-50' : ''}`}
    >
      {isAdmin && compact && (
        <div
          {...listeners}
          {...attributes}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md transition-all opacity-0 group-hover/drag:opacity-100 z-10"
          title="Glisser pour déplacer vers une autre section"
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      
      {isAdmin && !compact && (
        <div
          {...listeners}
          {...attributes}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md transition-colors z-10"
          title="Glisser pour déplacer vers une autre section"
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      
      <PersonCard
        person={person}
        onClick={onClick}
        isAdmin={isAdmin}
        onEdit={onEdit}
        compact={compact}
        isBureau={isBureau}
        sectionId={sectionId}
        sectionTitle={sectionTitle}
        allSections={allSections}
        onUpdate={onUpdate}
      />
    </div>
  );
};
