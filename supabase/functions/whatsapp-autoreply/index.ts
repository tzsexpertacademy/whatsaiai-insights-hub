
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
    console.log('📱 === WEBHOOK WHATSAPP AUTO-REPLY ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const webhookData = await req.json();
    console.log('📥 Dados do webhook completos:', JSON.stringify(webhookData, null, 2));

    // Processar mensagem do WhatsApp
    if (webhookData.messages && webhookData.messages.length > 0) {
      const message = webhookData.messages[0];
      const contactPhone = message.from;
      const messageText = message.text?.body || message.body || '';
      const contactName = message.profile?.name || message.pushname || `Contato ${contactPhone}`;

      console.log(`💬 Nova mensagem de ${contactName} (${contactPhone}): ${messageText}`);

      // Buscar configuração do assistente pessoal do usuário
      const toNumber = message.to || webhookData.to;
      console.log('📞 Mensagem destinada para:', toNumber);

      // IMPORTANTE: Aqui você deve implementar a busca real de configuração por usuário
      // Por enquanto, usando configuração padrão para testes
      const personalAssistantConfig = {
        enabled: true,
        masterNumber: '554796451886', // Substitua pelo seu número real
        assistantName: 'Kairon',
        systemPrompt: `Você é Kairon, um assistente pessoal inteligente via WhatsApp. 
        Seja proativo, eficiente e direto. Mantenha conversas naturais e amigáveis.
        Responda sempre em português brasileiro.`,
        responseDelay: 2
      };

      console.log('⚙️ Configuração do assistente:', personalAssistantConfig);

      // Verificar se o assistente está ativo
      if (!personalAssistantConfig.enabled) {
        console.log('🔇 Assistente pessoal desativado para este usuário');
        return new Response(
          JSON.stringify({ success: true, message: 'Assistente desativado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar se a mensagem é do número master autorizado
      const formatPhoneNumber = (phone: string): string => {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.endsWith('@c.us')) {
          cleaned = cleaned.replace('@c.us', '');
        }
        // Garantir que tenha o código do país
        if (cleaned.length >= 11 && !cleaned.startsWith('55')) {
          cleaned = '55' + cleaned;
        }
        return cleaned;
      };

      const cleanFromPhone = formatPhoneNumber(contactPhone);
      const cleanMasterPhone = formatPhoneNumber(personalAssistantConfig.masterNumber);

      console.log('🔍 Verificando autorização:', {
        fromPhone: cleanFromPhone,
        masterPhone: cleanMasterPhone,
        isAuthorized: cleanFromPhone === cleanMasterPhone,
        originalFrom: contactPhone,
        originalMaster: personalAssistantConfig.masterNumber
      });

      if (cleanFromPhone !== cleanMasterPhone) {
        console.log('🚫 Mensagem não é do número master autorizado - ignorando');
        console.log(`🚫 Recebido de: ${cleanFromPhone}, Master: ${cleanMasterPhone}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Não autorizado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Mensagem autorizada do master - processando...');

      // Salvar mensagem no banco
      const { data: conversation, error: convError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('contact_phone', contactPhone)
        .single();

      let conversationId;
      
      if (convError || !conversation) {
        console.log('📝 Criando nova conversa...');
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
        console.log('📝 Atualizando conversa existente...');
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

      // Gerar resposta automática usando OpenAI
      if (openaiApiKey && messageText.trim()) {
        console.log('🤖 Gerando resposta automática...');
        console.log('🤖 Prompt do sistema:', personalAssistantConfig.systemPrompt);
        
        // Aguardar delay configurado antes de responder
        console.log(`⏳ Aguardando ${personalAssistantConfig.responseDelay} segundos...`);
        await new Promise(resolve => setTimeout(resolve, personalAssistantConfig.responseDelay * 1000));
        
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: personalAssistantConfig.systemPrompt },
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
              ai_generated: true,
              assistant_name: personalAssistantConfig.assistantName
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

            console.log('✅ Resposta automática salva no banco');
          }

          // AQUI É ONDE VOCÊ PRECISA INTEGRAR COM SUA API DO WPPCONNECT
          // Por agora, apenas logando que a resposta seria enviada
          console.log(`📤 RESPOSTA SERIA ENVIADA para ${contactPhone}: ${replyText}`);
          console.log('⚠️ INTEGRAÇÃO COM WPPCONNECT NECESSÁRIA AQUI!');
          
        } else {
          console.error('❌ Erro na API OpenAI:', await aiResponse.text());
        }
      } else {
        console.log('⚠️ OpenAI não configurado ou mensagem vazia');
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
