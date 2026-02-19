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

const ZONE_QUERIES: Record<string, { query: string; zone: string }> = {
  savoie: { query: 'associations culturelles Savoie 73 Chambéry Aix-les-Bains liste annuaire', zone: 'savoie' },
  'haute-savoie': { query: 'associations culturelles Haute-Savoie 74 Annecy liste annuaire', zone: 'savoie' },
  'alpes-maritimes': { query: 'associations culturelles Nice Alpes-Maritimes 06 liste annuaire', zone: 'alpes-maritimes' },
  'vallee-aoste': { query: 'associazioni culturali Valle d\'Aosta Aosta elenco registro', zone: 'vallee-aoste' },
  piemont: { query: 'associazioni culturali Piemonte Torino Cuneo elenco registro', zone: 'piemont' },
};

const NET1901_URLS: Record<string, string> = {
  savoie: 'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=73',
  'haute-savoie': 'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=74',
  'alpes-maritimes': 'https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=6',
};

async function firecrawlSearch(query: string, apiKey: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5, scrapeOptions: { formats: ['markdown'] } }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Firecrawl search failed: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Firecrawl search error:`, error);
    return [];
  }
}

async function firecrawlScrape(url: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.markdown || data.markdown || null;
  } catch (error) {
    console.error(`Firecrawl scrape error:`, error);
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
    const timeout = setTimeout(() => controller.abort(), 20000);

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
            content: `Extrais les associations culturelles du texte. Retourne: { "associations": [{ "name": "...", "description": "...", "city": "..." }] }
- name: nom exact (sans statut juridique)
- description: courte description (max 150 chars)
- city: ville du siège
Ignore ce qui n'est pas une association culturelle. Max 15 résultats. Si rien trouvé: {"associations": []}`,
          },
          { role: 'user', content: `Zone: ${zone}\n\n${content.substring(0, 6000)}` },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];
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
    console.error('OpenAI error:', error);
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

    console.log(`Scraping zone=${zone}, source=${source || 'search'}`);

    // Run sources in parallel where possible
    const tasks: Promise<ScrapedAssociation[]>[] = [];

    if (!source || source === 'search') {
      tasks.push((async () => {
        console.log(`Search: ${zoneConfig.query}`);
        const results = await firecrawlSearch(zoneConfig.query, firecrawlKey);
        const extractions = await Promise.all(
          results.filter(r => (r.markdown || r.description || '').length > 50)
            .slice(0, 3)
            .map(r => extractAssociationsWithOpenAI(r.markdown || r.description || '', zoneConfig.zone, openaiKey))
        );
        return extractions.flat();
      })());
    }

    if ((!source || source === 'net1901') && NET1901_URLS[zone]) {
      tasks.push((async () => {
        console.log(`Scraping net1901: ${NET1901_URLS[zone]}`);
        const markdown = await firecrawlScrape(NET1901_URLS[zone], firecrawlKey);
        if (markdown) return extractAssociationsWithOpenAI(markdown, zoneConfig.zone, openaiKey);
        return [];
      })());
    }

    if ((!source || source === 'registri') && (zone === 'vallee-aoste' || zone === 'piemont')) {
      tasks.push((async () => {
        const q = `registro associazioni culturali ${zone === 'vallee-aoste' ? 'Valle d\'Aosta' : 'Piemonte'}`;
        console.log(`Italian registry search: ${q}`);
        const results = await firecrawlSearch(q, firecrawlKey);
        const extractions = await Promise.all(
          results.filter(r => (r.markdown || r.description || '').length > 50)
            .slice(0, 2)
            .map(r => extractAssociationsWithOpenAI(r.markdown || r.description || '', zoneConfig.zone, openaiKey))
        );
        return extractions.flat();
      })());
    }

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

    // Geocode in parallel
    if (mapboxToken) {
      const cities = [...new Set(unique.filter(a => a.city).map(a => a.city!))];
      const geoCache = await geocodeCities(cities, mapboxToken);
      for (const assoc of unique) {
        if (assoc.city && geoCache[assoc.city]) {
          assoc.latitude = geoCache[assoc.city].lat;
          assoc.longitude = geoCache[assoc.city].lng;
        }
      }
    }

    // Batch upsert
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

    console.log(`Done: ${inserted} inserted, ${skipped} skipped`);

    return new Response(
      JSON.stringify({ success: true, zone, total_found: unique.length, inserted, skipped, associations: unique.map(a => ({ name: a.name, city: a.city })) }),
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
