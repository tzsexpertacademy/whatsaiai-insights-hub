
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

    console.log('🤖 Iniciando análise multi-assistente para usuário:', userId);

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

    // Buscar configuração dos assistentes
    const { data: clientConfig, error: configError } = await supabase
      .from('client_configs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (configError) {
      console.error('❌ Erro ao buscar configuração:', configError);
    }

    // Assistentes padrão caso não haja configuração
    const defaultAssistants = [
      {
        id: 'oracle',
        name: 'Oráculo das Sombras',
        prompt: 'Você é o Oráculo das Sombras, especialista em psicologia profunda. Analise padrões inconscientes, traumas não resolvidos e aspectos sombrios da personalidade. Foque em insights psicológicos profundos.',
        isActive: true,
        area: 'psicologia'
      },
      {
        id: 'guardian',
        name: 'Guardião dos Recursos',
        prompt: 'Você é o Guardião dos Recursos, mentor financeiro especializado. Analise padrões de gastos, decisões financeiras e relacionamento com dinheiro. Identifique oportunidades de crescimento financeiro.',
        isActive: true,
        area: 'financeiro'
      },
      {
        id: 'engineer',
        name: 'Engenheiro do Corpo',
        prompt: 'Você é o Engenheiro do Corpo, especialista em biohacking e otimização física. Analise padrões de saúde, sono, alimentação e exercícios mencionados nas conversas.',
        isActive: true,
        area: 'saude'
      },
      {
        id: 'architect',
        name: 'Arquiteto do Jogo',
        prompt: 'Você é o Arquiteto do Jogo, estrategista de vida. Analise padrões de tomada de decisão, planejamento e execução de metas. Identifique pontos de melhoria na estratégia de vida.',
        isActive: true,
        area: 'estrategia'
      },
      {
        id: 'weaver',
        name: 'Tecelão da Alma',
        prompt: 'Você é o Tecelão da Alma, especialista em propósito e legado. Analise conexões com propósito de vida, valores fundamentais e direcionamento existencial.',
        isActive: true,
        area: 'proposito'
      },
      {
        id: 'catalyst',
        name: 'Catalisador',
        prompt: 'Você é o Catalisador, especialista em criatividade e inovação. Analise padrões criativos, bloqueios e potencial de inovação nas conversas.',
        isActive: true,
        area: 'criatividade'
      },
      {
        id: 'mirror',
        name: 'Espelho Social',
        prompt: 'Você é o Espelho Social, especialista em relacionamentos. Analise padrões de comunicação, vínculos sociais e dinâmicas relacionais mencionadas.',
        isActive: true,
        area: 'relacionamentos'
      }
    ];

    // Usar assistentes configurados ou padrão
    let assistants = defaultAssistants;
    if (clientConfig?.openai_config?.assistants) {
      const configuredAssistants = clientConfig.openai_config.assistants;
      assistants = configuredAssistants.filter((ast: any) => ast.isActive && !ast.canRespond);
    }

    console.log(`📊 Usando ${assistants.length} assistentes para análise`);

    if (!conversations || conversations.length === 0) {
      console.log('⚠️ Nenhuma conversa encontrada, criando análise de exemplo');
      
      const exampleAnalysis = {
        perfil_psicologico: 'ENFP - Explorador empático em desenvolvimento',
        estado_emocional: 'Curioso e receptivo ao crescimento',
        areas_vida: {
          profissional: 'Potencial em desenvolvimento',
          relacionamentos: 'Base sólida para crescimento',
          saude: 'Consciência emergente',
          desenvolvimento: 'Ativo e engajado'
        },
        insights: [
          'Personalidade aberta a novas experiências detectada',
          'Padrões de reflexão e autoconhecimento em desenvolvimento',
          'Tendência natural para conexões significativas'
        ],
        recomendacoes: [
          'Explore técnicas de journaling para autoconhecimento',
          'Desenvolva rotinas de bem-estar pessoal',
          'Cultive relacionamentos autênticos'
        ],
        alertas: [],
        big_five: {
          extroversao: 65,
          abertura: 85,
          neuroticismo: 45,
          amabilidade: 70,
          conscienciosidade: 75
        },
        areas_metricas: {
          profissional: 70,
          financeiro: 55,
          relacionamentos: 75,
          saude_fisica: 60,
          saude_mental: 70,
          espiritualidade: 65,
          crescimento_pessoal: 80
        }
      };

      return new Response(JSON.stringify({
        success: true,
        analysis: exampleAnalysis,
        assistants_used: assistants.map(a => a.name),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados das conversas
    const conversationData = conversations.map(conv => ({
      contact: conv.contact_name,
      messages: conv.messages,
      emotional_analysis: conv.emotional_analysis,
      psychological_profile: conv.psychological_profile
    }));

    console.log('🔍 Iniciando análises individuais dos assistentes...');

    // Executar análises de cada assistente
    const assistantAnalyses = await Promise.all(
      assistants.map(async (assistant) => {
        try {
          console.log(`🤖 Analisando com ${assistant.name}...`);
          
          const assistantPrompt = `
${assistant.prompt}

Analise as seguintes conversas de WhatsApp da sua perspectiva especializada:

${JSON.stringify(conversationData, null, 2)}

IMPORTANTE: Responda APENAS com um JSON válido seguindo esta estrutura:

{
  "area_especialidade": "${assistant.area || 'geral'}",
  "avaliacao_principal": "Sua avaliação principal da área",
  "nivel_desenvolvimento": 75,
  "insights_especificos": [
    "Primeiro insight da sua área",
    "Segundo insight da sua área"
  ],
  "recomendacoes_especificas": [
    "Primeira recomendação específica",
    "Segunda recomendação específica"
  ],
  "alertas_especificos": [
    "Alerta se houver algo importante"
  ],
  "metricas_especificas": {
    "metric1": 75,
    "metric2": 68
  }
}

Seja preciso, focado na sua especialidade e use linguagem construtiva.
`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: assistant.model || model,
              messages: [
                { role: 'system', content: assistant.prompt },
                { role: 'user', content: assistantPrompt }
              ],
              temperature: temperature,
              max_tokens: maxTokens
            }),
          });

          if (!response.ok) {
            throw new Error(`Erro na API OpenAI para ${assistant.name}: ${response.status}`);
          }

          const data = await response.json();
          const analysis = data.choices[0].message.content;

          try {
            return {
              assistant: assistant.name,
              analysis: JSON.parse(analysis)
            };
          } catch {
            return {
              assistant: assistant.name,
              analysis: {
                area_especialidade: assistant.area || 'geral',
                avaliacao_principal: 'Análise em processo',
                nivel_desenvolvimento: 70,
                insights_especificos: [`Insight de ${assistant.name} em desenvolvimento`],
                recomendacoes_especificas: [`Continue explorando sua ${assistant.area}`],
                alertas_especificos: [],
                metricas_especificas: {}
              }
            };
          }
        } catch (error) {
          console.error(`❌ Erro na análise do ${assistant.name}:`, error);
          return {
            assistant: assistant.name,
            analysis: {
              area_especialidade: assistant.area || 'geral',
              avaliacao_principal: 'Análise temporariamente indisponível',
              nivel_desenvolvimento: 65,
              insights_especificos: ['Aguardando nova análise'],
              recomendacoes_especificas: ['Continue suas práticas atuais'],
              alertas_especificos: [],
              metricas_especificas: {}
            }
          };
        }
      })
    );

    console.log('✅ Consolidando análises dos assistentes...');

    // Consolidar análises
    const consolidatedInsights = assistantAnalyses.flatMap(a => a.analysis.insights_especificos || []);
    const consolidatedRecommendations = assistantAnalyses.flatMap(a => a.analysis.recomendacoes_especificas || []);
    const consolidatedAlerts = assistantAnalyses.flatMap(a => a.analysis.alertas_especificos || []);

    // Calcular métricas Big Five baseadas nas análises
    const bigFiveMetrics = {
      extroversao: Math.round(assistantAnalyses.reduce((acc, a) => acc + (a.analysis.metricas_especificas?.extroversao || 65), 0) / assistantAnalyses.length),
      abertura: Math.round(assistantAnalyses.reduce((acc, a) => acc + (a.analysis.metricas_especificas?.abertura || 75), 0) / assistantAnalyses.length),
      neuroticismo: Math.round(assistantAnalyses.reduce((acc, a) => acc + (a.analysis.metricas_especificas?.neuroticismo || 45), 0) / assistantAnalyses.length),
      amabilidade: Math.round(assistantAnalyses.reduce((acc, a) => acc + (a.analysis.metricas_especificas?.amabilidade || 70), 0) / assistantAnalyses.length),
      conscienciosidade: Math.round(assistantAnalyses.reduce((acc, a) => acc + (a.analysis.metricas_especificas?.conscienciosidade || 75), 0) / assistantAnalyses.length)
    };

    // Calcular métricas de áreas da vida
    const areasMetricas = {
      profissional: assistantAnalyses.find(a => a.analysis.area_especialidade === 'estrategia')?.analysis.nivel_desenvolvimento || 75,
      financeiro: assistantAnalyses.find(a => a.analysis.area_especialidade === 'financeiro')?.analysis.nivel_desenvolvimento || 65,
      relacionamentos: assistantAnalyses.find(a => a.analysis.area_especialidade === 'relacionamentos')?.analysis.nivel_desenvolvimento || 70,
      saude_fisica: assistantAnalyses.find(a => a.analysis.area_especialidade === 'saude')?.analysis.nivel_desenvolvimento || 65,
      saude_mental: assistantAnalyses.find(a => a.analysis.area_especialidade === 'psicologia')?.analysis.nivel_desenvolvimento || 70,
      espiritualidade: assistantAnalyses.find(a => a.analysis.area_especialidade === 'proposito')?.analysis.nivel_desenvolvimento || 65,
      crescimento_pessoal: assistantAnalyses.find(a => a.analysis.area_especialidade === 'criatividade')?.analysis.nivel_desenvolvimento || 75
    };

    const finalAnalysis = {
      perfil_psicologico: assistantAnalyses.find(a => a.analysis.area_especialidade === 'psicologia')?.analysis.avaliacao_principal || 'ENFP - Personalidade exploratória',
      estado_emocional: 'Equilibrado e em crescimento',
      areas_vida: {
        profissional: assistantAnalyses.find(a => a.analysis.area_especialidade === 'estrategia')?.analysis.avaliacao_principal || 'Em desenvolvimento estratégico',
        relacionamentos: assistantAnalyses.find(a => a.analysis.area_especialidade === 'relacionamentos')?.analysis.avaliacao_principal || 'Conexões saudáveis',
        saude: assistantAnalyses.find(a => a.analysis.area_especialidade === 'saude')?.analysis.avaliacao_principal || 'Consciência corporal ativa',
        desenvolvimento: assistantAnalyses.find(a => a.analysis.area_especialidade === 'criatividade')?.analysis.avaliacao_principal || 'Criatividade florescente'
      },
      insights: consolidatedInsights.slice(0, 8),
      recomendacoes: consolidatedRecommendations.slice(0, 6),
      alertas: consolidatedAlerts,
      big_five: bigFiveMetrics,
      areas_metricas: areasMetricas,
      assistants_analysis: assistantAnalyses
    };

    // Salvar insights consolidados no banco
    for (const insight of consolidatedInsights.slice(0, 10)) {
      try {
        await supabase
          .from('insights')
          .insert({
            user_id: userId,
            title: 'Análise Multi-Assistente',
            description: insight,
            insight_type: 'ai_analysis',
            priority: 'medium',
            status: 'active'
          });
      } catch (error) {
        console.error('❌ Erro ao salvar insight:', error);
      }
    }

    console.log('✅ Análise multi-assistente concluída');

    return new Response(JSON.stringify({
      success: true,
      analysis: finalAnalysis,
      assistants_used: assistants.map(a => a.name),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na análise multi-assistente:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
