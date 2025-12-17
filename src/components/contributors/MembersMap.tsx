import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface MemberLocation {
  city: string;
  count: number;
  lat: number;
  lng: number;
}

interface MembersMapProps {
  members: Array<{ city?: string | null }>;
  mapboxToken: string;
}

// City coordinates for common French cities
const CITY_COORDS: Record<string, [number, number]> = {
  'paris': [2.3522, 48.8566],
  'lyon': [4.8357, 45.7640],
  'marseille': [5.3698, 43.2965],
  'toulouse': [1.4442, 43.6047],
  'nice': [7.2620, 43.7102],
  'nantes': [1.5534, 47.2184],
  'strasbourg': [7.7521, 48.5734],
  'montpellier': [3.8767, 43.6108],
  'bordeaux': [0.5792, 44.8378],
  'lille': [3.0573, 50.6292],
  'grenoble': [5.7245, 45.1885],
  'annecy': [6.1296, 45.8992],
  'chambéry': [5.9120, 45.5646],
  'chambery': [5.9120, 45.5646],
  'aix-les-bains': [5.9089, 45.6881],
  'albertville': [6.3928, 45.6755],
  'thonon-les-bains': [6.4798, 46.3706],
  'annemasse': [6.2340, 46.1946],
  'cluses': [6.5795, 46.0608],
  'sallanches': [6.6320, 45.9359],
  'chamonix': [6.8694, 45.9237],
  'habère-lullin': [6.4601, 46.2312],
  'habere-lullin': [6.4601, 46.2312],
  'evian-les-bains': [6.5895, 46.4009],
  'megève': [6.6176, 45.8568],
  'megeve': [6.6176, 45.8568],
  'morzine': [6.7091, 46.1785],
  'les gets': [6.6666, 46.1560],
  'la clusaz': [6.4239, 45.9043],
  'saint-gervais': [6.7117, 45.8920],
};

export default function MembersMap({ members, mapboxToken }: MembersMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<MemberLocation[]>([]);

  useEffect(() => {
    // Aggregate members by city
    const cityCount: Record<string, number> = {};
    members.forEach((m) => {
      if (m.city) {
        const city = m.city.toLowerCase().trim();
        cityCount[city] = (cityCount[city] || 0) + 1;
      }
    });

    // Convert to locations with coordinates
    const locs: MemberLocation[] = [];
    Object.entries(cityCount).forEach(([city, count]) => {
      const coords = CITY_COORDS[city];
      if (coords) {
        locs.push({ city, count, lng: coords[0], lat: coords[1] });
      }
    });
    setLocations(locs);
  }, [members]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || locations.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [5.9, 45.8], // Center on Savoie
      zoom: 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each location
    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'member-marker';
      el.innerHTML = `
        <div style="
          background: hsl(var(--primary));
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${loc.count}</div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong style="text-transform: capitalize;">${loc.city}</strong><br/>
            ${loc.count} membre${loc.count > 1 ? 's' : ''}
          </div>
        `))
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, locations]);

  const totalCities = locations.length;
  const totalMembers = locations.reduce((sum, l) => sum + l.count, 0);

  if (!mapboxToken) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Carte des Membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Configurez le token Mapbox dans les paramètres pour afficher la carte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Carte des Membres
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {totalMembers} membres · {totalCities} villes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="h-[300px] md:h-[400px] rounded-b-lg" />
      </CardContent>
    </Card>
  );
}
