import React, { useEffect } from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Linkedin, MapPin, Edit } from 'lucide-react';
import { Button } from './ui/button';

interface PersonSidebarProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (person: Person) => void;
}

export const PersonSidebar: React.FC<PersonSidebarProps> = ({ 
  person, 
  isOpen, 
  onClose, 
  isAdmin = false,
  onEdit 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!person) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-lg">
                {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">
                {person.firstName} {person.lastName}
              </h2>
              {person.role && (
                <p className="text-sm text-muted-foreground truncate">{person.role}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onEdit && (
              <Button
                onClick={() => onEdit(person)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {person.description && (
            <div>
              <h3 className="font-semibold text-base mb-3">À propos</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{person.description}</p>
            </div>
          )}

          {(person.missionDescription || (person.missions && person.missions.length > 0)) && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Missions & Responsabilités
              </h3>
              {person.missionDescription && (
                <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                  {person.missionDescription}
                </p>
              )}
              {person.missions && person.missions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {person.missions.map((mission, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-2 py-1 text-xs"
                    >
                      {mission}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {person.linkedin && (
            <div>
              <h3 className="font-semibold text-base mb-3">Liens externes</h3>
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#005885] transition-colors text-sm"
              >
                <Linkedin className="w-4 h-4" />
                Voir le profil LinkedIn
              </a>
            </div>
          )}

          {person.instagram && (
            <div>
              <h3 className="font-semibold text-base mb-3">Publication Instagram</h3>
              <div 
                className="instagram-embed"
                dangerouslySetInnerHTML={{ __html: person.instagram }}
              />
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          )}
        </div>
      </div>
    </>
  );
};