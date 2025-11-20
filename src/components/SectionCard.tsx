import React from 'react';
import { Section, Person, VacantPosition } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { DraggablePersonCard } from './DraggablePersonCard';
import { VacantPositionCard } from './VacantPositionCard';
import { OpenPositionCard } from './OpenPositionCard';
import { SpontaneousApplicationForm } from './SpontaneousApplicationForm';
import { SectionReassuranceDialog } from './SectionReassuranceDialog';
import { ChevronDown, ChevronRight, Users, Star } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
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
  allSections?: Section[];
  onUpdate?: () => void;
  isPersonDragOver?: boolean;
  showSubsections?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  onToggle, 
  onPersonClick, 
  isAdmin, 
  onEditPerson,
  onEditVacantPosition,
  level = 0,
  allSections = [],
  onUpdate,
  isPersonDragOver = false,
  showSubsections = true
}) => {
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  const [showReassuranceDialog, setShowReassuranceDialog] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const { setNodeRef } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      section
    }
  });
  
  const handleToggle = () => {
    onToggle(section.id);
  };

  const handleOpenReassurance = () => {
    setShowReassuranceDialog(true);
  };

  const handleApply = () => {
    setShowReassuranceDialog(false);
    setShowApplicationForm(true);
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
        {showReassuranceDialog && (
          <SectionReassuranceDialog
            open={showReassuranceDialog}
            onOpenChange={setShowReassuranceDialog}
            sectionId={section.id}
            sectionTitle={section.title}
            onApply={handleApply}
          />
        )}
        
        {showApplicationForm && (
          <SpontaneousApplicationForm
            sectionId={section.id}
            sectionTitle={section.title}
            onClose={() => setShowApplicationForm(false)}
          />
        )}
        
        <div className="mb-6" id={`section-${section.id}`}>
          <div 
            className={`section-header ${section.type} ${hasContent ? 'cursor-pointer' : 'cursor-default'} group hover:shadow-sm`}
            onClick={hasContent ? handleToggle : undefined}
          >
            <div className="flex items-center gap-3">
              {(section.subsections && section.subsections.length > 0) ? (
                section.isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Users className="w-5 h-5 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
                    {section.leader && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-semibold flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                              <Star className="w-3 h-3 fill-current" />
                              {section.leader.firstName} {section.leader.lastName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Responsable de la section</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground ml-4 bg-muted/50 px-3 py-1 rounded-full">
                    {totalMemberCount} membre{totalMemberCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {section.isExpanded && hasContent && (
            <div 
              ref={setNodeRef}
              className={`mt-4 space-y-4 transition-colors ${isPersonDragOver ? 'ring-2 ring-primary ring-offset-2 rounded-lg p-2' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Affichage compact des membres principaux */}
              {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0)) && (
                <div className="flex flex-wrap gap-2 items-stretch pl-6 relative">
                  {section.members.map(person => (
                    <DraggablePersonCard
                      key={person.id}
                      person={person}
                      sectionId={section.id}
                      sectionTitle={section.title}
                      allSections={allSections}
                      onClick={onPersonClick}
                      isAdmin={isAdmin}
                      onEdit={onEditPerson}
                      compact={true}
                      isBureau={section.type === 'bureau'}
                      onUpdate={onUpdate || (() => {})}
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
                  {/* OpenPositionCard uniquement si pas de sous-sections */}
                  {!isAdmin && isHovered && (!section.subsections || section.subsections.length === 0) && (
                    <OpenPositionCard onClick={handleOpenReassurance} />
                  )}
                </div>
              )}

              {/* Sous-sections */}
              {showSubsections && section.subsections && section.subsections.length > 0 && (
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
      {showReassuranceDialog && (
        <SectionReassuranceDialog
          open={showReassuranceDialog}
          onOpenChange={setShowReassuranceDialog}
          sectionId={section.id}
          sectionTitle={section.title}
          onApply={handleApply}
        />
      )}
      
      {showApplicationForm && (
        <SpontaneousApplicationForm
          sectionId={section.id}
          sectionTitle={section.title}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
      
      <div className="mb-3" style={{ marginLeft: `${marginLeft}px` }} id={`section-${section.id}`}>
        <div 
          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2.5">
            {section.isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <h4 className="font-medium text-sm text-foreground">{section.title}</h4>
            {section.leader && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-semibold flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {section.leader.firstName} {section.leader.lastName}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Responsable de la section</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {totalMemberCount}
          </span>
        </div>

        {section.isExpanded && hasContent && (
          <div 
            ref={setNodeRef}
            className={`mt-2 ml-6 space-y-2 transition-colors ${isPersonDragOver ? 'ring-2 ring-primary ring-offset-2 rounded-lg p-2' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0) || !isAdmin) && (
              <div className="flex flex-wrap gap-1 items-stretch pl-6 relative">
                {section.members.map(person => (
                  <DraggablePersonCard
                    key={person.id}
                    person={person}
                    sectionId={section.id}
                    sectionTitle={section.title}
                    allSections={allSections}
                    onClick={onPersonClick}
                    isAdmin={isAdmin}
                    onEdit={onEditPerson}
                    compact={true}
                    onUpdate={onUpdate || (() => {})}
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
                {!isAdmin && isHovered && (
                  <OpenPositionCard onClick={handleOpenReassurance} />
                )}
              </div>
            )}

            {showSubsections && section.subsections && section.subsections.length > 0 && (
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
                    allSections={allSections}
                    onUpdate={onUpdate}
                    showSubsections={showSubsections}
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