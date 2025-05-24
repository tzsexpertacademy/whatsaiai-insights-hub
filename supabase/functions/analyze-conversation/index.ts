
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
    const { userId, openaiApiKey, model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 1000 } = await req.json();

    if (!userId || !openaiApiKey) {
      throw new Error('userId e openaiApiKey são obrigatórios');
    }

    console.log('🤖 Iniciando análise para usuário:', userId);

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar conversas do usuário
    const { data: conversations, error: conversationsError } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (conversationsError) {
      console.error('❌ Erro ao buscar conversas:', conversationsError);
      throw conversationsError;
    }

    if (!conversations || conversations.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhuma conversa encontrada para análise',
        insights: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados para análise
    const conversationData = conversations.map(conv => ({
      contact: conv.contact_name,
      messages: conv.messages,
      emotional_analysis: conv.emotional_analysis,
      psychological_profile: conv.psychological_profile
    }));

    // Prompt para análise psicológica
    const analysisPrompt = `
Analise as seguintes conversas de WhatsApp e forneça insights psicológicos e comportamentais detalhados:

${JSON.stringify(conversationData, null, 2)}

Por favor, analise e retorne um JSON com:
1. perfil_psicologico: Traços de personalidade dominantes (Big Five)
2. estado_emocional: Estado emocional atual e tendências
3. areas_vida: Avaliação das principais áreas da vida (profissional, relacionamentos, saúde, etc.)
4. insights: Array de insights importantes detectados
5. recomendacoes: Sugestões de desenvolvimento pessoal
6. alertas: Padrões preocupantes ou que merecem atenção

Seja preciso, empático e focado em crescimento pessoal.
`;

    // Fazer chamada para OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um psicólogo experiente especializado em análise comportamental através de conversas. Forneça insights profissionais e construtivos.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`Erro na API OpenAI: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiAnalysis = openaiData.choices[0].message.content;

    console.log('✅ Análise IA concluída');

    // Tentar parsear como JSON, se falhar, usar como texto
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiAnalysis);
    } catch {
      analysisResult = {
        perfil_psicologico: 'Análise em processo',
        estado_emocional: 'Processando dados',
        areas_vida: {},
        insights: [aiAnalysis],
        recomendacoes: ['Continue compartilhando suas experiências'],
        alertas: []
      };
    }

    // Salvar insights no banco
    if (analysisResult.insights && Array.isArray(analysisResult.insights)) {
      for (const insight of analysisResult.insights) {
        await supabase
          .from('insights')
          .insert({
            user_id: userId,
            title: 'Insight Automatizado',
            description: typeof insight === 'string' ? insight : JSON.stringify(insight),
            insight_type: 'ai_analysis',
            priority: 'medium',
            status: 'active'
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na análise:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
