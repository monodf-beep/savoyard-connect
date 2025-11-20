export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  role?: string;
  missions?: string[];
  missionDescription?: string;
  linkedin?: string;
  instagram?: string;
  description?: string;
  sectionId?: string;
  // Nouvelles informations détaillées
  email?: string;
  phone?: string;
  formation?: string;
  experience?: string;
  competences?: string[];
  dateEntree?: string;
  adresse?: string;
  specialite?: string;
  langues?: string[];
  hobbies?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  applicationUrl: string;
  publishedDate: string;
  isActive: boolean;
}

export interface VacantPosition {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  externalLink?: string;
}

export interface Section {
  id: string;
  title: string;
  type: 'bureau' | 'conseil' | 'commission' | 'groupe';
  isExpanded: boolean;
  isHidden?: boolean;
  parentId?: string | null;
  displayOrder?: number;
  subsections?: Section[];
  members: Person[];
  vacantPositions?: VacantPosition[];
  leader?: Person;
}

export interface OrganigrammeData {
  sections: Section[];
  people: Person[];
  jobPostings: JobPosting[];
}

export interface AdminMode {
  isActive: boolean;
  selectedPerson?: Person;
  selectedSection?: Section;
  selectedJobPosting?: JobPosting;
}