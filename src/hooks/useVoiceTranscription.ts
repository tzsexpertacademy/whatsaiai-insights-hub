
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const transcribeAudio = async (audioBase64: string): Promise<string | null> => {
    setIsTranscribing(true);
    
    try {
      console.log('🔄 Enviando áudio para transcrição...');
      
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
        throw new Error('Erro na transcrição do áudio');
      }

      const data = await response.json();
      
      if (data.error) {
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
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever o áudio",
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
