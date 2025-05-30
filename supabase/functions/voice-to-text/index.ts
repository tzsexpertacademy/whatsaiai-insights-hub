
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
        JSON.stringify({ error: 'OpenAI API key não configurada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'Audio base64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Processando áudio... Tamanho:', audioBase64.length);

    // Convert base64 to blob with better error handling
    let audioBlob;
    try {
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      audioBlob = new Blob([bytes], { type: 'audio/webm' });
      console.log('📄 Blob criado:', { size: audioBlob.size, type: audioBlob.type });
      
      if (audioBlob.size === 0) {
        throw new Error('Arquivo de áudio vazio após conversão');
      }
    } catch (error) {
      console.error('❌ Erro ao converter base64:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar dados de áudio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create form data for OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'json');

    console.log('🔄 Enviando para OpenAI Whisper...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    console.log('📡 Resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na OpenAI Whisper:', response.status, errorText);
      
      let errorMessage = 'Erro na transcrição';
      if (response.status === 400) {
        errorMessage = 'Formato de áudio não suportado';
      } else if (response.status === 401) {
        errorMessage = 'API key da OpenAI inválida';
      } else if (response.status === 429) {
        errorMessage = 'Limite de uso atingido';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcription = await response.json();
    console.log('✅ Transcrição concluída');

    if (!transcription.text || transcription.text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transcrição vazia. Tente falar mais alto.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        text: transcription.text.trim(),
        language: transcription.language || 'pt'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na transcrição:', error);
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
