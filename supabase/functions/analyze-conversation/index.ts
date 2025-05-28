
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    console.log('🔍 Analyze Conversation - Iniciando análise');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key não configurada');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada' }),
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

    console.log('✅ Usuário autenticado:', user.id);

    const { messages, conversationType = 'personal' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Mensagens inválidas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Analisando ${messages.length} mensagens do tipo: ${conversationType}`);

    // Prompt base para análise
    const analysisPrompt = conversationType === 'commercial' 
      ? getCommercialAnalysisPrompt(messages)
      : getPersonalAnalysisPrompt(messages);

    // Chamar OpenAI para análise
    console.log('🤖 Enviando para OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: analysisPrompt
          },
          {
            role: 'user',
            content: `Analise esta conversa: ${JSON.stringify(messages.slice(-10))}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('❌ Erro na OpenAI:', response.status);
      throw new Error(`Erro na OpenAI: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;

    console.log('✅ Análise gerada pela OpenAI');

    // Parse da análise
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da análise:', parseError);
      // Fallback: criar análise básica
      analysis = {
        emotional_state: { dominant_emotion: 'neutro', intensity: 5 },
        psychological_profile: { openness: 5, conscientiousness: 5, extraversion: 5, agreeableness: 5, neuroticism: 3 },
        life_areas: { career: 5, relationships: 5, health: 5, finance: 5, personal_growth: 5 },
        insights: [{ type: 'general', title: 'Análise processada', description: 'Conversação analisada com sucesso' }]
      };
    }

    // Salvar análise no banco
    const table = conversationType === 'commercial' ? 'commercial_insights' : 'insights';
    
    if (analysis.insights && Array.isArray(analysis.insights)) {
      for (const insight of analysis.insights) {
        const { error: insertError } = await supabase
          .from(table)
          .insert({
            user_id: user.id,
            insight_type: insight.type || 'general',
            title: insight.title || 'Insight gerado',
            description: insight.description || 'Análise automática',
            priority: insight.priority || 'medium',
            ...(conversationType === 'commercial' && {
              sales_impact: insight.sales_impact || 'medium'
            })
          });

        if (insertError) {
          console.error('❌ Erro ao salvar insight:', insertError);
        }
      }
    }

    console.log('✅ Análise salva no banco de dados');

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        insights_saved: analysis.insights?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na análise:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getPersonalAnalysisPrompt(messages: any[]): string {
  return `Você é um especialista em análise comportamental e psicológica. Analise esta conversa e retorne um JSON com:

{
  "emotional_state": {
    "dominant_emotion": "alegria|tristeza|ansiedade|raiva|medo|neutro",
    "intensity": 1-10,
    "stability": "estável|instável|flutuante"
  },
  "psychological_profile": {
    "openness": 1-10,
    "conscientiousness": 1-10,
    "extraversion": 1-10,
    "agreeableness": 1-10,
    "neuroticism": 1-10
  },
  "life_areas": {
    "career": 1-10,
    "relationships": 1-10,
    "health": 1-10,
    "finance": 1-10,
    "personal_growth": 1-10
  },
  "insights": [
    {
      "type": "emotional|behavioral|cognitive|social",
      "title": "Título do insight",
      "description": "Descrição detalhada",
      "priority": "high|medium|low"
    }
  ]
}

Seja preciso e baseie-se no conteúdo real das mensagens.`;
}

function getCommercialAnalysisPrompt(messages: any[]): string {
  return `Você é um especialista em análise comercial e vendas. Analise esta conversa comercial e retorne um JSON com:

{
  "sales_analysis": {
    "intent_score": 1-10,
    "urgency": "high|medium|low",
    "budget_indication": "high|medium|low|unknown",
    "decision_maker": true|false
  },
  "conversion_metrics": {
    "engagement_level": 1-10,
    "objection_count": 0-10,
    "closing_readiness": 1-10
  },
  "insights": [
    {
      "type": "conversion|behavioral|process|performance",
      "title": "Título do insight comercial",
      "description": "Descrição detalhada",
      "sales_impact": "high|medium|low",
      "priority": "high|medium|low"
    }
  ]
}

Foque em aspectos comerciais: intenção de compra, objeções, comportamento do lead.`;
}
