
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User, Clock, Volume2, FileText, MousePointer } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';

interface WPPMessage {
  id: string;
  timestamp: number;
  fromMe: boolean;
  senderName: string;
  body: string;
  type: string;
  hasMedia: boolean;
  mediaUrl?: string;
  transcription?: string;
}

interface MessageItemProps {
  message: WPPMessage;
  isMarked: boolean;
  isAudio: boolean;
  transcription?: string;
  onToggleSelection: () => void;
  onTranscriptionComplete: (messageId: string, transcription: string) => void;
}

export function MessageItem({ 
  message, 
  isMarked, 
  isAudio, 
  transcription,
  onToggleSelection,
  onTranscriptionComplete 
}: MessageItemProps) {
  return (
    <div
      className={`flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
        message.fromMe 
          ? 'bg-blue-50 border-l-4 border-blue-400' 
          : 'bg-gray-50 border-l-4 border-gray-300'
      } ${isMarked ? 'ring-2 ring-green-400 bg-green-50' : ''} hover:shadow-md`}
      onClick={onToggleSelection}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        message.fromMe ? 'bg-blue-500' : 'bg-gray-400'
      }`}>
        <User className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.fromMe ? 'Você' : 'Contato'}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(message.timestamp * 1000).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {isAudio && (
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
              <Volume2 className="w-3 h-3 mr-1" />
              Áudio
            </Badge>
          )}
          {transcription && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              <FileText className="w-3 h-3 mr-1" />
              Transcrito
            </Badge>
          )}
          {isMarked && (
            <Badge className="text-xs bg-green-500 text-white">
              <MousePointer className="w-3 h-3 mr-1" />
              Selecionada
            </Badge>
          )}
        </div>
        
        {isAudio ? (
          <div className="space-y-2">
            <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-700 mb-2">
                🎵 Mensagem de áudio detectada
              </p>
              <AudioPlayer
                audioBase64={message.body}
                duration={30}
                onTranscriptionComplete={(text) => onTranscriptionComplete(message.id, text)}
                className="w-full"
              />
            </div>
            {transcription && (
              <div className="bg-white p-2 rounded border-l-4 border-green-400">
                <p className="text-sm text-gray-700">
                  <strong>Transcrição:</strong> {transcription}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message.body || <span className="italic text-gray-400">Mídia sem texto</span>}
          </p>
        )}
        
        {message.hasMedia && !isAudio && (
          <div className="mt-2 p-2 bg-blue-100 rounded-md">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              📎 Mídia anexada ({message.type || 'arquivo'})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
