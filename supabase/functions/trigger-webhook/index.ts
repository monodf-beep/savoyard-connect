import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { association_id, event, payload } = await req.json();

    if (!association_id || !event) {
      return new Response(JSON.stringify({ error: "Missing association_id or event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch active webhooks for this association that listen to this event
    const { data: webhooks, error: fetchErr } = await supabase
      .from("association_webhooks")
      .select("*")
      .eq("association_id", association_id)
      .eq("is_active", true)
      .contains("events", [event]);

    if (fetchErr) {
      console.error("Error fetching webhooks:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!webhooks || webhooks.length === 0) {
      return new Response(JSON.stringify({ triggered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled(
      webhooks.map(async (wh: any) => {
        const body = {
          text: `[Associacion] ${event}: ${payload?.title || payload?.name || "Nouvel événement"}`,
          content: `[Associacion] ${event}: ${payload?.title || payload?.name || "Nouvel événement"}`,
          event,
          data: payload,
          timestamp: new Date().toISOString(),
        };

        let statusCode = 0;
        let responseBody = "";
        try {
          const resp = await fetch(wh.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          statusCode = resp.status;
          responseBody = await resp.text();
        } catch (e: any) {
          statusCode = 0;
          responseBody = e.message;
        }

        // Log the result
        await supabase.from("webhook_logs").insert({
          webhook_id: wh.id,
          association_id,
          event,
          service: wh.service,
          status_code: statusCode,
          response_body: responseBody.slice(0, 500),
          payload: body,
        });

        return { service: wh.service, statusCode };
      })
    );

    return new Response(
      JSON.stringify({ triggered: webhooks.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("trigger-webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
