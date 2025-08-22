import React, { useState, useCallback } from 'react';
import { Person, Section, AdminMode } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { PersonSidebar } from './PersonSidebar';
import { PersonForm } from './PersonForm';
import { SectionForm } from './SectionForm';
import { Button } from './ui/button';
import { Settings, Eye, ExpandIcon as Expand, ShrinkIcon as Shrink, Plus, UserPlus, FolderPlus } from 'lucide-react';
import { Badge } from './ui/badge';
import { useIsWordPressAdmin } from '../utils/wordpress';
import { useOrganigramme } from '../hooks/useOrganigramme';

interface OrganigrammeProps {
  isAdminMode?: boolean;
}

export const Organigramme: React.FC<OrganigrammeProps> = ({
  isAdminMode = false
}) => {
  const { data, loading, savePerson, deletePerson, saveSection, deleteSection, updateSectionExpansion } = useOrganigramme();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isWPAdmin = useIsWordPressAdmin();
  const [adminMode, setAdminMode] = useState<AdminMode>({ isActive: isAdminMode });
  const [isPersonFormOpen, setIsPersonFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const toggleSection = useCallback(async (sectionId: string) => {
    const findSectionRecursively = (sections: Section[]): Section | null => {
      for (const section of sections) {
        if (section.id === sectionId) {
          return section;
        }
        if (section.subsections) {
          const found = findSectionRecursively(section.subsections);
          if (found) return found;
        }
      }
      return null;
    };

    const targetSection = findSectionRecursively(data.sections);
    if (targetSection) {
      await updateSectionExpansion(sectionId, !targetSection.isExpanded);
    }
  }, [data.sections, updateSectionExpansion]);

  const expandAll = useCallback(async () => {
    const expandSectionRecursively = async (sections: Section[]) => {
      for (const section of sections) {
        await updateSectionExpansion(section.id, true);
        if (section.subsections) {
          await expandSectionRecursively(section.subsections);
        }
      }
    };
    
    await expandSectionRecursively(data.sections);
  }, [data.sections, updateSectionExpansion]);

  const collapseAll = useCallback(async () => {
    const collapseSectionRecursively = async (sections: Section[]) => {
      for (const section of sections) {
        await updateSectionExpansion(section.id, false);
        if (section.subsections) {
          await collapseSectionRecursively(section.subsections);
        }
      }
    };
    
    await collapseSectionRecursively(data.sections);
  }, [data.sections, updateSectionExpansion]);

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

  const handleSavePerson = useCallback(async (person: Person) => {
    try {
      await savePerson(person);
      setIsPersonFormOpen(false);
      setEditingPerson(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [savePerson]);

  const handleDeletePerson = useCallback(async (personId: string) => {
    try {
      await deletePerson(personId);
      setIsPersonFormOpen(false);
      setEditingPerson(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [deletePerson]);

  const handleAddSection = useCallback(() => {
    setEditingSection(null);
    setIsSectionFormOpen(true);
  }, []);

  const handleSaveSection = useCallback(async (sectionData: Omit<Section, 'members' | 'subsections'>) => {
    try {
      await saveSection(sectionData);
      setIsSectionFormOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [saveSection]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    try {
      await deleteSection(sectionId);
      setIsSectionFormOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [deleteSection]);

  const toggleAdminMode = useCallback(() => {
    setAdminMode(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  // Compter uniquement les membres assignés à des sections pour éviter les doublons
  const totalMembers = data.people.filter(person => person.sectionId).length;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'organigramme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className={`organigramme-container transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''} flex-1 max-w-6xl mx-auto p-4`}>
      {/* Header épuré */}
      <div className="mb-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-xs bg-secondary/50 px-2 py-1 rounded-md">
            {totalMembers} membres
          </span>
          <Button
            onClick={() => window.location.href = '/jobs'}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Postes vacants
          </Button>
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

          {/* Bouton Admin */}
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
        {data.sections.map(section => (
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