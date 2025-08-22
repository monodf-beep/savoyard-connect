import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrganigrammeData, Person, Section, JobPosting } from '@/types/organigramme';
import { toast } from 'sonner';

export const useOrganigramme = () => {
  const [data, setData] = useState<OrganigrammeData>({
    sections: [],
    people: [],
    jobPostings: []
  });
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  const loadData = async () => {
    try {
      console.log('Début du chargement des données...');
      setLoading(true);
      
      // Charger les sections
      console.log('Chargement des sections...');
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('created_at');
      
      if (sectionsError) throw sectionsError;

      // Charger les personnes
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('created_at');
      
      if (peopleError) throw peopleError;

      // Charger les liaisons section-membres
      const { data: sectionMembersData, error: sectionMembersError } = await supabase
        .from('section_members')
        .select('*');
      
      if (sectionMembersError) throw sectionMembersError;

      // Charger les offres d'emploi
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at');
      
      if (jobsError) throw jobsError;

      // Construire la hiérarchie des sections
      const buildSectionHierarchy = (sections: any[], parentId: string | null = null): Section[] => {
        return sections
          .filter(section => section.parent_id === parentId)
          .map(section => {
            // Récupérer les membres de cette section via la table de liaison
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
                sectionId: section.id
              } : null;
            }).filter(Boolean);

            return {
              id: section.id,
              title: section.title,
              type: 'bureau' as const,
              isExpanded: section.is_expanded,
              members: members as Person[],
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
        description: person.bio || ''
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

      console.log('Formatage terminé, mise à jour de l\'état...');
      setData({
        sections: formattedSections,
        people: formattedPeople,
        jobPostings: formattedJobs
      });
      console.log('État mis à jour avec:', { sectionsCount: formattedSections.length, peopleCount: formattedPeople.length });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une personne
  const savePerson = async (person: Person) => {
    try {
      console.log('Sauvegarde de la personne:', person);
      
      const { data: savedPerson, error } = await supabase
        .from('people')
        .upsert({
          id: person.id,
          first_name: person.firstName,
          last_name: person.lastName,
          title: person.role,
          bio: person.description,
          avatar_url: person.photo
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      console.log('Personne sauvegardée:', savedPerson);
      toast.success('Personne sauvegardée avec succès');
      
      // Recharger les données et vérifier qu'elles sont bien mises à jour
      console.log('Rechargement des données...');
      await loadData();
      console.log('Données rechargées');
      return savedPerson;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
      console.error('Erreur lors de la suppression:', error);
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
          is_expanded: section.isExpanded
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast.success('Section sauvegardée avec succès');
      await loadData(); // Recharger les données
      return savedSection;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  // Mettre à jour l'état d'expansion d'une section
  const updateSectionExpansion = async (sectionId: string, isExpanded: boolean) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update({ is_expanded: isExpanded })
        .eq('id', sectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    savePerson,
    deletePerson,
    saveSection,
    deleteSection,
    updateSectionExpansion,
    refetch: loadData
  };
};