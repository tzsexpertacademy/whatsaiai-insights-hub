
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [WPPCONNECT-PROXY] Processando requisição...');
    
    const { 
      method, 
      url: targetUrl, 
      headers: requestHeaders, 
      body: requestBody,
      chatId,
      messageLimit = 50 
    } = await req.json();

    console.log('📋 [WPPCONNECT-PROXY] Parâmetros:', {
      method,
      targetUrl,
      chatId,
      messageLimit,
      hasBody: !!requestBody
    });

    // Headers para o WPPConnect
    const proxyHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Copia headers de autorização se existirem
    if (requestHeaders?.Authorization) {
      proxyHeaders['Authorization'] = requestHeaders.Authorization;
    }
    if (requestHeaders?.['X-Session-Token']) {
      proxyHeaders['X-Session-Token'] = requestHeaders['X-Session-Token'];
    }

    let finalUrl = targetUrl;
    let finalBody = requestBody;

    // Detecta se é requisição de mensagens e ajusta parâmetros
    if (targetUrl.includes('/get-messages') || targetUrl.includes('/chat-messages') || targetUrl.includes('/messages')) {
      console.log('📱 [WPPCONNECT-PROXY] Detectada requisição de mensagens - aplicando correção de limite');

      if (method === 'GET') {
        // Para GET, adiciona/substitui o parâmetro limit na URL
        const url = new URL(targetUrl);
        url.searchParams.set('limit', messageLimit.toString());
        url.searchParams.set('count', messageLimit.toString());
        url.searchParams.set('max', messageLimit.toString());
        finalUrl = url.toString();
        
        console.log('🔧 [WPPCONNECT-PROXY] URL ajustada para GET:', finalUrl);
      } else if (method === 'POST') {
        // Para POST, garante que o body tenha o limite correto
        const bodyData = requestBody ? JSON.parse(requestBody) : {};
        bodyData.limit = messageLimit;
        bodyData.count = messageLimit;
        bodyData.max = messageLimit;
        
        if (chatId) {
          bodyData.chatId = chatId;
        }
        
        finalBody = JSON.stringify(bodyData);
        console.log('🔧 [WPPCONNECT-PROXY] Body ajustado para POST:', finalBody);
      }
    }

    // Faz a requisição para o WPPConnect
    console.log('🌐 [WPPCONNECT-PROXY] Fazendo requisição para WPPConnect...');
    
    const proxyResponse = await fetch(finalUrl, {
      method: method,
      headers: proxyHeaders,
      body: finalBody || undefined
    });

    console.log('📊 [WPPCONNECT-PROXY] Resposta do WPPConnect:', {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      console.error('❌ [WPPCONNECT-PROXY] Erro do WPPConnect:', errorText);
      
      return new Response(JSON.stringify({ 
        error: `WPPConnect error: ${proxyResponse.status}`,
        details: errorText 
      }), {
        status: proxyResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const responseData = await proxyResponse.json();
    
    // Log do resultado para debug
    if (Array.isArray(responseData) || (responseData.response && Array.isArray(responseData.response))) {
      const messages = Array.isArray(responseData) ? responseData : responseData.response;
      console.log('✅ [WPPCONNECT-PROXY] Mensagens retornadas:', {
        solicitado: messageLimit,
        recebido: messages.length,
        limiteFuncionando: messages.length >= Math.min(messageLimit, 20) // Se tem pelo menos o que pediu ou pelo menos mais que 20
      });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [WPPCONNECT-PROXY] Erro geral:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Proxy error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
