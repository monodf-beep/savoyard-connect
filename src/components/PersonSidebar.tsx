import React, { useEffect } from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Linkedin, MapPin, Edit, Mail, Phone, Calendar, User, BookOpen, Briefcase, Star, Globe, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useOrganigramme } from '../hooks/useOrganigramme';

// Composant pour afficher les sections d'une personne
const PersonSections: React.FC<{ personId: string }> = ({ personId }) => {
  const { data } = useOrganigramme();
  
  const getPersonSections = () => {
    const sections: Array<{ title: string; role: string }> = [];
    
    const findPersonInSections = (sectionList: any[], parentTitle = '') => {
      sectionList.forEach(section => {
        const member = section.members?.find((m: any) => m.id === personId);
        if (member) {
          sections.push({
            title: section.title,
            role: member.role || 'Membre'
          });
        }
        if (section.subsections) {
          findPersonInSections(section.subsections, section.title);
        }
      });
    };
    
    findPersonInSections(data.sections);
    return sections;
  };

  const personSections = getPersonSections();

  if (personSections.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        Participe à
      </h3>
      <div className="flex flex-wrap gap-2">
        {personSections.map((section, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {section.title}
            {section.role !== 'Membre' && ` (${section.role})`}
          </Badge>
        ))}
      </div>
    </div>
  );
};

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
          
          {/* Contact */}
          {(person.email || person.phone || person.linkedin) && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Contact
              </h3>
              <div className="space-y-2">
                {person.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${person.email}`} className="hover:text-primary transition-colors">
                      {person.email}
                    </a>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${person.phone}`} className="hover:text-primary transition-colors">
                      {person.phone}
                    </a>
                  </div>
                )}
                {person.linkedin && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Linkedin className="w-4 h-4" />
                    <a 
                      href={person.linkedin.startsWith('http') ? person.linkedin : `https://linkedin.com/in/${person.linkedin}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-primary transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. Lieu */}
          {person.adresse && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Lieu
              </h3>
              <p className="text-muted-foreground text-sm">{person.adresse}</p>
            </div>
          )}

          {/* 2. Groupes et commissions */}
          <PersonSections personId={person.id} />

          {/* 3. À propos / Mission */}
          {person.description && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                À propos / Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{person.description}</p>
            </div>
          )}

          {/* 4. Compétences */}
          {person.competences && person.competences.length > 0 && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.competences.map((competence, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {competence}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 5. Membre depuis */}
          {person.dateEntree && (
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Membre depuis
              </h3>
              <p className="text-muted-foreground text-sm">
                {new Date(person.dateEntree).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};