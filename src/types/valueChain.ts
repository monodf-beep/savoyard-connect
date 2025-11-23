import { Person, Section } from './organigramme';

export interface ValueChain {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  segments?: ValueChainSegment[];
  approval_status?: 'pending' | 'approved' | 'rejected';
  created_by?: string;
  approved_by?: string;
}

export interface ValueChainSegment {
  id: string;
  value_chain_id: string;
  function_name: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  actors?: Person[];
  sections?: Section[];
}

export interface SegmentActor {
  id: string;
  segment_id: string;
  person_id: string;
  created_at?: string;
}

export interface SegmentSection {
  id: string;
  segment_id: string;
  section_id: string;
  created_at?: string;
}
