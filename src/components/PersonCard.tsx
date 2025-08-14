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
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-sm bg-card hover:bg-accent/50 border border-border rounded-md transition-colors ${
          isBureau ? 'px-4 py-2' : 'px-3 py-1.5'
        }`}
      >
        <Avatar className={isBureau ? "w-7 h-7" : "w-6 h-6"}>
          <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
          <AvatarFallback className="text-xs bg-primary/10">
            {person.firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className={`font-medium truncate ${isBureau ? 'text-base' : ''}`}>
          {person.firstName} {person.lastName}
        </span>
        {person.linkedin && (
          <Linkedin className="w-3 h-3 text-muted-foreground opacity-60" />
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