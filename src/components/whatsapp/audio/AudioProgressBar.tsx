
import React from 'react';

interface AudioProgressBarProps {
  currentTime: number;
  duration: number;
  transcription?: string | null;
}

export function AudioProgressBar({ currentTime, duration, transcription }: AudioProgressBarProps) {
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-xs text-green-700">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <div className="flex-1 bg-green-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>
      
      {transcription && (
        <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-green-400">
          <strong>Transcrição:</strong> {transcription}
        </div>
      )}
    </div>
  );
}
