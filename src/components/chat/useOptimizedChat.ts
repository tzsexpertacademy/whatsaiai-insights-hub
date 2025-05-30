
import { useState, useEffect, useCallback } from 'react';
import { useGreenAPI } from '@/hooks/useGreenAPI';

export function useOptimizedChat() {
  const { 
    chats, 
    messages, 
    loadChats, 
    loadChatHistory, 
    sendMessage,
    refreshChats
  } = useGreenAPI();
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectChat = useCallback((chat: any) => {
    setSelectedChat(chat);
    if (chat?.chatId) {
      loadChatHistory(chat.chatId);
    }
  }, [loadChatHistory]);

  const handleSendMessage = useCallback(async (chatId: string, message: string) => {
    if (!chatId || !message.trim()) return false;
    
    setIsLoading(true);
    try {
      const success = await sendMessage(chatId, message);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [sendMessage]);

  const handleRefreshChats = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshChats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshChats]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    messages,
    selectedChat,
    isLoading,
    handleSelectChat,
    handleSendMessage,
    handleRefreshChats
  };
}
