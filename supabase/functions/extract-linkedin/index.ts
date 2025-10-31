import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInProfile {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  experience: string;
  formation: string;
  competences: string[];
  langues: string[];
  location: string;
}

function parseLinkedInProfile(markdown: string): LinkedInProfile {
  console.log('Parsing LinkedIn markdown...');
  
  const profile: LinkedInProfile = {
    firstName: '',
    lastName: '',
    title: '',
    bio: '',
    experience: '',
    formation: '',
    competences: [],
    langues: [],
    location: ''
  };

  // Extract name (usually in first heading)
  const nameMatch = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
  if (nameMatch) {
    const fullName = nameMatch[1].trim();
    const nameParts = fullName.split(' ');
    profile.firstName = nameParts[0] || '';
    profile.lastName = nameParts.slice(1).join(' ') || '';
  }

  // Extract title (usually after name)
  const titleMatch = markdown.match(/(?:^|\n)([^\n]+?)\s*(?:at|chez|@)\s+[^\n]+/i);
  if (titleMatch) {
    profile.title = titleMatch[1].trim();
  }

  // Extract bio/about section
  const bioMatch = markdown.match(/(?:About|À propos|Summary)[:\s]*\n+([^\n#]+(?:\n(?!#)[^\n]+)*)/i);
  if (bioMatch) {
    profile.bio = bioMatch[1].trim().substring(0, 500);
  }

  // Extract experience section
  const expMatch = markdown.match(/(?:Experience|Expérience)[:\s]*\n+((?:[^\n#]+\n)*)/i);
  if (expMatch) {
    profile.experience = expMatch[1].trim().substring(0, 1000);
  }

  // Extract education
  const eduMatch = markdown.match(/(?:Education|Formation)[:\s]*\n+((?:[^\n#]+\n)*)/i);
  if (eduMatch) {
    profile.formation = eduMatch[1].trim().substring(0, 500);
  }

  // Extract skills
  const skillsMatch = markdown.match(/(?:Skills|Compétences)[:\s]*\n+((?:[^\n#]+(?:\n(?!#)[^\n]+)*)?)/i);
  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    profile.competences = skillsText
      .split(/[,\n•·-]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50)
      .slice(0, 20);
  }

  // Extract languages
  const langMatch = markdown.match(/(?:Languages|Langues)[:\s]*\n+((?:[^\n#]+(?:\n(?!#)[^\n]+)*)?)/i);
  if (langMatch) {
    const langText = langMatch[1];
    profile.langues = langText
      .split(/[,\n•·-]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 30)
      .slice(0, 10);
  }

  // Extract location
  const locationMatch = markdown.match(/(?:Location|Localisation|Région)[:\s]*([^\n]+)/i);
  if (locationMatch) {
    profile.location = locationMatch[1].trim();
  }

  return profile;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl } = await req.json();
    
    if (!linkedinUrl) {
      throw new Error('LinkedIn URL is required');
    }

    console.log('Extracting LinkedIn profile from:', linkedinUrl);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    // Call Firecrawl API to scrape the LinkedIn profile
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: linkedinUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl error:', scrapeResponse.status, errorText);
      throw new Error(`Failed to scrape LinkedIn profile: ${scrapeResponse.status}`);
    }

    const scrapeData = await scrapeResponse.json();
    console.log('Firecrawl response received');

    if (!scrapeData.success || !scrapeData.data?.markdown) {
      throw new Error('Failed to extract LinkedIn profile data');
    }

    const markdown = scrapeData.data.markdown;
    const profile = parseLinkedInProfile(markdown);

    console.log('Profile extracted:', profile);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        rawMarkdown: markdown.substring(0, 2000) // Include sample for debugging
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in extract-linkedin function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
