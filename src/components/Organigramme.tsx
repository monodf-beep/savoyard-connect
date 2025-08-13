import React, { useState, useCallback } from 'react';
import { OrganigrammeData, Person, Section, AdminMode } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { PersonModal } from './PersonModal';
import { Button } from './ui/button';
import { Settings, Eye, ExpandIcon as Expand, ShrinkIcon as Shrink } from 'lucide-react';
import { Badge } from './ui/badge';

interface OrganigrammeProps {
  data: OrganigrammeData;
  isAdminMode?: boolean;
  onDataChange?: (data: OrganigrammeData) => void;
}

export const Organigramme: React.FC<OrganigrammeProps> = ({
  data,
  isAdminMode = false,
  onDataChange
}) => {
  const [sections, setSections] = useState<Section[]>(data.sections);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminMode, setAdminMode] = useState<AdminMode>({ isActive: isAdminMode });

  const toggleSection = useCallback((sectionId: string) => {
    const updateSectionRecursively = (sections: Section[]): Section[] => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, isExpanded: !section.isExpanded };
        }
        if (section.subsections) {
          return {
            ...section,
            subsections: updateSectionRecursively(section.subsections)
          };
        }
        return section;
      });
    };

    setSections(updateSectionRecursively(sections));
  }, [sections]);

  const expandAll = useCallback(() => {
    const expandSectionRecursively = (sections: Section[]): Section[] => {
      return sections.map(section => ({
        ...section,
        isExpanded: true,
        subsections: section.subsections ? expandSectionRecursively(section.subsections) : undefined
      }));
    };

    setSections(expandSectionRecursively(sections));
  }, []);

  const collapseAll = useCallback(() => {
    const collapseSectionRecursively = (sections: Section[]): Section[] => {
      return sections.map(section => ({
        ...section,
        isExpanded: false,
        subsections: section.subsections ? collapseSectionRecursively(section.subsections) : undefined
      }));
    };

    setSections(collapseSectionRecursively(sections));
  }, []);

  const handlePersonClick = useCallback((person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPerson(null);
  }, []);

  const handleEditPerson = useCallback((person: Person) => {
    setAdminMode(prev => ({ ...prev, selectedPerson: person }));
    // Ici vous pourriez ouvrir un modal d'édition
    console.log('Éditer personne:', person);
  }, []);

  const toggleAdminMode = useCallback(() => {
    setAdminMode(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const totalMembers = data.people.length;
  const totalSections = sections.length;

  return (
    <div className="organigramme-container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Institut de la Langue Savoyarde
        </h1>
        <p className="text-muted-foreground mb-6">Organigramme synthétique - Mise à jour consolidée</p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Badge variant="secondary" className="px-3 py-1">
            {totalMembers} membres actifs
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {totalSections} sections principales
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button 
            onClick={expandAll}
            variant="outline"
            className="expand-collapse-btn"
          >
            <Expand className="w-4 h-4 mr-2" />
            Tout déplier
          </Button>
          
          <Button 
            onClick={collapseAll}
            variant="outline"
            className="expand-collapse-btn"
          >
            <Shrink className="w-4 h-4 mr-2" />
            Tout replier
          </Button>

          {/* Mode administrateur (pour WordPress) */}
          <Button
            onClick={toggleAdminMode}
            variant={adminMode.isActive ? "default" : "outline"}
            className="ml-2"
          >
            {adminMode.isActive ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Mode Visiteur
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Mode Admin
              </>
            )}
          </Button>
        </div>
      </div>

      {adminMode.isActive && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-accent" />
            <span className="font-medium text-accent">Mode Administrateur</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Vous pouvez maintenant modifier les informations en cliquant sur l'icône d'édition de chaque personne.
          </p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            onToggle={toggleSection}
            onPersonClick={handlePersonClick}
            isAdmin={adminMode.isActive}
            onEditPerson={handleEditPerson}
          />
        ))}
      </div>

      {/* Modal */}
      <PersonModal
        person={selectedPerson}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};