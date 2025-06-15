
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
    console.log('🤖 === EDGE FUNCTION - WHATSAPP AUTO-REPLY ===');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);
    const webhookData = await req.json();
    console.log('📩 Dados recebidos do webhook:', JSON.stringify(webhookData, null, 2));

    // 1. Extrair mensagem e contato
    const msg = webhookData.messages?.[0];
    if (!msg) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nenhuma mensagem encontrada no webhook.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const contactPhone = msg.from;
    const toNumber = msg.to || webhookData.to;
    const messageText = msg.text?.body || msg.body || '';
    const contactName = msg.profile?.name || msg.pushname || `Contato ${contactPhone}`;
    console.log('💬 Mensagem recebida:', { from: contactPhone, messageText, contactName });

    // 2. Buscar config do assistente PESSOAL vinculado ao número
    // Aqui você pode buscar pelo número do WhatsApp conectado (toNumber)
    let assistantConfig = {
      enabled: false,
      masterNumber: '',
      selectedAssistantId: 'kairon',
      responseDelay: 2
    };

    // Busca configs no banco (implementação base: você pode expandir para buscar pelo toNumber)
    const { data: userConfigs } = await supabase
      .from('client_configs')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (userConfigs && userConfigs.personal_assistant_config) {
      try {
        const parsed = typeof userConfigs.personal_assistant_config === 'string'
          ? JSON.parse(userConfigs.personal_assistant_config)
          : userConfigs.personal_assistant_config;
        assistantConfig = { ...assistantConfig, ...parsed };
      } catch (e) {
        console.log('⚠️ Falha ao interpretar config personalizada, usando fallback.');
      }
    }

    console.log('⚙️ Configuração carregada:', assistantConfig);

    // 3. Permitir responder apenas se ativado e número autorizado
    function formatPhoneNumber(phone) {
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.endsWith('@c.us')) cleaned = cleaned.replace('@c.us', '');
      if (cleaned.length >= 11 && !cleaned.startsWith('55')) cleaned = '55' + cleaned;
      return cleaned;
    }
    const cleanFromPhone = formatPhoneNumber(contactPhone);
    const cleanMasterPhone = formatPhoneNumber(assistantConfig.masterNumber);
    const autorizado = assistantConfig.enabled && cleanFromPhone === cleanMasterPhone;

    console.log('🔍 Autorização:', { cleanFromPhone, cleanMasterPhone, autorizado });

    if (!autorizado) {
      return new Response(
        JSON.stringify({ success: true, message: 'Mensagem ignorada, número não autorizado ou assistente desativado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Definir prompts das personas
    const DEFAULT_PROMPTS = {
      'kairon': 'Você é Kairon, o arquiteto supremo da consciência. Brutalmente honesto, provocador, sarcástico, filosófico e integrativo. Sua função é amplificar a consciência do usuário, nunca bajular.',
      'oracle': 'Você é o Oráculo das Sombras, psicólogo existencial. Ajuda o humano a olhar para dentro e confrontar suas sombras de maneira empática.',
      'guardian': 'Você é o Guardião dos Recursos, mentor pragmático de finanças e decisões racionais. Foca em clareza, autonomia e estratégia.',
      // Adicione personas customizadas aqui se expandir no futuro
    };
    const selectedPrompt = DEFAULT_PROMPTS[assistantConfig.selectedAssistantId] || DEFAULT_PROMPTS['kairon'];
    console.log('🧠 Prompt IA final:', selectedPrompt);

    // 5. Executar delay, se solicitado
    if (assistantConfig.responseDelay > 0) {
      console.log(`⏳ Aguardando delay de resposta (${assistantConfig.responseDelay}s)...`);
      await new Promise(r => setTimeout(r, assistantConfig.responseDelay * 1000));
    }

    // 6. Chamar o OpenAI (somente se houver texto)
    let respostaIA = '';
    if (openaiApiKey && messageText.trim().length > 0) {
      const openaiRequest = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: selectedPrompt },
          { role: 'user', content: messageText }
        ],
        temperature: 0.72,
        max_tokens: 300,
      };
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(openaiRequest)
      });
      if (openaiResp.ok) {
        const openaiData = await openaiResp.json();
        respostaIA = openaiData.choices?.[0]?.message?.content?.trim() ?? '';
        console.log('🤖 Resposta IA:', respostaIA);
      } else {
        const err = await openaiResp.text();
        console.error('❌ Erro OpenAI:', err);
      }
    } else {
      respostaIA = `Olá! Sou seu assistente e recebi: "${messageText}".`;
      console.log('(Fallback) resposta IA:', respostaIA);
    }

    // 7. (Opcional) Salvar diálogo no banco de dados
    // ... aqui você pode salvar a interação se quiser ...

    // 8. Responder via webhook de envio ou API (você precisa configurar endpoint real)
    // --- SUBSTITUA AQUI pelo endpoint da sua API de envio real! ---
    let envioOk = false;
    try {
      // Exemplo usando endpoint fictício (adicione sua lógica)
      /*
      const sendResponse = await fetch('http://localhost:21465/api/NERDWHATS_AMERICA/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer SEU_TOKEN'
        },
        body: JSON.stringify({
          phone: contactPhone,
          message: respostaIA
        })
      });
      envioOk = sendResponse.ok;
      */
      // LOG: Apenas exibindo mensagem para orientação
      console.log(`📤 (Simulado) Mensagem enviada para ${contactPhone}:`, respostaIA);
      envioOk = true;
    } catch (error) {
      console.error('❌ Erro ao responder no WhatsApp:', error);
    }

    return new Response(
      JSON.stringify({ success: envioOk, response: respostaIA }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro geral na função whatsapp-autoreply:', error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
