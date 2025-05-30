
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
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas');
      throw new Error('Configuração do Supabase incompleta');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const webhookData = await req.json();
    console.log('📥 Dados do webhook GREEN-API:', JSON.stringify(webhookData, null, 2));

    // Processar mensagem recebida
    if (webhookData.typeWebhook === 'incomingMessageReceived') {
      const messageData = webhookData.messageData;
      const senderData = webhookData.senderData;
      
      if (!messageData || !senderData) {
        console.log('❌ Dados de mensagem ou remetente ausentes');
        return new Response(
          JSON.stringify({ success: false, message: 'Dados incompletos' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const chatId = senderData.chatId;
      const senderName = senderData.chatName || senderData.sender || chatId;
      const messageText = messageData.textMessageData?.textMessage || 
                         messageData.extendedTextMessageData?.text || 
                         messageData.imageMessageData?.caption ||
                         '[Mídia]';
      const messageId = messageData.idMessage;
      const timestamp = new Date(messageData.timestamp * 1000).toISOString();

      console.log(`💬 Nova mensagem GREEN-API de ${senderName} (${chatId}): ${messageText}`);

      // Buscar ou criar conversa
      let conversationId = await getOrCreateConversationId(supabase, chatId, senderName);
      
      if (!conversationId) {
        console.error('❌ Erro ao obter/criar conversa');
        throw new Error('Não foi possível criar conversa');
      }

      // Salvar mensagem no banco
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
            platform: 'greenapi',
            senderName: senderName
          }
        });

      if (messageError) {
        console.error('❌ Erro ao salvar mensagem:', messageError);
        throw messageError;
      }

      console.log('✅ Mensagem salva no banco de dados');

      // Verificar se há assistente configurado para este chat
      const assignedAssistant = await getAssignedAssistant(supabase, chatId);
      
      // Gerar resposta automática se houver assistente configurado e OpenAI disponível
      if (assignedAssistant && openaiApiKey && messageText.trim() && messageText !== '[Mídia]') {
        console.log(`🤖 Gerando resposta automática com assistente: ${assignedAssistant.assistant_name}`);
        
        try {
          await generateAutoReply(supabase, {
            chatId,
            messageText,
            assistantConfig: assignedAssistant,
            openaiApiKey,
            timestamp,
            conversationId
          });
        } catch (replyError) {
          console.error('❌ Erro ao gerar resposta automática:', replyError);
          // Não falhar o webhook por erro na resposta automática
        }
      } else if (!assignedAssistant) {
        console.log('ℹ️ Nenhum assistente configurado para este chat');
      } else if (!openaiApiKey) {
        console.log('ℹ️ OpenAI não configurada - resposta automática desabilitada');
      }

      console.log('✅ Mensagem processada com sucesso');
    }

    // Processar status de mensagem (entregue, lida, etc.)
    else if (webhookData.typeWebhook === 'outgoingMessageStatus') {
      const statusData = webhookData.statusData;
      console.log('📊 Status da mensagem:', statusData);
      
      if (statusData && statusData.idMessage) {
        await updateMessageStatus(supabase, statusData);
      }
    }

    // Processar mudança de estado da instância
    else if (webhookData.typeWebhook === 'stateInstanceChanged') {
      const instanceData = webhookData.instanceData;
      console.log('🔄 Estado da instância alterado:', instanceData);
    }

    // Resposta de teste para webhook
    else if (webhookData.typeWebhook === 'test') {
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
    // Buscar assistente configurado para este chat específico
    // Por enquanto, retorna o primeiro assistente ativo
    // TODO: Implementar mapeamento chat -> assistente
    const { data, error } = await supabase
      .from('assistants_config')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar assistente:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar assistente:', error);
    return null;
  }
}

async function generateAutoReply(supabase: any, params: any) {
  const { chatId, messageText, assistantConfig, openaiApiKey, timestamp, conversationId } = params;
  
  try {
    console.log('🤖 Gerando resposta automática...');
    
    const systemPrompt = `${assistantConfig.prompt}

INSTRUÇÕES ESPECÍFICAS:
- Você é o assistente "${assistantConfig.assistant_name}" especializado em "${assistantConfig.assistant_role}"
- Responda como se fosse uma conversa de WhatsApp
- Seja natural, cordial e profissional
- Mantenha respostas concisas (máximo 2 parágrafos)
- Responda sempre em português brasileiro
- Use emojis quando apropriado, mas com moderação`;

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

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const replyText = aiData.choices[0].message.content;

    console.log('💬 Resposta gerada:', replyText);

    // Salvar resposta no banco
    const { error: saveError } = await supabase
      .from('whatsapp_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'assistant',
        message_text: replyText,
        ai_generated: true,
        timestamp: new Date().toISOString(),
        metadata: {
          assistant_id: assistantConfig.id,
          assistant_name: assistantConfig.assistant_name,
          original_message: messageText,
          chatId: chatId
        }
      });

    if (saveError) {
      console.error('❌ Erro ao salvar resposta no banco:', saveError);
      throw saveError;
    }

    console.log('✅ Resposta automática salva no banco');

    // TODO: Enviar resposta via GREEN-API
    // await sendMessageViaGreenAPI(chatId, replyText);

  } catch (error) {
    console.error('❌ Erro ao gerar resposta automática:', error);
    throw error;
  }
}

async function getOrCreateConversationId(supabase: any, chatId: string, senderName: string) {
  try {
    // Buscar conversa existente
    const { data: existing, error: fetchError } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('contact_phone', chatId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Erro ao buscar conversa:', fetchError);
      throw fetchError;
    }

    if (existing) {
      console.log('✅ Conversa existente encontrada:', existing.id);
      return existing.id;
    }

    // Criar nova conversa
    const { data: newConv, error: createError } = await supabase
      .from('whatsapp_conversations')
      .insert({
        contact_phone: chatId,
        contact_name: senderName || chatId,
        messages: []
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);
      throw createError;
    }

    console.log('✅ Nova conversa criada:', newConv.id);
    return newConv.id;

  } catch (error) {
    console.error('❌ Erro ao obter/criar conversa:', error);
    return null;
  }
}

async function updateMessageStatus(supabase: any, statusData: any) {
  try {
    console.log('📋 Atualizando status da mensagem:', statusData);
    
    // Buscar mensagem pelo ID
    const { data: message, error: findError } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('metadata->>messageId', statusData.idMessage)
      .maybeSingle();

    if (findError) {
      console.error('❌ Erro ao buscar mensagem para atualizar status:', findError);
      return;
    }

    if (!message) {
      console.log('ℹ️ Mensagem não encontrada para atualizar status');
      return;
    }

    // Atualizar metadata com status
    const updatedMetadata = {
      ...message.metadata,
      status: statusData.status,
      statusTimestamp: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({ metadata: updatedMetadata })
      .eq('id', message.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar status da mensagem:', updateError);
      return;
    }

    console.log('✅ Status da mensagem atualizado');

  } catch (error) {
    console.error('❌ Erro ao processar atualização de status:', error);
  }
}
