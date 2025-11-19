import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_person",
      description: "Rechercher une personne par nom. TOUJOURS utiliser AVANT edit_person. Retourne l'UUID exact.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Prénom, nom ou les deux" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_person",
      description: "Ajouter une nouvelle personne à l'organigramme",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Prénom" },
          last_name: { type: "string", description: "Nom de famille" },
          title: { type: "string", description: "Titre/poste" },
          email: { type: "string", description: "Email (optionnel)" },
          phone: { type: "string", description: "Téléphone (optionnel)" },
          bio: { type: "string", description: "Bio (optionnel)" },
          linkedin: { type: "string", description: "LinkedIn (optionnel)" },
          competences: { type: "array", items: { type: "string" }, description: "Compétences (optionnel)" },
        },
        required: ["first_name", "last_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_person",
      description: "Modifier une personne. UUID doit venir de search_person.",
      parameters: {
        type: "object",
        properties: {
          person_id: { type: "string", description: "UUID de search_person (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)" },
          first_name: { type: "string", description: "Prénom" },
          last_name: { type: "string", description: "Nom" },
          title: { type: "string", description: "Titre" },
          email: { type: "string", description: "Email" },
          phone: { type: "string", description: "Téléphone" },
          bio: { type: "string", description: "Bio" },
          linkedin: { type: "string", description: "LinkedIn" },
          competences: { type: "array", items: { type: "string" }, description: "Compétences" },
        },
        required: ["person_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_section",
      description: "Ajouter une section",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Nom" },
          parent_id: { type: "string", description: "UUID parent (optionnel)" },
        },
        required: ["title"],
      },
    },
  },
];

async function executeToolCall(toolName: string, args: any, supabaseClient: any) {
  console.log(`Executing: ${toolName}`, JSON.stringify(args));

  try {
    switch (toolName) {
      case "search_person": {
        const raw = (args.name || '').toString().toLowerCase().trim();
        const terms = raw.split(/\s+/).filter(Boolean);

        const { data, error } = await supabaseClient
          .from('people')
          .select('id, first_name, last_name, title, bio');

        if (error) throw error;

        const matches = data.filter((p: any) => {
          const full = `${p.first_name} ${p.last_name}`.toLowerCase();
          const first = p.first_name.toLowerCase();
          const last = p.last_name.toLowerCase();
          return terms.some((t: string) =>
            first.includes(t) ||
            last.includes(t) ||
            full.includes(t)
          );
        });

        return { found: matches.length > 0, people: matches };
      }

      case "add_person": {
        const { data, error } = await supabaseClient
          .from('people')
          .insert([{
            first_name: args.first_name,
            last_name: args.last_name,
            title: args.title || '',
            email: args.email || null,
            phone: args.phone || null,
            bio: args.bio || null,
            linkedin: args.linkedin || null,
            competences: args.competences || [],
          }])
          .select('id, first_name, last_name, title')
          .single();

        if (error) throw error;
        return { success: true, person: data };
      }

      case "edit_person": {
        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(args.person_id)) {
          return { success: false, error: "UUID invalide. Utilisez search_person d'abord." };
        }

        const updates: any = {};
        if (args.first_name !== undefined) updates.first_name = args.first_name;
        if (args.last_name !== undefined) updates.last_name = args.last_name;
        if (args.title !== undefined) updates.title = args.title;
        if (args.email !== undefined) updates.email = args.email;
        if (args.phone !== undefined) updates.phone = args.phone;
        if (args.bio !== undefined) updates.bio = args.bio;
        if (args.linkedin !== undefined) updates.linkedin = args.linkedin;
        if (args.competences !== undefined) updates.competences = args.competences;

        const { data, error } = await supabaseClient
          .from('people')
          .update(updates)
          .eq('id', args.person_id)
          .select('id, first_name, last_name, title')
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return { success: false, error: "Aucune personne trouvée avec cet identifiant dans l'organigramme." };
        }
        return { success: true, person: data };
      }

      case "add_section": {
        const { data, error } = await supabaseClient
          .from('sections')
          .insert([{
            title: args.title,
            parent_id: args.parent_id || null,
          }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, section: data };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error in ${toolName}:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const systemPrompt = `Assistant IA pour organigrammes.

RÈGLE : Toute info de l'utilisateur = demande de modification.

PROCESSUS RAPIDE :
1. Nom mentionné ? → search_person(nom) immédiatement
2. Trouvé ? → Demande confirmation : "Voulez-vous modifier [nom trouvé] en [nouveau nom] ?"
3. "oui"/"ok" → edit_person avec UUID exact de search_person
4. Pas trouvé ? → Demande si ajouter

EXEMPLES :
- User: "Rodolphe Guilhot"
  → search_person("Rodolphe")
  → Trouvé "Rodolphe Simon" (id: <UUID_RENVOYÉ_PAR_SEARCH_PERSON>)
  → "Voulez-vous renommer Rodolphe Simon en Rodolphe Guilhot ?"
  → Sur "oui" : edit_person(person_id: <MÊME_UUID_RENVOYÉ>, last_name: "Guilhot")

CRITIQUE :
- TOUJOURS search_person AVANT edit_person
- TOUJOURS utiliser l'UUID exact de search_person
- JAMAIS inventer d'UUID
- Être rapide et concis

Français uniquement.`;

    let currentMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    let continueLoop = true;
    let allContent = '';
    let maxIterations = 4;
    let iteration = 0;

    while (continueLoop && iteration < maxIterations) {
      iteration++;
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: currentMessages,
          tools: tools,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Trop de requêtes, attendez un instant." }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        // Execute tool calls
        const toolResults = [];
        
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          const result = await executeToolCall(toolName, toolArgs, supabaseClient);
          
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        // Add assistant message and tool results to conversation
        currentMessages.push(choice.message);
        currentMessages.push(...toolResults);
        
        // Continue loop to get final response
        continue;
      }

      // Final response
      allContent = choice.message.content || '';
      continueLoop = false;
    }

    if (iteration >= maxIterations) {
      allContent = "Requête trop complexe. Reformulez plus simplement svp.";
    }

    return new Response(
      JSON.stringify({ content: allContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
