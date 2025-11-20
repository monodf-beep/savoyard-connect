import React from 'react';
import { Person, Section } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Edit2, Linkedin, Sparkles } from 'lucide-react';
import { PersonQuickActions } from './PersonQuickActions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
  isAdmin: boolean;
  onEdit?: (person: Person) => void;
  compact?: boolean;
  isBureau?: boolean;
  sectionId?: string;
  sectionTitle?: string;
  allSections?: Section[];
  onUpdate?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ 
  person, 
  onClick, 
  isAdmin, 
  onEdit,
  compact = false,
  isBureau = false,
  sectionId,
  sectionTitle,
  allSections = [],
  onUpdate
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(person);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(person);
  };

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (person.linkedin) {
      window.open(person.linkedin, '_blank');
    }
  };

  // Trouver les sections dont cette personne est responsable
  const ledSections = allSections.filter(section => section.leader?.id === person.id);
  const isLeader = ledSections.length > 0;

  if (compact) {
    const compactClass = isBureau 
      ? "inline-flex items-center gap-3 px-4 py-2 text-base bg-card hover:bg-accent/50 border border-border rounded-lg transition-colors h-[44px] w-full"
      : "inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-card hover:bg-accent/50 border border-border rounded-md transition-colors h-[44px] w-full";
    
    const avatarClass = isBureau ? "w-8 h-8" : "w-6 h-6";
    const textClass = isBureau ? "font-semibold" : "font-medium";
    const iconClass = isBureau ? "w-4 h-4" : "w-3 h-3";
    
    return (
      <div className="relative group w-full">
        <div className={compactClass}>
          <button
            onClick={handleClick}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <Avatar className={avatarClass}>
              <AvatarImage 
                src={person.photo} 
                alt={`${person.firstName} ${person.lastName}`}
                className="object-cover object-center w-full h-full"
                style={{ imageRendering: 'auto' }}
              />
              <AvatarFallback className="text-xs bg-primary/10">
                {person.firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className={`${textClass} truncate whitespace-nowrap`}>
                {person.firstName} {person.lastName}
              </span>
              {isLeader && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Responsable de {ledSections.map(s => s.title).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {person.linkedin && (
              <Linkedin className={`${iconClass} text-muted-foreground opacity-60 flex-shrink-0`} />
            )}
          </button>
          {isAdmin && sectionId && sectionTitle && onUpdate && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <PersonQuickActions
                person={person}
                currentSectionId={sectionId}
                currentSectionTitle={sectionTitle}
                allSections={allSections}
                onEdit={() => onEdit?.(person)}
                onUpdate={onUpdate}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="person-card group" onClick={handleClick}>
      <div className="flex items-center gap-3">
        <Avatar className="person-avatar w-10 h-10">
          <AvatarImage 
            src={person.photo} 
            alt={`${person.firstName} ${person.lastName}`}
            className="object-cover object-center w-full h-full"
            style={{ imageRendering: 'auto' }}
          />
          <AvatarFallback className="bg-primary/10 text-foreground font-semibold text-sm">
            {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {person.firstName} {person.lastName}
              </h4>
              {isLeader && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Responsable de {ledSections.map(s => s.title).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {person.linkedin && (
                <button
                  onClick={handleLinkedInClick}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </button>
              )}
              {isAdmin && sectionId && sectionTitle && onUpdate && (
                <PersonQuickActions
                  person={person}
                  currentSectionId={sectionId}
                  currentSectionTitle={sectionTitle}
                  allSections={allSections}
                  onEdit={() => onEdit?.(person)}
                  onUpdate={onUpdate}
                />
              )}
              {isAdmin && !sectionId && (
                <button
                  onClick={handleEdit}
                  className="admin-controls p-1 hover:bg-accent rounded transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </button>
              )}
            </div>
          </div>
          
          {person.role && (
            <p className="text-xs text-muted-foreground truncate">{person.role}</p>
          )}
        </div>
      </div>
    </div>
  );
};