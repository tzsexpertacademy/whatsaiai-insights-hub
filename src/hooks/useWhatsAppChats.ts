
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'customer';
  timestamp: string;
  platform?: string;
}

export function useWhatsAppChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadChats = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📱 Carregando conversas do banco...');
      
      const { data: conversations, error } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_messages(
            message_text,
            timestamp,
            sender_type
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao buscar conversas:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        const formattedChats: Chat[] = conversations.map((conv: any) => {
          const messages = conv.whatsapp_messages || [];
          const lastMessage = messages.length > 0 
            ? messages[messages.length - 1]
            : null;

          return {
            chatId: conv.contact_phone,
            name: conv.contact_name || conv.contact_phone.split('@')[0],
            lastMessage: lastMessage?.message_text || 'Conversa iniciada',
            unreadCount: 0,
            isPinned: false,
            isMonitored: false,
            isGroup: conv.contact_phone.includes('@g.us'),
            assignedAssistant: ''
          };
        });
        
        console.log(`✅ ${formattedChats.length} conversas carregadas`);
        setChats(formattedChats);
      } else {
        console.log('📭 Nenhuma conversa encontrada');
        setChats([]);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!chatId || !user?.id) return;

    try {
      console.log(`📖 Carregando histórico do chat: ${chatId}`);
      
      const { data: dbMessages, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          *,
          conversation:whatsapp_conversations!inner(contact_phone)
        `)
        .eq('conversation.contact_phone', chatId)
        .eq('conversation.user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (!error && dbMessages && dbMessages.length > 0) {
        const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
          id: msg.id,
          text: msg.message_text,
          sender: msg.sender_type === 'customer' ? 'customer' : 'user',
          timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          platform: 'database'
        }));

        setMessages(prev => ({ ...prev, [chatId]: formattedMessages }));
        console.log(`📊 ${formattedMessages.length} mensagens carregadas`);
      } else {
        setMessages(prev => ({ ...prev, [chatId]: [] }));
        console.log('⚠️ Nenhuma mensagem encontrada');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setMessages(prev => ({ ...prev, [chatId]: [] }));
    }
  }, [user?.id]);

  return {
    chats,
    messages,
    isLoading,
    loadChats,
    loadChatHistory
  };
}
