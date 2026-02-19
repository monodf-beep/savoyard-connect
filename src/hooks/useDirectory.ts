import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryAssociation } from '@/types/directory';

interface UseDirectoryOptions {
  silo?: string;
  searchQuery?: string;
}

export function useDirectory(options: UseDirectoryOptions = {}) {
  const { silo, searchQuery = '' } = options;

  return useQuery({
    queryKey: ['directory', silo, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('associations')
        .select('id, name, description, logo_url, primary_zone, secondary_zone, silo, city, latitude, longitude, linkedin_url, instagram_url, created_at')
        .eq('is_public', true)
        .eq('is_active', true);

      if (silo && silo !== 'all') {
        query = query.eq('silo', silo);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return (data || []) as DirectoryAssociation[];
    },
  });
}

export function useUserGeolocation() {
  return useQuery({
    queryKey: ['user-geolocation'],
    queryFn: async () => {
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            resolve(null);
          },
          { timeout: 10000 }
        );
      });
    },
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

export function useCrossBorderSuggestions(userAssociationSilo?: string | null, userAssociationZone?: string | null) {
  return useQuery({
    queryKey: ['cross-border-suggestions', userAssociationSilo, userAssociationZone],
    queryFn: async () => {
      if (!userAssociationSilo || !userAssociationZone) return [];

      const { data: zones } = await import('@/types/directory').then(m => {
        const userZoneInfo = m.GEOGRAPHIC_ZONES.find(z => z.id === userAssociationZone);
        return { data: userZoneInfo };
      });

      if (!zones) return [];

      const userCountry = zones.country;

      let query = supabase
        .from('associations')
        .select('id, name, description, logo_url, primary_zone, secondary_zone, silo, city, latitude, longitude, linkedin_url, instagram_url, created_at')
        .eq('is_public', true)
        .eq('is_active', true)
        .eq('silo', userAssociationSilo)
        .limit(4);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter client-side to get associations from a different country
      const { GEOGRAPHIC_ZONES } = await import('@/types/directory');
      const suggestions = (data || []).filter(assoc => {
        const assocZone = GEOGRAPHIC_ZONES.find(z => z.id === assoc.primary_zone);
        return assocZone && assocZone.country !== userCountry;
      });

      return suggestions.slice(0, 4) as DirectoryAssociation[];
    },
    enabled: !!userAssociationSilo && !!userAssociationZone,
  });
}
