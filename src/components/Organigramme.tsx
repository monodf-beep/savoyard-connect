import React, { useState, useCallback } from 'react';
import { OrganigrammeData, Person, Section, AdminMode } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { PersonSidebar } from './PersonSidebar';
import { PersonForm } from './PersonForm';
import { SectionForm } from './SectionForm';
import { Button } from './ui/button';
import { Settings, Eye, ExpandIcon as Expand, ShrinkIcon as Shrink, Plus, UserPlus, FolderPlus } from 'lucide-react';
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
  const [people, setPeople] = useState<Person[]>(data.people);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminMode, setAdminMode] = useState<AdminMode>({ isActive: isAdminMode });
  const [isPersonFormOpen, setIsPersonFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

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
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedPerson(null);
  }, []);

  const handleEditPerson = useCallback((person: Person) => {
    setEditingPerson(person);
    setIsPersonFormOpen(true);
    setIsSidebarOpen(false);
  }, []);

  const handleAddPerson = useCallback(() => {
    setEditingPerson(null);
    setIsPersonFormOpen(true);
  }, []);

  const handleSavePerson = useCallback((person: Person) => {
    setPeople(prev => {
      const existing = prev.find(p => p.id === person.id);
      if (existing) {
        return prev.map(p => p.id === person.id ? person : p);
      } else {
        return [...prev, person];
      }
    });

    // Update sections to reflect changes
    setSections(prev => updateSectionsWithPerson(prev, person));
    
    if (onDataChange) {
      const newData = {
        people: people.map(p => p.id === person.id ? person : p),
        sections: sections
      };
      if (!people.find(p => p.id === person.id)) {
        newData.people.push(person);
      }
      onDataChange(newData);
    }
  }, [people, sections, onDataChange]);

  const handleDeletePerson = useCallback((personId: string) => {
    setPeople(prev => prev.filter(p => p.id !== personId));
    setSections(prev => removeSectionMember(prev, personId));
    
    if (onDataChange) {
      onDataChange({
        people: people.filter(p => p.id !== personId),
        sections: sections
      });
    }
  }, [people, sections, onDataChange]);

  const handleAddSection = useCallback(() => {
    setEditingSection(null);
    setIsSectionFormOpen(true);
  }, []);

  const handleSaveSection = useCallback((sectionData: Omit<Section, 'members' | 'subsections'>) => {
    const newSection: Section = {
      ...sectionData,
      members: [],
      subsections: []
    };

    setSections(prev => {
      const existing = prev.find(s => s.id === sectionData.id);
      if (existing) {
        return prev.map(s => s.id === sectionData.id ? { ...s, ...sectionData } : s);
      } else {
        return [...prev, newSection];
      }
    });

    if (onDataChange) {
      onDataChange({
        people,
        sections: sections.map(s => s.id === sectionData.id ? { ...s, ...sectionData } : s)
      });
    }
  }, [people, sections, onDataChange]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    
    if (onDataChange) {
      onDataChange({
        people,
        sections: sections.filter(s => s.id !== sectionId)
      });
    }
  }, [people, sections, onDataChange]);

  // Helper functions
  const updateSectionsWithPerson = (sections: Section[], person: Person): Section[] => {
    return sections.map(section => ({
      ...section,
      members: section.members.map(m => m.id === person.id ? person : m),
      subsections: section.subsections ? updateSectionsWithPerson(section.subsections, person) : undefined
    }));
  };

  const removeSectionMember = (sections: Section[], personId: string): Section[] => {
    return sections.map(section => ({
      ...section,
      members: section.members.filter(m => m.id !== personId),
      subsections: section.subsections ? removeSectionMember(section.subsections, personId) : undefined
    }));
  };


  const toggleAdminMode = useCallback(() => {
    setAdminMode(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const totalMembers = people.length;

  return (
    <div className="flex min-h-screen w-full">
      <div className={`organigramme-container transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''} flex-1 max-w-6xl mx-auto p-4`}>
      {/* Header épuré */}
      <div className="mb-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-xs bg-secondary/50 px-2 py-1 rounded-md">
            {totalMembers} membres
          </span>
        </div>

        {/* Controls compacts et discrets */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button 
            onClick={expandAll}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Expand className="w-3 h-3 mr-1" />
            Tout déplier
          </Button>
          
          <Button 
            onClick={collapseAll}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Shrink className="w-3 h-3 mr-1" />
            Tout replier
          </Button>

          {adminMode.isActive && (
            <>
              <Button
                onClick={handleAddPerson}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Ajouter personne
              </Button>
              
              <Button
                onClick={handleAddSection}
                variant="outline"
                size="sm"
              >
                <FolderPlus className="w-3 h-3 mr-1" />
                Ajouter section
              </Button>
            </>
          )}

          <Button
            onClick={toggleAdminMode}
            variant={adminMode.isActive ? "default" : "outline"}
            size="sm"
            className="ml-1"
          >
            {adminMode.isActive ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Visiteur
              </>
            ) : (
              <>
                <Settings className="w-3 h-3 mr-1" />
                Admin
              </>
            )}
          </Button>
        </div>
      </div>

      {adminMode.isActive && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="w-3 h-3 text-accent" />
            <span className="font-medium text-accent">Mode Administrateur</span>
            <span className="text-xs text-muted-foreground">• Cliquez sur les icônes d'édition</span>
          </div>
        </div>
      )}

      {/* Sections épurées */}
      <div className="space-y-4">
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

      </div>

      {/* Sidebar */}
      <PersonSidebar
        person={selectedPerson}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        isAdmin={adminMode.isActive}
        onEdit={handleEditPerson}
      />

      {/* Forms */}
      <PersonForm
        person={editingPerson}
        isOpen={isPersonFormOpen}
        onClose={() => setIsPersonFormOpen(false)}
        onSave={handleSavePerson}
        onDelete={handleDeletePerson}
      />

      <SectionForm
        section={editingSection}
        isOpen={isSectionFormOpen}
        onClose={() => setIsSectionFormOpen(false)}
        onSave={handleSaveSection}
        onDelete={handleDeleteSection}
      />
    </div>
  );
};