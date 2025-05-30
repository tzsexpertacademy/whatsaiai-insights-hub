
import { useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from '@/hooks/useGreenAPI';

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  isPinned: boolean;
  isMonitored: boolean;
  isGroup: boolean;
  assignedAssistant?: string;
}

export function useOptimizedChat() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showAssistantConfig, setShowAssistantConfig] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const {
    greenAPIState,
    chats,
    messages,
    loadChatHistory,
    sendMessage,
    togglePinChat,
    toggleMonitorChat,
    assignAssistantToChat,
    refreshChats
  } = useGreenAPI();

  // Memoizar chats para evitar re-renderizações desnecessárias
  const memoizedChats = useMemo(() => chats, [chats]);

  const handleChatSelect = useCallback(async (chat: Chat) => {
    if (selectedChat?.chatId === chat.chatId) return;
    
    setSelectedChat(chat);
    
    try {
      await loadChatHistory(chat.chatId);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico do chat",
        variant: "destructive"
      });
    }
  }, [selectedChat?.chatId, loadChatHistory, toast]);

  const handleSendMessage = useCallback(async (chatId: string, message: string): Promise<boolean> => {
    return await sendMessage(chatId, message);
  }, [sendMessage]);

  const handleRefreshChats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshChats();
      toast({
        title: "Conversas atualizadas",
        description: "Lista de conversas foi atualizada com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar conversas:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshChats, toast]);

  const handleTogglePin = useCallback((chatId: string) => {
    togglePinChat(chatId);
  }, [togglePinChat]);

  const handleToggleMonitor = useCallback((chatId: string) => {
    toggleMonitorChat(chatId);
  }, [toggleMonitorChat]);

  const handleShowConfig = useCallback(() => {
    setShowAssistantConfig(!showAssistantConfig);
  }, [showAssistantConfig]);

  return {
    greenAPIState,
    chats: memoizedChats,
    messages,
    selectedChat,
    showAssistantConfig,
    isRefreshing,
    handleChatSelect,
    handleSendMessage,
    handleRefreshChats,
    handleTogglePin,
    handleToggleMonitor,
    handleShowConfig,
    assignAssistantToChat
  };
}
