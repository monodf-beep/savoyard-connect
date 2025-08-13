import React from 'react';
import { Section, Person } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { ChevronDown, ChevronRight, Users, User } from 'lucide-react';
import { Badge } from './ui/badge';

interface SectionCardProps {
  section: Section;
  onToggle: (sectionId: string) => void;
  onPersonClick: (person: Person) => void;
  isAdmin: boolean;
  onEditPerson?: (person: Person) => void;
  level?: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onToggle,
  onPersonClick,
  isAdmin,
  onEditPerson,
  level = 0
}) => {
  const handleToggle = () => {
    onToggle(section.id);
  };

  const getIconComponent = () => {
    if (section.subsections && section.subsections.length > 0) {
      return section.isExpanded ? ChevronDown : ChevronRight;
    }
    return section.members.length > 1 ? Users : User;
  };

  const Icon = getIconComponent();
  const hasContent = section.members.length > 0 || (section.subsections && section.subsections.length > 0);
  const marginLeft = level * 16;

  return (
    <div className="mb-4" style={{ marginLeft: `${marginLeft}px` }}>
      <div 
        className={`section-header ${section.type} ${hasContent ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={hasContent ? handleToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">{section.title}</h3>
              {section.leader && (
                <p className="text-sm text-muted-foreground">
                  Responsable : {section.leader.firstName} {section.leader.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {section.members.length} membre{section.members.length > 1 ? 's' : ''}
            </Badge>
            {(section.subsections && section.subsections.length > 0) && (
              <Icon className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {section.isExpanded && hasContent && (
        <div className="mt-4 space-y-4">
          {section.members.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {section.members.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={onPersonClick}
                  isAdmin={isAdmin}
                  onEdit={onEditPerson}
                />
              ))}
            </div>
          )}

          {section.subsections && section.subsections.length > 0 && (
            <div className="space-y-3">
              {section.subsections.map(subsection => (
                <SectionCard
                  key={subsection.id}
                  section={subsection}
                  onToggle={onToggle}
                  onPersonClick={onPersonClick}
                  isAdmin={isAdmin}
                  onEditPerson={onEditPerson}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};