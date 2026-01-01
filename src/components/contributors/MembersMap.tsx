import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { MapPin, Users, Heart, GraduationCap, UserCheck } from 'lucide-react';

interface LocationData {
  city: string;
  volunteers: number;
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
  volunteers: Array<{ adresse?: string | null }>;
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
  'rumilly': [5.9442, 45.8675],
  'faverges': [6.2942, 45.7467],
  'thônes': [6.3266, 45.8800],
  'thones': [6.3266, 45.8800],
  'seynod': [6.0889, 45.8842],
  'cran-gevrier': [6.1011, 45.9033],
  'meythet': [6.0953, 45.9247],
  'pringy': [6.1203, 45.9506],
  'poisy': [6.0611, 45.9211],
  'epagny': [6.0736, 45.9364],
  'saint-julien-en-genevois': [6.0808, 46.1436],
  'bonneville': [6.4089, 46.0778],
  'la roche-sur-foron': [6.3117, 46.0678],
  'ugine': [6.4175, 45.7547],
  'saint-jean-de-maurienne': [6.3517, 45.2764],
  'modane': [6.6628, 45.1942],
  'bourg-saint-maurice': [6.7703, 45.6175],
  'moutiers': [6.5317, 45.4850],
  'aime': [6.6517, 45.5556],
  'lanslebourg': [6.8778, 45.2847],
  'val-d\'isère': [6.9797, 45.4497],
  'tignes': [6.9000, 45.4697],
  'courchevel': [6.6347, 45.4147],
  'méribel': [6.5656, 45.3969],
  'les arcs': [6.8283, 45.5722],
  'la plagne': [6.7028, 45.5089],
  'avoriaz': [6.7736, 46.1894],
  'flaine': [6.6906, 46.0053],
  'saint-pierre-d\'albigny': [6.1614, 45.5614],
  'montmélian': [6.0442, 45.5033],
  'pontcharra': [6.0194, 45.4331],
  'allevard': [6.0750, 45.3953],
  'la motte-servolex': [5.8764, 45.5958],
  'cognin': [5.8856, 45.5542],
  'jacob-bellecombette': [5.9042, 45.5561],
  'barberaz': [5.9364, 45.5575],
  'bassens': [5.9339, 45.5842],
  'saint-alban-leysse': [5.9561, 45.5819],
  'la ravoire': [5.9581, 45.5611],
  'challes-les-eaux': [5.9786, 45.5431],
  'barby': [5.9975, 45.5581],
  'le bourget-du-lac': [5.8567, 45.6439],
  'viviers-du-lac': [5.8933, 45.6375],
  'tresserve': [5.8897, 45.6567],
  'mouxy': [5.9133, 45.6689],
  'drumettaz-clarafond': [5.9283, 45.6558],
  'sonnaz': [5.8753, 45.5972],
  'saint-baldoph': [5.9183, 45.5369],
  'voglans': [5.8739, 45.6147],
  'belley': [5.6875, 45.7597],
  'yenne': [5.7558, 45.7019],
  'novalaise': [5.7756, 45.5767],
  'saint-genix-sur-guiers': [5.6328, 45.5981],
  'pont-de-beauvoisin': [5.6708, 45.5358],
  'les échelles': [5.7481, 45.4408],
  'saint-béron': [5.7175, 45.4681],
  'saint-laurent-du-pont': [5.7331, 45.3889],
  'voiron': [5.5897, 45.3639],
  'rives': [5.4956, 45.3569],
  'moirans': [5.5717, 45.3331],
  'tullins': [5.4925, 45.2989],
  'vinay': [5.4156, 45.2114],
  'saint-marcellin': [5.3183, 45.1519],
  'romans-sur-isère': [5.0508, 45.0433],
  'valence': [4.8914, 44.9333],
  'bourg-en-bresse': [5.2256, 46.2047],
  'oyonnax': [5.6558, 46.2572],
  'bellegarde-sur-valserine': [5.8244, 46.1089],
  'gex': [6.0581, 46.3333],
  'ferney-voltaire': [6.1089, 46.2558],
  'divonne-les-bains': [6.1378, 46.3561],
  'genève': [6.1432, 46.2044],
  'geneve': [6.1432, 46.2044],
  'lausanne': [6.6323, 46.5197],
  'montreux': [6.9106, 46.4312],
  'vevey': [6.8433, 46.4628],
  'aigle': [6.9706, 46.3189],
  'sion': [7.3603, 46.2331],
  'sierre': [7.5353, 46.2919],
  'martigny': [7.0725, 46.1017],
  'monthey': [6.9539, 46.2536],
  'villeneuve': [6.9281, 46.3997],
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

// Category colors
const CATEGORY_COLORS = {
  volunteers: 'hsl(280, 65%, 50%)', // Purple
  members: 'hsl(142, 76%, 36%)',    // Green
  donors: 'hsl(0, 84%, 60%)',       // Red
  learners: 'hsl(221, 83%, 53%)',   // Blue
};

export default function MembersMap({ members, donors, learners, volunteers, mapboxToken }: MembersMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  // Filter toggles
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [showDonors, setShowDonors] = useState(true);
  const [showLearners, setShowLearners] = useState(true);

  useEffect(() => {
    // Aggregate data by city
    const cityData: Record<string, { volunteers: number; members: number; donors: number; learners: number }> = {};

    // Count volunteers (from address field)
    volunteers.forEach((v) => {
      if (v.adresse) {
        const city = extractCityFromAddress(v.adresse);
        if (city) {
          if (!cityData[city]) cityData[city] = { volunteers: 0, members: 0, donors: 0, learners: 0 };
          cityData[city].volunteers++;
        }
      }
    });

    // Count members
    members.forEach((m) => {
      if (m.city) {
        const city = m.city.toLowerCase().trim();
        if (!cityData[city]) cityData[city] = { volunteers: 0, members: 0, donors: 0, learners: 0 };
        cityData[city].members++;
      }
    });

    // Count donors
    donors.forEach((d) => {
      if (d.city) {
        const city = d.city.toLowerCase().trim();
        if (!cityData[city]) cityData[city] = { volunteers: 0, members: 0, donors: 0, learners: 0 };
        cityData[city].donors++;
      }
    });

    // Count learners (from address field)
    learners.forEach((l) => {
      if (l.adresse) {
        const city = extractCityFromAddress(l.adresse);
        if (city) {
          if (!cityData[city]) cityData[city] = { volunteers: 0, members: 0, donors: 0, learners: 0 };
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
          volunteers: counts.volunteers,
          members: counts.members, 
          donors: counts.donors, 
          learners: counts.learners,
          lng: coords[0], 
          lat: coords[1] 
        });
      }
    });
    setLocations(locs);
  }, [members, donors, learners, volunteers]);

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
        // Calculate visible totals based on filters
        const visibleCounts = {
          volunteers: showVolunteers ? loc.volunteers : 0,
          members: showMembers ? loc.members : 0,
          donors: showDonors ? loc.donors : 0,
          learners: showLearners ? loc.learners : 0,
        };
        const total = visibleCounts.volunteers + visibleCounts.members + visibleCounts.donors + visibleCounts.learners;
        if (total === 0) return;

        const el = document.createElement('div');
        el.className = 'community-marker';
        
        // Create a multi-color marker showing visible categories
        const size = Math.min(48, 28 + total * 2);
        
        // Build conic gradient based on visible categories
        let gradientParts: string[] = [];
        let currentAngle = 0;
        
        if (visibleCounts.volunteers > 0) {
          const angle = (visibleCounts.volunteers / total) * 360;
          gradientParts.push(`${CATEGORY_COLORS.volunteers} ${currentAngle}deg ${currentAngle + angle}deg`);
          currentAngle += angle;
        }
        if (visibleCounts.members > 0) {
          const angle = (visibleCounts.members / total) * 360;
          gradientParts.push(`${CATEGORY_COLORS.members} ${currentAngle}deg ${currentAngle + angle}deg`);
          currentAngle += angle;
        }
        if (visibleCounts.donors > 0) {
          const angle = (visibleCounts.donors / total) * 360;
          gradientParts.push(`${CATEGORY_COLORS.donors} ${currentAngle}deg ${currentAngle + angle}deg`);
          currentAngle += angle;
        }
        if (visibleCounts.learners > 0) {
          const angle = (visibleCounts.learners / total) * 360;
          gradientParts.push(`${CATEGORY_COLORS.learners} ${currentAngle}deg ${currentAngle + angle}deg`);
          currentAngle += angle;
        }

        const gradient = gradientParts.length > 0 
          ? `conic-gradient(${gradientParts.join(', ')})`
          : CATEGORY_COLORS.members;

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
              background: ${gradient};
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
              ${showVolunteers && loc.volunteers > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS.volunteers};"></span>
                <span>${loc.volunteers} bénévole${loc.volunteers > 1 ? 's' : ''}</span>
              </div>` : ''}
              ${showMembers && loc.members > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS.members};"></span>
                <span>${loc.members} membre${loc.members > 1 ? 's' : ''}</span>
              </div>` : ''}
              ${showDonors && loc.donors > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS.donors};"></span>
                <span>${loc.donors} donateur${loc.donors > 1 ? 's' : ''}</span>
              </div>` : ''}
              ${showLearners && loc.learners > 0 ? `<div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${CATEGORY_COLORS.learners};"></span>
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
  }, [mapboxToken, locations, showVolunteers, showMembers, showDonors, showLearners]);

  const totalVolunteers = locations.reduce((sum, l) => sum + l.volunteers, 0);
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Carte de la Communauté
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {totalCities} villes
            </Badge>
          </div>
          
          {/* Filter toggles */}
          <div className="flex flex-wrap gap-2">
            <Toggle 
              pressed={showVolunteers} 
              onPressedChange={setShowVolunteers}
              size="sm"
              className="data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-700 border border-purple-200 text-xs gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Bénévoles ({totalVolunteers})
            </Toggle>
            <Toggle 
              pressed={showMembers} 
              onPressedChange={setShowMembers}
              size="sm"
              className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 border border-green-200 text-xs gap-1"
            >
              <Users className="w-3 h-3" />
              Membres ({totalMembers})
            </Toggle>
            <Toggle 
              pressed={showDonors} 
              onPressedChange={setShowDonors}
              size="sm"
              className="data-[state=on]:bg-red-500/20 data-[state=on]:text-red-700 border border-red-200 text-xs gap-1"
            >
              <Heart className="w-3 h-3" />
              Donateurs ({totalDonors})
            </Toggle>
            <Toggle 
              pressed={showLearners} 
              onPressedChange={setShowLearners}
              size="sm"
              className="data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-700 border border-blue-200 text-xs gap-1"
            >
              <GraduationCap className="w-3 h-3" />
              Apprenants ({totalLearners})
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="h-[300px] md:h-[400px] rounded-b-lg" />
      </CardContent>
    </Card>
  );
}
