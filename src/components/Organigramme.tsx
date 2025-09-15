import React, { useState, useCallback } from 'react';
import { Person, Section, AdminMode, VacantPosition } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { PersonSidebar } from './PersonSidebar';
import { VacantPositionsSidebar } from './VacantPositionsSidebar';
import { PersonForm } from './PersonForm';
import { SectionForm } from './SectionForm';
import { VacantPositionForm } from './VacantPositionForm';
import { Button } from './ui/button';
import { Settings, Eye, ExpandIcon as Expand, ShrinkIcon as Shrink, Plus, UserPlus, FolderPlus } from 'lucide-react';
import { Badge } from './ui/badge';
import { useIsWordPressAdmin } from '../utils/wordpress';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { supabase } from '../integrations/supabase/client';

interface OrganigrammeProps {
  isAdminMode?: boolean;
}

export const Organigramme: React.FC<OrganigrammeProps> = ({
  isAdminMode = false
}) => {
  const { data, loading, savePerson, deletePerson, saveSection, deleteSection, updateSectionExpansion, saveVacantPosition, updateVacantPosition, deleteVacantPosition, refetch } = useOrganigramme();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVacantPositionsSidebarOpen, setIsVacantPositionsSidebarOpen] = useState(false);
  const isWPAdmin = useIsWordPressAdmin();
  const [adminMode, setAdminMode] = useState<AdminMode>({ isActive: isAdminMode });
  const [isPersonFormOpen, setIsPersonFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isVacantPositionFormOpen, setIsVacantPositionFormOpen] = useState(false);
  const [editingVacantPosition, setEditingVacantPosition] = useState<VacantPosition | null>(null);

  // Listen for custom events to open vacant positions sidebar
  React.useEffect(() => {
    const handleOpenVacantPositions = (event: CustomEvent) => {
      if (!adminMode.isActive) {
        setIsVacantPositionsSidebarOpen(true);
      }
    };

    window.addEventListener('openVacantPositions', handleOpenVacantPositions as EventListener);
    return () => {
      window.removeEventListener('openVacantPositions', handleOpenVacantPositions as EventListener);
    };
  }, [adminMode.isActive]);

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
    try {
      // Mettre à jour toutes les sections en base de données en une fois
      await supabase
        .from('sections')
        .update({ is_expanded: true })
        .neq('id', ''); // Condition pour sélectionner toutes les lignes

      // Recharger les données une seule fois
      await refetch();
    } catch (error) {
      console.error('Erreur lors de l\'expansion:', error);
    }
  }, [refetch]);

  const collapseAll = useCallback(async () => {
    try {
      // Mettre à jour toutes les sections en base de données en une fois
      await supabase
        .from('sections')
        .update({ is_expanded: false })
        .neq('id', ''); // Condition pour sélectionner toutes les lignes

      // Recharger les données une seule fois
      await refetch();
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
    }
  }, [refetch]);

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

  // Fonction pour récupérer tous les postes vacants avec leur section
  const getAllVacantPositions = useCallback((): (VacantPosition & { sectionTitle: string })[] => {
    const positions: (VacantPosition & { sectionTitle: string })[] = [];
    
    const collectPositions = (sections: Section[]) => {
      sections.forEach(section => {
        if (section.vacantPositions) {
          section.vacantPositions.forEach(position => {
            positions.push({
              ...position,
              sectionTitle: section.title
            });
          });
        }
        if (section.subsections) {
          collectPositions(section.subsections);
        }
      });
    };
    
    collectPositions(data.sections);
    return positions;
  }, [data.sections]);

  // Fonction pour naviguer vers une section contenant un poste vacant
  const navigateToVacantPosition = useCallback((position: VacantPosition & { sectionTitle: string }) => {
    // Ne pas fermer le sidebar, garder le panneau ouvert
    
    // Expandre d'abord toutes les sections parentes si nécessaire
    const expandParentSections = async (sectionId: string) => {
      const findAndExpandParents = (sections: Section[], targetId: string, parentId?: string): boolean => {
        for (const section of sections) {
          if (section.id === targetId) {
            if (parentId) {
              // Si on a trouvé la section cible, s'assurer que son parent est étendu
              updateSectionExpansion(parentId, true);
            }
            // S'assurer que la section elle-même est étendue
            updateSectionExpansion(targetId, true);
            return true;
          }
          if (section.subsections && findAndExpandParents(section.subsections, targetId, section.id)) {
            // Si trouvé dans une sous-section, étendre cette section aussi
            updateSectionExpansion(section.id, true);
            return true;
          }
        }
        return false;
      };
      
      findAndExpandParents(data.sections, sectionId);
    };
    
    // Attendre l'expansion puis naviguer
    expandParentSections(position.sectionId).then(() => {
      setTimeout(() => {
        const sectionElement = document.getElementById(`section-${position.sectionId}`);
        if (sectionElement) {
          // Faire défiler jusqu'à la section
          sectionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Ajouter un effet flash
          sectionElement.classList.add('flash-highlight');
          setTimeout(() => {
            sectionElement.classList.remove('flash-highlight');
          }, 2000);
        }
      }, 300);
    });
  }, [data.sections, updateSectionExpansion]);

  // Gérer l'ouverture du sidebar des postes vacants
  const handleVacantPositionsClick = useCallback(() => {
    if (adminMode.isActive) {
      // En mode admin, aller vers la page jobs
      window.location.href = '/jobs';
    } else {
      // En mode lecture, ouvrir le sidebar
      setIsVacantPositionsSidebarOpen(true);
    }
  }, [adminMode.isActive]);

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

  // Handlers pour les postes vacants
  const handleAddVacantPosition = useCallback(() => {
    setEditingVacantPosition(null);
    setIsVacantPositionFormOpen(true);
  }, []);

  const handleEditVacantPosition = useCallback((position: VacantPosition) => {
    setEditingVacantPosition(position);
    setIsVacantPositionFormOpen(true);
  }, []);

  const handleSaveVacantPosition = useCallback(async (positionData: Omit<VacantPosition, 'id'>) => {
    try {
      if (editingVacantPosition) {
        await updateVacantPosition(editingVacantPosition.id, positionData);
      } else {
        await saveVacantPosition(positionData);
      }
      setIsVacantPositionFormOpen(false);
      setEditingVacantPosition(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, [editingVacantPosition, saveVacantPosition, updateVacantPosition]);

  const handleDeleteVacantPosition = useCallback(async (positionId: string) => {
    try {
      await deleteVacantPosition(positionId);
      setIsVacantPositionFormOpen(false);
      setEditingVacantPosition(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [deleteVacantPosition]);

  const toggleAdminMode = useCallback(() => {
    setAdminMode(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  // Compter les membres uniques à travers toutes les sections
  const getAllMembers = (sections: Section[]): Person[] => {
    const members: Person[] = [];
    const addedIds = new Set<string>();
    
    const collectMembers = (sectionList: Section[]) => {
      sectionList.forEach(section => {
        section.members.forEach(member => {
          if (!addedIds.has(member.id)) {
            members.push(member);
            addedIds.add(member.id);
          }
        });
        if (section.subsections) {
          collectMembers(section.subsections);
        }
      });
    };
    
    collectMembers(sections);
    return members;
  };
  
  const totalMembers = getAllMembers(data.sections).length;

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
    <div className="flex min-h-screen w-full relative">
      <div className={`organigramme-container transition-all duration-300 ${(isSidebarOpen || isVacantPositionsSidebarOpen) ? 'pr-80' : ''} flex-1 max-w-full px-4 py-4`}>
      {/* Header épuré */}
      <div className="mb-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-xs bg-secondary/50 px-2 py-1 rounded-md">
            {totalMembers} membres
          </span>
          <Button
            onClick={handleVacantPositionsClick}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            {adminMode.isActive ? 'Postes vacants' : `${getAllVacantPositions().length} postes vacants`}
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
              
              <Button
                onClick={handleAddVacantPosition}
                variant="outline"
                size="sm"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Ajouter poste vacant
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
            onEditVacantPosition={handleEditVacantPosition}
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

      <VacantPositionForm
        position={editingVacantPosition}
        isOpen={isVacantPositionFormOpen}
        onClose={() => setIsVacantPositionFormOpen(false)}
        onSave={handleSaveVacantPosition}
        onDelete={handleDeleteVacantPosition}
      />

      <VacantPositionsSidebar
        isOpen={isVacantPositionsSidebarOpen}
        onClose={() => setIsVacantPositionsSidebarOpen(false)}
        positions={getAllVacantPositions()}
        onPositionClick={navigateToVacantPosition}
      />
    </div>
  );
};