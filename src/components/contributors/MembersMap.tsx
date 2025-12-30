import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Heart, GraduationCap } from 'lucide-react';

interface LocationData {
  city: string;
  members: number;
  donors: number;
  learners: number;
  lat: number;
  lng: number;
}

interface MembersMapProps {
  members: Array<{ city?: string | null }>;
  donors: Array<{ city?: string | null }>;
  learners: Array<{ adresse?: string | null }>;
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
  'rennes': [-1.6778, 48.1173],
  'reims': [4.0317, 49.2583],
  'saint-etienne': [4.3872, 45.4397],
  'toulon': [5.9280, 43.1242],
  'le havre': [0.1079, 49.4944],
  'dijon': [5.0415, 47.3220],
  'nîmes': [4.3601, 43.8367],
  'aix-en-provence': [5.4474, 43.5297],
  'clermont-ferrand': [3.0863, 45.7772],
  'brest': [-4.4860, 48.3904],
  'tours': [0.6848, 47.3941],
  'amiens': [2.2957, 49.8942],
  'limoges': [1.2611, 45.8336],
  'perpignan': [2.8954, 42.6887],
  'besançon': [6.0243, 47.2378],
  'orléans': [1.9039, 47.9029],
  'rouen': [1.0993, 49.4432],
  'mulhouse': [7.3389, 47.7508],
  'caen': [-0.3707, 49.1829],
  'nancy': [6.1844, 48.6921],
  'argenteuil': [2.2469, 48.9472],
  'saint-denis': [2.3569, 48.9362],
  'montreuil': [2.4489, 48.8637],
  'la rochelle': [-1.1508, 46.1603],
};

// Extract city from address string
function extractCityFromAddress(address: string): string | null {
  const normalized = address.toLowerCase().trim();
  
  // Check if any known city is in the address
  for (const city of Object.keys(CITY_COORDS)) {
    if (normalized.includes(city)) {
      return city;
    }
  }
  
  // Try to extract last word as city (common format: "123 rue X, 74000 Annecy")
  const parts = normalized.split(/[,\s]+/);
  const lastWord = parts[parts.length - 1];
  if (lastWord && CITY_COORDS[lastWord]) {
    return lastWord;
  }
  
  return null;
}

export default function MembersMap({ members, donors, learners, mapboxToken }: MembersMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    // Aggregate data by city
    const cityData: Record<string, { members: number; donors: number; learners: number }> = {};

    // Count members
    members.forEach((m) => {
      if (m.city) {
        const city = m.city.toLowerCase().trim();
        if (!cityData[city]) cityData[city] = { members: 0, donors: 0, learners: 0 };
        cityData[city].members++;
      }
    });

    // Count donors (try to extract city if available, for now we just track totals)
    donors.forEach((d) => {
      if (d.city) {
        const city = d.city.toLowerCase().trim();
        if (!cityData[city]) cityData[city] = { members: 0, donors: 0, learners: 0 };
        cityData[city].donors++;
      }
    });

    // Count learners (from address field)
    learners.forEach((l) => {
      if (l.adresse) {
        const city = extractCityFromAddress(l.adresse);
        if (city) {
          if (!cityData[city]) cityData[city] = { members: 0, donors: 0, learners: 0 };
          cityData[city].learners++;
        }
      }
    });

    // Convert to locations with coordinates
    const locs: LocationData[] = [];
    Object.entries(cityData).forEach(([city, counts]) => {
      const coords = CITY_COORDS[city];
      if (coords) {
        locs.push({ 
          city, 
          members: counts.members, 
          donors: counts.donors, 
          learners: counts.learners,
          lng: coords[0], 
          lat: coords[1] 
        });
      }
    });
    setLocations(locs);
  }, [members, donors, learners]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Clean up previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Only remove previous map if it exists and has a container
    if (map.current) {
      try {
        map.current.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      map.current = null;
    }

    mapboxgl.accessToken = mapboxToken;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [5.9, 45.8], // Center on Savoie
      zoom: 7,
    });

    map.current = newMap;

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      // Add markers for each location
      locations.forEach((loc) => {
        const total = loc.members + loc.donors + loc.learners;
        if (total === 0) return;

        const el = document.createElement('div');
        el.className = 'community-marker';
        
        // Create a multi-color marker showing all categories
        const size = Math.min(48, 28 + total * 2);
        
        el.innerHTML = `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: conic-gradient(
                hsl(142, 76%, 36%) 0deg ${loc.members ? (loc.members / total) * 360 : 0}deg,
                hsl(0, 84%, 60%) ${loc.members ? (loc.members / total) * 360 : 0}deg ${loc.members ? (loc.members / total) * 360 : 0 + (loc.donors ? (loc.donors / total) * 360 : 0)}deg,
                hsl(221, 83%, 53%) ${loc.members ? (loc.members / total) * 360 : 0 + (loc.donors ? (loc.donors / total) * 360 : 0)}deg 360deg
              );
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              inset: 4px;
              border-radius: 50%;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: ${size > 36 ? '14px' : '11px'};
              color: #333;
            ">${total}</div>
          </div>
        `;

        const popupContent = `
          <div style="padding: 12px; min-width: 150px;">
            <strong style="text-transform: capitalize; font-size: 14px; display: block; margin-bottom: 8px;">${loc.city}</strong>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${loc.members > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: hsl(142, 76%, 36%);"></span>
                <span>${loc.members} membre${loc.members > 1 ? 's' : ''}</span>
              </div>` : ''}
              ${loc.donors > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: hsl(0, 84%, 60%);"></span>
                <span>${loc.donors} donateur${loc.donors > 1 ? 's' : ''}</span>
              </div>` : ''}
              ${loc.learners > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: hsl(221, 83%, 53%);"></span>
                <span>${loc.learners} apprenant${loc.learners > 1 ? 's' : ''}</span>
              </div>` : ''}
            </div>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    });

    return () => {
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      markersRef.current = [];
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        map.current = null;
      }
    };
  }, [mapboxToken, locations]);

  const totalMembers = locations.reduce((sum, l) => sum + l.members, 0);
  const totalDonors = locations.reduce((sum, l) => sum + l.donors, 0);
  const totalLearners = locations.reduce((sum, l) => sum + l.learners, 0);
  const totalCities = locations.length;

  if (!mapboxToken) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Carte de la Communauté
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
            Carte de la Communauté
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">
              <Users className="w-3 h-3 mr-1" />
              {totalMembers} membres
            </Badge>
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-200">
              <Heart className="w-3 h-3 mr-1" />
              {totalDonors} donateurs
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-200">
              <GraduationCap className="w-3 h-3 mr-1" />
              {totalLearners} apprenants
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {totalCities} villes
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
