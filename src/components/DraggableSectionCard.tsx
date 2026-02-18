import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Section, Person, VacantPosition } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { GripVertical } from 'lucide-react';

interface DraggableSectionCardProps {
  section: Section;
  onToggle: (sectionId: string) => void;
  onPersonClick: (person: Person) => void;
  isAdmin: boolean;
  onEditPerson?: (person: Person) => void;
  onEditVacantPosition?: (position: VacantPosition) => void;
  level?: number;
  allSections?: Section[];
  onUpdate?: () => void;
  isDragging?: boolean;
  isOver?: boolean;
  isPersonDragOver?: boolean;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export const DraggableSectionCard: React.FC<DraggableSectionCardProps> = ({
  section,
  onToggle,
  onPersonClick,
  isAdmin,
  onEditPerson,
  onEditVacantPosition,
  level = 0,
  allSections = [],
  onUpdate,
  isDragging = false,
  isOver = false,
  isPersonDragOver = false,
  onEditSection,
  onDeleteSection,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: section.id,
    disabled: !isAdmin,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: section.id,
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDragging ? 'z-50' : ''}`}
    >
      {isAdmin && (
        <div
          {...listeners}
          {...attributes}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-8 cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-md transition-colors z-10"
          title="Glisser pour réorganiser"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      
      <SectionCard
        section={section}
        onToggle={onToggle}
        onPersonClick={onPersonClick}
        isAdmin={isAdmin}
        onEditPerson={onEditPerson}
        onEditVacantPosition={onEditVacantPosition}
        level={level}
        allSections={allSections}
        onUpdate={onUpdate}
        isPersonDragOver={isPersonDragOver}
        showSubsections={false}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
      />
      
      {section.subsections && section.isExpanded && (
        <div className="ml-6 space-y-2">
          {section.subsections.map((subsection) => (
            <DraggableSectionCard
              key={subsection.id}
              section={subsection}
              onToggle={onToggle}
              onPersonClick={onPersonClick}
              isAdmin={isAdmin}
              onEditPerson={onEditPerson}
              onEditVacantPosition={onEditVacantPosition}
              level={level + 1}
              allSections={allSections}
              onUpdate={onUpdate}
              isDragging={isDragging}
              isOver={isOver}
              isPersonDragOver={isPersonDragOver}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
            />
          ))}
        </div>
      )}
    </div>
  );
};
