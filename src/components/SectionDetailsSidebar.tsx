import React from 'react';
import { Section, Person } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { X, Users, FolderTree, Briefcase, ChevronRight, Star, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Project } from '@/pages/Projects';

interface SectionDetailsSidebarProps {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onPersonClick: (person: Person) => void;
  isAdmin: boolean;
  onEditPerson?: (person: Person) => void;
}

interface PersonDetails {
  competences: string[] | null;
  email: string | null;
  phone: string | null;
  adresse: string | null;
  date_entree: string | null;
  embeds: any[] | null;
  experience: string | null;
  formation: string | null;
  langues: string[] | null;
  hobbies: string | null;
  specialite: string | null;
}

const PersonInfoSkeleton = () => (
  <div className="space-y-4">
    <div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export const SectionDetailsSidebar: React.FC<SectionDetailsSidebarProps> = ({
  section,
  isOpen,
  onClose,
  onPersonClick,
  isAdmin,
  onEditPerson
}) => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Person | null>(null);
  const [personDetails, setPersonDetails] = React.useState<PersonDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

  React.useEffect(() => {
    if (section && isOpen) {
      setLoading(true);
      setSelectedMember(null);
      setPersonDetails(null);
      supabase
        .from('projects')
        .select('*')
        .eq('section_id', section.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setProjects(data.map(p => ({
              ...p,
              documents: (p.documents as any) || [],
              approval_status: (p.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
            })));
          }
          setLoading(false);
        });
    }
  }, [section, isOpen]);

  // Charger les détails complets du membre sélectionné
  React.useEffect(() => {
    if (selectedMember && isOpen) {
      setIsLoadingDetails(true);
      supabase.rpc('get_people_detailed')
        .then(({ data, error }) => {
          if (!error && data) {
            const fullPerson = data.find((p: any) => p.id === selectedMember.id);
            if (fullPerson) {
              setPersonDetails({
                competences: fullPerson.competences,
                email: fullPerson.email,
                phone: fullPerson.phone,
                adresse: fullPerson.adresse,
                date_entree: fullPerson.date_entree,
                embeds: fullPerson.embeds as any[],
                experience: fullPerson.experience,
                formation: fullPerson.formation,
                langues: fullPerson.langues,
                hobbies: fullPerson.hobbies,
                specialite: fullPerson.specialite,
              });
            }
          }
          setIsLoadingDetails(false);
        });
    } else {
      setPersonDetails(null);
    }
  }, [selectedMember, isOpen]);

  const handleMemberClick = (person: Person) => {
    setSelectedMember(person);
  };

  const handleBackToSection = () => {
    setSelectedMember(null);
    setPersonDetails(null);
  };

  if (!isOpen || !section) return null;

  const getAllSubsectionMembers = (sec: Section): Person[] => {
    let members = [...sec.members];
    if (sec.subsections) {
      sec.subsections.forEach(sub => {
        members = [...members, ...getAllSubsectionMembers(sub)];
      });
    }
    return members;
  };

  const allMembers = getAllSubsectionMembers(section);

  // Si un membre est sélectionné, afficher ses détails
  if (selectedMember) {
    return (
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header avec bouton retour */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSection}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Retour au groupe
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {selectedMember.photo && (
                <img
                  src={selectedMember.photo}
                  alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                {selectedMember.role && (
                  <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {selectedMember.description && (
                <div>
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.description}</p>
                </div>
              )}

              {isLoadingDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement des détails...
                  </div>
                  <PersonInfoSkeleton />
                </div>
              ) : (
                <>
                  {(personDetails?.email || selectedMember.email) && (
                    <div>
                      <h3 className="font-semibold mb-2">Contact</h3>
                      <p className="text-sm text-muted-foreground">{personDetails?.email || selectedMember.email}</p>
                      {(personDetails?.phone || selectedMember.phone) && (
                        <p className="text-sm text-muted-foreground mt-1">{personDetails?.phone || selectedMember.phone}</p>
                      )}
                    </div>
                  )}

                  {((personDetails?.competences && personDetails.competences.length > 0) || 
                    (selectedMember.competences && selectedMember.competences.length > 0)) && (
                    <div>
                      <h3 className="font-semibold mb-2">Compétences</h3>
                      <div className="flex flex-wrap gap-2">
                        {(personDetails?.competences || selectedMember.competences || []).map((comp, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {personDetails?.experience && (
                    <div>
                      <h3 className="font-semibold mb-2">Expérience</h3>
                      <p className="text-sm text-muted-foreground">{personDetails.experience}</p>
                    </div>
                  )}

                  {personDetails?.formation && (
                    <div>
                      <h3 className="font-semibold mb-2">Formation</h3>
                      <p className="text-sm text-muted-foreground">{personDetails.formation}</p>
                    </div>
                  )}

                  {personDetails?.langues && personDetails.langues.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Langues</h3>
                      <div className="flex flex-wrap gap-2">
                        {personDetails.langues.map((lang, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {personDetails?.specialite && (
                    <div>
                      <h3 className="font-semibold mb-2">Spécialité</h3>
                      <p className="text-sm text-muted-foreground">{personDetails.specialite}</p>
                    </div>
                  )}
                </>
              )}

              {selectedMember.linkedin && (
                <div>
                  <h3 className="font-semibold mb-2">Réseaux</h3>
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}

              {isAdmin && onEditPerson && (
                <Button
                  onClick={() => onEditPerson(selectedMember)}
                  variant="outline"
                  className="w-full"
                >
                  Modifier
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Vue du groupe par défaut
  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                {section.leader && (
                  <span className="text-xs font-semibold flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    {section.leader.firstName} {section.leader.lastName}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Membres */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">
                  Membres ({allMembers.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allMembers.map(person => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onClick={handleMemberClick}
                    isAdmin={isAdmin}
                    onEdit={onEditPerson}
                    compact={true}
                  />
                ))}
                {allMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun membre</p>
                )}
              </div>
            </div>

            {/* Sous-groupes */}
            {section.subsections && section.subsections.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderTree className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">
                    Sous-groupes ({section.subsections.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {section.subsections.map(subsection => {
                    const subsectionMembers = getAllSubsectionMembers(subsection);
                    return (
                      <div
                        key={subsection.id}
                        onClick={() => {
                          // Ouvrir les détails du sous-groupe en remplaçant la section actuelle
                          onClose();
                          setTimeout(() => {
                            const sectionClickEvent = new CustomEvent('section-click', { detail: subsection });
                            window.dispatchEvent(sectionClickEvent);
                          }, 100);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{subsection.title}</h4>
                            {subsection.leader && (
                              <span className="text-[10px] font-bold flex items-center gap-0.5 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm">
                                <Star className="w-2 h-2 fill-current" />
                                {subsection.leader.firstName} {subsection.leader.lastName}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {subsectionMembers.length} membre{subsectionMembers.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projets */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">
                  Projets ({projects.length})
                </h3>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{project.title}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            project.status === 'completed'
                              ? 'bg-muted/70 text-foreground border border-border font-medium'
                              : project.status === 'in_progress'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {project.status === 'completed'
                            ? 'Terminé'
                            : project.status === 'in_progress'
                            ? 'En cours'
                            : 'Planifié'}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun projet</p>
              )}
            </div>

            {/* Informations de la commission */}
            {section.vacantPositions && section.vacantPositions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">
                    Postes vacants ({section.vacantPositions.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {section.vacantPositions.map(position => (
                    <div
                      key={position.id}
                      className="p-3 border border-dashed border-primary/50 rounded-lg bg-primary/5"
                    >
                      <h4 className="font-medium text-sm text-primary">{position.title}</h4>
                      {position.description && (
                        <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
