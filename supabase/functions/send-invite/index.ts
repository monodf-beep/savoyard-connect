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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's JWT to verify admin role
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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

    // Insert invite
    const { data: invite, error: insertError } = await supabase
      .from("invites")
      .insert({ email, token, expires_at: expiresAt, status: "pending" })
      .select()
      .maybeSingle();

    if (insertError) {
      return new Response(JSON.stringify({ error: "Erreur lors de la création de l'invitation" }), {
        status: 500,
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

    // En mode test (sans domaine vérifié), Resend n'autorise l'envoi qu'à votre propre email
    // et l'expéditeur doit être votre adresse email vérifiée
    const { error: emailError } = await resend.emails.send({
      from: "monodf@hotmail.com",
      to: [email],
      subject: "Invitation à compléter votre profil",
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(JSON.stringify({ 
        error: "Erreur d'envoi de l'email", 
        details: emailError.message || "Vérifiez que votre domaine est configuré dans Resend"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, inviteId: invite?.id, link }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    if (Deno.env.get("DENO_ENV") !== "production") console.error("send-invite error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});