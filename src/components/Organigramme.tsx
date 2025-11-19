import React, { useState, useCallback } from 'react';
import { Person, Section, VacantPosition } from '../types/organigramme';
import { SectionCard } from './SectionCard';
import { PersonSidebar } from './PersonSidebar';
import { VacantPositionsSidebar } from './VacantPositionsSidebar';
import { SectionDetailsSidebar } from './SectionDetailsSidebar';
import { PersonForm } from './PersonForm';
import { SectionForm } from './SectionForm';
import { VacantPositionForm } from './VacantPositionForm';
import { MembersGrid } from './MembersGrid';
import { VolunteerImportManager } from './admin/VolunteerImportManager';
import { NameCorrectionTool } from './admin/NameCorrectionTool';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent } from './ui/dialog';
import { Settings, Eye, EyeOff, ExpandIcon as Expand, ShrinkIcon as Shrink, UserPlus, FolderPlus, LogIn, LogOut, LayoutGrid, List, Network, Menu, X, Upload, Plus, CheckCircle2 } from 'lucide-react';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OrganigrammeProps {
  isAdminMode?: boolean;
}

export const Organigramme: React.FC<OrganigrammeProps> = ({
  isAdminMode = false
}) => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data, loading, savePerson, deletePerson, saveSection, deleteSection, updateSectionExpansion, saveVacantPosition, updateVacantPosition, deleteVacantPosition, refetch } = useOrganigramme(isAdmin);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVacantPositionsSidebarOpen, setIsVacantPositionsSidebarOpen] = useState(false);
  const [isPersonFormOpen, setIsPersonFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isVacantPositionFormOpen, setIsVacantPositionFormOpen] = useState(false);
  const [editingVacantPosition, setEditingVacantPosition] = useState<VacantPosition | null>(null);
  const [viewMode, setViewMode] = useState<'line' | 'grid' | 'members'>('line');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isSectionDetailsSidebarOpen, setIsSectionDetailsSidebarOpen] = useState(false);
  const [isControlsMenuOpen, setIsControlsMenuOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNameCorrectionOpen, setIsNameCorrectionOpen] = useState(false);

  // Listen for custom events to open vacant positions sidebar
  React.useEffect(() => {
    const handleOpenVacantPositions = (event: CustomEvent) => {
      if (!isAdmin) {
        // Fermer le panneau des personnes et ouvrir celui des postes vacants
        setIsSidebarOpen(false);
        setSelectedPerson(null);
        setIsVacantPositionsSidebarOpen(true);
      }
    };

    window.addEventListener('openVacantPositions', handleOpenVacantPositions as EventListener);
    return () => {
      window.removeEventListener('openVacantPositions', handleOpenVacantPositions as EventListener);
    };
  }, [isAdmin]);

  // Listen for navbar actions
  React.useEffect(() => {
    const handleOpenPersonForm = () => {
      if (isAdmin) {
        setEditingPerson(null);
        setIsPersonFormOpen(true);
      }
    };

    const handleOpenSectionForm = () => {
      if (isAdmin) {
        setEditingSection(null);
        setIsSectionFormOpen(true);
      }
    };

    const handleOpenVacantPositionForm = () => {
      if (isAdmin) {
        setEditingVacantPosition(null);
        setIsVacantPositionFormOpen(true);
      }
    };

    const handleOpenImportDialog = () => {
      if (isAdmin) {
        setIsImportOpen(true);
      }
    };

    window.addEventListener('openPersonForm', handleOpenPersonForm);
    window.addEventListener('openSectionForm', handleOpenSectionForm);
    window.addEventListener('openVacantPositionForm', handleOpenVacantPositionForm);
    window.addEventListener('openImportDialog', handleOpenImportDialog);

    return () => {
      window.removeEventListener('openPersonForm', handleOpenPersonForm);
      window.removeEventListener('openSectionForm', handleOpenSectionForm);
      window.removeEventListener('openVacantPositionForm', handleOpenVacantPositionForm);
      window.removeEventListener('openImportDialog', handleOpenImportDialog);
    };
  }, [isAdmin]);

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

  const toggleSectionVisibility = useCallback(async (sectionId: string, currentHidden: boolean) => {
    try {
      await supabase
        .from('sections')
        .update({ is_hidden: !currentHidden })
        .eq('id', sectionId);

      await refetch();
      toast.success(currentHidden ? 'Section affichée' : 'Section cachée');
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
      toast.error('Erreur lors du changement de visibilité');
    }
  }, [refetch]);

  // Filter sections based on visibility and admin status
  // If a section is hidden for non-admins, promote its children to the parent level
  const filterVisibleSections = useCallback((sections: Section[]): Section[] => {
    const result: Section[] = [];
    
    for (const section of sections) {
      if (isAdmin || !section.isHidden) {
        // Section is visible, include it with its filtered subsections
        result.push({
          ...section,
          subsections: section.subsections ? filterVisibleSections(section.subsections) : []
        });
      } else {
        // Section is hidden for non-admins, but promote its subsections to this level
        if (section.subsections) {
          result.push(...filterVisibleSections(section.subsections));
        }
      }
    }
    
    return result;
  }, [isAdmin]);

  const visibleSections = filterVisibleSections(data.sections);

  const handlePersonClick = useCallback((person: Person) => {
    // Fermer le panneau des postes vacants s'il est ouvert
    setIsVacantPositionsSidebarOpen(false);
    // Ouvrir le panneau de la personne
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
    if (isAdmin) {
      // En mode admin, aller vers la page jobs
      window.location.href = '/jobs';
    } else {
      // En mode lecture, fermer le panneau des personnes et ouvrir le sidebar des postes vacants
      setIsSidebarOpen(false);
      setSelectedPerson(null);
      setIsVacantPositionsSidebarOpen(true);
    }
  }, [isAdmin]);

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

  const handleAuthAction = useCallback(async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  }, [user, signOut, navigate]);

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

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full relative">
      <div className={`organigramme-container transition-all duration-300 ${(isSidebarOpen || isVacantPositionsSidebarOpen) ? 'pr-80' : ''} flex-1 max-w-full px-4 py-4`}>
      {/* Header épuré */}
      <div className="mb-3 md:mb-6">
        {/* Version mobile : stats + menu bouton */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-secondary/50 px-2 py-1 rounded-md">
              {totalMembers} membres
            </span>
            <Button
              onClick={() => {
                setIsSidebarOpen(false);
                setSelectedPerson(null);
                setIsVacantPositionsSidebarOpen(true);
              }}
              variant="outline"
              size="sm"
              className="text-xs h-7"
            >
              <UserPlus className="w-3 h-3" />
              <span className="ml-1">{getAllVacantPositions().length}</span>
            </Button>
          </div>

          {/* Bouton Menu Modal */}
          <Sheet open={isControlsMenuOpen} onOpenChange={setIsControlsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader>
                <SheetTitle>Options</SheetTitle>
              </SheetHeader>
              
              <div className="py-4 space-y-4">
                {/* Modes de vue */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Mode d'affichage</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => { setViewMode('line'); setIsControlsMenuOpen(false); }}
                      variant={viewMode === 'line' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      <List className="w-4 h-4 mr-2" />
                      Ligne
                    </Button>
                    <Button
                      onClick={() => { setViewMode('grid'); setIsControlsMenuOpen(false); }}
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Tuiles
                    </Button>
                    <Button
                      onClick={() => { setViewMode('members'); setIsControlsMenuOpen(false); }}
                      variant={viewMode === 'members' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      <Network className="w-4 h-4 mr-2" />
                      Membres
                    </Button>
                  </div>
                </div>

                {/* Expand/Collapse */}
                {(viewMode === 'line' || viewMode === 'grid') && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Sections</h3>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => { expandAll(); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Expand className="w-4 h-4 mr-2" />
                        Tout déplier
                      </Button>
                      <Button 
                        onClick={() => { collapseAll(); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Shrink className="w-4 h-4 mr-2" />
                        Tout replier
                      </Button>
                    </div>
                  </div>
                )}

                {/* Admin actions */}
                {isAdmin && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Administration</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => { handleAddPerson(); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Ajouter une personne
                      </Button>
                      <Button
                        onClick={() => { handleAddSection(); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Ajouter une section
                      </Button>
                      <Button
                        onClick={() => { handleAddVacantPosition(); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Ajouter un poste vacant
                      </Button>
                      <Button
                        onClick={() => { setIsImportOpen(true); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Importer bénévoles
                      </Button>
                      <Button
                        onClick={() => { setIsNameCorrectionOpen(true); setIsControlsMenuOpen(false); }}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Vérifier les noms
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Version desktop/tablette : layout normal */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-secondary/50 px-2 py-1 rounded-md">
                {totalMembers} membres
              </span>
              <Button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setSelectedPerson(null);
                  setIsVacantPositionsSidebarOpen(true);
                }}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                {isAdmin ? 'Postes vacants' : `${getAllVacantPositions().length} postes`}
              </Button>
            </div>
          </div>

        {/* Controls - Desktop */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* View Mode Toggle */}
          <div className="flex gap-1 border border-border rounded-md p-0.5">
            <Button
              type="button"
              onClick={() => setViewMode('line')}
              variant={viewMode === 'line' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
            >
              <List className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Ligne</span>
            </Button>
            <Button
              type="button"
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Tuiles</span>
            </Button>
            <Button
              type="button"
              onClick={() => setViewMode('members')}
              variant={viewMode === 'members' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3"
            >
              <Network className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Membres</span>
            </Button>
          </div>

          {/* Expand/Collapse */}
          <Button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); expandAll(); }}
            variant="ghost"
            size="sm"
            className="h-8 px-3"
          >
            <Expand className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Tout déplier</span>
          </Button>
          
          <Button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); collapseAll(); }}
            variant="ghost"
            size="sm"
            className="h-8 px-3"
          >
            <Shrink className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Tout replier</span>
          </Button>

          {isAdmin && (
            <>
              <Button
                onClick={handleAddPerson}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Ajouter personne</span>
              </Button>
              
              <Button
                onClick={handleAddSection}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <FolderPlus className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Ajouter section</span>
              </Button>
              
              <Button
                onClick={handleAddVacantPosition}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Poste vacant</span>
              </Button>
              
              <Button
                onClick={() => setIsImportOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Importer</span>
              </Button>
              
              <Button
                onClick={() => setIsNameCorrectionOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">Vérifier noms</span>
              </Button>
            </>
          )}
        </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="w-3 h-3 text-accent" />
            <span className="font-medium text-accent">Mode Administrateur</span>
            <span className="text-xs text-muted-foreground">• Cliquez sur les icônes d'édition</span>
          </div>
        </div>
      )}

      {/* Sections ou Vue membres */}
      {viewMode === 'members' ? (
        <MembersGrid
          sections={data.sections}
          people={data.people}
          isAdmin={isAdmin}
          onEdit={handleEditPerson}
        />
      ) : viewMode === 'line' ? (
        <div className="space-y-4">
          {visibleSections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              onToggle={toggleSection}
              onPersonClick={handlePersonClick}
              isAdmin={isAdmin}
              onEditPerson={handleEditPerson}
              onEditVacantPosition={handleEditVacantPosition}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const renderSectionCards = (sections: Section[]): JSX.Element[] => {
              return sections.flatMap(section => {
                const cards = [];
                
                // Carte pour la section principale
                cards.push(
                  <div
                    key={section.id}
                    className="bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
                  >
                    {/* Section content */}
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        // Fermer les autres sidebars et ouvrir le détail de la section
                        setIsSidebarOpen(false);
                        setSelectedPerson(null);
                        setIsVacantPositionsSidebarOpen(false);
                        setSelectedSection(section);
                        setIsSectionDetailsSidebarOpen(true);
                      }}
                    >
                      <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                      <div className="text-sm text-muted-foreground mb-3">
                        {section.members.length} membre{section.members.length > 1 ? 's' : ''}
                        {section.subsections && section.subsections.length > 0 && (
                          <span> • {section.subsections.length} sous-groupe{section.subsections.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {section.members.slice(0, 3).map(member => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded-md text-xs hover:bg-secondary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePersonClick(member);
                            }}
                          >
                            <span>{member.firstName} {member.lastName}</span>
                          </div>
                        ))}
                        {section.members.length > 3 && (
                          <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
                            +{section.members.length - 3} autres
                          </div>
                        )}
                      </div>
                      {section.vacantPositions && section.vacantPositions.length > 0 && (
                        <div className="mt-3 text-xs text-primary">
                          {section.vacantPositions.length} poste{section.vacantPositions.length > 1 ? 's' : ''} vacant{section.vacantPositions.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Admin visibility toggle button */}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionVisibility(section.id, section.isHidden || false);
                        }}
                      >
                        {section.isHidden ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}

                    {/* Hidden indicator for admins */}
                    {isAdmin && section.isHidden && (
                      <div className="absolute top-2 left-2 bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                        Cachée
                      </div>
                    )}
                  </div>
                );
                
                // Ajouter les sous-sections récursivement
                if (section.subsections && section.subsections.length > 0) {
                  cards.push(...renderSectionCards(section.subsections));
                }
                
                return cards;
              });
            };
            
            return renderSectionCards(visibleSections);
          })()}
        </div>
      )}

      </div>

      {/* Sidebar */}
      <PersonSidebar
        person={selectedPerson}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        isAdmin={isAdmin}
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

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <VolunteerImportManager
            sections={data.sections}
            onImportComplete={() => {
              setIsImportOpen(false);
              refetch();
              toast.success("Bénévoles importés avec succès");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isNameCorrectionOpen} onOpenChange={setIsNameCorrectionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <NameCorrectionTool />
        </DialogContent>
      </Dialog>

      <VacantPositionsSidebar
        isOpen={isVacantPositionsSidebarOpen}
        onClose={() => setIsVacantPositionsSidebarOpen(false)}
        positions={getAllVacantPositions()}
        onPositionClick={navigateToVacantPosition}
      />

      <SectionDetailsSidebar
        section={selectedSection}
        isOpen={isSectionDetailsSidebarOpen}
        onClose={() => {
          setIsSectionDetailsSidebarOpen(false);
          setSelectedSection(null);
        }}
        onPersonClick={handlePersonClick}
        isAdmin={isAdmin}
        onEditPerson={handleEditPerson}
      />
    </div>
  );
};