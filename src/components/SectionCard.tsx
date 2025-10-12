import React from 'react';
import { Section, Person, VacantPosition } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { VacantPositionCard } from './VacantPositionCard';
import { OpenPositionCard } from './OpenPositionCard';
import { SpontaneousApplicationForm } from './SpontaneousApplicationForm';
import { ChevronDown, ChevronRight, Users, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface SectionCardProps {
  section: Section;
  onToggle: (sectionId: string) => void;
  onPersonClick: (person: Person) => void;
  isAdmin: boolean;
  onEditPerson?: (person: Person) => void;
  onEditVacantPosition?: (position: VacantPosition) => void;
  level?: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  onToggle, 
  onPersonClick, 
  isAdmin, 
  onEditPerson,
  onEditVacantPosition,
  level = 0 
}) => {
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  
  const handleToggle = () => {
    onToggle(section.id);
  };

  // Fonction pour calculer le nombre total de membres (incluant les sous-sections)
  const getTotalMemberCount = (section: Section): number => {
    let count = section.members.length;
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        count += getTotalMemberCount(subsection);
      });
    }
    return count;
  };

  const totalMemberCount = getTotalMemberCount(section);

  const hasContent = section.members.length > 0 || (section.subsections && section.subsections.length > 0) || (section.vacantPositions && section.vacantPositions.length > 0);
  const isMainSection = level === 0;
  const marginLeft = level * 20;

  // Pour les sections principales, affichage plus épuré
  if (isMainSection) {
    return (
      <>
        {showApplicationForm && (
          <SpontaneousApplicationForm
            sectionId={section.id}
            sectionTitle={section.title}
            onClose={() => setShowApplicationForm(false)}
          />
        )}
        
        <div className="mb-6" id={`section-${section.id}`}>
          <TooltipProvider>
            <div 
              className={`section-header ${section.type} ${hasContent ? 'cursor-pointer' : 'cursor-default'} group`}
              onClick={hasContent ? handleToggle : undefined}
            >
              <div className="flex items-center gap-3">
                {(section.subsections && section.subsections.length > 0) ? (
                  section.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{section.title}</h3>
                        {section.leader && (
                          <p className="text-sm text-muted-foreground">
                            Responsable : {section.leader.firstName} {section.leader.lastName}
                          </p>
                        )}
                      </div>
                      {!isAdmin && (
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                <Sparkles className="w-3 h-3" />
                                Ouvert aux candidatures
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">Postulez spontanément à cette section</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground ml-4">
                      {totalMemberCount} membre{totalMemberCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TooltipProvider>

          {section.isExpanded && hasContent && (
            <div className="mt-4 space-y-4">
              {/* Affichage compact des membres principaux */}
              {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0) || !isAdmin) && (
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
                      onEdit={onEditVacantPosition}
                      compact={true}
                      onClick={!isAdmin ? (pos) => {
                        // Trigger vacant positions sidebar
                        const event = new CustomEvent('openVacantPositions', { detail: position });
                        window.dispatchEvent(event);
                      } : undefined}
                    />
                  ))}
                  {!isAdmin && (
                    <OpenPositionCard onClick={() => setShowApplicationForm(true)} />
                  )}
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
                      onEditVacantPosition={onEditVacantPosition}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  // Pour les sous-sections, affichage encore plus minimaliste
  return (
    <>
      {showApplicationForm && (
        <SpontaneousApplicationForm
          sectionId={section.id}
          sectionTitle={section.title}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
      
      <div className="mb-3" style={{ marginLeft: `${marginLeft}px` }} id={`section-${section.id}`}>
        <TooltipProvider>
          <div 
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors cursor-pointer group"
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
              {!isAdmin && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Postulez spontanément</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {totalMemberCount}
            </span>
          </div>
        </TooltipProvider>

        {section.isExpanded && hasContent && (
          <div className="mt-2 ml-6 space-y-2">
            {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0) || !isAdmin) && (
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
                    onEdit={onEditVacantPosition}
                    compact={true}
                    onClick={!isAdmin ? (pos) => {
                      // Trigger vacant positions sidebar
                      const event = new CustomEvent('openVacantPositions', { detail: position });
                      window.dispatchEvent(event);
                    } : undefined}
                  />
                ))}
                {!isAdmin && (
                  <OpenPositionCard onClick={() => setShowApplicationForm(true)} />
                )}
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
                    onEditVacantPosition={onEditVacantPosition}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};