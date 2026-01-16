import { LucideIcon } from 'lucide-react';

export interface Expert {
  id: string;
  slug: string;
  name: string;
  role: string;
  iconType: 'laptop' | 'scale' | 'palette' | 'euro' | 'languages';
  mainExpertises: string[];
  fullExpertises: string[];
  bio: {
    fr: string;
    it: string;
  };
  marketRate: number;
  memberRate: number;
  discount: number;
  avatarUrl?: string;
}

export interface ExpertContactForm {
  name: string;
  email: string;
  association: string;
  needType: string;
  message: string;
  acceptContact: boolean;
}
