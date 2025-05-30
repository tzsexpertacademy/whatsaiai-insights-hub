
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
