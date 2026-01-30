import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CheckoutRequest {
  productId: string;
  email: string;
  userId: string;
}

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
    const { productId, email, userId }: CheckoutRequest = await req.json();

    if (!productId || !email || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productId, email, userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("LEMON_SQUEEZY_API_KEY");
    const storeId = Deno.env.get("LEMON_SQUEEZY_STORE_ID");

    if (!apiKey || !storeId) {
      console.error("Missing API credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create checkout session using Lemon Squeezy API
    const checkoutResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email,
              custom: {
                user_id: userId,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: productId,
              },
            },
          },
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error("Lemon Squeezy API error:", errorData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create checkout session",
          details: errorData 
        }),
        {
          status: checkoutResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const checkoutData = await checkoutResponse.json();
    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error("No checkout URL in response:", checkoutData);
      return new Response(
        JSON.stringify({ error: "No checkout URL returned" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Checkout created for user ${userId}: ${checkoutUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        checkoutUrl: checkoutUrl 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating checkout:", error);
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
