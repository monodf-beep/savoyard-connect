import React, { useEffect } from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Linkedin, MapPin } from 'lucide-react';

interface PersonModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({ person, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  if (!isOpen || !person) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-lg">
                {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {person.firstName} {person.lastName}
              </h2>
              {person.role && (
                <p className="text-muted-foreground">{person.role}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {person.description && (
            <div>
              <h3 className="font-semibold text-lg mb-3">À propos</h3>
              <p className="text-muted-foreground leading-relaxed">{person.description}</p>
            </div>
          )}

          {person.missions && person.missions.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Missions & Responsabilités
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.missions.map((mission, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-3 py-1 text-sm"
                  >
                    {mission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {person.linkedin && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Liens externes</h3>
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#005885] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                Voir le profil LinkedIn
              </a>
            </div>
          )}

          {person.instagram && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Publication Instagram</h3>
              <div 
                className="instagram-embed"
                dangerouslySetInnerHTML={{ __html: person.instagram }}
              />
              <script async src="//www.instagram.com/embed.js"></script>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};