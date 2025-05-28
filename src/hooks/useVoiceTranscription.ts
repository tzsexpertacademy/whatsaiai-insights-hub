
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const transcribeAudio = async (audioBase64: string): Promise<string | null> => {
    setIsTranscribing(true);
    
    try {
      console.log('🔄 Enviando áudio para transcrição via edge function...');
      
      const response = await fetch('/functions/v1/voice-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioBase64
        }),
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API de transcrição:', errorText);
        throw new Error(`Erro na transcrição (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('❌ Erro retornado pela API:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Transcrição concluída:', data.text);
      
      toast({
        title: "Transcrição concluída",
        description: "Sua voz foi convertida em texto",
      });

      return data.text;

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
