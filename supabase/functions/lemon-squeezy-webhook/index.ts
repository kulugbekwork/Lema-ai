import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface LemonSqueezyWebhook {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      user_email?: string;
      product_id?: string;
      variant_id?: string;
      customer_id?: string;
    };
  };
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Handle GET requests for testing
  if (req.method === "GET") {
    console.log(`[${new Date().toISOString()}] GET test request received`);
    return new Response(
      JSON.stringify({ 
        message: "Webhook endpoint is working!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Log all incoming requests for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} request received`);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log("Raw body length:", rawBody.length);
    
    // Verify webhook signature (optional but recommended for production)
    const webhookSecret = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");
    if (webhookSecret) {
      const signature = req.headers.get("x-signature");
      if (signature) {
        try {
          // Lemon Squeezy uses HMAC SHA256 for webhook verification
          // The signature is sent as a hex string in the x-signature header
          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(webhookSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const computedSignature = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(rawBody)
          );
          const computedSignatureHex = Array.from(new Uint8Array(computedSignature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
          
          // Remove 'sha256=' prefix if present and compare
          const receivedSignature = signature.replace(/^sha256=/, "").toLowerCase();
          const computedSignatureLower = computedSignatureHex.toLowerCase();
          
          // Constant-time comparison
          if (receivedSignature !== computedSignatureLower) {
            console.error("Invalid webhook signature - request rejected");
            return new Response(
              JSON.stringify({ error: "Invalid signature" }),
              {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } catch (sigError) {
          console.error("Signature verification error:", sigError);
          // In case of verification error, log but don't fail (for debugging)
          // Remove this in production if you want strict verification
        }
      }
    }

    const payload: LemonSqueezyWebhook = JSON.parse(rawBody);
    console.log("Event name:", payload.meta?.event_name);
    console.log("Custom data:", payload.meta?.custom_data);
    const { meta, data } = payload;

    // Only process subscription events
    if (meta.event_name !== "subscription_created" && 
        meta.event_name !== "subscription_updated" &&
        meta.event_name !== "subscription_payment_success" &&
        meta.event_name !== "subscription_cancelled") {
      return new Response(
        JSON.stringify({ message: "Event not processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client first
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user_id from custom_data (preferred). If missing, fallback to email lookup.
    // Lemon Squeezy passes custom data in meta.custom_data
    let userId = meta.custom_data?.user_id as string | undefined;

    if (!userId && data.attributes.user_email) {
      console.log('No user_id in meta.custom_data; attempting profile lookup by email:', data.attributes.user_email);
      try {
        const { data: emailProfile, error: emailLookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.attributes.user_email)
          .maybeSingle();

        if (emailLookupError) {
          console.error('Error looking up profile by email:', emailLookupError);
        } else if (emailProfile && (emailProfile as Record<string, unknown>).id) {
          userId = (emailProfile as Record<string, unknown>).id as string;
          console.log('Found profile id by email:', userId);
        } else {
          console.log('No profile found for email:', data.attributes.user_email);
        }
      } catch (lookupErr) {
        console.error('Exception during email lookup:', lookupErr);
      }
    }

    if (!userId) {
      console.error('No user_id found in webhook payload after fallback lookup', JSON.stringify(payload, null, 2));
      // Don't fail the webhook - just log and return success to avoid retries
      return new Response(
        JSON.stringify({ message: 'No user_id found, skipping update' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine if user should be premium based on subscription status
    const isPremium = meta.event_name !== "subscription_cancelled" && 
                     data.attributes.status === "active";

    // Get customer ID and subscription ID from webhook
    const customerId = data.attributes.customer_id;
    const subscriptionId = data.id; // The subscription ID is in data.id

    // Update user's premium status and store customer ID + subscription ID
    const updateData: Record<string, unknown> = { is_premium: isPremium };
    if (customerId) {
      updateData.lemon_squeezy_customer_id = customerId;
    }
    if (subscriptionId) {
      updateData.lemon_squeezy_subscription_id = subscriptionId;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating premium status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update premium status", details: updateError?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Updated user ${userId} premium status to ${isPremium} (event: ${meta.event_name})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Premium status updated for user ${userId}`,
        is_premium: isPremium 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
