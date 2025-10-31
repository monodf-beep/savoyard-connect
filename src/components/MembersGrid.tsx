import React, { useState, useMemo } from 'react';
import { Person, Section } from '../types/organigramme';
import { MemberCard } from './MemberCard';
import { PersonSidebar } from './PersonSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Filter, ArrowUpDown } from 'lucide-react';

interface MembersGridProps {
  sections: Section[];
  people: Person[];
  isAdmin?: boolean;
  onEdit?: (person: Person) => void;
}

type SortOption = 'name' | 'date' | 'section';

export const MembersGrid: React.FC<MembersGridProps> = ({ 
  sections, 
  people, 
  isAdmin = false,
  onEdit 
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Construire une map de personnes -> sections
  const personSectionsMap = useMemo(() => {
    const map = new Map<string, { section: Section; role?: string }[]>();
    
    const mapSections = (sectionList: Section[]) => {
      sectionList.forEach(section => {
        section.members?.forEach(member => {
          const existing = map.get(member.id) || [];
          existing.push({ section, role: member.role });
          map.set(member.id, existing);
        });
        if (section.subsections) {
          mapSections(section.subsections);
        }
      });
    };
    
    mapSections(sections);
    return map;
  }, [sections]);

  // Obtenir toutes les sections pour le filtre
  const allSections = useMemo(() => {
    const list: Section[] = [];
    const collectSections = (sectionList: Section[]) => {
      sectionList.forEach(section => {
        list.push(section);
        if (section.subsections) {
          collectSections(section.subsections);
        }
      });
    };
    collectSections(sections);
    return list;
  }, [sections]);

  // Filtrer les personnes
  const filteredPeople = useMemo(() => {
    let filtered = people;

    // Filtre par section
    if (filterSection !== 'all') {
      filtered = filtered.filter(person => {
        const sections = personSectionsMap.get(person.id) || [];
        return sections.some(s => s.section.id === filterSection);
      });
    }

    return filtered;
  }, [people, filterSection, personSectionsMap]);

  // Trier les personnes
  const sortedPeople = useMemo(() => {
    const sorted = [...filteredPeople];

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
        break;
      case 'date':
        sorted.sort((a, b) => {
          const dateA = a.dateEntree ? new Date(a.dateEntree).getTime() : 0;
          const dateB = b.dateEntree ? new Date(b.dateEntree).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'section':
        sorted.sort((a, b) => {
          const sectionsA = personSectionsMap.get(a.id) || [];
          const sectionsB = personSectionsMap.get(b.id) || [];
          const titleA = sectionsA[0]?.section.title || '';
          const titleB = sectionsB[0]?.section.title || '';
          return titleA.localeCompare(titleB);
        });
        break;
    }

    return sorted;
  }, [filteredPeople, sortBy, personSectionsMap]);

  return (
    <div className="w-full space-y-6">
      {/* Filtres et tri */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/50 p-4 rounded-lg border border-border">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filtre par section */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Toutes les sections" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Toutes les sections</SelectItem>
                {allSections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="name">Trier par nom</SelectItem>
                <SelectItem value="date">Trier par date d'entrée</SelectItem>
                <SelectItem value="section">Trier par section</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compteur */}
        <div className="text-sm text-muted-foreground">
          {sortedPeople.length} membre{sortedPeople.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedPeople.map(person => {
          const sections = personSectionsMap.get(person.id) || [];
          const mainSection = sections[0]?.section.title;
          
          return (
            <MemberCard
              key={person.id}
              person={person}
              sectionTitle={mainSection}
              onClick={() => setSelectedPerson(person)}
            />
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {sortedPeople.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun membre trouvé
        </div>
      )}

      {/* Sidebar de détails */}
      <PersonSidebar
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        isAdmin={isAdmin}
        onEdit={onEdit}
      />
    </div>
  );
};
