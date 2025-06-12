
import React from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { Pin, Brain, Star, TrendingUp, AlertTriangle } from 'lucide-react';

interface ConversationContextMenuProps {
  children: React.ReactNode;
  chatId: string;
  chatName: string;
}

export function ConversationContextMenu({ 
  children, 
  chatId, 
  chatName 
}: ConversationContextMenuProps) {
  // For now, we'll create placeholder functions
  // These will be properly implemented when the real context menu functionality is needed
  const handleTogglePin = (chatId: string) => {
    console.log('Toggle pin for chat:', chatId);
  };

  const handleToggleAnalysis = (chatId: string, priority?: 'high' | 'medium' | 'low') => {
    console.log('Toggle analysis for chat:', chatId, 'priority:', priority);
  };

  // Placeholder values - these would come from a real state management system
  const isPinned = false;
  const isMarkedForAnalysis = false;
  const analysisPriority: 'high' | 'medium' | 'low' = 'low';

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Média Prioridade';
      case 'low': return 'Baixa Prioridade';
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => handleTogglePin(chatId)}>
          <Pin className={`mr-2 h-4 w-4 ${isPinned ? 'text-blue-500' : 'text-gray-500'}`} />
          {isPinned ? 'Desfixar conversa' : 'Fixar conversa'}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => handleToggleAnalysis(chatId)}>
          <Brain className={`mr-2 h-4 w-4 ${isMarkedForAnalysis ? 'text-green-500' : 'text-gray-500'}`} />
          {isMarkedForAnalysis ? 'Remover da análise IA' : 'Marcar para análise IA'}
        </ContextMenuItem>
        
        {isMarkedForAnalysis && (
          <>
            <ContextMenuSeparator />
            
            <ContextMenuItem onClick={() => handleToggleAnalysis(chatId, 'high')}>
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              Prioridade Alta
            </ContextMenuItem>
            
            <ContextMenuItem onClick={() => handleToggleAnalysis(chatId, 'medium')}>
              <TrendingUp className="mr-2 h-4 w-4 text-yellow-500" />
              Prioridade Média
            </ContextMenuItem>
            
            <ContextMenuItem onClick={() => handleToggleAnalysis(chatId, 'low')}>
              <Star className="mr-2 h-4 w-4 text-blue-500" />
              Prioridade Baixa
            </ContextMenuItem>
            
            <ContextMenuSeparator />
            
            <ContextMenuItem disabled>
              <div className="flex items-center">
                {getPriorityIcon(analysisPriority)}
                <span className="ml-2 text-sm text-gray-600">
                  Atual: {getPriorityLabel(analysisPriority)}
                </span>
              </div>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
