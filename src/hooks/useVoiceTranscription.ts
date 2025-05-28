
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
      
      // Verificar se há uma API key válida da OpenAI configurada
      if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
        console.warn('⚠️ API key da OpenAI não configurada, usando edge function');
        
        // Usar edge function como fallback
        const response = await fetch('/functions/v1/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: audioBase64
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na edge function (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        console.log('✅ Transcrição via edge function concluída');
        return data.text;
      }

      // Usar API da OpenAI diretamente
      console.log('🔄 Usando OpenAI API diretamente...');
      
      // Converter base64 para blob
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro da OpenAI (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Transcrição direta concluída');

      toast({
        title: "Transcrição concluída",
        description: "Sua voz foi convertida em texto",
      });

      return result.text;

    } catch (error) {
      console.error('❌ Erro na transcrição:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na transcrição';
      
      toast({
        title: "Erro na transcrição",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcribeAudio,
    isTranscribing
  };
}
