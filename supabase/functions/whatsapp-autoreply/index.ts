
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
    const { phoneNumber, message, contactName } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar histórico de conversas para contexto
    const { data: conversations } = await supabase
      .from('whatsapp_conversations')
      .select('messages, psychological_profile, emotional_analysis')
      .eq('contact_phone', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)

    let context = ''
    let profile = null
    
    if (conversations && conversations.length > 0) {
      const conv = conversations[0]
      profile = conv.psychological_profile
      
      // Últimas 5 mensagens para contexto
      const recentMessages = (conv.messages as any[]).slice(-5)
      context = recentMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n')
    }

    // Gerar resposta com OpenAI
    const systemPrompt = `Você é um assistente conselheiro especializado em bem-estar emocional e psicológico.

CONTEXTO DO CLIENTE:
${profile ? `
Perfil Psicológico:
- Traços de personalidade: ${profile.personality_traits?.join(', ') || 'N/A'}
- Estilo de comunicação: ${profile.communication_style || 'N/A'}
- Áreas de preocupação: ${profile.areas_of_concern?.join(', ') || 'N/A'}
- Pontos fortes: ${profile.strengths?.join(', ') || 'N/A'}
` : 'Perfil ainda não disponível - primeira interação'}

HISTÓRICO RECENTE:
${context || 'Sem histórico anterior'}

DIRETRIZES:
1. Seja empático e acolhedor
2. Use técnicas de aconselhamento apropriadas
3. Mantenha respostas concisas mas significativas
4. Se detectar sinais de crise, sugira buscar ajuda profissional
5. Adapte sua linguagem ao perfil do cliente
6. Foque no bem-estar emocional

Responda à mensagem do cliente de forma personalizada e terapêutica.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    })

    const aiData = await response.json()
    const aiReply = aiData.choices[0].message.content

    // Salvar mensagem recebida e resposta gerada
    const timestamp = new Date().toISOString()
    
    // Buscar ou criar conversa
    let conversationId = null
    
    if (conversations && conversations.length > 0) {
      // Atualizar conversa existente
      const conv = conversations[0]
      const updatedMessages = [...(conv.messages as any[]), 
        { sender: contactName, text: message, timestamp },
        { sender: 'assistant', text: aiReply, timestamp: new Date().toISOString() }
      ]
      
      const { data: updated } = await supabase
        .from('whatsapp_conversations')
        .update({ messages: updatedMessages })
        .eq('contact_phone', phoneNumber)
        .select('id')
        .single()
        
      conversationId = updated?.id
    } else {
      // Criar nova conversa
      const { data: newConv } = await supabase
        .from('whatsapp_conversations')
        .insert({
          contact_name: contactName,
          contact_phone: phoneNumber,
          messages: [
            { sender: contactName, text: message, timestamp },
            { sender: 'assistant', text: aiReply, timestamp: new Date().toISOString() }
          ]
        })
        .select('id')
        .single()
        
      conversationId = newConv?.id
    }

    // Salvar mensagens individuais
    if (conversationId) {
      await supabase.from('whatsapp_messages').insert([
        {
          conversation_id: conversationId,
          message_text: message,
          sender_type: 'client',
          timestamp
        },
        {
          conversation_id: conversationId,
          message_text: aiReply,
          sender_type: 'assistant',
          ai_generated: true,
          timestamp: new Date().toISOString()
        }
      ])
    }

    return new Response(JSON.stringify({
      success: true,
      reply: aiReply,
      conversation_id: conversationId
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
