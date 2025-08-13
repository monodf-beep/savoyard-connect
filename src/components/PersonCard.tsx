import React from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Edit2, Linkedin } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  onClick: (person: Person) => void;
  isAdmin: boolean;
  onEdit?: (person: Person) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onClick, isAdmin, onEdit }) => {
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

  return (
    <div className="person-card group" onClick={handleClick}>
      <div className="flex items-center gap-3">
        <Avatar className="person-avatar">
          <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
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
            <p className="text-xs text-muted-foreground mb-1 truncate">{person.role}</p>
          )}
          
          {person.missions && person.missions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {person.missions.slice(0, 2).map((mission, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-1 py-0 h-4"
                >
                  {mission}
                </Badge>
              ))}
              {person.missions.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                  +{person.missions.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};