import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HelloAssoToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface HelloAssoPayment {
  id: number;
  amount: number;
  state: string;
  date: string;
  payer?: {
    firstName?: string;
    lastName?: string;
  };
}

interface HelloAssoForm {
  formSlug: string;
  formType: string;
  organizationSlug: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('HELLOASSO_CLIENT_ID');
    const clientSecret = Deno.env.get('HELLOASSO_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!clientId || !clientSecret) {
      throw new Error('HelloAsso credentials not configured');
    }

    // Parse request body
    const { organizationSlug, formSlug, projectId } = await req.json();

    if (!organizationSlug || !formSlug || !projectId) {
      throw new Error('Missing required parameters: organizationSlug, formSlug, projectId');
    }

    console.log(`Syncing HelloAsso for org: ${organizationSlug}, form: ${formSlug}, project: ${projectId}`);

    // Step 1: Get OAuth2 token
    const tokenResponse = await fetch('https://api.helloasso.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error(`Failed to get HelloAsso token: ${tokenResponse.status}`);
    }

    const tokenData: HelloAssoToken = await tokenResponse.json();
    console.log('Successfully obtained HelloAsso token');

    // Step 2: Get payments for the form
    const paymentsUrl = `https://api.helloasso.com/v5/organizations/${organizationSlug}/forms/Donation/${formSlug}/payments`;
    console.log('Fetching payments from:', paymentsUrl);

    const paymentsResponse = await fetch(paymentsUrl, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!paymentsResponse.ok) {
      const errorText = await paymentsResponse.text();
      console.error('Payments error:', errorText);
      throw new Error(`Failed to get payments: ${paymentsResponse.status}`);
    }

    const paymentsData = await paymentsResponse.json();
    const payments: HelloAssoPayment[] = paymentsData.data || [];

    console.log(`Found ${payments.length} payments`);

    // Step 3: Calculate totals
    const validPayments = payments.filter(p => p.state === 'Authorized');
    const haNetTotal = validPayments.reduce((sum, p) => sum + (p.amount / 100), 0); // HelloAsso amounts are in cents
    const supporterCount = new Set(validPayments.map(p => 
      `${p.payer?.firstName || ''}-${p.payer?.lastName || ''}`
    )).size;

    console.log(`Calculated: haNetTotal=${haNetTotal}, supporterCount=${supporterCount}`);

    // Step 4: Update project in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        ha_net_total: haNetTotal,
        supporter_count: supporterCount,
        funded_amount: haNetTotal, // Update funded_amount with HelloAsso total
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    console.log('Successfully synced HelloAsso data to project');

    return new Response(
      JSON.stringify({
        success: true,
        ha_net_total: haNetTotal,
        supporter_count: supporterCount,
        payments_count: validPayments.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-helloasso:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
