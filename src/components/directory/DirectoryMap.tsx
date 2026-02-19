import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinOff, Maximize2, Minimize2 } from 'lucide-react';
import { DirectoryAssociation, SILO_INFO, SiloType } from '@/types/directory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DirectoryMapProps {
  associations: DirectoryAssociation[];
  userLocation?: { lat: number; lng: number } | null;
}

export function DirectoryMap({ associations, userLocation }: DirectoryMapProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'it' ? 'it' : 'fr';
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const { data: mapboxToken } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_settings')
        .select('value')
        .eq('key', 'mapbox_token')
        .single();
      
      const token = data?.value;
      if (typeof token === 'string' && token.startsWith('pk.')) {
        return token;
      }
      return null;
    },
  });

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const assocWithCoords = associations.filter(a => a.latitude && a.longitude);
      let centerLng = 6.8;
      let centerLat = 45.5;
      
      if (assocWithCoords.length > 0) {
        centerLng = assocWithCoords.reduce((sum, a) => sum + (a.longitude || 0), 0) / assocWithCoords.length;
        centerLat = assocWithCoords.reduce((sum, a) => sum + (a.latitude || 0), 0) / assocWithCoords.length;
      }
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [centerLng, centerLat],
        zoom: 7,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, associations]);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    associations.forEach(assoc => {
      if (!assoc.latitude || !assoc.longitude) return;

      const siloInfo = assoc.silo ? SILO_INFO[assoc.silo as SiloType] : null;
      const color = siloInfo?.color || '#6B7280';

      const el = document.createElement('div');
      el.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform';
      el.style.backgroundColor = color;

      const profileLabel = lang === 'it' ? 'Vedi profilo' : 'Voir le profil';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([assoc.longitude, assoc.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <p class="font-semibold text-sm">${assoc.name}</p>
              ${assoc.city ? `<p class="text-xs text-gray-500 mb-2">${assoc.city}</p>` : ''}
              <a href="/annuaire/${assoc.id}" class="text-xs text-blue-600 hover:underline font-medium">${profileLabel} →</a>
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [associations, lang]);

  if (!mapboxToken || mapError) {
    return (
      <Card className="border-border/50 bg-card h-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center h-full">
          <MapPinOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-sm">
            {t('directory.map.unavailable')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border/50 bg-card overflow-hidden transition-all h-full ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      <div className="absolute top-3 left-3 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      <div
        ref={mapContainer}
        className={`w-full ${isExpanded ? 'h-full' : 'h-full min-h-[400px] md:min-h-[500px]'}`}
      />
    </Card>
  );
}
