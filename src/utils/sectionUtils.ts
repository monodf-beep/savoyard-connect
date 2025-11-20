import { Section } from '@/types/organigramme';

//Fonction utilitaire pour trouver une section par ID dans la hiérarchie
export const findSectionById = (sections: Section[], id: string): Section | null => {
  for (const section of sections) {
    if (section.id === id) return section;
    if (section.subsections) {
      const found = findSectionById(section.subsections, id);
      if (found) return found;
    }
  }
  return null;
};
