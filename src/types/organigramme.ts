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
  sectionId?: string; // Ajouter section_id
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

export interface Section {
  id: string;
  title: string;
  type: 'bureau' | 'conseil' | 'commission' | 'groupe';
  isExpanded: boolean;
  subsections?: Section[];
  members: Person[];
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