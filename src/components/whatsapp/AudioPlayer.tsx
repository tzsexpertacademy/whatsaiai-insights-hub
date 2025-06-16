
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
}

export function AudioPlayer({ 
  audioUrl, 
  audioBase64, 
  duration = 0, 
  onTranscriptionComplete,
  className = "" 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [hasValidAudio, setHasValidAudio] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { transcribeAudio } = useVoiceTranscription();
  const { toast } = useToast();

  // Processar e validar dados de áudio
  const processAudioData = (base64Data: string): string | null => {
    try {
      // Limpar dados de áudio se necessário
      let cleanBase64 = base64Data;
      
      // Remover prefixos como "audio:" se existirem
      if (base64Data.includes('audio:')) {
        cleanBase64 = base64Data.split('audio:')[1];
      }
      
      // Verificar se parece com base64 válido
      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Pattern.test(cleanBase64)) {
        console.warn('⚠️ Dados não parecem ser base64 válido:', cleanBase64.substring(0, 50));
        return null;
      }

      // Verificar tamanho mínimo
      if (cleanBase64.length < 100) {
        console.warn('⚠️ Dados de áudio muito pequenos');
        return null;
      }

      console.log('✅ Dados de áudio processados:', {
        originalLength: base64Data.length,
        cleanLength: cleanBase64.length,
        preview: cleanBase64.substring(0, 20) + '...'
      });

      return cleanBase64;
    } catch (error) {
      console.error('❌ Erro ao processar dados de áudio:', error);
      return null;
    }
  };

  // Criar URL do áudio
  const audioSrc = React.useMemo(() => {
    if (audioUrl) {
      setHasValidAudio(true);
      return audioUrl;
    }
    
    if (audioBase64) {
      const processedBase64 = processAudioData(audioBase64);
      if (processedBase64) {
        setHasValidAudio(true);
        // Usar formato WebM para compatibilidade
        return `data:audio/webm;base64,${processedBase64}`;
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
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedData = () => {
      console.log('🎵 Áudio carregado com sucesso');
      setHasValidAudio(true);
    };
    const handleError = (e: Event) => {
      console.error('❌ Erro ao carregar áudio:', e);
      setHasValidAudio(false);
      toast({
        title: "Erro no áudio",
        description: "Não foi possível carregar este áudio",
        variant: "destructive"
      });
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioSrc, toast]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !hasValidAudio) {
      toast({
        title: "Áudio indisponível",
        description: "Este áudio não pode ser reproduzido",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
        setHasValidAudio(false);
        toast({
          title: "Erro na reprodução",
          description: "Não foi possível reproduzir o áudio",
          variant: "destructive"
        });
      }
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
      console.log('🎵 Transcrevendo áudio da conversa...');
      const text = await transcribeAudio(processedBase64);
      
      if (text) {
        setTranscription(text);
        onTranscriptionComplete?.(text);
        
        toast({
          title: "✅ Áudio transcrito",
          description: `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        });
      }
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever o áudio",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Se não há áudio válido, mostrar placeholder
  if (!hasValidAudio && !audioSrc) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
        <Volume2 className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-700">Áudio indisponível</span>
        {audioBase64 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="h-6 text-xs"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Tentando...
              </>
            ) : (
              '📝 Tentar Transcrever'
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-2 bg-green-50 rounded-lg border ${className}`}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={!hasValidAudio}
        className="h-8 w-8 p-0 hover:bg-green-100"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-green-600" />
        ) : (
          <Play className="h-4 w-4 text-green-600" />
        )}
      </Button>

      <Volume2 className="h-3 w-3 text-green-600" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-green-700">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 bg-green-200 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-100"
              style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }}
            />
          </div>
          <span>{formatTime(audioDuration)}</span>
        </div>
        
        {transcription && (
          <div className="mt-1 text-xs text-gray-600 bg-white p-1 rounded text-left">
            <strong>Transcrição:</strong> {transcription}
          </div>
        )}
      </div>

      {audioBase64 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTranscribe}
          disabled={isTranscribing}
          className="h-8 text-xs"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Transcrevendo...
            </>
          ) : (
            <>
              📝 Transcrever
            </>
          )}
        </Button>
      )}
    </div>
  );
}
