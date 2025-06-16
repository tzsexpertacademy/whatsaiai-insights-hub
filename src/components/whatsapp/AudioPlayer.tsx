
import React from 'react';
import { Volume2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioControls } from './audio/AudioControls';
import { AudioProgressBar } from './audio/AudioProgressBar';

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
  duration = 30, 
  onTranscriptionComplete,
  className = "" 
}: AudioPlayerProps) {
  const {
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
  } = useAudioPlayer({
    audioUrl,
    audioBase64,
    duration,
    onTranscriptionComplete
  });

  if (audioError || !audioSrc) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
        <Volume2 className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-700 flex-1">
          {audioError || 'Áudio não disponível'}
        </span>
        <AudioControls
          isPlaying={false}
          hasValidAudio={false}
          audioError={audioError}
          isTranscribing={isTranscribing}
          audioBase64={audioBase64}
          onTogglePlayPause={() => {}}
          onTranscribe={handleTranscribe}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <AudioControls
        isPlaying={isPlaying}
        hasValidAudio={hasValidAudio}
        audioError={audioError}
        isTranscribing={isTranscribing}
        audioBase64={audioBase64}
        onTogglePlayPause={togglePlayPause}
        onTranscribe={handleTranscribe}
      />

      <AudioProgressBar
        currentTime={currentTime}
        duration={audioDuration}
        transcription={transcription}
      />
    </div>
  );
}
