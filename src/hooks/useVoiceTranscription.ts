
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const { config } = useClientConfig();

  const transcribeAudio = async (audioBase64: string): Promise<string | null> => {
    setIsTranscribing(true);
    
    try {
      console.log('🔄 Iniciando transcrição de áudio...');
      console.log('📊 Tamanho do áudio base64:', audioBase64.length);
      
      // Validar entrada
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Dados de áudio inválidos');
      }

      // Verificar se há uma API key válida da OpenAI configurada
      const hasValidApiKey = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');
      
      if (hasValidApiKey) {
        console.log('🔄 Usando OpenAI API diretamente...');
        return await transcribeWithOpenAI(audioBase64, config.openai.apiKey);
      } else {
        console.log('🔄 Usando edge function como fallback...');
        return await transcribeWithEdgeFunction(audioBase64);
      }

    } catch (error) {
      console.error('❌ Erro na transcrição:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na transcrição';
      
      toast({
        title: "❌ Erro na transcrição",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeWithOpenAI = async (audioBase64: string, apiKey: string): Promise<string> => {
    try {
      // Validar e converter base64
      const binaryString = atob(audioBase64);
      console.log('📊 Tamanho binário do áudio:', binaryString.length);
      
      if (binaryString.length === 0) {
        throw new Error('Dados de áudio corrompidos');
      }

      // Converter para Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Criar blob com tipo correto
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });
      console.log('📄 Blob criado:', { size: audioBlob.size, type: audioBlob.type });
      
      if (audioBlob.size === 0) {
        throw new Error('Arquivo de áudio vazio');
      }

      // Verificar tamanho máximo (25MB limite da OpenAI)
      const maxSize = 25 * 1024 * 1024;
      if (audioBlob.size > maxSize) {
        throw new Error(`Arquivo muito grande (${Math.round(audioBlob.size / 1024 / 1024)}MB). Máximo: 25MB`);
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      formData.append('response_format', 'json');

      // Fazer requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('📡 Resposta OpenAI:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro OpenAI:', errorText);
          
          let errorMessage = `Erro da OpenAI (${response.status})`;
          
          if (response.status === 400) {
            errorMessage = 'Formato de áudio não suportado ou corrompido';
          } else if (response.status === 401) {
            errorMessage = 'API key da OpenAI inválida';
          } else if (response.status === 429) {
            errorMessage = 'Limite de uso da OpenAI atingido';
          } else if (response.status >= 500) {
            errorMessage = 'Erro interno da OpenAI. Tente novamente em alguns minutos.';
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('📄 Resultado OpenAI:', result);

        if (!result.text || result.text.trim().length === 0) {
          throw new Error('Transcrição vazia. Tente falar mais alto ou em ambiente mais silencioso.');
        }

        console.log('✅ Transcrição direta concluída:', result.text.substring(0, 100) + '...');

        toast({
          title: "✅ Transcrição concluída",
          description: "Sua voz foi convertida em texto via OpenAI",
        });

        return result.text.trim();
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Transcrição demorou muito tempo. Tente um áudio mais curto.');
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Erro na API OpenAI:', error);
      throw error;
    }
  };

  const transcribeWithEdgeFunction = async (audioBase64: string): Promise<string> => {
    try {
      const response = await fetch('/functions/v1/voice-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          audioBase64: audioBase64
        }),
      });

      console.log('📡 Resposta da edge function:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na edge function:', errorText);
        throw new Error(`Erro na edge function (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Transcrição vazia retornada pela edge function');
      }

      console.log('✅ Transcrição via edge function concluída:', data.text.substring(0, 100) + '...');
      
      toast({
        title: "✅ Transcrição concluída",
        description: "Sua voz foi convertida em texto via edge function",
      });

      return data.text.trim();
    } catch (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error('Edge function indisponível. Configure a OpenAI API key para transcrição direta.');
    }
  };

  return {
    transcribeAudio,
    isTranscribing
  };
}
