import React from 'react';
import { Section, Person } from '../types/organigramme';
import { PersonCard } from './PersonCard';
import { X, Users, FolderTree, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
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

  React.useEffect(() => {
    if (section && isOpen) {
      setLoading(true);
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
            })));
          }
          setLoading(false);
        });
    }
  }, [section, isOpen]);

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
              <h2 className="text-2xl font-bold mb-1">{section.title}</h2>
              {section.leader && (
                <p className="text-sm text-muted-foreground">
                  Responsable : {section.leader.firstName} {section.leader.lastName}
                </p>
              )}
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
                    onClick={onPersonClick}
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
                  {section.subsections.map(subsection => (
                    <div
                      key={subsection.id}
                      className="p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{subsection.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {subsection.members.length} membre{subsection.members.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      {subsection.leader && (
                        <p className="text-xs text-muted-foreground">
                          Responsable : {subsection.leader.firstName} {subsection.leader.lastName}
                        </p>
                      )}
                    </div>
                  ))}
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
                              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                              : project.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
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
