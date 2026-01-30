import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get the JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.substring(7);

    // Initialize Supabase client (service role) early so we can resolve the user from token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve user from access token using Supabase Auth (avoids manual JWT verification and alg mismatches)
    try {
      const { data: getUserData, error: getUserError } = await supabase.auth.getUser(token as string);
      if (getUserError || !getUserData?.user) {
        console.error('Error fetching user from token:', getUserError);
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      var userId = getUserData.user.id as string;
    } catch (err) {
      console.error('Error resolving user from token:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to resolve user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's subscription ID from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("lemon_squeezy_subscription_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const subscriptionId = (profile as Record<string, unknown>).lemon_squeezy_subscription_id;

    if (!subscriptionId) {
      console.error("No subscription ID found for user:", userId);
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch subscription details from Lemon Squeezy API
    const apiKey = Deno.env.get("LEMON_SQUEEZY_API_KEY");
    if (!apiKey) {
      console.error("LEMON_SQUEEZY_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const subscriptionResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      }
    );

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      console.error("Lemon Squeezy API error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch subscription details",
          details: errorData,
        }),
        {
          status: subscriptionResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const subscriptionData = await subscriptionResponse.json();
    console.log('Subscription API response:', subscriptionData);

    // Defensive extraction of customer portal URL from possible response shapes
    let portalUrl: string | undefined;
    try {
      const dataObj = subscriptionData?.data as unknown;
      const attributes = (dataObj as Record<string, unknown>)?.['attributes'] as Record<string, unknown> | undefined;
      const urls = attributes?.['urls'] as Record<string, unknown> | undefined;
      portalUrl = urls?.['customer_portal'] as string | undefined;
      if (!portalUrl) {
        // try other possible keys
        portalUrl = urls?.['portal'] as string | undefined;
      }
    } catch (err) {
      console.error('Error extracting portal URL:', err);
    }

    if (!portalUrl) {
      console.error('No customer portal URL in subscription data');
      return new Response(
        JSON.stringify({ error: 'Customer portal URL not available', details: subscriptionData }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Generated portal URL for user ${userId}: ${portalUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: portalUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating billing portal URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
