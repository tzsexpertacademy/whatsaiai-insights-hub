
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConversationMarking } from '@/hooks/useConversationMarking';
import { 
  Star, 
  StarOff, 
  Loader2, 
  Target,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

interface ConversationMarkerProps {
  chatId: string;
  contactName: string;
  contactPhone: string;
  messages: any[];
  isMarked?: boolean;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

export function ConversationMarker({ 
  chatId, 
  contactName, 
  contactPhone, 
  messages,
  isMarked = false,
  priority = 'medium',
  className = '' 
}: ConversationMarkerProps) {
  const { markConversationForAnalysis, isMarking } = useConversationMarking();

  const handleMarkForAnalysis = async () => {
    console.log('🎯 Marcando conversa para análise:', { chatId, contactName, contactPhone });
    await markConversationForAnalysis(
      chatId, 
      contactName, 
      contactPhone, 
      priority,
      messages // Passando as mensagens para salvar no banco
    );
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isMarked && (
        <Badge variant="outline" className={`text-xs ${getPriorityColor()}`}>
          {getPriorityIcon()}
          <span className="ml-1">{priority}</span>
        </Badge>
      )}
      
      <Button
        onClick={handleMarkForAnalysis}
        disabled={isMarking}
        variant={isMarked ? "default" : "outline"}
        size="sm"
        className={`${isMarked ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
      >
        {isMarking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isMarked ? (
          <>
            <Star className="h-4 w-4 mr-1 fill-current" />
            Marcada
          </>
        ) : (
          <>
            <StarOff className="h-4 w-4 mr-1" />
            Marcar p/ Análise
          </>
        )}
      </Button>
    </div>
  );
}
