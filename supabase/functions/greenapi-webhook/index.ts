
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    console.log('🔔 GREEN-API Webhook recebido')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Configurações do Supabase não encontradas')
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await req.json()
    
    console.log('📊 Dados do webhook:', JSON.stringify(body, null, 2))

    // Verificar se é uma mensagem recebida
    if (body.typeWebhook === 'incomingMessageReceived') {
      const messageData = body.messageData
      const senderData = body.senderData
      
      console.log('📨 Mensagem recebida:', {
        from: senderData?.chatId,
        text: messageData?.textMessageData?.textMessage,
        type: messageData?.typeMessage
      })

      // Extrair informações da mensagem
      const chatId = senderData?.chatId
      const messageText = messageData?.textMessageData?.textMessage || 
                         messageData?.extendedTextMessageData?.text || 
                         '[Mídia não suportada]'
      const messageType = messageData?.typeMessage
      const timestamp = new Date().toISOString()
      
      if (!chatId) {
        console.log('⚠️ ChatId não encontrado na mensagem')
        return new Response('OK', { headers: corsHeaders })
      }

      // Encontrar TODOS os usuários com GREEN-API configurado
      const { data: configs, error: configError } = await supabase
        .from('client_configs')
        .select('user_id, whatsapp_config')
        .not('whatsapp_config', 'is', null)

      if (configError) {
        console.error('❌ Erro ao buscar configurações:', configError)
        return new Response('OK', { headers: corsHeaders })
      }

      console.log(`📋 Encontradas ${configs?.length || 0} configurações`)

      // Processar para TODOS os usuários com GREEN-API
      for (const config of configs || []) {
        const whatsappConfig = config.whatsapp_config as any
        if (whatsappConfig?.greenapi?.instanceId && whatsappConfig?.greenapi?.apiToken) {
          console.log(`👤 Processando para usuário: ${config.user_id}`)
          
          // Buscar ou criar conversa para este usuário
          let { data: conversation, error: convError } = await supabase
            .from('whatsapp_conversations')
            .select('*')
            .eq('user_id', config.user_id)
            .eq('contact_phone', chatId)
            .maybeSingle()

          if (convError) {
            console.error('❌ Erro ao buscar conversa:', convError)
            continue
          }

          // Criar conversa se não existir
          if (!conversation) {
            const contactName = senderData?.chatName || senderData?.sender || chatId.split('@')[0]
            
            const { data: newConv, error: createError } = await supabase
              .from('whatsapp_conversations')
              .insert({
                user_id: config.user_id,
                contact_phone: chatId,
                contact_name: contactName,
                messages: []
              })
              .select()
              .single()

            if (createError) {
              console.error('❌ Erro ao criar conversa:', createError)
              continue
            }

            conversation = newConv
            console.log(`✅ Nova conversa criada para usuário ${config.user_id}:`, conversation.id)
          }

          // Salvar mensagem na tabela de mensagens
          const { error: msgError } = await supabase
            .from('whatsapp_messages')
            .insert({
              user_id: config.user_id,
              conversation_id: conversation.id,
              message_text: messageText,
              sender_type: 'customer',
              timestamp: timestamp,
              ai_generated: false
            })

          if (msgError) {
            console.error(`❌ Erro ao salvar mensagem para usuário ${config.user_id}:`, msgError)
          } else {
            console.log(`✅ Mensagem salva para usuário ${config.user_id}`)
          }

          // Atualizar a conversa com a última mensagem
          const { error: updateError } = await supabase
            .from('whatsapp_conversations')
            .update({
              updated_at: timestamp
            })
            .eq('id', conversation.id)

          if (updateError) {
            console.error(`❌ Erro ao atualizar conversa para usuário ${config.user_id}:`, updateError)
          }
        }
      }

      console.log('✅ Webhook processado com sucesso para todos os usuários')
    } else {
      console.log(`ℹ️ Tipo de webhook ignorado: ${body.typeWebhook}`)
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
