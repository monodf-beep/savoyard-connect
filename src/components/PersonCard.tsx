import React from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Edit2, Linkedin } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
  isAdmin: boolean;
  onEdit?: (person: Person) => void;
  compact?: boolean;
  isBureau?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({ 
  person, 
  onClick, 
  isAdmin, 
  onEdit,
  compact = false,
  isBureau = false 
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

  if (compact) {
    const compactClass = isBureau 
      ? "inline-flex items-center gap-3 px-4 py-3 text-base bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 border border-primary/20 rounded-xl transition-all duration-300 h-[50px] shadow-sm hover:shadow-md"
      : "inline-flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/15 hover:to-accent/10 border border-accent/30 rounded-lg transition-all duration-300 h-[42px] shadow-sm hover:shadow-md";
    
    const avatarClass = isBureau ? "w-8 h-8" : "w-6 h-6";
    const textClass = isBureau ? "font-semibold text-foreground" : "font-medium text-foreground";
    const iconClass = isBureau ? "w-4 h-4" : "w-3 h-3";
    
    return (
      <button
        onClick={handleClick}
        className={`${compactClass} group hover:scale-105`}
      >
        <Avatar className={`${avatarClass} ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300`}>
          <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
          <AvatarFallback className="text-xs bg-primary/15 text-primary font-semibold">
            {person.firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className={`${textClass} truncate whitespace-nowrap`}>
          {person.firstName} {person.lastName}
        </span>
        {person.linkedin && (
          <Linkedin className={`${iconClass} text-primary/60 group-hover:text-primary transition-colors duration-300`} />
        )}
      </button>
    );
  }

  return (
    <div className="person-card group" onClick={handleClick}>
      <div className="flex items-center gap-3">
        <Avatar className="person-avatar">
          <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
          <AvatarFallback className="bg-primary/10 text-foreground font-semibold">
            {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm truncate">
              {person.firstName} {person.lastName}
            </h4>
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
              {isAdmin && (
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