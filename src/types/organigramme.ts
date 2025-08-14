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
}

export interface AdminMode {
  isActive: boolean;
  selectedPerson?: Person;
  selectedSection?: Section;
}