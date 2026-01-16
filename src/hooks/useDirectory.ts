import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryAssociation, GeographicZone } from '@/types/directory';

interface UseDirectoryOptions {
  zones?: GeographicZone[];
  silo?: string;
  ignoreBorders?: boolean;
  searchQuery?: string;
}

export function useDirectory(options: UseDirectoryOptions = {}) {
  const { zones = [], silo, ignoreBorders = false, searchQuery = '' } = options;

  return useQuery({
    queryKey: ['directory', zones, silo, ignoreBorders, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('associations')
        .select('id, name, description, logo_url, primary_zone, secondary_zone, silo, city, latitude, longitude, linkedin_url, instagram_url, created_at')
        .eq('is_public', true)
        .eq('is_active', true);

      // Apply zone filter if not ignoring borders
      if (!ignoreBorders && zones.length > 0) {
        // Filter by primary or secondary zone
        const zoneFilters = zones.map(z => `primary_zone.eq.${z},secondary_zone.eq.${z}`).join(',');
        query = query.or(zoneFilters);
      }

      // Apply silo filter
      if (silo && silo !== 'all') {
        query = query.eq('silo', silo);
      }

      // Apply search filter
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
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: false,
  });
}
