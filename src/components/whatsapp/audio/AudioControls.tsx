
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  hasValidAudio: boolean;
  audioError: string | null;
  isTranscribing: boolean;
  audioBase64?: string;
  onTogglePlayPause: () => void;
  onTranscribe: () => void;
}

export function AudioControls({
  isPlaying,
  hasValidAudio,
  audioError,
  isTranscribing,
  audioBase64,
  onTogglePlayPause,
  onTranscribe
}: AudioControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onTogglePlayPause}
        disabled={!hasValidAudio}
        className="h-8 w-8 p-0 hover:bg-green-100"
        title={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-green-600" />
        ) : (
          <Play className="h-4 w-4 text-green-600" />
        )}
      </Button>

      <Volume2 className="h-3 w-3 text-green-600" />

      {audioBase64 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onTranscribe}
          disabled={isTranscribing}
          className="h-8 text-xs ml-2"
          title="Transcrever áudio para texto"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Transcrevendo...
            </>
          ) : (
            '📝 Transcrever'
          )}
        </Button>
      )}
    </div>
  );
}
