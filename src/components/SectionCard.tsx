import React from 'react';
import { Section, Person, VacantPosition } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { DraggablePersonCard } from './DraggablePersonCard';
import { VacantPositionCard } from './VacantPositionCard';
import { OpenPositionCard } from './OpenPositionCard';
import { SpontaneousApplicationForm } from './SpontaneousApplicationForm';
import { SectionReassuranceDialog } from './SectionReassuranceDialog';
import { ChevronDown, ChevronRight, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDroppable } from '@dnd-kit/core';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  onToggle, 
  onPersonClick, 
  isAdmin, 
  onEditPerson,
  onEditVacantPosition,
  level = 0,
  onEditSection,
  onDeleteSection,
  allSections = [],
  onUpdate,
  isPersonDragOver = false,
  showSubsections = true
}) => {
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  const [showReassuranceDialog, setShowReassuranceDialog] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isMobile = useIsMobile();
  
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

  // Collecter récursivement tous les membres (y compris sous-sections) avec déduplication
  const getAllMembers = (s: Section): Person[] => {
    let all = [...s.members];
    if (s.leader) all.push(s.leader);
    if (s.subsections) {
      s.subsections.forEach(sub => {
        all = all.concat(getAllMembers(sub));
      });
    }
    return all;
  };
  const allMembers = React.useMemo(() => 
    [...new Map(getAllMembers(section).map(m => [m.id, m])).values()],
    [section]
  );

  const hasContent = section.members.length > 0 || (section.subsections && section.subsections.length > 0) || (section.vacantPositions && section.vacantPositions.length > 0);
  const isMainSection = level === 0;
  const marginLeft = isMobile ? level * 8 : level * 20;

  const handleMoveToSection = async (newParentId: string | null) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ parent_id: newParentId })
        .eq('id', section.id);

      if (error) throw error;
      
      onUpdate?.();
    } catch (error) {
      console.error('Error moving section:', error);
    }
  };

  // Obtenir les sections racines (N0)
  const rootSections = allSections.filter(s => !s.parentId && s.id !== section.id);
  
  // Obtenir les sections N-1 (qui ont un parent N0)
  const n1Sections = allSections.filter(s => {
    if (!s.parentId || s.id === section.id) return false;
    const parent = allSections.find(p => p.id === s.parentId);
    return parent && !parent.parentId;
  });

  const getCurrentLevel = () => {
    if (!section.parentId) return 'N0 (Racine)';
    const parent = allSections.find(s => s.id === section.parentId);
    if (parent && !parent.parentId) return 'N-1';
    return 'N-2';
  };

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
        
        <div className="mb-4" id={`section-${section.id}`}>
          <div 
            className={`section-header ${section.type} ${hasContent ? 'cursor-pointer' : 'cursor-default'} group hover:shadow-sm`}
            onClick={hasContent ? handleToggle : undefined}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {(section.subsections && section.subsections.length > 0) ? (
                section.isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <h3 className="font-semibold text-base text-foreground truncate">{section.title}</h3>
              {section.leader && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                        Resp. {section.leader.firstName} {section.leader.lastName}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Responsable de la section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!section.isExpanded && allMembers.length > 0 && (
                <div className="flex items-center ml-2 flex-shrink-0">
                  {allMembers.slice(0, 8).map((person, index) => (
                    <Avatar 
                      key={person.id} 
                      className="w-6 h-6 border-2 border-background"
                      style={{ marginLeft: index === 0 ? 0 : -8 }}
                    >
                      <AvatarImage src={person.photo} />
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {person.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {allMembers.length > 8 && (
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground border-2 border-background"
                          style={{ marginLeft: -8 }}>
                      +{allMembers.length - 8}
                    </span>
                  )}
                </div>
              )}
              <span className="text-xs font-medium text-primary ml-auto flex-shrink-0">
                {totalMemberCount} membre{totalMemberCount > 1 ? 's' : ''}
              </span>
            </div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {onEditSection && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditSection(section); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier la section
                    </DropdownMenuItem>
                  )}
                  {onDeleteSection && (
                    <DropdownMenuItem 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
                          onDeleteSection(section.id);
                        }
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer la section
                    </DropdownMenuItem>
                  )}
                  {(onEditSection || onDeleteSection) && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Niveau actuel : {getCurrentLevel()}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {!section.parentId ? (
                    <DropdownMenuItem disabled>
                      Déjà au niveau racine (N0)
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToSection(null); }}>
                      → Déplacer vers Racine (N0)
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold">Déplacer sous :</DropdownMenuLabel>
                  
                  {rootSections.length > 0 ? (
                    rootSections.map(rootSection => (
                      <DropdownMenuItem 
                        key={rootSection.id}
                        onClick={(e) => { e.stopPropagation(); handleMoveToSection(rootSection.id); }}
                        disabled={section.parentId === rootSection.id}
                      >
                        {section.parentId === rootSection.id ? '✓ ' : '→ '}{rootSection.title} (N-1)
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Aucune section racine disponible
                    </DropdownMenuItem>
                  )}
                  
                  {n1Sections.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {n1Sections.map(n1Section => (
                        <DropdownMenuItem 
                          key={n1Section.id}
                          onClick={(e) => { e.stopPropagation(); handleMoveToSection(n1Section.id); }}
                          disabled={section.parentId === n1Section.id}
                        >
                          {section.parentId === n1Section.id ? '✓ ' : '→ '}{n1Section.title} (N-2)
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                <div className="flex flex-wrap gap-2 items-stretch pl-2 md:pl-6 relative">
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
                <div className="space-y-3 ml-1 md:ml-4">
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
          <div className="flex items-center gap-2.5 flex-1">
            {section.isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <h4 className="font-medium text-sm text-foreground">{section.title}</h4>
            {section.leader && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Resp. {section.leader.firstName} {section.leader.lastName}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Responsable de la section</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!section.isExpanded && allMembers.length > 0 && (
              <div className="flex items-center flex-shrink-0">
                {allMembers.slice(0, 8).map((person, index) => (
                  <Avatar 
                    key={person.id} 
                    className="w-5 h-5 border-2 border-background"
                    style={{ marginLeft: index === 0 ? 0 : -6 }}
                  >
                    <AvatarImage src={person.photo} />
                    <AvatarFallback className="text-[7px] bg-primary/10 text-primary">
                      {person.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {allMembers.length > 8 && (
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium text-muted-foreground border-2 border-background"
                        style={{ marginLeft: -6 }}>
                    +{allMembers.length - 8}
                  </span>
                )}
              </div>
            )}
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              {totalMemberCount}
            </span>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {onEditSection && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditSection(section); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier la section
                    </DropdownMenuItem>
                  )}
                  {onDeleteSection && (
                    <DropdownMenuItem 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
                          onDeleteSection(section.id);
                        }
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer la section
                    </DropdownMenuItem>
                  )}
                  {(onEditSection || onDeleteSection) && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Niveau actuel : {getCurrentLevel()}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {!section.parentId ? (
                    <DropdownMenuItem disabled>
                      Déjà au niveau racine (N0)
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToSection(null); }}>
                      → Déplacer vers Racine (N0)
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold">Déplacer sous :</DropdownMenuLabel>
                  
                  {rootSections.length > 0 ? (
                    rootSections.map(rootSection => (
                      <DropdownMenuItem 
                        key={rootSection.id}
                        onClick={(e) => { e.stopPropagation(); handleMoveToSection(rootSection.id); }}
                        disabled={section.parentId === rootSection.id}
                      >
                        {section.parentId === rootSection.id ? '✓ ' : '→ '}{rootSection.title} (N-1)
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Aucune section racine disponible
                    </DropdownMenuItem>
                  )}
                  
                  {n1Sections.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {n1Sections.map(n1Section => (
                        <DropdownMenuItem 
                          key={n1Section.id}
                          onClick={(e) => { e.stopPropagation(); handleMoveToSection(n1Section.id); }}
                          disabled={section.parentId === n1Section.id}
                        >
                          {section.parentId === n1Section.id ? '✓ ' : '→ '}{n1Section.title} (N-2)
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {section.isExpanded && hasContent && (
          <div 
            ref={setNodeRef}
            className={`mt-2 ml-2 md:ml-6 space-y-2 transition-colors ${isPersonDragOver ? 'ring-2 ring-primary ring-offset-2 rounded-lg p-2' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {(section.members.length > 0 || (section.vacantPositions && section.vacantPositions.length > 0) || !isAdmin) && (
              <div className="flex flex-wrap gap-1 items-stretch pl-1 md:pl-6 relative">
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