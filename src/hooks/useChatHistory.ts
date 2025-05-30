
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  user_id: string;
  assistant_id: string;
  user_message: string;
  assistant_response: string;
  timestamp: string;
  created_at?: string;
}

export function useChatHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChatHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        throw error;
      }

      setChatHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de chat:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de conversas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatMessage = async (
    assistantId: string,
    userMessage: string,
    assistantResponse: string
  ) => {
    if (!user?.id) return;

    try {
      const chatMessage = {
        user_id: user.id,
        assistant_id: assistantId,
        user_message: userMessage,
        assistant_response: assistantResponse,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_history')
        .insert([chatMessage]);

      if (error) {
        console.error('Erro ao salvar mensagem:', error);
        throw error;
      }

      // Recarregar histórico
      await loadChatHistory();
    } catch (error) {
      console.error('Erro ao salvar mensagem do chat:', error);
    }
  };

  const clearChatHistory = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setChatHistory([]);
      toast({
        title: "Histórico limpo",
        description: "Histórico de conversas foi removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast({
        title: "Erro ao limpar histórico",
        description: "Não foi possível limpar o histórico",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
    }
  }, [user?.id]);

  return {
    chatHistory,
    isLoading,
    saveChatMessage,
    loadChatHistory,
    clearChatHistory
  };
}
