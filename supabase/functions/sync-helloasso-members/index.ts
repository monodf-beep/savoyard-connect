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
  date: string;
  amount: number;
  state: string;
  payer: {
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  items?: Array<{
    type: string;
    name: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('HELLOASSO_CLIENT_ID');
    const clientSecret = Deno.env.get('HELLOASSO_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret) {
      throw new Error('HelloAsso credentials not configured');
    }

    const { organizationSlug } = await req.json();
    
    if (!organizationSlug) {
      throw new Error('organizationSlug is required');
    }

    console.log(`Syncing HelloAsso members for org: ${organizationSlug}`);

    // Get OAuth token
    const tokenResponse = await fetch('https://api.helloasso.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error(`Failed to get HelloAsso token: ${tokenResponse.status}`);
    }

    const tokenData: HelloAssoToken = await tokenResponse.json();
    console.log('Got HelloAsso token');

    // First, get all forms for this organization
    const formsResponse = await fetch(
      `https://api.helloasso.com/v5/organizations/${organizationSlug}/forms?formTypes=Membership,Donation&pageSize=100`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!formsResponse.ok) {
      const errorText = await formsResponse.text();
      console.error('Forms error:', errorText);
      throw new Error(`Failed to fetch forms: ${formsResponse.status}`);
    }

    const formsData = await formsResponse.json();
    const forms = formsData.data || [];
    console.log(`Found ${forms.length} forms`);

    // Collect all payments from all forms
    const payments: HelloAssoPayment[] = [];
    
    for (const form of forms) {
      try {
        const formPaymentsResponse = await fetch(
          `https://api.helloasso.com/v5/organizations/${organizationSlug}/forms/${form.formType}/${form.formSlug}/payments?pageSize=100&states=Authorized`,
          {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          }
        );

        if (formPaymentsResponse.ok) {
          const formPaymentsData = await formPaymentsResponse.json();
          const formPayments = formPaymentsData.data || [];
          console.log(`Form ${form.formSlug}: ${formPayments.length} payments`);
          payments.push(...formPayments);
        } else {
          console.warn(`Could not fetch payments for form ${form.formSlug}: ${formPaymentsResponse.status}`);
        }
      } catch (e) {
        console.warn(`Error fetching form ${form.formSlug}:`, e);
      }
    }
    
    console.log(`Total fetched ${payments.length} payments`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Process members (adhesion/membership payments)
    const members: Map<string, any> = new Map();
    const donors: Map<string, any> = new Map();

    for (const payment of payments) {
      if (payment.state !== 'Authorized') continue;
      
      const payer = payment.payer;
      const key = payer.email?.toLowerCase() || `${payer.firstName}-${payer.lastName}`.toLowerCase();
      
      // Check if it's a membership or donation
      const isMembership = payment.items?.some(item => 
        item.type === 'Membership' || 
        item.name?.toLowerCase().includes('adhésion') ||
        item.name?.toLowerCase().includes('adhesion')
      );

      if (isMembership) {
        // Add to members
        if (!members.has(key)) {
          members.set(key, {
            helloasso_id: String(payment.id),
            first_name: payer.firstName,
            last_name: payer.lastName,
            email: payer.email,
            city: payer.city,
            postal_code: payer.zipCode,
            country: payer.country,
            membership_date: payment.date.split('T')[0],
            membership_type: payment.items?.[0]?.name || 'Adhésion',
            amount: payment.amount / 100, // Convert from cents
          });
        }
      } else {
        // Add to donors
        const existing = donors.get(key);
        if (existing) {
          existing.total_donated += payment.amount / 100;
          existing.donation_count += 1;
          if (new Date(payment.date) > new Date(existing.last_donation_date)) {
            existing.last_donation_date = payment.date.split('T')[0];
          }
        } else {
          donors.set(key, {
            helloasso_id: String(payment.id),
            first_name: payer.firstName,
            last_name: payer.lastName,
            email: payer.email,
            total_donated: payment.amount / 100,
            donation_count: 1,
            last_donation_date: payment.date.split('T')[0],
          });
        }
      }
    }

    console.log(`Found ${members.size} members and ${donors.size} donors`);

    // Upsert members
    for (const member of members.values()) {
      const { error } = await supabase
        .from('helloasso_members')
        .upsert(member, { 
          onConflict: 'helloasso_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting member:', error);
      }
    }

    // Upsert donors
    for (const donor of donors.values()) {
      const { error } = await supabase
        .from('helloasso_donors')
        .upsert(donor, { 
          onConflict: 'helloasso_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting donor:', error);
      }
    }

    // Update member count in settings
    const totalMembers = members.size;
    await supabase
      .from('community_settings')
      .upsert({
        key: 'current_members',
        value: { count: totalMembers, manual_addition: 0 },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    return new Response(
      JSON.stringify({
        success: true,
        members_synced: members.size,
        donors_synced: donors.size,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
