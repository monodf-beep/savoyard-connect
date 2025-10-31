import React from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Linkedin, Calendar } from 'lucide-react';
import { Button } from './ui/button';

interface MemberCardProps {
  person: Person;
  sectionTitle?: string;
  onClick: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ person, sectionTitle, onClick }) => {
  const displayedCompetences = person.competences?.slice(0, 3) || [];

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border"
      onClick={onClick}
    >
      <div className="p-4 md:p-6 flex flex-col items-center text-center space-y-3 md:space-y-4">
        {/* Photo - Plus petite sur mobile */}
        <Avatar className="w-16 h-16 md:w-24 md:h-24 ring-4 ring-background shadow-md">
          <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold text-lg md:text-2xl">
            {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>

        {/* Nom et titre */}
        <div className="space-y-0.5 md:space-y-1 w-full">
          <h3 className="font-bold text-sm md:text-lg truncate">
            {person.firstName} {person.lastName}
          </h3>
          {person.role && (
            <p className="text-xs md:text-sm text-muted-foreground truncate">{person.role}</p>
          )}
        </div>

        {/* Section */}
        {sectionTitle && (
          <Badge variant="outline" className="text-xs">
            {sectionTitle}
          </Badge>
        )}

        {/* LinkedIn */}
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>LinkedIn</span>
          </a>
        )}

        {/* Compétences - Cachées sur très petits écrans */}
        {displayedCompetences.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5 justify-center w-full">
            {displayedCompetences.map((competence, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {competence}
              </Badge>
            ))}
          </div>
        )}

        {/* Date d'entrée */}
        {person.dateEntree && (
          <div className="flex items-center gap-1 md:gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>
              Depuis {new Date(person.dateEntree).toLocaleDateString('fr-FR', {
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Bouton au survol - Desktop uniquement */}
        <Button 
          variant="outline" 
          size="sm"
          className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-4"
        >
          Voir le profil →
        </Button>
      </div>
    </Card>
  );
};
