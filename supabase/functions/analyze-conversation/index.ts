
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
          error: 'Configuração do servidor incompleta - variáveis de ambiente ausentes'
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
        openai_model: requestBody.openai_config?.model,
        has_analysis_prompt: !!requestBody.analysis_prompt
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

    // Extrair e validar dados do payload
    const {
      conversation_id,
      messages,
      analysis_prompt,
      analysis_type,
      assistant_id,
      contact_info,
      openai_config
    } = requestBody;

    // Validação completa dos dados obrigatórios
    if (!conversation_id) {
      console.error('❌ conversation_id ausente');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ID da conversa é obrigatório'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Mensagens inválidas:', { 
        hasMessages: !!messages,
        isArray: Array.isArray(messages),
        length: messages?.length || 0
      });
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

    if (!analysis_prompt || typeof analysis_prompt !== 'string' || analysis_prompt.trim().length === 0) {
      console.error('❌ Prompt de análise inválido:', { 
        hasPrompt: !!analysis_prompt,
        type: typeof analysis_prompt,
        length: analysis_prompt?.length || 0
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt de análise é obrigatório e deve ser uma string válida'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validação rigorosa da configuração OpenAI
    if (!openai_config) {
      console.error('❌ Configuração OpenAI não fornecida');
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

    const { apiKey, model, temperature, maxTokens } = openai_config;
    
    if (!apiKey || typeof apiKey !== 'string') {
      console.error('❌ API Key da OpenAI ausente ou inválida');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key da OpenAI não fornecida'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey.startsWith('sk-')) {
      console.error('❌ API Key da OpenAI com formato inválido');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key da OpenAI inválida. Deve começar com sk-'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (apiKey.length < 50) {
      console.error('❌ API Key da OpenAI muito curta');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API Key da OpenAI parece estar incompleta'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Configuração OpenAI validada:', {
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 15) + '...',
      model: model || 'gpt-4o-mini',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2000
    });

    // Verificar autenticação do usuário
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Token de autorização ausente ou inválido');
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

    // Processar e filtrar mensagens válidas
    console.log('📝 Processando mensagens...');
    const validMessages = messages.filter(msg => {
      if (!msg || !msg.text || typeof msg.text !== 'string') return false;
      
      const text = msg.text.trim();
      if (text.length === 0) return false;
      if (text === 'Mensagem sem texto') return false;
      if (text.includes('🎵 Áudio')) return false;
      if (text.startsWith('/9j/')) return false; // Base64 images
      if (text.startsWith('data:')) return false; // Data URLs
      
      return true;
    });

    console.log('📊 Mensagens processadas:', {
      totalOriginal: messages.length,
      validAfterFilter: validMessages.length,
      filterRatio: `${((validMessages.length / messages.length) * 100).toFixed(1)}%`
    });

    if (validMessages.length === 0) {
      console.error('❌ Nenhuma mensagem válida após filtragem');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma mensagem de texto válida encontrada para análise. A conversa pode conter apenas áudios, imagens ou mensagens vazias.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar texto da conversa
    const conversationText = validMessages
      .map(msg => {
        const sender = msg.fromMe ? 'Você' : (contact_info?.name || 'Contato');
        const timestamp = msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleString('pt-BR') : '';
        return `[${timestamp}] ${sender}: ${msg.text.trim()}`;
      })
      .join('\n\n');

    console.log('📋 Conversa preparada:', {
      textLength: conversationText.length,
      estimatedTokens: Math.ceil(conversationText.length / 4),
      promptLength: analysis_prompt.length
    });

    // Validar se o texto não é muito longo
    const estimatedTokens = Math.ceil((conversationText.length + analysis_prompt.length) / 4);
    const maxAllowedTokens = (maxTokens || 2000) * 3; // 3x buffer for safety
    
    if (estimatedTokens > maxAllowedTokens) {
      console.warn('⚠️ Texto muito longo, truncando...');
      const maxChars = maxAllowedTokens * 4;
      const truncatedText = conversationText.substring(0, maxChars) + '\n\n[... conversa truncada para caber no limite de tokens ...]';
      conversationText = truncatedText;
    }

    // Chamar OpenAI API
    console.log('🤖 Enviando para OpenAI...');
    
    const openaiPayload = {
      model: model || 'gpt-4o-mini',
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
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000
    };

    console.log('🔄 Payload para OpenAI:', {
      model: openaiPayload.model,
      systemPromptLength: openaiPayload.messages[0].content.length,
      userContentLength: openaiPayload.messages[1].content.length,
      temperature: openaiPayload.temperature,
      maxTokens: openaiPayload.max_tokens
    });

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    });

    console.log('📡 Status da resposta OpenAI:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ Erro da OpenAI:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      });
      
      let errorMessage = 'Erro na API da OpenAI';
      if (openaiResponse.status === 401) {
        errorMessage = 'API Key da OpenAI inválida. Verifique sua configuração.';
      } else if (openaiResponse.status === 429) {
        errorMessage = 'Limite de uso da OpenAI excedido. Tente novamente em alguns minutos.';
      } else if (openaiResponse.status === 400) {
        errorMessage = 'Requisição inválida para OpenAI. Verifique o prompt e dados.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: `Status ${openaiResponse.status}: ${errorText}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiData = await openaiResponse.json();
    console.log('✅ Resposta da OpenAI recebida:', {
      hasChoices: !!aiData.choices,
      choicesLength: aiData.choices?.length || 0,
      usage: aiData.usage
    });

    const analysisResult = aiData.choices?.[0]?.message?.content;

    if (!analysisResult || typeof analysisResult !== 'string' || analysisResult.trim().length === 0) {
      console.error('❌ Resposta vazia ou inválida da OpenAI');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'A IA não conseguiu gerar uma análise válida'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📊 Análise gerada:', {
      length: analysisResult.length,
      preview: analysisResult.substring(0, 100) + '...'
    });

    // Salvar insight no banco
    const insightData = {
      user_id: userId,
      title: `Análise ${analysis_type}: ${contact_info?.name || 'Conversa'}`,
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
        messages_analyzed: validMessages.length,
        openai_model: model || 'gpt-4o-mini',
        tokens_used: aiData.usage?.total_tokens || 0
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
      console.warn('Continuando sem salvar insight...');
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
        openai_model_used: model || 'gpt-4o-mini',
        tokens_used: aiData.usage?.total_tokens || 0,
        processing_time_ms: Date.now()
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
    console.error('Stack trace completo:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno do servidor: ${error.message}`,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
