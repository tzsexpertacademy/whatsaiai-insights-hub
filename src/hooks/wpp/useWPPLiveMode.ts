
import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWPPLiveMode() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLiveMode = useCallback((chatId: string, loadRealMessages: Function, loadRealChats: Function) => {
    console.log('🔴 Iniciando modo live para:', chatId);
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    // Intervalos para mensagens da conversa ativa
    liveIntervalRef.current = setInterval(() => {
      if (chatId) {
        console.log('🔄 [LIVE] Verificando novas mensagens...');
        loadRealMessages(chatId, true);
      }
    }, 3000);
    
    // Intervalo para novas conversas
    chatsIntervalRef.current = setInterval(() => {
      console.log('🔄 [LIVE] Verificando novas conversas...');
      loadRealChats();
    }, 10000);
    
    toast({
      title: "🔴 Modo Live Ativo",
      description: "Mensagens sendo atualizadas automaticamente a cada 3s"
    });
  }, [toast]);

  const stopLiveMode = useCallback(() => {
    console.log('⏹️ Parando modo live');
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    
    if (chatsIntervalRef.current) {
      clearInterval(chatsIntervalRef.current);
      chatsIntervalRef.current = null;
    }
    
    toast({
      title: "⏹️ Modo Live Desativado",
      description: "Atualizações automáticas paradas"
    });
  }, [toast]);

  // Limpar intervalos quando componente desmonta
  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
      if (chatsIntervalRef.current) {
        clearInterval(chatsIntervalRef.current);
      }
    };
  }, []);

  return {
    isLiveMode,
    currentChatId,
    startLiveMode,
    stopLiveMode
  };
}
