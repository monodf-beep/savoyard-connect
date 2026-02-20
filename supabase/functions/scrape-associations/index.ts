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
      'site:net1901.org associations culturelles Savoie 73',
      'associations culturelles Chambéry Aix-les-Bains Savoie liste',
    ],
    zone: 'savoie',
  },
  'haute-savoie': {
    queries: [
      'site:net1901.org associations culturelles Haute-Savoie 74',
      'associations culturelles Annecy Haute-Savoie liste',
    ],
    zone: 'savoie',
  },
  'alpes-maritimes': {
    queries: [
      'site:net1901.org associations culturelles Alpes-Maritimes 06',
      'associations culturelles Nice Alpes-Maritimes liste',
    ],
    zone: 'alpes-maritimes',
  },
  'vallee-aoste': {
    queries: [
      'associazioni culturali Valle d\'Aosta elenco',
      'registro associazioni culturali Aosta',
    ],
    zone: 'vallee-aoste',
  },
  piemont: {
    queries: [
      'associazioni culturali Piemonte Torino elenco',
      'registro associazioni culturali Cuneo Piemonte',
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    console.log(`  Firecrawl search: "${query}"`);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  Firecrawl search failed (${response.status}): ${errText}`);
      return [];
    }
    const data = await response.json();
    const results = data.data || [];
    console.log(`  Firecrawl returned ${results.length} results`);
    // Log content lengths for debugging
    results.forEach((r: any, i: number) => {
      const content = r.markdown || r.description || '';
      console.log(`    Result ${i}: ${content.length} chars, url=${r.url || 'n/a'}`);
    });
    return results;
  } catch (error) {
    console.error(`  Firecrawl search error:`, error instanceof Error ? error.message : error);
    return [];
  }
}

async function firecrawlScrape(url: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    console.log(`  Firecrawl scrape: ${url}`);
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  Firecrawl scrape failed (${response.status}): ${errText}`);
      return null;
    }
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || null;
    console.log(`  Scraped ${markdown?.length || 0} chars`);
    return markdown;
  } catch (error) {
    console.error(`  Firecrawl scrape error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function extractAssociationsWithOpenAI(
  content: string,
  zone: string,
  openaiKey: string
): Promise<ScrapedAssociation[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const truncated = content.substring(0, 8000);
    console.log(`  OpenAI extraction (${truncated.length} chars, zone=${zone})`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en extraction de données. Extrais TOUTES les associations culturelles, sportives ou artistiques mentionnées dans le texte.
Retourne un JSON: { "associations": [{ "name": "...", "description": "...", "city": "..." }] }
- name: nom exact de l'association (sans forme juridique comme "loi 1901")
- description: courte description de l'activité (max 150 chars), invente si nécessaire à partir du nom
- city: ville du siège si mentionnée
Sois exhaustif, extrais le maximum d'associations. Si tu trouves des listes ou des annuaires, extrais chaque entrée.
Si rien trouvé: {"associations": []}`,
          },
          { role: 'user', content: `Zone géographique: ${zone}\n\nContenu:\n${truncated}` },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`  OpenAI failed (${response.status}): ${errText}`);
      return [];
    }
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const associations = (parsed.associations || []).map((a: any) => ({
      name: a.name?.trim(),
      description: a.description?.trim() || null,
      city: a.city?.trim() || null,
      primary_zone: zone,
      silo: 'culture',
      latitude: null,
      longitude: null,
    })).filter((a: ScrapedAssociation) => a.name && a.name.length > 2);

    console.log(`  OpenAI extracted ${associations.length} associations`);
    return associations;
  } catch (error) {
    console.error('  OpenAI error:', error instanceof Error ? error.message : error);
    return [];
  }
}

async function geocodeCities(cities: string[], mapboxToken: string): Promise<Record<string, { lat: number; lng: number }>> {
  const cache: Record<string, { lat: number; lng: number }> = {};
  const promises = cities.slice(0, 15).map(async (city) => {
    try {
      const r = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&limit=1&types=place`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.features?.[0]) {
        const [lng, lat] = d.features[0].center;
        cache[city] = { lat, lng };
      }
    } catch {}
  });
  await Promise.all(promises);
  return cache;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { zone, source } = await req.json();

    if (!zone || !ZONE_QUERIES[zone]) {
      return new Response(
        JSON.stringify({ success: false, error: `Zone invalide: ${zone}` }),
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

    console.log(`=== Scraping zone=${zone}, source=${source || 'all'} ===`);

    const tasks: Promise<ScrapedAssociation[]>[] = [];

    // Search-based extraction: run all queries for the zone
    if (!source || source === 'search') {
      for (const query of zoneConfig.queries) {
        tasks.push((async () => {
          const results = await firecrawlSearch(query, firecrawlKey);
          // Use ALL results that have some content, lower threshold
          const usable = results.filter(r => {
            const content = r.markdown || r.description || r.title || '';
            return content.length > 20;
          });
          console.log(`  ${usable.length}/${results.length} usable results for query`);
          
          if (usable.length === 0) return [];
          
          // Combine all content into one extraction call for efficiency
          const combined = usable.map(r => {
            const content = r.markdown || r.description || '';
            const title = r.title || '';
            return `--- Source: ${r.url || 'unknown'} ---\nTitle: ${title}\n${content}`;
          }).join('\n\n');
          
          return extractAssociationsWithOpenAI(combined, zoneConfig.zone, openaiKey);
        })());
      }
    }

    // net1901 scraping
    if ((!source || source === 'net1901') && NET1901_URLS[zone]) {
      for (const url of NET1901_URLS[zone]) {
        tasks.push((async () => {
          const markdown = await firecrawlScrape(url, firecrawlKey);
          if (markdown && markdown.length > 50) {
            return extractAssociationsWithOpenAI(markdown, zoneConfig.zone, openaiKey);
          }
          return [];
        })());
      }
    }

    // Italian registries
    if ((!source || source === 'registri') && (zone === 'vallee-aoste' || zone === 'piemont')) {
      tasks.push((async () => {
        const q = `registro associazioni culturali ${zone === 'vallee-aoste' ? 'Valle d\'Aosta Aosta' : 'Piemonte Torino Cuneo'}`;
        const results = await firecrawlSearch(q, firecrawlKey);
        const usable = results.filter(r => (r.markdown || r.description || '').length > 20);
        if (usable.length === 0) return [];
        const combined = usable.map(r => r.markdown || r.description || '').join('\n\n');
        return extractAssociationsWithOpenAI(combined, zoneConfig.zone, openaiKey);
      })());
    }

    console.log(`Launched ${tasks.length} parallel tasks`);
    const taskResults = await Promise.all(tasks);
    allAssociations = taskResults.flat();

    // Deduplicate
    const seen = new Set<string>();
    const unique = allAssociations.filter((a) => {
      const key = `${a.name.toLowerCase().trim()}|${(a.city || '').toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Found ${unique.length} unique (${allAssociations.length} total)`);

    // Geocode
    if (mapboxToken && unique.length > 0) {
      const cities = [...new Set(unique.filter(a => a.city).map(a => a.city!))];
      const geoCache = await geocodeCities(cities, mapboxToken);
      for (const assoc of unique) {
        if (assoc.city && geoCache[assoc.city]) {
          assoc.latitude = geoCache[assoc.city].lat;
          assoc.longitude = geoCache[assoc.city].lng;
        }
      }
    }

    // Upsert
    let inserted = 0, skipped = 0;
    for (const assoc of unique) {
      const { data: existing } = await supabase
        .from('associations')
        .select('id')
        .ilike('name', assoc.name)
        .eq('primary_zone', assoc.primary_zone)
        .limit(1);

      if (existing && existing.length > 0) { skipped++; continue; }

      const { error } = await supabase.from('associations').insert({
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

      if (error) { console.error(`Insert error ${assoc.name}:`, error.message); skipped++; }
      else { inserted++; }
    }

    console.log(`=== Done: ${inserted} inserted, ${skipped} skipped ===`);

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
