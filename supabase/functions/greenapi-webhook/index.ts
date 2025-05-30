
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 GREEN-API Webhook recebido - Method:', req.method)
    console.log('🔔 URL:', req.url)
    console.log('🔔 Headers:', Object.fromEntries(req.headers.entries()))
    
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
    
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error('❌ Erro ao fazer parse do JSON:', error)
      return new Response('OK', { headers: corsHeaders })
    }
    
    console.log('📊 Webhook payload completo:', JSON.stringify(body, null, 2))

    // Verificar se é uma mensagem recebida
    if (body.typeWebhook === 'incomingMessageReceived') {
      console.log('📨 Processando mensagem recebida...')
      
      const messageData = body.messageData
      const senderData = body.senderData
      const instanceData = body.instanceData
      
      console.log('📋 Dados extraídos:', {
        messageData: messageData,
        senderData: senderData,
        instanceData: instanceData
      })

      // Extrair informações da mensagem
      const chatId = senderData?.chatId
      let messageText = 'Mensagem não suportada'
      
      // Tentar extrair o texto da mensagem de diferentes formatos
      if (messageData?.textMessageData?.textMessage) {
        messageText = messageData.textMessageData.textMessage
      } else if (messageData?.extendedTextMessageData?.text) {
        messageText = messageData.extendedTextMessageData.text
      } else if (messageData?.quotedMessage?.textMessage) {
        messageText = messageData.quotedMessage.textMessage
      } else if (messageData?.imageMessage?.caption) {
        messageText = `[Imagem] ${messageData.imageMessage.caption || ''}`
      } else if (messageData?.audioMessage) {
        messageText = '[Áudio]'
      } else if (messageData?.videoMessage) {
        messageText = '[Vídeo]'
      } else if (messageData?.documentMessage) {
        messageText = '[Documento]'
      }

      const messageType = messageData?.typeMessage || 'unknown'
      const timestamp = new Date().toISOString()
      
      console.log('📝 Dados finais extraídos:', {
        chatId,
        messageText,
        messageType,
        timestamp
      })
      
      if (!chatId) {
        console.log('⚠️ ChatId não encontrado na mensagem')
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'ChatId não encontrado',
          timestamp: new Date().toISOString()
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      // Encontrar TODOS os usuários com GREEN-API configurado
      console.log('🔍 Buscando usuários com GREEN-API configurado...')
      
      const { data: configs, error: configError } = await supabase
        .from('client_configs')
        .select('user_id, whatsapp_config')
        .not('whatsapp_config', 'is', null)

      if (configError) {
        console.error('❌ Erro ao buscar configurações:', configError)
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Erro ao buscar configurações',
          error: configError.message,
          timestamp: new Date().toISOString()
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }

      console.log(`📋 Encontradas ${configs?.length || 0} configurações`)
      
      if (!configs || configs.length === 0) {
        console.log('⚠️ Nenhuma configuração encontrada')
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Nenhuma configuração encontrada',
          timestamp: new Date().toISOString()
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      // Processar para TODOS os usuários com GREEN-API
      let processedCount = 0
      const errors = []
      
      for (const config of configs) {
        const whatsappConfig = config.whatsapp_config as any
        
        console.log(`👤 Verificando configuração do usuário: ${config.user_id}`)
        console.log(`🔧 Config WhatsApp:`, whatsappConfig)
        
        if (whatsappConfig?.greenapi?.instanceId && whatsappConfig?.greenapi?.apiToken) {
          console.log(`✅ Usuário ${config.user_id} tem GREEN-API configurado`)
          
          try {
            // Buscar ou criar conversa para este usuário
            console.log(`📞 Buscando/criando conversa para ${config.user_id} e contato ${chatId}`)
            
            let { data: conversation, error: convError } = await supabase
              .from('whatsapp_conversations')
              .select('*')
              .eq('user_id', config.user_id)
              .eq('contact_phone', chatId)
              .maybeSingle()

            if (convError) {
              console.error(`❌ Erro ao buscar conversa para usuário ${config.user_id}:`, convError)
              errors.push(`Erro ao buscar conversa: ${convError.message}`)
              continue
            }

            // Criar conversa se não existir
            if (!conversation) {
              const contactName = senderData?.chatName || senderData?.sender || chatId.split('@')[0]
              
              console.log(`🆕 Criando nova conversa para usuário ${config.user_id}`)
              
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
                console.error(`❌ Erro ao criar conversa para usuário ${config.user_id}:`, createError)
                errors.push(`Erro ao criar conversa: ${createError.message}`)
                continue
              }

              conversation = newConv
              console.log(`✅ Nova conversa criada para usuário ${config.user_id}:`, conversation.id)
            }

            // Salvar mensagem na tabela de mensagens
            console.log(`💾 Salvando mensagem para usuário ${config.user_id}`)
            
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
              errors.push(`Erro ao salvar mensagem: ${msgError.message}`)
            } else {
              console.log(`✅ Mensagem salva para usuário ${config.user_id}`)
              processedCount++
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
            } else {
              console.log(`🔄 Conversa atualizada para usuário ${config.user_id}`)
            }

          } catch (userError) {
            console.error(`❌ Erro ao processar usuário ${config.user_id}:`, userError)
            errors.push(`Erro no usuário ${config.user_id}: ${userError.message}`)
          }
        } else {
          console.log(`⚠️ Usuário ${config.user_id} não tem GREEN-API configurado adequadamente`)
        }
      }

      console.log(`✅ Webhook processado. ${processedCount} mensagens salvas.`)
      
      if (errors.length > 0) {
        console.log('⚠️ Erros encontrados:', errors)
      }
      
    } else if (body.typeWebhook === 'outgoingMessageReceived') {
      console.log(`📤 Mensagem enviada recebida - ignorando`)
    } else if (body.typeWebhook === 'stateInstanceChanged') {
      console.log(`🔄 Mudança de estado da instância: ${body.stateInstance}`)
    } else {
      console.log(`ℹ️ Tipo de webhook ignorado: ${body.typeWebhook}`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      timestamp: new Date().toISOString()
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    console.error('Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
