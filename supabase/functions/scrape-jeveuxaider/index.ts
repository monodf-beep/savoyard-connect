import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.includes('jeveuxaider.gouv.fr')) {
      throw new Error('URL JeVeuxAider invalide');
    }

    // Extract mission ID from URL
    const missionIdMatch = url.match(/missions\/(\d+)/);
    if (!missionIdMatch) {
      throw new Error('Impossible d\'extraire l\'ID de la mission');
    }
    const missionId = missionIdMatch[1];

    // Try to fetch the public API or scrape the page
    // JeVeuxAider has a public API for some endpoints
    const apiUrl = `https://api.jeveuxaider.gouv.fr/api/missions/${missionId}`;
    
    let missionData: any = null;
    
    try {
      const apiResponse = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (apiResponse.ok) {
        missionData = await apiResponse.json();
      }
    } catch (e) {
      console.log('API fetch failed, trying HTML scraping');
    }

    // If API didn't work, try scraping the HTML page
    if (!missionData) {
      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
      
      if (firecrawlApiKey) {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlApiKey}`,
          },
          body: JSON.stringify({
            url: url,
            formats: ['markdown', 'extract'],
            extract: {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Mission title' },
                  description: { type: 'string', description: 'Mission description' },
                  organization: { type: 'string', description: 'Organization name' },
                  location: { type: 'string', description: 'Location/city' },
                  department: { type: 'string', description: 'Department or thematic area' },
                  commitment: { type: 'string', description: 'Time commitment required' },
                  requirements: { type: 'array', items: { type: 'string' }, description: 'Skills or requirements' },
                },
                required: ['title'],
              },
            },
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.data?.extract) {
            missionData = scrapeData.data.extract;
          }
        }
      }
    }

    // If still no data, return a fallback with the URL
    if (!missionData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Impossible de récupérer les données de la mission. Veuillez remplir manuellement.',
          fallback: {
            title: '',
            description: '',
            applicationUrl: url,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data to match JobPosting format
    const jobPosting = {
      title: missionData.title || missionData.name || '',
      description: missionData.description || missionData.objectif || missionData.presentation_mission || '',
      department: missionData.department || missionData.domaine?.name || missionData.organization || 'Bénévolat',
      location: missionData.location || missionData.city || missionData.department_name || 'France',
      type: 'Bénévolat',
      applicationUrl: url,
      requirements: missionData.requirements || missionData.competences || [],
      commitment: missionData.commitment || missionData.commitment_duration || '',
      organization: missionData.organization || missionData.structure?.name || '',
    };

    console.log('Extracted mission data:', jobPosting);

    return new Response(
      JSON.stringify({
        success: true,
        data: jobPosting,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        fallback: {
          title: '',
          description: '',
          applicationUrl: '',
        },
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
