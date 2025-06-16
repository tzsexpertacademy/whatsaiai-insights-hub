
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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { transcribeAudio } = useVoiceTranscription();
  const { toast } = useToast();

  // Criar URL do áudio se temos base64
  const audioSrc = audioUrl || (audioBase64 ? `data:audio/ogg;base64,${audioBase64}` : '');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
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

    setIsTranscribing(true);
    try {
      console.log('🎵 Transcrevendo áudio da conversa...');
      const text = await transcribeAudio(audioBase64);
      
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-green-50 rounded-lg border ${className}`}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={!audioSrc}
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
