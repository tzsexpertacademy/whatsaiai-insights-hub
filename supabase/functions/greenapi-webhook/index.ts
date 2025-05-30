
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
    console.log('🌿 GREEN-API Webhook - Requisição recebida');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const webhookData = await req.json();
    console.log('📥 Dados do webhook GREEN-API:', JSON.stringify(webhookData, null, 2));

    // Processar mensagem recebida
    if (webhookData.typeWebhook === 'incomingMessageReceived') {
      const messageData = webhookData.messageData;
      const senderData = webhookData.senderData;
      
      const chatId = senderData.chatId;
      const senderName = senderData.chatName || senderData.sender || chatId;
      const messageText = messageData.textMessageData?.textMessage || messageData.extendedTextMessageData?.text || '[Mídia]';
      const messageId = messageData.idMessage;
      const timestamp = new Date(messageData.timestamp * 1000).toISOString();

      console.log(`💬 Nova mensagem GREEN-API de ${senderName}: ${messageText}`);

      // Verificar se há assistente configurado para este chat
      const assignedAssistant = await getAssignedAssistant(supabase, chatId);
      
      // Verificar se é conversa monitorada
      const isMonitored = await checkIfChatIsMonitored(supabase, chatId);
      
      if (isMonitored) {
        console.log('📊 Conversa monitorada, salvando no banco...');
        await saveConversationToDatabase(supabase, {
          chatId,
          senderName,
          messageText,
          messageId,
          timestamp
        });
      }

      // Gerar resposta automática se houver assistente configurado
      if (assignedAssistant && openaiApiKey && messageText.trim()) {
        console.log(`🤖 Gerando resposta automática com assistente: ${assignedAssistant.assistant_name}`);
        await generateAutoReply(supabase, {
          chatId,
          messageText,
          assistantConfig: assignedAssistant,
          openaiApiKey,
          timestamp
        });
      }

      console.log('✅ Mensagem processada com sucesso');
    }

    // Processar status de mensagem (entregue, lida, etc.)
    if (webhookData.typeWebhook === 'outgoingMessageStatus') {
      const statusData = webhookData.statusData;
      console.log('📊 Status da mensagem:', statusData);
      
      await updateMessageStatus(supabase, statusData);
    }

    // Resposta de teste para webhook
    if (webhookData.typeWebhook === 'test') {
      console.log('🧪 Teste do webhook recebido');
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook GREEN-API funcionando corretamente' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook GREEN-API processado' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro no webhook GREEN-API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro no processamento do webhook GREEN-API',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getAssignedAssistant(supabase: any, chatId: string) {
  try {
    // Buscar assistente configurado para este chat
    // Por enquanto, vamos buscar o primeiro assistente ativo do usuário
    // Em uma implementação completa, você salvaria a configuração chat -> assistente
    const { data, error } = await supabase
      .from('assistants_config')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) {
      console.log('Nenhum assistente configurado:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar assistente:', error);
    return null;
  }
}

async function generateAutoReply(supabase: any, params: any) {
  const { chatId, messageText, assistantConfig, openaiApiKey, timestamp } = params;
  
  try {
    console.log('🤖 Gerando resposta automática...');
    
    const systemPrompt = `${assistantConfig.prompt}

INSTRUÇÕES ESPECÍFICAS:
- Você é o assistente "${assistantConfig.assistant_name}" especializado em "${assistantConfig.assistant_role}"
- Responda como se fosse uma conversa de WhatsApp
- Seja natural, cordial e profissional
- Mantenha respostas concisas (máximo 2 parágrafos)
- Responda sempre em português brasileiro`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageText }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const replyText = aiData.choices[0].message.content;

      console.log('💬 Resposta gerada:', replyText);

      // Salvar resposta no banco
      const conversationId = await getOrCreateConversationId(supabase, chatId);
      
      if (conversationId) {
        await supabase
          .from('whatsapp_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'assistant',
            message_text: replyText,
            ai_generated: true,
            timestamp: new Date().toISOString(),
            metadata: {
              assistant_id: assistantConfig.id,
              assistant_name: assistantConfig.assistant_name
            }
          });

        console.log('✅ Resposta automática salva no banco');
      }

      // Aqui você enviaria a resposta via GREEN-API
      // await sendMessageViaGreenAPI(chatId, replyText);
    }
  } catch (error) {
    console.error('❌ Erro ao gerar resposta automática:', error);
  }
}

async function getOrCreateConversationId(supabase: any, chatId: string) {
  try {
    const { data: existing } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('contact_phone', chatId)
      .single();

    if (existing) {
      return existing.id;
    }

    const { data: newConv } = await supabase
      .from('whatsapp_conversations')
      .insert({
        contact_phone: chatId,
        contact_name: chatId,
        messages: []
      })
      .select('id')
      .single();

    return newConv?.id;
  } catch (error) {
    console.error('Erro ao obter/criar conversa:', error);
    return null;
  }
}

async function checkIfChatIsMonitored(supabase: any, chatId: string): Promise<boolean> {
  try {
    // Verificar se a conversa está sendo monitorada
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('contact_phone', chatId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar monitoramento:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('Erro ao verificar monitoramento:', error);
    return false;
  }
}

async function saveConversationToDatabase(supabase: any, messageInfo: any) {
  try {
    const { chatId, senderName, messageText, messageId, timestamp } = messageInfo;
    
    // Buscar ou criar conversa
    const { data: existingConversation, error: fetchError } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('contact_phone', chatId)
      .maybeSingle();

    let conversationId;

    if (fetchError || !existingConversation) {
      // Criar nova conversa
      const { data: newConversation, error: createError } = await supabase
        .from('whatsapp_conversations')
        .insert({
          contact_name: senderName,
          contact_phone: chatId,
          messages: [{
            id: messageId,
            text: messageText,
            sender: 'customer',
            timestamp: timestamp,
            platform: 'greenapi'
          }]
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar conversa:', createError);
        throw createError;
      }

      conversationId = newConversation.id;
      console.log('✅ Nova conversa criada:', conversationId);
    } else {
      // Atualizar conversa existente
      const updatedMessages = [...(existingConversation.messages || []), {
        id: messageId,
        text: messageText,
        sender: 'customer',
        timestamp: timestamp,
        platform: 'greenapi'
      }];

      const { error: updateError } = await supabase
        .from('whatsapp_conversations')
        .update({
          messages: updatedMessages,
          updated_at: timestamp
        })
        .eq('id', existingConversation.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar conversa:', updateError);
        throw updateError;
      }

      conversationId = existingConversation.id;
      console.log('✅ Conversa atualizada:', conversationId);
    }

    // Salvar mensagem individual também
    const { error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'customer',
        message_text: messageText,
        timestamp: timestamp,
        metadata: {
          messageId: messageId,
          chatId: chatId,
          platform: 'greenapi'
        }
      });

    if (messageError) {
      console.error('❌ Erro ao salvar mensagem individual:', messageError);
    }

    console.log('✅ Mensagem GREEN-API processada e salva');

  } catch (dbError) {
    console.error('❌ Erro no banco de dados:', dbError);
    throw dbError;
  }
}

async function updateMessageStatus(supabase: any, statusData: any) {
  console.log('📋 Atualizando status:', statusData);
  // Implementar atualização de status de mensagem se necessário
}
