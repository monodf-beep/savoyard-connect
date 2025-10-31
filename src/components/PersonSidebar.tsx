import React, { useEffect } from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Linkedin, MapPin, Edit, Mail, Phone, Calendar, User, BookOpen, Briefcase, Star, Globe, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { Sheet, SheetContent } from './ui/sheet';
import { Drawer, DrawerContent, DrawerClose } from './ui/drawer';
import { useIsMobile } from '../hooks/use-mobile';

// Composant pour afficher les sections d'une personne
const PersonSections: React.FC<{ personId: string }> = ({ personId }) => {
  const { data } = useOrganigramme(false);
  
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
  const isMobile = useIsMobile();

  if (!person) return null;

  // Contenu commun pour desktop et mobile
  const content = (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
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
    </>
  );

  // Mobile: Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh]">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Sheet (sidebar)
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {content}
      </SheetContent>
    </Sheet>
  );
};