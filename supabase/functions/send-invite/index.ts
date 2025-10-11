import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { email, baseUrl }: { email?: string; baseUrl?: string } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const origin = baseUrl || req.headers.get("origin") || "";
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Insert invite - RLS will enforce admin permissions via forwarded JWT
    const { data: invite, error: insertError } = await supabase
      .from("invites")
      .insert({ email, token, expires_at: expiresAt, status: "pending" })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Insert invite error:", insertError);
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const link = `${origin}/onboarding?token=${token}`;

    const html = `
      <div>
        <h1>Complétez votre profil</h1>
        <p>Bonjour,</p>
        <p>Un administrateur vous invite à compléter votre fiche. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${link}" target="_blank" rel="noopener">Compléter mon profil</a></p>
        <p>Ce lien expirera dans 14 jours.</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Institut <onboarding@resend.dev>",
      to: [email],
      subject: "Invitation à compléter votre profil",
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(JSON.stringify({ error: "Erreur d'envoi de l'email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, inviteId: invite?.id, link }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("send-invite error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});