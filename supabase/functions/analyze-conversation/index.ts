
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 EDGE FUNCTION - analyze-conversation iniciada');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração do servidor incompleta'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request body recebido:', JSON.stringify({
        conversation_id: requestBody.conversation_id,
        messages_count: Array.isArray(requestBody.messages) ? requestBody.messages.length : 0,
        analysis_type: requestBody.analysis_type,
        assistant_id: requestBody.assistant_id,
        has_openai_config: !!requestBody.openai_config,
        openai_model: requestBody.openai_config?.model
      }));
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'JSON inválido no request body'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extrair dados do payload
    const conversation_id = requestBody.conversation_id;
    const messages = requestBody.messages;
    const analysis_prompt = requestBody.analysis_prompt;
    const analysis_type = requestBody.analysis_type;
    const assistant_id = requestBody.assistant_id;
    const contact_info = requestBody.contact_info;
    const openai_config = requestBody.openai_config; // ✅ NOVA: Receber config OpenAI do payload

    // Validações básicas
    if (!conversation_id) {
      console.error('❌ conversation_id ausente no payload');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'conversation_id é obrigatório'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Mensagens inválidas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma mensagem válida encontrada para análise'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!analysis_prompt || analysis_prompt.trim().length === 0) {
      console.error('❌ Prompt de análise vazio');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt de análise é obrigatório'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ NOVA: Verificar se a configuração OpenAI foi enviada no payload
    if (!openai_config || !openai_config.apiKey) {
      console.error('❌ Configuração OpenAI não enviada no payload');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração OpenAI não foi fornecida. Configure sua API key da OpenAI nas configurações.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ NOVA: Validar a API key recebida
    const openaiApiKey = openai_config.apiKey;
    if (!openaiApiKey || typeof openaiApiKey !== 'string' || openaiApiKey.length < 20 || !openaiApiKey.startsWith('sk-')) {
      console.error('❌ API Key da OpenAI inválida recebida no payload:', {
        hasApiKey: !!openaiApiKey,
        apiKeyLength: openaiApiKey?.length || 0,
        startsWithSk: openaiApiKey?.startsWith('sk-') || false
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key da OpenAI inválida. Verifique sua configuração OpenAI.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ API Key da OpenAI recebida e validada:', {
      length: openaiApiKey.length,
      prefix: openaiApiKey.substring(0, 10) + '...',
      model: openai_config.model || 'gpt-4o-mini'
    });

    // Verificar autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Token de autorização inválido');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autorização obrigatório'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 Verificando usuário...');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('❌ Erro de autenticação:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não autenticado'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = userData.user.id;
    console.log('✅ Usuário autenticado:', userId);

    // Processar mensagens
    console.log('📝 Processando mensagens...');
    const validMessages = messages.filter(msg => 
      msg && 
      msg.text && 
      typeof msg.text === 'string' && 
      msg.text.trim().length > 0 && 
      msg.text !== 'Mensagem sem texto' &&
      !msg.text.includes('🎵 Áudio') &&
      !msg.text.startsWith('/9j/') // Filtrar imagens base64
    );

    if (validMessages.length === 0) {
      console.error('❌ Nenhuma mensagem válida após filtragem');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma mensagem de texto válida encontrada para análise'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const conversationText = validMessages
      .map(msg => {
        const sender = msg.fromMe ? 'Você' : (contact_info?.name || 'Contato');
        return `[${sender}]: ${msg.text.trim()}`;
      })
      .join('\n\n');

    console.log('📊 Conversa preparada:', {
      totalMessages: messages.length,
      validMessages: validMessages.length,
      textLength: conversationText.length
    });

    // ✅ USAR A API KEY RECEBIDA NO PAYLOAD PARA CHAMAR OPENAI
    console.log('🤖 Enviando para OpenAI COM API KEY DO PAYLOAD...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`, // ✅ Usar a API key do payload
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openai_config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: analysis_prompt
          },
          {
            role: 'user',
            content: `Analise esta conversa do WhatsApp:\n\n${conversationText}`
          }
        ],
        temperature: openai_config.temperature || 0.7,
        max_tokens: openai_config.maxTokens || 2000
      }),
    });

    console.log('📡 Status da resposta OpenAI:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ Erro da OpenAI:', {
        status: openaiResponse.status,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro da OpenAI (${openaiResponse.status}): Verifique sua API key nas configurações.`,
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiData = await openaiResponse.json();
    console.log('✅ Resposta da OpenAI recebida');

    const analysisResult = aiData.choices?.[0]?.message?.content;

    if (!analysisResult || analysisResult.trim().length === 0) {
      console.error('❌ Resposta vazia da OpenAI');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'A IA não conseguiu gerar uma análise'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📊 Análise gerada com sucesso');

    // Salvar insight
    const insightData = {
      user_id: userId,
      title: `Análise: ${contact_info?.name || 'Conversa'}`,
      description: analysisResult.substring(0, 200) + (analysisResult.length > 200 ? '...' : ''),
      content: analysisResult,
      category: analysis_type || 'geral',
      insight_type: analysis_type || 'geral',
      priority: 'medium',
      status: 'active',
      metadata: {
        conversation_id,
        assistant_id,
        analysis_type,
        contact_info,
        generated_at: new Date().toISOString(),
        messages_analyzed: validMessages.length
      }
    };

    console.log('💾 Salvando insight...');
    const { data: savedInsight, error: insightError } = await supabaseClient
      .from('insights')
      .insert(insightData)
      .select()
      .single();

    if (insightError) {
      console.error('⚠️ Erro ao salvar insight:', insightError);
    } else {
      console.log('✅ Insight salvo:', savedInsight?.id);
    }

    const response = {
      success: true,
      insights: [{
        id: savedInsight?.id || `temp_${Date.now()}`,
        title: insightData.title,
        description: insightData.description,
        content: analysisResult,
        priority: 'medium',
        insight_type: analysis_type || 'geral',
        created_at: new Date().toISOString()
      }],
      message: 'Análise concluída com sucesso',
      metadata: {
        messages_analyzed: validMessages.length,
        analysis_type,
        assistant_id,
        openai_model_used: openai_config.model || 'gpt-4o-mini'
      }
    };

    console.log('🎉 Análise concluída com sucesso');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 ERRO CRÍTICO na Edge Function:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno do servidor: ${error.message}`,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
