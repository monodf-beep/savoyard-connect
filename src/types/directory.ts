export type GeographicZone = 'savoie' | 'vallee-aoste' | 'piemont' | 'alpes-maritimes';

export interface GeographicZoneInfo {
  id: GeographicZone;
  name: {
    fr: string;
    it: string;
  };
  country: 'FR' | 'IT';
  color: string;
  center: [number, number]; // [lng, lat]
}

export const GEOGRAPHIC_ZONES: GeographicZoneInfo[] = [
  {
    id: 'savoie',
    name: { fr: 'Savoie', it: 'Savoia' },
    country: 'FR',
    color: '#0066FF',
    center: [6.3917, 45.5646],
  },
  {
    id: 'vallee-aoste',
    name: { fr: 'Vallée d\'Aoste', it: 'Valle d\'Aosta' },
    country: 'IT',
    color: '#00D084',
    center: [7.3220, 45.7370],
  },
  {
    id: 'piemont',
    name: { fr: 'Piémont', it: 'Piemonte' },
    country: 'IT',
    color: '#FF6B35',
    center: [7.6869, 45.0703],
  },
  {
    id: 'alpes-maritimes',
    name: { fr: 'Alpes-Maritimes', it: 'Alpi Marittime' },
    country: 'FR',
    color: '#9333EA',
    center: [7.2620, 43.7102],
  },
];

export interface DirectoryAssociation {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  primary_zone: GeographicZone | null;
  secondary_zone: GeographicZone | null;
  silo: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  created_at: string;
}

export type SiloType = 'sport' | 'culture' | 'terroir' | 'other';

export const SILO_INFO: Record<SiloType, { labelFr: string; labelIt: string; color: string }> = {
  sport: { labelFr: 'Sport & Montagne', labelIt: 'Sport & Montagna', color: '#0066FF' },
  culture: { labelFr: 'Culture', labelIt: 'Cultura', color: '#9333EA' },
  terroir: { labelFr: 'Terroir', labelIt: 'Territorio', color: '#00D084' },
  other: { labelFr: 'Autre', labelIt: 'Altro', color: '#6B7280' },
};

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
