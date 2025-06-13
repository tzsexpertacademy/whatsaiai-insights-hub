
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWPPConfig } from './useWPPConfig';

export interface WPPConnectChat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

export interface WPPConnectContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export function useWPPChats(sessionConnected: boolean, isLiveMode: boolean) {
  const [chats, setChats] = useState<WPPConnectChat[]>([]);
  const [contacts, setContacts] = useState<WPPConnectContact[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  const { toast } = useToast();
  const { getWPPConfig } = useWPPConfig();

  const loadRealChats = useCallback(async () => {
    if (!sessionConnected) {
      console.log('❌ Não é possível carregar chats: WhatsApp não conectado');
      return [];
    }
    
    setIsLoadingChats(true);
    try {
      console.log('📱 [CHATS DEBUG] Iniciando carregamento de chats reais do WPPConnect...');
      const config = getWPPConfig();
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/all-chats`;
      
      console.log('🎯 [CHATS DEBUG] Carregando chats do endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 [CHATS DEBUG] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CHATS DEBUG] Erro no endpoint:', endpoint, 'Status:', response.status, 'Error:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 [CHATS DEBUG] Response completa:', result);

      let chatsData = [];
      
      if (result.response && Array.isArray(result.response)) {
        chatsData = result.response;
      } else if (Array.isArray(result)) {
        chatsData = result;
      } else if (result.chats && Array.isArray(result.chats)) {
        chatsData = result.chats;
      }

      console.log('📊 [CHATS DEBUG] Chats extraídos:', chatsData.length, 'chats encontrados');

      if (chatsData.length > 0) {
        const formattedChats: WPPConnectChat[] = chatsData.map((chat: any, index: number) => {
          let chatId = '';
          if (typeof chat.id === 'string') {
            chatId = chat.id;
          } else if (chat.id && chat.id._serialized) {
            chatId = chat.id._serialized;
          } else if (chat.id && chat.id.user && chat.id.server) {
            chatId = `${chat.id.user}@${chat.id.server}`;
          }
          
          let chatName = '';
          if (chat.name) {
            chatName = chat.name;
          } else if (chat.contact && chat.contact.name) {
            chatName = chat.contact.name;
          } else if (chat.contact && chat.contact.formattedName) {
            chatName = chat.contact.formattedName;
          } else if (chat.contact && chat.contact.pushname) {
            chatName = chat.contact.pushname;
          } else {
            chatName = chatId.split('@')[0] || `Chat ${index + 1}`;
          }
          
          let lastMessage = 'Sem mensagens';
          if (chat.chatlistPreview && chat.chatlistPreview.reactionText) {
            lastMessage = `Reação: ${chat.chatlistPreview.reactionText}`;
          } else if (chat.lastMessage && chat.lastMessage.body) {
            lastMessage = chat.lastMessage.body;
          } else if (chat.lastMessage && chat.lastMessage.content) {
            lastMessage = chat.lastMessage.content;
          }
          
          return {
            chatId: chatId,
            name: chatName,
            lastMessage: lastMessage,
            timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : new Date().toISOString(),
            unreadCount: chat.unreadCount || 0,
            isGroup: chat.isGroup || false
          };
        });

        console.log('✅ [CHATS DEBUG] Chats formatados com sucesso:', formattedChats);
        setChats(formattedChats);
        
        const formattedContacts: WPPConnectContact[] = formattedChats.map(chat => ({
          id: chat.chatId,
          name: chat.name,
          phone: chat.chatId.replace('@c.us', '').replace('@g.us', ''),
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          unread: chat.unreadCount
        }));
        
        setContacts(formattedContacts);
        console.log('✅ [CHATS DEBUG] Sucesso! Carregados', formattedChats.length, 'chats');
        
        if (!isLiveMode) {
          toast({
            title: "✅ Conversas carregadas!",
            description: `${formattedChats.length} conversas encontradas`
          });
        }
        
        return formattedChats;
      } else {
        console.log('⚠️ [CHATS DEBUG] Nenhum chat encontrado na resposta');
        if (!isLiveMode) {
          toast({
            title: "⚠️ Nenhuma conversa encontrada",
            description: "O WhatsApp está conectado mas não há conversas disponíveis",
            variant: "destructive"
          });
        }
        return [];
      }
      
    } catch (error) {
      console.error('❌ [CHATS DEBUG] Erro geral ao carregar chats:', error);
      if (!isLiveMode) {
        toast({
          title: "❌ Erro ao carregar chats",
          description: error.message,
          variant: "destructive"
        });
      }
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, [sessionConnected, toast, getWPPConfig, isLiveMode]);

  return {
    chats,
    setChats,
    contacts,
    setContacts,
    isLoadingChats,
    loadRealChats
  };
}
