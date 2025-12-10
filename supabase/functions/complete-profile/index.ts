import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileData {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  description?: string;
  linkedin?: string;
  adresse: string;
  photo?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ProfileData = await req.json();
    const { token, firstName, lastName, email, phone, role, description, linkedin, adresse, photo } = body;

    // Validate required fields
    if (!token) {
      return new Response(JSON.stringify({ error: "Token manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !role?.trim() || !adresse?.trim()) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!photo?.trim()) {
      return new Response(JSON.stringify({ error: "La photo est obligatoire" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify the token
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("id, email, person_id, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !invite) {
      console.error("Invite lookup error:", inviteError);
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (invite.status !== "pending") {
      return new Response(JSON.stringify({ error: "Cette invitation a déjà été utilisée" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      return new Response(JSON.stringify({ error: "Cette invitation a expiré" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare person data
    const profileData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      title: role.trim(),
      bio: description?.trim() || null,
      linkedin: linkedin?.trim() || null,
      adresse: adresse.trim(),
      avatar_url: photo || null,
      updated_at: new Date().toISOString(),
    };

    let personId = invite.person_id;

    if (personId) {
      // Update existing person
      const { error: updateError } = await supabase
        .from("people")
        .update(profileData)
        .eq("id", personId);

      if (updateError) {
        console.error("Update person error:", updateError);
        return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour du profil" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      console.log(`Updated person ${personId}`);
    } else {
      // Create new person
      const { data: newPerson, error: insertError } = await supabase
        .from("people")
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert person error:", insertError);
        return new Response(JSON.stringify({ error: "Erreur lors de la création du profil" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      personId = newPerson.id;
      console.log(`Created new person ${personId}`);
    }

    // Mark invite as used
    const { error: inviteUpdateError } = await supabase
      .from("invites")
      .update({
        status: "used",
        person_id: personId,
      })
      .eq("id", invite.id);

    if (inviteUpdateError) {
      console.error("Invite update error:", inviteUpdateError);
      // Don't fail the request, profile was saved
    }

    console.log(`Profile completed successfully for invite ${invite.id}`);

    return new Response(JSON.stringify({ ok: true, personId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("complete-profile error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
