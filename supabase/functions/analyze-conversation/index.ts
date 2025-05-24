
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
        prompt: `Você é o Oráculo das Sombras, especialista em psicologia profunda. Analise padrões inconscientes, traços de personalidade e aspectos emocionais. 

Responda com insights específicos sobre:
- Traços psicológicos identificados
- Padrões emocionais
- Aspectos inconscientes
- Pontos de desenvolvimento pessoal

Use linguagem clara e construtiva.`,
        isActive: true,
        area: 'psicologia'
      },
      {
        id: 'guardian',
        name: 'Guardião dos Recursos',
        prompt: `Você é o Guardião dos Recursos, mentor financeiro especializado. Analise padrões financeiros e de gestão de recursos.

Responda com insights sobre:
- Comportamentos financeiros
- Relação com dinheiro e recursos
- Oportunidades de melhoria financeira
- Planejamento e organização

Seja prático e orientado a resultados.`,
        isActive: true,
        area: 'financeiro'
      },
      {
        id: 'engineer',
        name: 'Engenheiro do Corpo',
        prompt: `Você é o Engenheiro do Corpo, especialista em saúde e bem-estar físico. Analise padrões relacionados à saúde física.

Responda com insights sobre:
- Cuidados com a saúde física
- Padrões de energia e vitalidade
- Hábitos de bem-estar
- Otimização do desempenho físico

Seja motivador e focado na saúde.`,
        isActive: true,
        area: 'saude'
      },
      {
        id: 'architect',
        name: 'Arquiteto do Jogo',
        prompt: `Você é o Arquiteto do Jogo, estrategista de vida. Analise padrões de planejamento e execução de objetivos.

Responda com insights sobre:
- Estratégias de vida e carreira
- Planejamento e organização
- Tomada de decisões
- Execução de metas

Seja estratégico e orientado a objetivos.`,
        isActive: true,
        area: 'estrategia'
      },
      {
        id: 'weaver',
        name: 'Tecelão da Alma',
        prompt: `Você é o Tecelão da Alma, especialista em propósito e significado. Analise conexões com valores e propósito de vida.

Responda com insights sobre:
- Propósito e significado de vida
- Valores fundamentais
- Direcionamento existencial
- Crescimento espiritual

Seja inspirador e profundo.`,
        isActive: true,
        area: 'proposito'
      },
      {
        id: 'catalyst',
        name: 'Catalisador',
        prompt: `Você é o Catalisador, especialista em criatividade e inovação. Analise padrões criativos e de inovação.

Responda com insights sobre:
- Potencial criativo
- Bloqueios e limitações
- Oportunidades de inovação
- Expressão pessoal

Seja criativo e inspirador.`,
        isActive: true,
        area: 'criatividade'
      },
      {
        id: 'mirror',
        name: 'Espelho Social',
        prompt: `Você é o Espelho Social, especialista em relacionamentos e comunicação. Analise padrões sociais e relacionais.

Responda com insights sobre:
- Habilidades de comunicação
- Padrões relacionais
- Inteligência social
- Vínculos e conexões

Seja empático e focado nas relações.`,
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
      
      // Criar insights de exemplo com informações do assistente
      const exampleInsights = [
        { text: 'Personalidade introspectiva com tendência à reflexão profunda e autoconhecimento', assistant: defaultAssistants[0] },
        { text: 'Consciência emergente sobre gestão de recursos e planejamento futuro', assistant: defaultAssistants[1] },
        { text: 'Interesse crescente em otimização de bem-estar e cuidados corporais', assistant: defaultAssistants[2] },
        { text: 'Foco em desenvolvimento pessoal e construção de objetivos claros', assistant: defaultAssistants[3] },
        { text: 'Busca por significado e alinhamento com valores fundamentais', assistant: defaultAssistants[4] },
        { text: 'Potencial criativo em desenvolvimento com abertura para novas experiências', assistant: defaultAssistants[5] },
        { text: 'Habilidades sociais em crescimento com foco em conexões autênticas', assistant: defaultAssistants[6] }
      ];

      // Salvar insights de exemplo com metadados do assistente
      for (const insight of exampleInsights) {
        try {
          await supabase
            .from('insights')
            .insert({
              user_id: userId,
              title: `Análise - ${insight.assistant.name}`,
              description: insight.text,
              insight_type: 'ai_analysis',
              priority: 'medium',
              status: 'active',
              metadata: {
                assistant_id: insight.assistant.id,
                assistant_name: insight.assistant.name,
                assistant_area: insight.assistant.area
              }
            });
        } catch (error) {
          console.error('❌ Erro ao salvar insight:', error);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        insights_generated: exampleInsights.length,
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
Analise as seguintes conversas de WhatsApp da sua perspectiva especializada em ${assistant.area}:

${JSON.stringify(conversationData, null, 2)}

Forneça insights específicos da sua área de especialização. Seja direto, construtivo e focado nos padrões que identifica.

Responda em português, de forma clara e objetiva.
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

          return {
            assistant: assistant.name,
            assistantId: assistant.id,
            area: assistant.area,
            analysis: analysis
          };

        } catch (error) {
          console.error(`❌ Erro na análise do ${assistant.name}:`, error);
          return {
            assistant: assistant.name,
            assistantId: assistant.id,
            area: assistant.area,
            analysis: `Insight de ${assistant.name}: Aguardando nova análise baseada em mais dados de conversa.`
          };
        }
      })
    );

    console.log('✅ Consolidando análises dos assistentes...');

    // Salvar insights consolidados no banco com informações do assistente
    const savedInsights = [];
    for (const assistantAnalysis of assistantAnalyses) {
      try {
        const { data: savedInsight } = await supabase
          .from('insights')
          .insert({
            user_id: userId,
            title: `Análise - ${assistantAnalysis.assistant}`,
            description: assistantAnalysis.analysis,
            insight_type: 'ai_analysis',
            priority: 'medium',
            status: 'active',
            metadata: {
              assistant_id: assistantAnalysis.assistantId,
              assistant_name: assistantAnalysis.assistant,
              assistant_area: assistantAnalysis.area
            }
          })
          .select()
          .single();

        if (savedInsight) {
          savedInsights.push(savedInsight);
        }
      } catch (error) {
        console.error('❌ Erro ao salvar insight:', error);
      }
    }

    console.log('✅ Análise multi-assistente concluída');

    return new Response(JSON.stringify({
      success: true,
      insights_generated: savedInsights.length,
      assistants_used: assistants.map(a => a.name),
      assistant_analyses: assistantAnalyses.map(a => ({
        assistant: a.assistant,
        area: a.area,
        preview: a.analysis.substring(0, 100) + '...'
      })),
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
