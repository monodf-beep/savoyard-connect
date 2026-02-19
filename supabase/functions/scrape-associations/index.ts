import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ScrapedAssociation {
  name: string;
  description: string | null;
  city: string | null;
  primary_zone: string;
  silo: string;
  latitude: number | null;
  longitude: number | null;
}

const ZONE_QUERIES: Record<string, { queries: string[]; zone: string }> = {
  savoie: {
    queries: [
      'association culturelle Savoie 73',
      'association culture art Chambéry Savoie',
      'association culturelle Aix-les-Bains Albertville',
    ],
    zone: 'savoie',
  },
  'haute-savoie': {
    queries: [
      'association culturelle Haute-Savoie 74',
      'association culture art Annecy Haute-Savoie',
      'association culturelle Thonon Chamonix',
    ],
    zone: 'savoie',
  },
  'alpes-maritimes': {
    queries: [
      'association culturelle Nice Alpes-Maritimes',
      'association culture art Nice 06',
      'association culturelle arrondissement Nice',
    ],
    zone: 'alpes-maritimes',
  },
  'vallee-aoste': {
    queries: [
      'associazione culturale Valle d\'Aosta',
      'association culturelle Vallée d\'Aoste Aoste',
      'associazione cultura arte Aosta',
    ],
    zone: 'vallee-aoste',
  },
  piemont: {
    queries: [
      'associazione culturale Piemonte Torino',
      'associazione cultura arte Piemonte',
      'associazione culturale Cuneo Novara Piemonte',
    ],
    zone: 'piemont',
  },
};

const NET1901_URLS: Record<string, string[]> = {
  savoie: [
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=73',
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=73&page=2',
  ],
  'haute-savoie': [
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=74',
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=74&page=2',
  ],
  'alpes-maritimes': [
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=6',
    'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=6&page=2',
  ],
};

async function firecrawlSearch(query: string, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl search failed for "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Firecrawl search error for "${query}":`, error);
    return [];
  }
}

async function firecrawlScrape(url: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl scrape failed for "${url}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data?.markdown || data.markdown || null;
  } catch (error) {
    console.error(`Firecrawl scrape error for "${url}":`, error);
    return null;
  }
}

async function extractAssociationsWithOpenAI(
  content: string,
  zone: string,
  openaiKey: string
): Promise<ScrapedAssociation[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Tu es un extracteur de données d'associations culturelles. Extrais les associations culturelles du texte fourni. 
Retourne un JSON avec la structure: { "associations": [{ "name": "...", "description": "...", "city": "..." }] }
- name: le nom exact de l'association (sans le statut juridique)
- description: une courte description de l'objet/activités (max 200 caractères)
- city: la ville du siège (si disponible)
Ignore les entrées qui ne sont clairement pas des associations culturelles.
Retourne maximum 20 associations par extraction.
Si aucune association n'est trouvée, retourne {"associations": []}.`,
          },
          {
            role: 'user',
            content: `Extrais les associations culturelles de ce texte (zone: ${zone}):\n\n${content.substring(0, 8000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return [];
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return (parsed.associations || []).map((a: any) => ({
      name: a.name?.trim(),
      description: a.description?.trim() || null,
      city: a.city?.trim() || null,
      primary_zone: zone,
      silo: 'culture',
      latitude: null,
      longitude: null,
    })).filter((a: ScrapedAssociation) => a.name && a.name.length > 2);
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return [];
  }
}

async function geocodeCity(city: string, mapboxToken: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&limit=1&types=place`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zone, source } = await req.json();

    if (!zone || !ZONE_QUERIES[zone]) {
      return new Response(
        JSON.stringify({ success: false, error: `Zone invalide: ${zone}. Zones disponibles: ${Object.keys(ZONE_QUERIES).join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey || !openaiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const zoneConfig = ZONE_QUERIES[zone];
    let allAssociations: ScrapedAssociation[] = [];

    console.log(`Starting scrape for zone: ${zone}, source: ${source || 'all'}`);

    // Source 1: Firecrawl Search (web search)
    if (!source || source === 'search') {
      for (const query of zoneConfig.queries) {
        console.log(`Searching: ${query}`);
        const results = await firecrawlSearch(query, firecrawlKey);

        for (const result of results) {
          const content = result.markdown || result.description || '';
          if (content.length > 50) {
            const extracted = await extractAssociationsWithOpenAI(content, zoneConfig.zone, openaiKey);
            allAssociations.push(...extracted);
          }
        }
      }
    }

    // Source 2: net1901.org scraping (French zones only)
    if ((!source || source === 'net1901') && NET1901_URLS[zone]) {
      for (const url of NET1901_URLS[zone]) {
        console.log(`Scraping net1901: ${url}`);
        const markdown = await firecrawlScrape(url, firecrawlKey);
        if (markdown) {
          const extracted = await extractAssociationsWithOpenAI(markdown, zoneConfig.zone, openaiKey);
          allAssociations.push(...extracted);
        }
      }
    }

    // Source 3: Italian registries (for Italian zones)
    if ((!source || source === 'registri') && (zone === 'vallee-aoste' || zone === 'piemont')) {
      const italianQueries = [
        `site:servizicivili.gov.it associazione culturale ${zone === 'vallee-aoste' ? 'Valle d\'Aosta' : 'Piemonte'}`,
        `site:regione.${zone === 'piemont' ? 'piemonte' : 'vda'}.it associazione culturale registro`,
      ];
      for (const query of italianQueries) {
        console.log(`Searching Italian registry: ${query}`);
        const results = await firecrawlSearch(query, firecrawlKey);
        for (const result of results) {
          const content = result.markdown || result.description || '';
          if (content.length > 50) {
            const extracted = await extractAssociationsWithOpenAI(content, zoneConfig.zone, openaiKey);
            allAssociations.push(...extracted);
          }
        }
      }
    }

    // Deduplicate by normalized name
    const seen = new Set<string>();
    const unique = allAssociations.filter((a) => {
      const key = `${a.name.toLowerCase().trim()}|${(a.city || '').toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Found ${unique.length} unique associations (from ${allAssociations.length} total)`);

    // Geocode cities
    if (mapboxToken) {
      const citiesToGeocode = [...new Set(unique.filter(a => a.city && !a.latitude).map(a => a.city!))];
      const geocodeCache: Record<string, { lat: number; lng: number } | null> = {};

      for (const city of citiesToGeocode.slice(0, 30)) {
        geocodeCache[city] = await geocodeCity(city, mapboxToken);
      }

      for (const assoc of unique) {
        if (assoc.city && geocodeCache[assoc.city]) {
          assoc.latitude = geocodeCache[assoc.city]!.lat;
          assoc.longitude = geocodeCache[assoc.city]!.lng;
        }
      }
    }

    // Upsert into database
    let inserted = 0;
    let skipped = 0;

    for (const assoc of unique) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('associations')
        .select('id')
        .ilike('name', assoc.name)
        .eq('primary_zone', assoc.primary_zone)
        .limit(1);

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('associations')
        .insert({
          name: assoc.name,
          description: assoc.description,
          city: assoc.city,
          primary_zone: assoc.primary_zone,
          silo: assoc.silo,
          latitude: assoc.latitude,
          longitude: assoc.longitude,
          is_public: true,
          is_active: true,
          owner_id: null,
        });

      if (error) {
        console.error(`Error inserting ${assoc.name}:`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }

    console.log(`Done: ${inserted} inserted, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        zone,
        total_found: unique.length,
        inserted,
        skipped,
        associations: unique.map(a => ({ name: a.name, city: a.city })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
