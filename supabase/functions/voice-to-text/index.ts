
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎤 Voice to Text - Iniciando transcrição');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key não configurada');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada no servidor' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ OpenAI API key encontrada');

    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      console.error('❌ Audio base64 não fornecido');
      return new Response(
        JSON.stringify({ error: 'Audio base64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Processando áudio...', {
      tamanho: audioBase64.length,
      primeirosChars: audioBase64.substring(0, 20),
      ultimosChars: audioBase64.substring(audioBase64.length - 20)
    });

    // Validar base64
    let audioBlob;
    try {
      // Testar se é base64 válido primeiro
      const testDecode = atob(audioBase64.substring(0, 100));
      console.log('✅ Base64 válido confirmado');
      
      const binaryString = atob(audioBase64);
      console.log('📊 Dados decodificados:', {
        tamanhoOriginal: audioBase64.length,
        tamanhoBinario: binaryString.length,
        tamanhoKB: Math.round(binaryString.length / 1024)
      });
      
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      audioBlob = new Blob([bytes], { type: 'audio/webm' });
      console.log('📄 Blob criado:', { 
        size: audioBlob.size, 
        type: audioBlob.type,
        sizeKB: Math.round(audioBlob.size / 1024)
      });
      
      if (audioBlob.size === 0) {
        throw new Error('Arquivo de áudio vazio após conversão');
      }

      if (audioBlob.size < 1024) {
        throw new Error('Arquivo de áudio muito pequeno - possível corrupção');
      }

      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máximo 25MB)');
      }

    } catch (error) {
      console.error('❌ Erro ao processar base64:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar dados de áudio',
          details: error.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar form data para OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt'); // Forçar português brasileiro
    formData.append('response_format', 'json');
    formData.append('temperature', '0'); // Máxima precisão

    console.log('🔄 Enviando para OpenAI Whisper...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    console.log('📡 Resposta OpenAI:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na OpenAI Whisper:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      
      let errorMessage = 'Erro na transcrição';
      if (response.status === 400) {
        errorMessage = 'Formato de áudio não suportado ou dados corrompidos';
      } else if (response.status === 401) {
        errorMessage = 'API key da OpenAI inválida';
      } else if (response.status === 429) {
        errorMessage = 'Limite de uso atingido';
      } else if (response.status >= 500) {
        errorMessage = 'Erro interno da OpenAI';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: errorText,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcription = await response.json();
    console.log('📄 Transcrição recebida:', {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration
    });

    if (!transcription.text || transcription.text.trim().length === 0) {
      console.warn('⚠️ Transcrição vazia');
      return new Response(
        JSON.stringify({ error: 'Transcrição vazia. Áudio pode estar mudo ou corrompido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalText = transcription.text.trim();

    // Verificar se o texto contém conteúdo suspeito
    if (finalText.toLowerCase().includes('amara.org') || 
        finalText.toLowerCase().includes('legendada pela comunidade')) {
      console.error('❌ Texto suspeito detectado:', finalText);
      return new Response(
        JSON.stringify({ 
          error: 'Transcrição retornou conteúdo inválido. Tente gravar novamente.',
          suspiciousText: finalText 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Transcrição válida concluída:', finalText.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({
        text: finalText,
        language: transcription.language || 'pt',
        confidence: transcription.confidence || 'high'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro geral na transcrição:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno na transcrição',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
