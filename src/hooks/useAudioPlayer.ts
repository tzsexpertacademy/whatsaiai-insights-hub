
import { useState, useRef, useEffect, useMemo } from 'react';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  onTranscriptionComplete?: (text: string) => void;
}

export function useAudioPlayer({
  audioUrl,
  audioBase64,
  duration = 30,
  onTranscriptionComplete
}: UseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [hasValidAudio, setHasValidAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { transcribeAudio } = useVoiceTranscription();
  const { toast } = useToast();

  const processAudioData = (base64Data: string): string | null => {
    try {
      console.log('🎵 Processando dados de áudio:', {
        length: base64Data.length,
        preview: base64Data.substring(0, 50) + '...'
      });

      let cleanBase64 = base64Data.trim();
      
      if (cleanBase64.includes('data:')) {
        cleanBase64 = cleanBase64.split(',')[1] || cleanBase64;
      }
      if (cleanBase64.includes('audio:')) {
        cleanBase64 = cleanBase64.split('audio:')[1] || cleanBase64;
      }

      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Pattern.test(cleanBase64)) {
        console.warn('⚠️ Dados não são base64 válido');
        return null;
      }

      if (cleanBase64.length < 50) {
        console.warn('⚠️ Dados de áudio muito pequenos');
        return null;
      }

      console.log('✅ Dados de áudio processados com sucesso');
      return cleanBase64;
    } catch (error) {
      console.error('❌ Erro ao processar dados de áudio:', error);
      return null;
    }
  };

  const audioSrc = useMemo(() => {
    setAudioError(null);
    
    if (audioUrl) {
      console.log('🎵 Usando URL de áudio:', audioUrl);
      setHasValidAudio(true);
      return audioUrl;
    }
    
    if (audioBase64) {
      const processedBase64 = processAudioData(audioBase64);
      if (processedBase64) {
        console.log('🎵 Criando data URL para áudio base64');
        setHasValidAudio(true);
        return `data:audio/webm;base64,${processedBase64}`;
      } else {
        setAudioError('Formato de áudio inválido');
      }
    }
    
    setHasValidAudio(false);
    return '';
  }, [audioUrl, audioBase64]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
        console.log('🎵 Duração do áudio detectada:', audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedData = () => {
      console.log('✅ Áudio carregado com sucesso');
      setHasValidAudio(true);
      setAudioError(null);
    };
    const handleError = (e: Event) => {
      console.error('❌ Erro ao carregar áudio:', e);
      setHasValidAudio(false);
      setAudioError('Erro ao carregar áudio');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioSrc]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !hasValidAudio) {
      toast({
        title: "Áudio indisponível",
        description: audioError || "Este áudio não pode ser reproduzido",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        console.log('⏸️ Áudio pausado');
      } else {
        await audio.play();
        setIsPlaying(true);
        console.log('▶️ Áudio reproduzindo');
      }
    } catch (error) {
      console.error('❌ Erro ao reproduzir áudio:', error);
      setAudioError('Erro na reprodução');
      toast({
        title: "Erro na reprodução",
        description: "Não foi possível reproduzir o áudio",
        variant: "destructive"
      });
    }
  };

  const handleTranscribe = async () => {
    if (!audioBase64) {
      toast({
        title: "Áudio não disponível",
        description: "Dados de áudio não encontrados para transcrição",
        variant: "destructive"
      });
      return;
    }

    const processedBase64 = processAudioData(audioBase64);
    if (!processedBase64) {
      toast({
        title: "Áudio inválido",
        description: "Os dados de áudio não são válidos para transcrição",
        variant: "destructive"
      });
      return;
    }

    setIsTranscribing(true);
    try {
      console.log('🎵 Iniciando transcrição de áudio...');
      const text = await transcribeAudio(processedBase64);
      
      if (text) {
        setTranscription(text);
        onTranscriptionComplete?.(text);
        
        toast({
          title: "✅ Áudio transcrito",
          description: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        });
      } else {
        throw new Error('Transcrição vazia');
      }
    } catch (error) {
      console.error('❌ Erro na transcrição:', error);
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever o áudio",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    audioRef,
    audioSrc,
    isPlaying,
    currentTime,
    audioDuration,
    isTranscribing,
    transcription,
    hasValidAudio,
    audioError,
    togglePlayPause,
    handleTranscribe
  };
}
