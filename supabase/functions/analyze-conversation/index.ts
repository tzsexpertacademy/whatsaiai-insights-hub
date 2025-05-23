
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, contactName, contactPhone } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada')
    }

    // Preparar mensagens para análise
    const messagesText = messages.map((msg: any) => 
      `${msg.sender}: ${msg.text}`
    ).join('\n')

    // Análise emocional com OpenAI
    const emotionalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Você é um psicólogo especialista em análise emocional. Analise as mensagens e retorne um JSON com:
            - sentiment: "positive", "negative", "neutral"
            - emotions: array com emoções identificadas
            - intensity: 1-10
            - summary: resumo da análise emocional
            - recommendations: array com recomendações`
          },
          { role: 'user', content: messagesText }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    })

    const emotionalData = await emotionalResponse.json()
    let emotionalAnalysis = {}
    
    try {
      emotionalAnalysis = JSON.parse(emotionalData.choices[0].message.content)
    } catch {
      emotionalAnalysis = {
        sentiment: 'neutral',
        emotions: ['indefinido'],
        intensity: 5,
        summary: 'Análise não disponível',
        recommendations: []
      }
    }

    // Perfil psicológico com OpenAI
    const profileResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Você é um psicólogo especialista em análise comportamental. Crie um perfil psicológico baseado nas mensagens e retorne um JSON com:
            - personality_traits: array com traços de personalidade
            - communication_style: estilo de comunicação
            - emotional_patterns: padrões emocionais identificados
            - stress_indicators: indicadores de estresse
            - coping_mechanisms: mecanismos de enfrentamento
            - areas_of_concern: áreas de preocupação
            - strengths: pontos fortes identificados`
          },
          { role: 'user', content: messagesText }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    })

    const profileData = await profileResponse.json()
    let psychologicalProfile = {}
    
    try {
      psychologicalProfile = JSON.parse(profileData.choices[0].message.content)
    } catch {
      psychologicalProfile = {
        personality_traits: ['análise pendente'],
        communication_style: 'indefinido',
        emotional_patterns: [],
        stress_indicators: [],
        coping_mechanisms: [],
        areas_of_concern: [],
        strengths: []
      }
    }

    // Salvar no Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('Usuário não autenticado')
    }

    // Inserir conversa
    const { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .insert({
        user_id: user.user.id,
        contact_name: contactName,
        contact_phone: contactPhone,
        messages: messages,
        emotional_analysis: emotionalAnalysis,
        psychological_profile: psychologicalProfile
      })
      .select()
      .single()

    if (convError) throw convError

    // Inserir mensagens individuais
    const messageRecords = messages.map((msg: any) => ({
      conversation_id: conversation.id,
      user_id: user.user.id,
      message_text: msg.text,
      sender_type: msg.sender === contactName ? 'client' : 'user',
      timestamp: msg.timestamp || new Date().toISOString()
    }))

    const { error: msgError } = await supabase
      .from('whatsapp_messages')
      .insert(messageRecords)

    if (msgError) throw msgError

    // Gerar insights
    const insights = []
    
    if (emotionalAnalysis.intensity > 7) {
      insights.push({
        user_id: user.user.id,
        conversation_id: conversation.id,
        insight_type: 'emotional_alert',
        title: 'Alta Intensidade Emocional',
        description: `Detectada alta intensidade emocional (${emotionalAnalysis.intensity}/10) na conversa com ${contactName}`,
        priority: 'high'
      })
    }

    if (psychologicalProfile.stress_indicators?.length > 0) {
      insights.push({
        user_id: user.user.id,
        conversation_id: conversation.id,
        insight_type: 'stress_indicator',
        title: 'Indicadores de Estresse',
        description: `Identificados indicadores de estresse: ${psychologicalProfile.stress_indicators.join(', ')}`,
        priority: 'medium'
      })
    }

    if (insights.length > 0) {
      await supabase.from('insights').insert(insights)
    }

    return new Response(JSON.stringify({
      success: true,
      conversation_id: conversation.id,
      emotional_analysis: emotionalAnalysis,
      psychological_profile: psychologicalProfile,
      insights_generated: insights.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
