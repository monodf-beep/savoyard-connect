import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, filename, secret } = await req.json();

    // Verify webhook secret or JWT
    const expectedSecret = Deno.env.get("TRANSCRIPT_WEBHOOK_SECRET");
    if (!expectedSecret || secret !== expectedSecret) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Transcript text is required (min 20 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load sections and people
    const [sectionsRes, peopleRes] = await Promise.all([
      supabase.from("sections").select("id, title, parent_id"),
      supabase.from("people").select("id, first_name, last_name, title"),
    ]);

    const sections = sectionsRes.data || [];
    const people = peopleRes.data || [];

    const sectionsContext = sections
      .map((s) => `- "${s.title}" (id: ${s.id})`)
      .join("\n");
    const peopleContext = people
      .map((p) => `- "${p.first_name} ${p.last_name}" (id: ${p.id}, poste: ${p.title || "N/A"})`)
      .join("\n");

    const systemPrompt = `Tu es un assistant qui analyse des transcriptions de réunions d'association.
Tu dois extraire les actions concrètes, tâches et projets décidés pendant la réunion.
Tu dois aussi générer un résumé factuel de la réunion en 3 lignes maximum.

Voici les sections/commissions de l'association :
${sectionsContext}

Voici les membres de l'association :
${peopleContext}

Pour chaque action identifiée, tu dois :
1. Donner un titre clair et concis
2. Rédiger une description détaillée
3. Identifier la personne responsable parmi les membres (si mentionnée)
4. Identifier la section concernée parmi les sections existantes
5. Si tu ne trouves pas de correspondance exacte, mets null pour l'ID et indique le nom tel que mentionné

Utilise l'outil extract_action_items pour retourner les actions ET le résumé de la réunion.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyse cette transcription de réunion et extrais toutes les actions/projets décidés, ainsi qu'un résumé en 3 lignes :\n\n${transcript}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_action_items",
                description:
                  "Extraire les actions, projets et le résumé de la réunion",
                parameters: {
                  type: "object",
                  properties: {
                    meeting_title: {
                      type: "string",
                      description: "Titre de la réunion (ex: 'Réunion CA du 15 février')",
                    },
                    meeting_summary: {
                      type: "string",
                      description: "Résumé factuel de la réunion en 3 lignes maximum",
                    },
                    attendees: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Nom du participant" },
                          email: { type: "string", nullable: true },
                        },
                        required: ["name"],
                        additionalProperties: false,
                      },
                      description: "Liste des participants identifiés dans la transcription",
                    },
                    actions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "Titre concis de l'action/projet" },
                          description: { type: "string", description: "Description détaillée" },
                          responsible_person_id: { type: "string", nullable: true },
                          responsible_name: { type: "string" },
                          section_id: { type: "string", nullable: true },
                          section_name: { type: "string" },
                        },
                        required: ["title", "description", "responsible_name", "section_name"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["meeting_title", "meeting_summary", "attendees", "actions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_action_items" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'analyse IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "L'IA n'a pas pu extraire d'actions", actions: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    const actions = extracted.actions || [];
    const meetingTitle = extracted.meeting_title || filename || "Réunion sans titre";
    const meetingSummary = extracted.meeting_summary || null;
    const attendees = extracted.attendees || [];

    // Create meeting record
    const { data: meetingRecord, error: meetingError } = await supabase
      .from("meetings")
      .insert({
        title: meetingTitle,
        ai_summary: meetingSummary,
        attendees: attendees,
        transcript_filename: filename || null,
        start_time: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (meetingError) {
      console.error("Error creating meeting:", meetingError);
    }

    const meetingId = meetingRecord?.id || null;

    if (actions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          projects_created: 0,
          actions: [],
          meeting_id: meetingId,
          meeting_summary: meetingSummary,
          attendees,
          message: "Aucune action identifiée",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isWebhook = secret === expectedSecret;

    if (isWebhook) {
      const projectsToInsert = actions
        .filter((a: any) => a.section_id)
        .map((a: any) => ({
          title: a.title,
          description: a.description,
          section_id: a.section_id,
          status: "planned",
          approval_status: "pending",
          source_meeting_id: meetingId,
        }));

      if (projectsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("projects")
          .insert(projectsToInsert);

        if (insertError) {
          console.error("Error inserting projects:", insertError);
          return new Response(
            JSON.stringify({ error: "Erreur lors de la création des projets" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          projects_created: projectsToInsert.length,
          skipped: actions.length - projectsToInsert.length,
          meeting_id: meetingId,
          meeting_summary: meetingSummary,
          filename: filename || "unknown",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Manual import: return actions for preview, include meeting info
    return new Response(
      JSON.stringify({
        success: true,
        actions,
        meeting_id: meetingId,
        meeting_title: meetingTitle,
        meeting_summary: meetingSummary,
        attendees,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("process-transcript error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
