
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';

interface VoiceRecordButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  audioLevel: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export function VoiceRecordButton({
  isRecording,
  isTranscribing,
  audioLevel,
  onStartRecording,
  onStopRecording,
  disabled = false
}: VoiceRecordButtonProps) {
  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const getButtonStyle = () => {
    if (disabled) {
      return "bg-gray-300 cursor-not-allowed hover:bg-gray-300";
    }
    if (isTranscribing) {
      return "bg-yellow-500 hover:bg-yellow-600 animate-pulse shadow-lg";
    }
    if (isRecording) {
      const pulseIntensity = Math.min(audioLevel * 3, 1);
      return `bg-red-500 hover:bg-red-600 shadow-lg transform scale-110 ${pulseIntensity > 0.3 ? 'animate-pulse' : ''}`;
    }
    return "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-200";
  };

  const getIcon = () => {
    if (isTranscribing) {
      return <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />;
    }
    if (disabled) {
      return <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />;
    }
    if (isRecording) {
      return <MicOff className="w-4 h-4 lg:w-5 lg:h-5" />;
    }
    return <Mic className="w-4 h-4 lg:w-5 lg:h-5" />;
  };

  const getTitle = () => {
    if (disabled) {
      return "Microfone indisponível";
    }
    if (isTranscribing) {
      return "Transcrevendo áudio...";
    }
    if (isRecording) {
      return "Clique para parar a gravação";
    }
    return "Clique para gravar áudio";
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        className={`rounded-full w-10 h-10 lg:w-12 lg:h-12 p-0 transition-all duration-200 ${getButtonStyle()}`}
        title={getTitle()}
      >
        {getIcon()}
      </Button>
      
      {/* Indicador de gravação ativa */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-red-500 rounded-full animate-ping"></div>
      )}
      
      {/* Indicador de nível de áudio */}
      {isRecording && audioLevel > 0.1 && (
        <div 
          className="absolute inset-0 rounded-full border-2 lg:border-4 border-red-300 animate-pulse pointer-events-none"
          style={{ 
            transform: `scale(${1 + audioLevel * 0.4})`,
            opacity: Math.min(audioLevel * 2, 0.8)
          }}
        />
      )}

      {/* Indicador de processamento */}
      {isTranscribing && (
        <div className="absolute inset-0 rounded-full border-2 lg:border-4 border-yellow-300 animate-spin pointer-events-none" />
      )}
    </div>
  );
}
