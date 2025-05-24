
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      phoneNumber, 
      message, 
      contactName, 
      firebaseConfig,
      module = 'observatory' // 'commercial' ou 'observatory'
    } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada')
    }

    if (!firebaseConfig?.databaseURL || !firebaseConfig?.apiKey) {
      throw new Error('Firebase do cliente não configurado')
    }

    // Buscar histórico do Firebase do cliente
    const firebaseUrl = firebaseConfig.databaseURL.replace(/\/$/, '')
    const authToken = firebaseConfig.apiKey
    
    console.log(`🔍 Buscando histórico no Firebase do cliente (${module})`)
    
    const conversationsUrl = `${firebaseUrl}/conversations/${module}.json?auth=${authToken}`
    let context = ''
    let profile = null
    
    try {
      const response = await fetch(conversationsUrl)
      if (response.ok) {
        const conversations = await response.json()
        if (conversations) {
          // Encontrar conversa pelo telefone
          const userConversations = Object.values(conversations).filter(
            (conv: any) => conv.contact_phone === phoneNumber
          )
          
          if (userConversations.length > 0) {
            const lastConv = userConversations[userConversations.length - 1] as any
            profile = lastConv.psychological_profile || lastConv.sales_analysis
            
            // Últimas 5 mensagens para contexto
            const recentMessages = lastConv.messages?.slice(-5) || []
            context = recentMessages.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n')
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar do Firebase:', error)
    }

    // Gerar resposta com OpenAI baseada no módulo
    const systemPrompt = module === 'commercial' 
      ? `Você é um assistente de vendas especializado em conversão e análise comercial.

CONTEXTO DO CLIENTE:
${profile ? `
Perfil Comercial:
- Intenção de compra: ${profile.sales_intent || 'N/A'}
- Estágio no funil: ${profile.sales_stage || 'N/A'}
- Objeções principais: ${profile.main_objections?.join(', ') || 'N/A'}
- Pontos de interesse: ${profile.interest_points?.join(', ') || 'N/A'}
` : 'Perfil comercial ainda não disponível - primeira interação'}

HISTÓRICO RECENTE:
${context || 'Sem histórico anterior'}

DIRETRIZES COMERCIAIS:
1. Foque na conversão e geração de valor
2. Identifique necessidades e dores do cliente
3. Apresente soluções de forma consultiva
4. Use técnicas de vendas apropriadas
5. Mantenha o foco no ROI e benefícios
6. Conduza para próximos passos no funil

Responda focando em vendas e conversão.`
      : `Você é um assistente conselheiro especializado em bem-estar emocional e psicológico.

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

Responda de forma personalizada e terapêutica.`

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

    // Salvar mensagem e resposta no Firebase do cliente
    const timestamp = new Date().toISOString()
    const conversationId = `${phoneNumber.replace(/\D/g, '')}_${Date.now()}`
    
    const conversationData = {
      id: conversationId,
      contact_name: contactName,
      contact_phone: phoneNumber,
      messages: [
        { sender: contactName, text: message, timestamp, ai_generated: false, sender_type: 'client' },
        { sender: 'assistant', text: aiReply, timestamp: new Date().toISOString(), ai_generated: true, sender_type: 'assistant' }
      ],
      created_at: timestamp,
      updated_at: new Date().toISOString(),
      ...(module === 'commercial' && {
        lead_status: 'active',
        sales_stage: 'engagement'
      })
    }

    // Salvar no Firebase do cliente
    const saveUrl = `${firebaseUrl}/conversations/${module}/${conversationId}.json?auth=${authToken}`
    
    console.log(`💾 Salvando conversa no Firebase do cliente (${module})`)
    
    const saveResponse = await fetch(saveUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversationData)
    })

    if (!saveResponse.ok) {
      console.error('Erro ao salvar no Firebase do cliente:', saveResponse.status)
    } else {
      console.log('✅ Conversa salva no Firebase do cliente')
    }

    return new Response(JSON.stringify({
      success: true,
      reply: aiReply,
      conversation_id: conversationId,
      saved_to_client_firebase: saveResponse.ok
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
