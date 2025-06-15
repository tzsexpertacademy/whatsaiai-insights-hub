
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConversationMarking } from '@/hooks/useConversationMarking';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

export function ConversationMarker({ 
  chatId, 
  contactName, 
  contactPhone, 
  messages,
  priority = 'medium',
  className = '' 
}: ConversationMarkerProps) {
  const { user } = useAuth();
  const { markConversationForAnalysis, isMarking } = useConversationMarking();
  const [isMarked, setIsMarked] = useState(false);
  const [currentPriority, setCurrentPriority] = useState(priority);

  // Verificar se a conversa já está marcada
  useEffect(() => {
    const checkIfMarked = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('whatsapp_conversations_analysis')
          .select('marked_for_analysis, priority')
          .eq('user_id', user.id)
          .eq('chat_id', chatId)
          .eq('marked_for_analysis', true)
          .single();

        if (data && !error) {
          setIsMarked(true);
          setCurrentPriority(data.priority || 'medium');
        } else {
          setIsMarked(false);
        }
      } catch (error) {
        console.log('Conversa não marcada ainda');
        setIsMarked(false);
      }
    };

    checkIfMarked();
  }, [user?.id, chatId]);

  const handleMarkForAnalysis = async () => {
    console.log('🎯 Marcando conversa para análise:', { chatId, contactName, contactPhone });
    
    const result = await markConversationForAnalysis(
      chatId, 
      contactName, 
      contactPhone, 
      currentPriority,
      messages
    );

    if (typeof result === 'boolean') {
      setIsMarked(result);
    }
  };

  const getPriorityIcon = () => {
    switch (currentPriority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = () => {
    switch (currentPriority) {
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
          <span className="ml-1">{currentPriority}</span>
        </Badge>
      )}
      
      <Button
        onClick={handleMarkForAnalysis}
        disabled={isMarking}
        variant={isMarked ? "default" : "outline"}
        size="sm"
        className={`transition-all duration-200 ${
          isMarked 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
            : 'hover:bg-blue-50 hover:border-blue-300'
        }`}
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
