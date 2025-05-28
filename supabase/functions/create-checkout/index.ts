
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💳 Create Checkout - Iniciando processo');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      console.error('❌ Stripe key não configurada');
      return new Response(
        JSON.stringify({ error: 'Stripe não configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { priceId, planType, successUrl, cancelUrl } = await req.json();

    console.log(`💰 Criando checkout para usuário ${user.id}, plano: ${planType}`);

    // Mapear planos para preços
    const planPrices = {
      'basic': 'price_basic_monthly', // Substitua pelos IDs reais do Stripe
      'premium': 'price_premium_monthly',
      'enterprise': 'price_enterprise_monthly'
    };

    const stripePrice = priceId || planPrices[planType];
    
    if (!stripePrice) {
      return new Response(
        JSON.stringify({ error: 'Plano inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar ou criar customer no Stripe
    let customerId;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Criar sessão de checkout do Stripe
    const checkoutData = {
      mode: 'subscription',
      line_items: [{
        price: stripePrice,
        quantity: 1,
      }],
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard?checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan_type: planType
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType
        }
      }
    };

    console.log('🔄 Criando sessão no Stripe...');

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': checkoutData.mode,
        'line_items[0][price]': checkoutData.line_items[0].price,
        'line_items[0][quantity]': checkoutData.line_items[0].quantity.toString(),
        'success_url': checkoutData.success_url,
        'cancel_url': checkoutData.cancel_url,
        'client_reference_id': checkoutData.client_reference_id,
        'customer_email': checkoutData.customer_email,
        'metadata[user_id]': checkoutData.metadata.user_id,
        'metadata[plan_type]': checkoutData.metadata.plan_type,
        'subscription_data[metadata][user_id]': checkoutData.subscription_data.metadata.user_id,
        'subscription_data[metadata][plan_type]': checkoutData.subscription_data.metadata.plan_type,
      }),
    });

    if (!stripeResponse.ok) {
      console.error('❌ Erro no Stripe:', stripeResponse.status);
      const errorText = await stripeResponse.text();
      console.error('Erro detalhado:', errorText);
      throw new Error(`Erro no Stripe: ${stripeResponse.status}`);
    }

    const session = await stripeResponse.json();
    console.log('✅ Sessão de checkout criada:', session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro no checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao criar checkout',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
