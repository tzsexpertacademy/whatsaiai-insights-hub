
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from 'lucide-react';

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
    if (isTranscribing) {
      return "bg-yellow-500 hover:bg-yellow-600 animate-pulse";
    }
    if (isRecording) {
      const intensity = Math.min(audioLevel * 2, 1);
      return `bg-red-500 hover:bg-red-600 shadow-lg transform scale-110`;
    }
    return "bg-blue-500 hover:bg-blue-600";
  };

  const getIcon = () => {
    if (isTranscribing) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    if (isRecording) {
      return <MicOff className="w-5 h-5" />;
    }
    return <Mic className="w-5 h-5" />;
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        className={`rounded-full w-12 h-12 p-0 transition-all duration-200 ${getButtonStyle()}`}
        title={
          isTranscribing 
            ? "Transcrevendo áudio..." 
            : isRecording 
              ? "Clique para parar a gravação" 
              : "Clique para gravar áudio"
        }
      >
        {getIcon()}
      </Button>
      
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
      )}
      
      {isRecording && audioLevel > 0 && (
        <div 
          className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse"
          style={{ 
            transform: `scale(${1 + audioLevel * 0.3})`,
            opacity: audioLevel 
          }}
        />
      )}
    </div>
  );
}
