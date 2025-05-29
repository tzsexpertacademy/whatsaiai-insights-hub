
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Criar configuração básica do portal se não existir
    let portalSession;
    try {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/dashboard`,
      });
    } catch (portalError: any) {
      logStep("Portal creation failed, trying with configuration", { error: portalError.message });
      
      // Se falhar, tentar criar uma configuração básica
      try {
        const configuration = await stripe.billingPortal.configurations.create({
          business_profile: {
            privacy_policy_url: `${req.headers.get("origin") || "http://localhost:3000"}/privacy`,
            terms_of_service_url: `${req.headers.get("origin") || "http://localhost:3000"}/terms`,
          },
          features: {
            payment_method_update: { enabled: true },
            subscription_cancel: { enabled: true },
            subscription_pause: { enabled: false },
          },
        });
        
        const origin = req.headers.get("origin") || "http://localhost:3000";
        portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          configuration: configuration.id,
          return_url: `${origin}/dashboard`,
        });
      } catch (configError: any) {
        // Se ainda falhar, redirecionar para checkout
        logStep("Portal configuration failed, redirecting to checkout");
        return new Response(JSON.stringify({ 
          error: "Portal not available, redirecting to checkout",
          redirectToCheckout: true 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      redirectToCheckout: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
