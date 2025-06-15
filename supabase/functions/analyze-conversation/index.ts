
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 EDGE FUNCTION - analyze-conversation iniciada');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração do servidor incompleta',
          details: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Variáveis de ambiente OK');

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse do request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request body recebido:', {
        hasConversationId: !!requestBody.conversation_id,
        hasMessages: !!requestBody.messages,
        messagesCount: requestBody.messages?.length || 0,
        hasPrompt: !!requestBody.analysis_prompt,
        analysisType: requestBody.analysis_type,
        assistantId: requestBody.assistant_id
      });
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'JSON inválido no request body',
          details: error.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const {
      conversation_id,
      messages,
      analysis_prompt,
      analysis_type,
      assistant_id,
      contact_info
    } = requestBody;

    // Validações básicas
    if (!conversation_id) {
      console.error('❌ conversation_id ausente');
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
      console.error('❌ Mensagens inválidas:', { messages: messages?.slice(0, 3) });
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
          error: 'Usuário não autenticado',
          details: userError?.message
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = userData.user.id;
    console.log('✅ Usuário autenticado:', userId);

    // Buscar configuração OpenAI
    console.log('🔍 Buscando configuração OpenAI...');
    const { data: configData, error: configError } = await supabaseClient
      .from('client_configs')
      .select('openai_config')
      .eq('user_id', userId)
      .single();

    if (configError) {
      console.error('❌ Erro ao buscar configuração:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao acessar configuração do usuário',
          details: configError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!configData?.openai_config?.apiKey) {
      console.error('❌ API Key da OpenAI não encontrada');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configure sua API key da OpenAI nas configurações do sistema'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiConfig = configData.openai_config;
    console.log('✅ Configuração OpenAI encontrada');

    // Processar mensagens
    console.log('📝 Processando mensagens...');
    const validMessages = messages.filter(msg => 
      msg && 
      msg.text && 
      typeof msg.text === 'string' && 
      msg.text.trim().length > 0 && 
      msg.text !== 'Mensagem sem texto'
    );

    if (validMessages.length === 0) {
      console.error('❌ Nenhuma mensagem válida após filtragem');
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

    // Chamar OpenAI
    console.log('🤖 Enviando para OpenAI...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        temperature: 0.7,
        max_tokens: 2000
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
          error: `Erro da OpenAI: ${openaiResponse.status}`,
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
      // Não falhar se não conseguir salvar o insight
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
        assistant_id
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
