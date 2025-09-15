import React from 'react';
import { Section, Person, VacantPosition } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { VacantPositionCard } from './VacantPositionCard';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

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

  const hasContent = section.members.length > 0 || (section.subsections && section.subsections.length > 0) || (section.vacantPositions && section.vacantPositions.length > 0);
  const isMainSection = level === 0;
  const marginLeft = level * 20;

  // Pour les sections principales, affichage plus épuré
  if (isMainSection) {
    return (
      <div className="mb-6">
        <div 
          className={`section-header ${section.type} ${hasContent ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={hasContent ? handleToggle : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(section.subsections && section.subsections.length > 0) ? (
                section.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
              <div>
                <h3 className="font-semibold text-lg">{section.title}</h3>
                {section.leader && (
                  <p className="text-sm text-muted-foreground">
                    Responsable : {section.leader.firstName} {section.leader.lastName}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {section.members.length} membre{section.members.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {section.isExpanded && hasContent && (
          <div className="mt-4 space-y-4">
            {/* Affichage compact des membres principaux */}
            {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0)) && (
              <div className="flex flex-wrap gap-2 items-stretch">
                {section.members.map(person => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onClick={onPersonClick}
                    isAdmin={isAdmin}
                    onEdit={onEditPerson}
                    compact={true}
                    isBureau={section.type === 'bureau'}
                  />
                ))}
                {section.vacantPositions?.map(position => (
                  <VacantPositionCard
                    key={position.id}
                    position={position}
                    isAdmin={isAdmin}
                    compact={true}
                    onClick={!isAdmin ? (pos) => {
                      // Trigger vacant positions sidebar
                      const event = new CustomEvent('openVacantPositions', { detail: position });
                      window.dispatchEvent(event);
                    } : undefined}
                  />
                ))}
              </div>
            )}

            {/* Sous-sections */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="space-y-3 ml-4">
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
  }

  // Pour les sous-sections, affichage encore plus minimaliste
  return (
    <div className="mb-3" style={{ marginLeft: `${marginLeft}px` }}>
      <div 
        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {section.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h4 className="font-medium text-sm">{section.title}</h4>
          {section.leader && (
            <span className="text-xs text-muted-foreground">
              • {section.leader.firstName} {section.leader.lastName}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {section.members.length}
        </span>
      </div>

      {section.isExpanded && hasContent && (
        <div className="mt-2 ml-6 space-y-2">
          {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0)) && (
            <div className="flex flex-wrap gap-1 items-stretch">
              {section.members.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={onPersonClick}
                  isAdmin={isAdmin}
                  onEdit={onEditPerson}
                  compact={true}
                />
              ))}
              {section.vacantPositions?.map(position => (
                <VacantPositionCard
                  key={position.id}
                  position={position}
                  isAdmin={isAdmin}
                  compact={true}
                  onClick={!isAdmin ? (pos) => {
                    // Trigger vacant positions sidebar
                    const event = new CustomEvent('openVacantPositions', { detail: position });
                    window.dispatchEvent(event);
                  } : undefined}
                />
              ))}
            </div>
          )}

          {section.subsections && section.subsections.length > 0 && (
            <div className="space-y-2">
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