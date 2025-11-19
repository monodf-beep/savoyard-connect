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
      name: "add_person",
      description: "Ajouter une nouvelle personne à l'organigramme",
      parameters: {
        type: "object",
        properties: {
          first_name: { type: "string", description: "Prénom" },
          last_name: { type: "string", description: "Nom de famille" },
          title: { type: "string", description: "Titre/poste" },
          email: { type: "string", description: "Adresse email (optionnel)" },
          phone: { type: "string", description: "Téléphone (optionnel)" },
          bio: { type: "string", description: "Biographie/description (optionnel)" },
          linkedin: { type: "string", description: "URL LinkedIn (optionnel)" },
          competences: { type: "array", items: { type: "string" }, description: "Liste de compétences (optionnel)" },
        },
        required: ["first_name", "last_name", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_person",
      description: "Modifier les informations d'une personne existante",
      parameters: {
        type: "object",
        properties: {
          person_id: { type: "string", description: "ID de la personne à modifier" },
          first_name: { type: "string", description: "Prénom (optionnel)" },
          last_name: { type: "string", description: "Nom de famille (optionnel)" },
          title: { type: "string", description: "Titre/poste (optionnel)" },
          email: { type: "string", description: "Adresse email (optionnel)" },
          phone: { type: "string", description: "Téléphone (optionnel)" },
          bio: { type: "string", description: "Biographie/description (optionnel)" },
          linkedin: { type: "string", description: "URL LinkedIn (optionnel)" },
          competences: { type: "array", items: { type: "string" }, description: "Liste de compétences (optionnel)" },
        },
        required: ["person_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_section",
      description: "Ajouter une nouvelle section à l'organigramme",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Nom de la section" },
          parent_id: { type: "string", description: "ID de la section parente (optionnel, null pour section racine)" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_section",
      description: "Modifier une section existante",
      parameters: {
        type: "object",
        properties: {
          section_id: { type: "string", description: "ID de la section à modifier" },
          title: { type: "string", description: "Nouveau nom de la section" },
        },
        required: ["section_id", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_organization_structure",
      description: "Obtenir la structure complète de l'organigramme avec toutes les sections et personnes",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

async function executeToolCall(toolName: string, args: any, supabaseClient: any) {
  console.log(`Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      case "add_person": {
        const { data, error } = await supabaseClient
          .from('people')
          .insert([{
            first_name: args.first_name,
            last_name: args.last_name,
            title: args.title,
            email: args.email || null,
            phone: args.phone || null,
            bio: args.bio || null,
            linkedin: args.linkedin || null,
            competences: args.competences || [],
          }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, person: data };
      }

      case "edit_person": {
        const updates: any = {};
        if (args.first_name) updates.first_name = args.first_name;
        if (args.last_name) updates.last_name = args.last_name;
        if (args.title) updates.title = args.title;
        if (args.email !== undefined) updates.email = args.email;
        if (args.phone !== undefined) updates.phone = args.phone;
        if (args.bio !== undefined) updates.bio = args.bio;
        if (args.linkedin !== undefined) updates.linkedin = args.linkedin;
        if (args.competences !== undefined) updates.competences = args.competences;

        const { data, error } = await supabaseClient
          .from('people')
          .update(updates)
          .eq('id', args.person_id)
          .select()
          .single();

        if (error) throw error;
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

      case "edit_section": {
        const { data, error } = await supabaseClient
          .from('sections')
          .update({ title: args.title })
          .eq('id', args.section_id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, section: data };
      }

      case "get_organization_structure": {
        const [sectionsResult, peopleResult, membersResult] = await Promise.all([
          supabaseClient.from('sections').select('*').order('display_order'),
          supabaseClient.from('people').select('*'),
          supabaseClient.from('section_members').select('*'),
        ]);

        if (sectionsResult.error) throw sectionsResult.error;
        if (peopleResult.error) throw peopleResult.error;
        if (membersResult.error) throw membersResult.error;

        return {
          sections: sectionsResult.data,
          people: peopleResult.data,
          members: membersResult.data,
        };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return { error: error.message };
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

    const systemPrompt = `Tu es un assistant IA spécialisé dans la gestion d'organigrammes.

RÈGLE PRINCIPALE : Toute information que l'utilisateur te donne est une demande de modification ou d'ajout dans l'organigramme.

PROCESSUS À SUIVRE :
1. Si tu n'as pas encore la structure de l'organigramme, commence TOUJOURS par appeler get_organization_structure
2. Analyse l'information fournie par l'utilisateur
3. Identifie quelle(s) action(s) effectuer (ajout, modification, suppression)
4. Recherche dans la structure actuelle pour voir si l'entité existe déjà
5. AVANT d'utiliser un outil de modification, pose TOUJOURS une question de confirmation claire à l'utilisateur
6. Attends la confirmation explicite de l'utilisateur (oui, ok, confirmer, d'accord, valider, etc.)
7. Une fois confirmé, utilise les outils appropriés pour effectuer les modifications

EXEMPLES :
- Utilisateur : "Rodolphe Guilhot"
  → Appelle get_organization_structure, cherche "Rodolphe", puis réponds : "J'ai trouvé Rodolphe Simon dans l'organigramme. Voulez-vous modifier son nom en Rodolphe Guilhot ?"
  
- Utilisateur : "Jean Dupont, développeur"
  → Appelle get_organization_structure, vérifie si Jean Dupont existe, puis réponds : "Souhaitez-vous ajouter Jean Dupont avec le titre de développeur dans l'organigramme ?"

- Utilisateur : "Marie Martin est maintenant directrice"
  → Appelle get_organization_structure, trouve Marie Martin, puis réponds : "Voulez-vous modifier le titre de Marie Martin pour le changer en directrice ?"

- Si l'utilisateur répond "oui", "ok", "confirmer", "d'accord" après ta question de confirmation, exécute immédiatement l'action appropriée.

N'effectue JAMAIS une modification sans avoir obtenu une confirmation explicite de l'utilisateur.

Réponds toujours en français de manière claire et concise.`;

    let currentMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    let continueLoop = true;
    let allContent = '';

    while (continueLoop) {
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

    return new Response(
      JSON.stringify({ content: allContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
