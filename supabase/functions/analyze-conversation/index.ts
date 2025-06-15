
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
    console.log('🚀 Edge Function analyze-conversation started');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration incomplete'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body with error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('📥 Raw request body length:', rawBody.length);
      
      if (!rawBody || rawBody.trim().length === 0) {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(rawBody);
      console.log('✅ Request parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log request structure (without sensitive data)
    console.log('📋 Request structure:', {
      hasConversationId: !!requestBody.conversation_id,
      hasMessages: !!requestBody.messages,
      messagesLength: requestBody.messages?.length || 0,
      hasAnalysisPrompt: !!requestBody.analysis_prompt,
      hasOpenaiConfig: !!requestBody.openai_config,
      analysisType: requestBody.analysis_type,
      assistantId: requestBody.assistant_id
    });

    // Extract and validate required fields
    const {
      conversation_id,
      messages,
      analysis_prompt,
      analysis_type,
      assistant_id,
      contact_info,
      openai_config
    } = requestBody;

    // Validate conversation_id
    if (!conversation_id || typeof conversation_id !== 'string') {
      console.error('❌ Invalid conversation_id');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'conversation_id is required and must be a string'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Invalid messages array');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'messages must be a non-empty array'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate analysis_prompt
    if (!analysis_prompt || typeof analysis_prompt !== 'string' || analysis_prompt.trim().length === 0) {
      console.error('❌ Invalid analysis_prompt');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'analysis_prompt is required and must be a non-empty string'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate OpenAI config
    if (!openai_config || typeof openai_config !== 'object') {
      console.error('❌ Missing openai_config');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'openai_config is required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { apiKey, model, temperature, maxTokens } = openai_config;
    
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
      console.error('❌ Invalid OpenAI API key');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Valid OpenAI API key is required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing authorization');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authorization required'
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
      console.error('❌ Authentication failed:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not authenticated'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ User authenticated:', userData.user.id);

    // Filter and process messages
    const validMessages = messages.filter(msg => {
      if (!msg || !msg.text || typeof msg.text !== 'string') return false;
      const text = msg.text.trim();
      if (text.length === 0) return false;
      if (text === 'Mensagem sem texto') return false;
      if (text.includes('🎵 Áudio')) return false;
      if (text.startsWith('/9j/') || text.startsWith('data:')) return false;
      return true;
    });

    console.log(`📝 Filtered messages: ${validMessages.length} of ${messages.length}`);

    if (validMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid text messages found for analysis'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare conversation text
    const conversationText = validMessages
      .map(msg => {
        const sender = msg.fromMe ? 'Você' : (contact_info?.name || 'Contato');
        const timestamp = msg.timestamp 
          ? new Date(msg.timestamp * 1000).toLocaleString('pt-BR') 
          : new Date().toLocaleString('pt-BR');
        return `[${timestamp}] ${sender}: ${msg.text.trim()}`;
      })
      .join('\n\n');

    console.log(`📋 Conversation prepared: ${conversationText.length} characters`);

    // Call OpenAI API
    console.log('🤖 Calling OpenAI API...');
    
    const openaiPayload = {
      model: model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: analysis_prompt.trim()
        },
        {
          role: 'user',
          content: `Analise esta conversa do WhatsApp:\n\n${conversationText}`
        }
      ],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000
    };

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    });

    console.log('📡 OpenAI response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      
      let errorMessage = 'OpenAI API error';
      if (openaiResponse.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (openaiResponse.status === 429) {
        errorMessage = 'OpenAI rate limit exceeded';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiData = await openaiResponse.json();
    const analysisResult = aiData.choices?.[0]?.message?.content;

    if (!analysisResult) {
      console.error('❌ Empty response from OpenAI');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI did not generate a valid analysis'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Analysis generated successfully');

    // Save insight to database
    const insightData = {
      user_id: userData.user.id,
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

    const { data: savedInsight, error: insightError } = await supabaseClient
      .from('insights')
      .insert(insightData)
      .select()
      .single();

    if (insightError) {
      console.warn('⚠️ Failed to save insight:', insightError);
    } else {
      console.log('✅ Insight saved:', savedInsight.id);
    }

    // Return success response
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
      message: 'Analysis completed successfully',
      metadata: {
        messages_analyzed: validMessages.length,
        analysis_type,
        assistant_id,
        openai_model_used: model || 'gpt-4o-mini',
        tokens_used: aiData.usage?.total_tokens || 0
      }
    };

    console.log('🎉 Analysis completed successfully');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Critical error in edge function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
