
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
      
      // Validar entrada
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Dados de áudio inválidos ou vazios');
      }

      if (audioBase64.length < 100) {
        throw new Error('Dados de áudio muito pequenos');
      }

      // Verificar configuração OpenAI
      const hasValidApiKey = config?.openai?.apiKey && config.openai.apiKey.startsWith('sk-');
      
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
      console.log('🤖 Processando com OpenAI direta');

      // Converter base64 para blob
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });
      
      if (audioBlob.size === 0) {
        throw new Error('Arquivo de áudio vazio');
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      formData.append('response_format', 'json');

      console.log('📤 Enviando para OpenAI Whisper...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na OpenAI:', errorText);
        throw new Error(`Erro da OpenAI (${response.status})`);
      }

      const result = await response.json();
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('Transcrição vazia');
      }

      const transcribedText = result.text.trim();
      
      console.log('✅ Transcrição OpenAI válida:', transcribedText.substring(0, 100) + '...');

      toast({
        title: "✅ Transcrição concluída",
        description: `OpenAI: "${transcribedText.substring(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
      });

      return transcribedText;
      
    } catch (error) {
      console.error('❌ Erro na API OpenAI:', error);
      throw error;
    }
  };

  const transcribeWithEdgeFunction = async (audioBase64: string): Promise<string> => {
    try {
      console.log('🌐 Usando edge function');

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro edge function:', errorText);
        throw new Error(`Erro na edge function (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Edge function retornou transcrição vazia');
      }

      const transcribedText = data.text.trim();
      
      console.log('✅ Transcrição edge function válida:', transcribedText.substring(0, 100) + '...');
      
      toast({
        title: "✅ Transcrição concluída",
        description: `Servidor: "${transcribedText.substring(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
      });

      return transcribedText;
    } catch (error) {
      console.error('❌ Erro na edge function:', error);
      throw new Error('Servidor de transcrição indisponível - configure OpenAI API key');
    }
  };

  return {
    transcribeAudio,
    isTranscribing
  };
}
