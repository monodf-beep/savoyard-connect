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
  {
    type: "function",
    function: {
      name: "rename_person_by_name",
      description: "Renommer une personne en se basant sur son prénom+nom actuels (évite les problèmes d'UUID).",
      parameters: {
        type: "object",
        properties: {
          original_first_name: { type: "string", description: "Prénom actuel (ex: Rodolphe)" },
          original_last_name: { type: "string", description: "Nom actuel (ex: Simon)" },
          new_first_name: { type: "string", description: "Nouveau prénom" },
          new_last_name: { type: "string", description: "Nouveau nom" },
        },
        required: ["original_first_name", "original_last_name", "new_last_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_value_chain",
      description: "Créer une nouvelle chaîne de valeur",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre de la chaîne" },
          description: { type: "string", description: "Description (optionnel)" },
          segments: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                function_name: { type: "string", description: "Nom de la fonction/segment" },
                actors: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "Prénoms et/ou noms des acteurs pour ce segment"
                }
              },
              required: ["function_name"]
            },
            description: "Liste des segments avec leurs acteurs"
          },
        },
        required: ["title", "segments"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_value_chain",
      description: "Rechercher une chaîne de valeur par titre",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre de la chaîne" },
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
        const query = (args.name || '').toString().trim().toLowerCase();
        
        // Récupérer toutes les personnes
        const { data: allPeople, error } = await supabaseClient
          .from('people')
          .select('id, first_name, last_name, title, bio');

        if (error) throw error;

        // Fonction de normalisation (enlève accents, minuscules, trim)
        const normalize = (str: string) => 
          str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

        const normalizedQuery = normalize(query);

        // Scoring de pertinence pour chaque personne
        const scored = (allPeople || []).map((person: any) => {
          const firstName = normalize(person.first_name);
          const lastName = normalize(person.last_name);
          const fullName = `${firstName} ${lastName}`;
          
          let score = 0;

          // Correspondance exacte = score maximal
          if (firstName === normalizedQuery || lastName === normalizedQuery) score += 100;
          if (fullName === normalizedQuery) score += 150;

          // Commence par la requête
          if (firstName.startsWith(normalizedQuery)) score += 50;
          if (lastName.startsWith(normalizedQuery)) score += 50;
          if (fullName.startsWith(normalizedQuery)) score += 75;

          // Contient la requête
          if (firstName.includes(normalizedQuery)) score += 25;
          if (lastName.includes(normalizedQuery)) score += 25;
          if (fullName.includes(normalizedQuery)) score += 35;

          // Recherche par mots individuels
          const queryWords = normalizedQuery.split(/\s+/);
          queryWords.forEach(word => {
            if (word.length > 2) {
              if (firstName.includes(word)) score += 15;
              if (lastName.includes(word)) score += 15;
            }
          });

          return { ...person, score };
        });

        // Filtrer (score > 0) et trier par score décroissant
        const matches = scored
          .filter((p: any) => p.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 10)
          .map(({ score, ...person }: any) => person);

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

      case "rename_person_by_name": {
        const originalFirst = (args.original_first_name || '').toString().trim().toLowerCase();
        const originalLast = (args.original_last_name || '').toString().trim().toLowerCase();

        const { data: persons, error } = await supabaseClient
          .from('people')
          .select('id, first_name, last_name');

        if (error) throw error;

        const target = persons.find((p: any) =>
          p.first_name.toLowerCase() === originalFirst &&
          p.last_name.toLowerCase() === originalLast
        );

        if (!target) {
          return { success: false, error: "Aucune personne trouvée avec ce prénom et nom dans l'organigramme." };
        }

        const updates: any = {};
        if (args.new_first_name) updates.first_name = args.new_first_name;
        if (args.new_last_name) updates.last_name = args.new_last_name;

        const { data: updated, error: updateError } = await supabaseClient
          .from('people')
          .update(updates)
          .eq('id', target.id)
          .select('id, first_name, last_name, title')
          .single();

        if (updateError) throw updateError;
        return { success: true, person: updated };
      }

      case "create_value_chain": {
        // Créer la chaîne de valeur
        const { data: chain, error: chainError } = await supabaseClient
          .from('value_chains')
          .insert([{
            title: args.title,
            description: args.description || null,
          }])
          .select()
          .single();

        if (chainError) throw chainError;

        // Récupérer toutes les personnes pour le matching
        const { data: allPeople, error: peopleError } = await supabaseClient
          .from('people')
          .select('id, first_name, last_name');

        if (peopleError) throw peopleError;

        const createdSegments = [];
        
        // Créer chaque segment
        for (let i = 0; i < args.segments.length; i++) {
          const segment = args.segments[i];
          
          const { data: segmentData, error: segmentError } = await supabaseClient
            .from('value_chain_segments')
            .insert([{
              value_chain_id: chain.id,
              function_name: segment.function_name,
              display_order: i,
            }])
            .select()
            .single();

          if (segmentError) throw segmentError;

          // Assigner les acteurs si spécifiés
          if (segment.actors && segment.actors.length > 0) {
            for (const actorName of segment.actors) {
              const query = actorName.toString().trim().toLowerCase();
              const words = query.split(/\s+/);
              
              const person = allPeople.find((p: any) => {
                const firstName = p.first_name.toLowerCase();
                const lastName = p.last_name.toLowerCase();
                const fullName = `${firstName} ${lastName}`;
                
                if (words.length === 1) {
                  return firstName.includes(words[0]) || lastName.includes(words[0]);
                }
                return words.every(w => fullName.includes(w));
              });

              if (person) {
                await supabaseClient
                  .from('segment_actors')
                  .insert([{
                    segment_id: segmentData.id,
                    person_id: person.id,
                  }]);
              }
            }
          }

          createdSegments.push(segmentData);
        }

        return { success: true, chain, segments: createdSegments };
      }

      case "search_value_chain": {
        const query = (args.title || '').toString().trim().toLowerCase();
        
        const { data: chains, error } = await supabaseClient
          .from('value_chains')
          .select('*');

        if (error) throw error;

        const matches = chains.filter((c: any) => 
          c.title.toLowerCase().includes(query)
        );

        return { success: true, chains: matches };
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

    const systemPrompt = `Assistant IA pour organigrammes et chaînes de valeur.

RÈGLE : Toute info de l'utilisateur = demande de modification.

CAPACITÉS :
- Gérer les personnes (ajouter, modifier, renommer)
- Gérer les sections de l'organigramme
- Créer et gérer les chaînes de valeur avec segments et acteurs

PROCESSUS RAPIDE :
1. Nom mentionné ? → search_person(nom) ou rename_person_by_name si la question de confirmation contient l'ancien et le nouveau nom
2. Pour un simple renommage "Voulez-vous renommer X en Y ?" → privilégier rename_person_by_name avec le prénom+nom actuels (X) et le nouveau nom (Y)
3. Chaîne de valeur mentionnée ? → utiliser create_value_chain avec les segments et acteurs
4. "oui"/"ok" → exécuter l'outil choisi
5. Pas trouvé ? → Demande si ajouter

EXEMPLES PERSONNES :
- User: "Rodolphe Guilhot"
  → "Voulez-vous modifier Rodolphe Guilhot ?"
- User: "oui"
  → search_person("Rodolphe Guilhot")
- User: "renommer rodolphe simon en rodolphe guilhot"
  → rename_person_by_name({original_first_name: "Rodolphe", original_last_name: "Simon", new_last_name: "Guilhot"})

EXEMPLES CHAÎNES DE VALEUR :
- User: "Créer chaîne Edition avec segments : Design Nina, Gestion commandes Margot"
  → create_value_chain({
      title: "Edition",
      segments: [
        { function_name: "Design", actors: ["Nina"] },
        { function_name: "Gestion commandes", actors: ["Margot"] }
      ]
    })

IMPORTANT :
- Utilisez les @ mentions dans les descriptions pour identifier les acteurs
- Tous les acteurs doivent exister dans l'organigramme
- Demandez confirmation avant de créer une chaîne complexe

RÉPONSE : courte, structure seulement, pas de commentaires superflus.`;

  → search_person("Rodolphe")
  → Trouvé "Rodolphe Simon" (id: <UUID_RENVOYÉ_PAR_SEARCH_PERSON>)
  → "Voulez-vous renommer Rodolphe Simon en Rodolphe Guilhot ?"
  → Sur "oui" : rename_person_by_name(original_first_name: "Rodolphe", original_last_name: "Simon", new_last_name: "Guilhot")

CRITIQUE :
- Utiliser de préférence rename_person_by_name pour les renommages simples
- TOUJOURS utiliser l'UUID exact de search_person si vous utilisez edit_person
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
