
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
    console.log('📱 WhatsApp Auto-Reply - Webhook recebido');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const webhookData = await req.json();
    console.log('📥 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Processar mensagem do WhatsApp
    if (webhookData.messages && webhookData.messages.length > 0) {
      const message = webhookData.messages[0];
      const contactPhone = message.from;
      const messageText = message.text?.body || '';
      const contactName = message.profile?.name || `Contato ${contactPhone}`;

      console.log(`💬 Nova mensagem de ${contactName}: ${messageText}`);

      // Salvar mensagem no banco
      const { data: conversation, error: convError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('contact_phone', contactPhone)
        .single();

      let conversationId;
      
      if (convError || !conversation) {
        // Criar nova conversa
        const { data: newConv, error: newError } = await supabase
          .from('whatsapp_conversations')
          .insert({
            contact_name: contactName,
            contact_phone: contactPhone,
            messages: [{ 
              text: messageText, 
              sender: 'customer', 
              timestamp: new Date().toISOString() 
            }]
          })
          .select()
          .single();

        if (newError) {
          console.error('❌ Erro ao criar conversa:', newError);
          throw newError;
        }
        
        conversationId = newConv.id;
        console.log('✅ Nova conversa criada:', conversationId);
      } else {
        // Atualizar conversa existente
        const updatedMessages = [...(conversation.messages || []), {
          text: messageText,
          sender: 'customer',
          timestamp: new Date().toISOString()
        }];

        const { error: updateError } = await supabase
          .from('whatsapp_conversations')
          .update({ 
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar conversa:', updateError);
          throw updateError;
        }

        conversationId = conversation.id;
        console.log('✅ Conversa atualizada:', conversationId);
      }

      // Salvar mensagem individual
      await supabase
        .from('whatsapp_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'customer',
          message_text: messageText,
          timestamp: new Date().toISOString()
        });

      // Gerar resposta automática se OpenAI estiver configurada
      if (openaiApiKey && messageText.trim()) {
        console.log('🤖 Gerando resposta automática...');
        
        const systemPrompt = `Você é um assistente virtual especializado em atendimento ao cliente via WhatsApp. 
        
        Diretrizes:
        - Seja cordial, profissional e empático
        - Responda em português brasileiro
        - Mantenha respostas concisas (máximo 2 parágrafos)
        - Identifique-se como assistente virtual
        - Ofereça ajuda específica baseada na mensagem
        - Se não souber algo, seja honesto e ofereça contato humano
        
        Contexto: Esta é uma conversa via WhatsApp com um cliente.`;

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
          const updatedConversation = await supabase
            .from('whatsapp_conversations')
            .select('messages')
            .eq('id', conversationId)
            .single();

          if (updatedConversation.data) {
            const newMessages = [...(updatedConversation.data.messages || []), {
              text: replyText,
              sender: 'assistant',
              timestamp: new Date().toISOString(),
              ai_generated: true
            }];

            await supabase
              .from('whatsapp_conversations')
              .update({ 
                messages: newMessages,
                updated_at: new Date().toISOString()
              })
              .eq('id', conversationId);

            await supabase
              .from('whatsapp_messages')
              .insert({
                conversation_id: conversationId,
                sender_type: 'assistant',
                message_text: replyText,
                ai_generated: true,
                timestamp: new Date().toISOString()
              });

            console.log('✅ Resposta automática salva');
          }

          // Aqui você pode integrar com sua plataforma de WhatsApp
          // para enviar a resposta de volta ao cliente
          // Exemplo: await sendWhatsAppMessage(contactPhone, replyText);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processado' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro no processamento do webhook',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
