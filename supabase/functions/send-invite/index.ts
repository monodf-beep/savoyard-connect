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

    const { email, firstName, baseUrl, personId }: { 
      email?: string; 
      firstName?: string; 
      baseUrl?: string;
      personId?: string;
    } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!firstName || firstName.trim() === "") {
      return new Response(JSON.stringify({ error: "Le prénom est obligatoire" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get organization settings for logo
    const { data: orgSettings } = await supabase
      .from("organization_settings")
      .select("logo_url, name")
      .single();

    const origin = baseUrl || req.headers.get("origin") || "";
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Insert invite with person_id if provided
    const insertData: { 
      email: string; 
      token: string; 
      expires_at: string; 
      status: string;
      person_id?: string;
    } = { 
      email, 
      token, 
      expires_at: expiresAt, 
      status: "pending" 
    };
    
    if (personId) {
      insertData.person_id = personId;
    }

    const { data: invite, error: insertError } = await supabase
      .from("invites")
      .insert(insertData)
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erreur lors de la création de l'invitation" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const link = `${origin}/onboarding?token=${token}`;

    const logoHtml = orgSettings?.logo_url 
      ? `<div style="text-align: center; margin: 40px 0;"><img src="${orgSettings.logo_url}" alt="Logo ${orgSettings?.name || 'Organisation'}" style="max-width: 200px; height: auto;" /></div>`
      : '';

    const orgName = orgSettings?.name || "l'organisation";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        ${logoHtml}
        <p>Bonjour ${firstName},</p>
        <p>Nous mettons à jour l'organigramme de ${orgName}. Pour que ton rôle apparaisse correctement dans la structure, ta fiche doit être complétée.</p>
        <p>Utilise le lien ci-dessous pour renseigner tes informations.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" target="_blank" rel="noopener" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Compléter votre profil</a>
        </div>
        <p style="color: #666; font-size: 14px;">Le lien restera actif 14 jours.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 0;"><strong>Sylvie Rollin</strong></p>
          <p style="margin: 5px 0; color: #666;">Conseil d'Administration. Responsable Ressources Humaines.</p>
        </div>
      </div>
    `;

    console.log("Sending email to:", email);

    const { error: emailError } = await resend.emails.send({
      from: "contact@langue-savoyarde.com",
      to: [email],
      subject: `Mise à jour de votre fiche - organigramme interne ${orgName}`,
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Still return the link even if email fails
      return new Response(JSON.stringify({ 
        ok: false,
        error: "Erreur d'envoi de l'email", 
        details: emailError.message || "Vérifiez que votre domaine est configuré dans Resend",
        link, // Return the link so user can copy it manually
        inviteId: invite?.id
      }), {
        status: 200, // Return 200 so we can show the link
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully to:", email);

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