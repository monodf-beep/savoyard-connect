import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganigrammeData, Person, Section, JobPosting, VacantPosition } from '@/types/organigramme';
import { toast } from 'sonner';

export const useOrganigramme = (isAdmin: boolean = false) => {
  const [data, setData] = useState<OrganigrammeData>({
    sections: [],
    people: [],
    jobPostings: []
  });
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  const loadData = async () => {
    try {
      if (import.meta.env.DEV) console.log('Début du chargement des données...');
      setLoading(true);
      
      // Charger les sections
      if (import.meta.env.DEV) console.log('Chargement des sections...');
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (sectionsError) {
        if (import.meta.env.DEV) console.error('Sections load error:', sectionsError);
        toast.error('Erreur lors du chargement des sections');
        setLoading(false);
        return;
      }

      // Charger les personnes - utilisez les fonctions sécurisées
      let peopleData: any[] = [];
      try {
        if (isAdmin) {
          const result = await supabase.rpc('get_people_with_details');
          if (result.error) throw result.error;
          peopleData = result.data || [];
        } else {
          const result = await supabase.rpc('people_public_fn');
          if (result.error) throw result.error;
          peopleData = result.data || [];
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error('People load error:', e);
        peopleData = [];
      }
      
      // Charger les liaisons section-membres
      let sectionMembersData: any[] = [];
      try {
        const { data: smd, error: sectionMembersError } = await supabase
          .from('section_members')
          .select('*');
        if (sectionMembersError) throw sectionMembersError;
        sectionMembersData = smd || [];
      } catch (e) {
        if (import.meta.env.DEV) console.error('Section members load error:', e);
        sectionMembersData = [];
      }

      // Charger les offres d'emploi
      let jobsData: any[] = [];
      try {
        const { data: jd, error: jobsError } = await supabase
          .from('job_postings')
          .select('*')
          .order('created_at');
        if (jobsError) throw jobsError;
        jobsData = jd || [];
      } catch (e) {
        if (import.meta.env.DEV) console.error('Job postings load error:', e);
        jobsData = [];
      }

      // Charger les postes vacants
      let vacantPositionsData: any[] = [];
      try {
        const { data: vpd, error: vacantPositionsError } = await supabase
          .from('vacant_positions')
          .select('*')
          .order('created_at');
        if (vacantPositionsError) throw vacantPositionsError;
        vacantPositionsData = vpd || [];
      } catch (e) {
        if (import.meta.env.DEV) console.error('Vacant positions load error:', e);
        vacantPositionsData = [];
      }


      // Construire la hiérarchie des sections
      const buildSectionHierarchy = (sections: any[], parentId: string | null = null): Section[] => {
        return sections
          .filter(section => section.parent_id === parentId)
          .map(section => {
            const sectionMembers = sectionMembersData?.filter(sm => sm.section_id === section.id) || [];
            const members = sectionMembers.map(sm => {
              const person = peopleData?.find(p => p.id === sm.person_id);
              return person ? {
                id: person.id,
                firstName: person.first_name,
                lastName: person.last_name,
                photo: person.avatar_url || '',
                role: sm.role || person.title || '',
                description: person.bio || '',
                sectionId: section.id,
                email: person.email || '',
                phone: person.phone || '',
                linkedin: person.linkedin || '',
                formation: '',
                experience: '',
                competences: person.competences || [],
                dateEntree: person.date_entree || '',
                adresse: person.adresse || '',
                specialite: '',
                langues: [],
                hobbies: ''
              } : null;
            }).filter(Boolean) as Person[];

            // Trouver le responsable de la section
            const leaderPerson = section.leader_id 
              ? peopleData?.find(p => p.id === section.leader_id)
              : null;
            
            const leader = leaderPerson ? {
              id: leaderPerson.id,
              firstName: leaderPerson.first_name,
              lastName: leaderPerson.last_name,
              photo: leaderPerson.avatar_url || '',
              role: leaderPerson.title || '',
              description: leaderPerson.bio || '',
              sectionId: section.id,
              email: leaderPerson.email || '',
              phone: leaderPerson.phone || '',
              linkedin: leaderPerson.linkedin || '',
              formation: '',
              experience: '',
              competences: leaderPerson.competences || [],
              dateEntree: leaderPerson.date_entree || '',
              adresse: leaderPerson.adresse || '',
              specialite: '',
              langues: [],
              hobbies: ''
            } : undefined;

            return {
              id: section.id,
              title: section.title,
              type: 'bureau' as const,
              isExpanded: section.is_expanded,
              isHidden: section.is_hidden || false,
              parentId: section.parent_id,
              displayOrder: section.display_order,
              members: members as Person[],
              leader,
              vacantPositions: vacantPositionsData?.filter(vp => vp.section_id === section.id).map(vp => ({
                id: vp.id,
                sectionId: vp.section_id,
                title: vp.title,
                description: vp.description,
                externalLink: vp.external_link
              })) || [],
              subsections: buildSectionHierarchy(sections, section.id)
            };
          });
      };

      const formattedSections = buildSectionHierarchy(sectionsData || []);
      const formattedPeople = peopleData?.map(person => ({
        id: person.id,
        firstName: person.first_name,
        lastName: person.last_name,
        photo: person.avatar_url || '',
        role: person.title || '',
        description: person.bio || '',
        email: person.email || '',
        phone: person.phone || '',
        linkedin: person.linkedin || '',
        formation: '',
        experience: '',
        competences: person.competences || [],
        dateEntree: person.date_entree || '',
        adresse: person.adresse || '',
        specialite: '',
        langues: [],
        hobbies: ''
      })) || [];
      const formattedJobs = jobsData?.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department || '',
        description: job.description || '',
        requirements: job.requirements || [],
        location: job.location || '',
        type: (job.type || 'CDI') as 'CDI' | 'CDD' | 'Stage' | 'Freelance',
        applicationUrl: '',
        publishedDate: job.created_at || '',
        isActive: job.status === 'active'
      })) || [];

      if (import.meta.env.DEV) console.log('Formatage terminé, mise à jour de l\'état...');
      setData({
        sections: formattedSections,
        people: formattedPeople,
        jobPostings: formattedJobs
      });
      if (import.meta.env.DEV) console.log('État mis à jour avec:', { sectionsCount: formattedSections.length, peopleCount: formattedPeople.length });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une personne
  const savePerson = async (person: Person) => {
    try {
      if (import.meta.env.DEV) console.log('Sauvegarde de la personne:', person);
      
      const { data: savedPerson, error } = await supabase
        .from('people')
        .upsert({
          id: person.id,
          first_name: person.firstName,
          last_name: person.lastName || '',
          title: person.role || null,
          bio: person.description || null,
          avatar_url: person.photo || null,
          email: person.email || null,
          phone: person.phone || null,
          linkedin: person.linkedin || null,
          adresse: person.adresse || null,
          competences: person.competences && person.competences.length > 0 ? person.competences : null,
          date_entree: person.dateEntree && person.dateEntree !== '' ? person.dateEntree : null
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (import.meta.env.DEV) console.log('Personne sauvegardée:', savedPerson);
      toast.success('Personne sauvegardée avec succès');
      
      // Recharger les données et vérifier qu'elles sont bien mises à jour
      if (import.meta.env.DEV) console.log('Rechargement des données...');
      await loadData();
      if (import.meta.env.DEV) console.log('Données rechargées');
      return savedPerson;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  };

  // Supprimer une personne
  const deletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      toast.success('Personne supprimée avec succès');
      await loadData(); // Recharger les données
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  // Sauvegarder une section
  const saveSection = async (section: Omit<Section, 'members' | 'subsections'>) => {
    try {
      const { data: savedSection, error } = await supabase
        .from('sections')
        .upsert({
          id: section.id,
          title: section.title,
          is_expanded: section.isExpanded,
          parent_id: section.parentId || null,
          display_order: section.displayOrder ?? 0
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast.success('Section sauvegardée avec succès');
      await loadData(); // Recharger les données
      return savedSection;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  };

  // Supprimer une section
  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      toast.success('Section supprimée avec succès');
      await loadData(); // Recharger les données
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  // Mettre à jour l'état d'expansion d'une section
  const updateSectionExpansion = async (sectionId: string, isExpanded: boolean) => {
    try {
      // Mettre à jour la base de données
      const { error } = await supabase
        .from('sections')
        .update({ is_expanded: isExpanded })
        .eq('id', sectionId);

      if (error) throw error;
      
      // Mettre à jour l'état local immédiatement sans recharger toutes les données
      const updateSectionInState = (sections: Section[]): Section[] => {
        return sections.map(section => {
          if (section.id === sectionId) {
            return { ...section, isExpanded };
          }
          if (section.subsections) {
            return { ...section, subsections: updateSectionInState(section.subsections) };
          }
          return section;
        });
      };

      setData(prevData => ({
        ...prevData,
        sections: updateSectionInState(prevData.sections)
      }));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Sauvegarder un poste vacant
  const saveVacantPosition = async (position: Omit<VacantPosition, 'id'>) => {
    try {
      const { data: savedPosition, error } = await supabase
        .from('vacant_positions')
        .insert({
          section_id: position.sectionId,
          title: position.title,
          description: position.description,
          external_link: position.externalLink
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast.success('Poste vacant créé avec succès');
      await loadData(); // Recharger les données
      return savedPosition;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    }
  };

  // Mettre à jour un poste vacant
  const updateVacantPosition = async (positionId: string, position: Omit<VacantPosition, 'id'>) => {
    try {
      const { data: updatedPosition, error } = await supabase
        .from('vacant_positions')
        .update({
          section_id: position.sectionId,
          title: position.title,
          description: position.description,
          external_link: position.externalLink
        })
        .eq('id', positionId)
        .select()
        .maybeSingle();

      if (error) throw error;

      toast.success('Poste vacant modifié avec succès');
      await loadData(); // Recharger les données
      return updatedPosition;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
      throw error;
    }
  };

  // Supprimer un poste vacant
  const deleteVacantPosition = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('vacant_positions')
        .delete()
        .eq('id', positionId);

      if (error) throw error;

      toast.success('Poste vacant supprimé avec succès');
      await loadData(); // Recharger les données
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Écouter les événements de succès de l'assistant IA pour rafraîchir automatiquement
  useEffect(() => {
    const handleAISuccess = () => {
      loadData();
    };

    window.addEventListener('aiAssistantSuccess', handleAISuccess);
    return () => {
      window.removeEventListener('aiAssistantSuccess', handleAISuccess);
    };
  }, []);

  return {
    data,
    loading,
    savePerson,
    deletePerson,
    saveSection,
    deleteSection,
    updateSectionExpansion,
    saveVacantPosition,
    updateVacantPosition,
    deleteVacantPosition,
    refetch: loadData
  };
};