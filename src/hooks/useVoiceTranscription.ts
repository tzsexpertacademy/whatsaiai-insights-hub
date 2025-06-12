
// Nada mudou, mantendo arquivo como está
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
      console.log('🔄 Iniciando transcrição:', {
        audioSize: audioBase64.length,
        audioPreview: audioBase64.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      
      // Validar entrada rigorosamente
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Dados de áudio inválidos ou vazios');
      }

      if (audioBase64.length < 100) {
        throw new Error('Dados de áudio muito pequenos - possível corrupção');
      }

      // Verificar se é base64 válido
      try {
        const testDecode = atob(audioBase64.substring(0, 100));
        console.log('✅ Base64 válido confirmado');
      } catch (decodeError) {
        console.error('❌ Base64 inválido:', decodeError);
        throw new Error('Dados de áudio corrompidos - formato inválido');
      }

      // Verificar configuração OpenAI
      const hasValidApiKey = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');
      
      if (hasValidApiKey) {
        console.log('🔄 Usando OpenAI API diretamente...');
        return await transcribeWithOpenAI(audioBase64, config.openai.apiKey);
      } else {
        console.log('🔄 Usando edge function como fallback...');
        return await transcribeWithEdgeFunction(audioBase64);
      }

    } catch (error) {
      console.error('❌ Erro geral na transcrição:', error);
      
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
      console.log('🤖 Processando com OpenAI direta:', {
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        audioSize: audioBase64.length
      });

      // Converter base64 com validação detalhada
      const binaryString = atob(audioBase64);
      console.log('📊 Dados binários:', {
        binaryLength: binaryString.length,
        sizeKB: Math.round(binaryString.length / 1024)
      });
      
      if (binaryString.length === 0) {
        throw new Error('Dados de áudio corrompidos após decodificação');
      }

      // Converter para Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Criar blob com tipo específico
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });
      console.log('📄 Blob final para OpenAI:', { 
        size: audioBlob.size, 
        type: audioBlob.type,
        sizeKB: Math.round(audioBlob.size / 1024)
      });
      
      if (audioBlob.size === 0) {
        throw new Error('Arquivo de áudio vazio após conversão');
      }

      // Verificar tamanho máximo (25MB limite da OpenAI)
      const maxSize = 25 * 1024 * 1024;
      if (audioBlob.size > maxSize) {
        throw new Error(`Arquivo muito grande (${Math.round(audioBlob.size / 1024 / 1024)}MB). Máximo: 25MB`);
      }

      // Preparar FormData com configurações específicas
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt'); // Forçar português
      formData.append('response_format', 'json');
      formData.append('temperature', '0'); // Menor criatividade para maior precisão

      console.log('📤 Enviando para OpenAI Whisper...');

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
        
        console.log('📡 Resposta OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro detalhado OpenAI:', {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText
          });
          
          let errorMessage = `Erro da OpenAI (${response.status})`;
          
          if (response.status === 400) {
            errorMessage = 'Formato de áudio não suportado ou dados corrompidos';
          } else if (response.status === 401) {
            errorMessage = 'API key da OpenAI inválida ou expirada';
          } else if (response.status === 429) {
            errorMessage = 'Limite de uso da OpenAI atingido - tente novamente em alguns minutos';
          } else if (response.status >= 500) {
            errorMessage = 'Erro interno da OpenAI - tente novamente em alguns minutos';
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('📄 Resultado completo OpenAI:', {
          text: result.text,
          language: result.language,
          duration: result.duration,
          segments: result.segments ? result.segments.length : 'N/A'
        });

        if (!result.text || result.text.trim().length === 0) {
          throw new Error('Transcrição vazia - áudio pode estar mudo ou corrompido');
        }

        // Verificar se o resultado faz sentido (evitar textos estranhos)
        const transcribedText = result.text.trim();
        
        if (transcribedText.toLowerCase().includes('amara.org') || 
            transcribedText.toLowerCase().includes('legendada pela comunidade')) {
          console.warn('⚠️ Texto suspeito detectado:', transcribedText);
          throw new Error('Transcrição retornou texto inválido - tente gravar novamente');
        }

        console.log('✅ Transcrição válida:', transcribedText.substring(0, 100) + '...');

        toast({
          title: "✅ Transcrição concluída",
          description: `Transcrito via OpenAI: "${transcribedText.substring(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
        });

        return transcribedText;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Transcrição demorou muito - tente um áudio mais curto');
        }
        
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Erro detalhado na API OpenAI:', error);
      throw error;
    }
  };

  const transcribeWithEdgeFunction = async (audioBase64: string): Promise<string> => {
    try {
      console.log('🌐 Usando edge function:', {
        audioSize: audioBase64.length,
        endpoint: '/functions/v1/voice-to-text'
      });

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

      console.log('📡 Resposta edge function:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro edge function:', {
          status: response.status,
          errorBody: errorText
        });
        throw new Error(`Erro na edge function (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Dados da edge function:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Edge function retornou transcrição vazia');
      }

      const transcribedText = data.text.trim();

      // Verificar texto suspeito também na edge function
      if (transcribedText.toLowerCase().includes('amara.org') || 
          transcribedText.toLowerCase().includes('legendada pela comunidade')) {
        console.warn('⚠️ Texto suspeito da edge function:', transcribedText);
        throw new Error('Edge function retornou texto inválido - problema na transcrição');
      }

      console.log('✅ Transcrição edge function válida:', transcribedText.substring(0, 100) + '...');
      
      toast({
        title: "✅ Transcrição concluída",
        description: `Transcrito via servidor: "${transcribedText.substring(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
      });

      return transcribedText;
    } catch (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error('Servidor de transcrição indisponível - configure OpenAI API key para transcrição direta');
    }
  };

  return {
    transcribeAudio,
    isTranscribing
  };
}

