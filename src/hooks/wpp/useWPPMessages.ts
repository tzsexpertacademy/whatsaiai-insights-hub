import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWPPConfig } from './useWPPConfig';
import { supabase } from '@/integrations/supabase/client';

export interface WPPConnectMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  chatId: string;
  isAudio?: boolean;
  status?: string;
}

export interface WPPConnectChat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  isGroup: boolean;
  unreadCount: number;
  profilePic?: string;
}

export interface WPPConnectContact {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
}

export function useWPPMessages(chats: WPPConnectChat[]) {
  const [messages, setMessages] = useState<WPPConnectMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const { toast } = useToast();
  const { getWPPConfig } = useWPPConfig();

  const loadRealMessages = useCallback(async (chatId: string, silent = false) => {
    if (!silent) {
      setIsLoadingMessages(true);
    }
    
    try {
      console.log('💬 [MESSAGES DEBUG] Carregando mensagens via proxy para:', chatId, 'Limite:', messageHistoryLimit);
      const config = getWPPConfig();
      
      // Lista de endpoints para tentar, usando o proxy
      const messageEndpoints = [
        {
          url: `${config.serverUrl}/api/${config.sessionName}/get-messages/${chatId}`,
          method: 'GET'
        },
        {
          url: `${config.serverUrl}/api/${config.sessionName}/get-messages`,
          method: 'GET',
          params: { chatId, count: messageHistoryLimit }
        },
        {
          url: `${config.serverUrl}/api/${config.sessionName}/chat-messages`,
          method: 'POST',
          body: { chatId, limit: messageHistoryLimit }
        },
        {
          url: `${config.serverUrl}/api/${config.sessionName}/messages`,
          method: 'GET',
          params: { chat: chatId, limit: messageHistoryLimit }
        }
      ];

      for (const endpoint of messageEndpoints) {
        try {
          console.log('🎯 [MESSAGES DEBUG] Testando endpoint via proxy:', endpoint.url);
          
          let proxyPayload: any = {
            method: endpoint.method,
            url: endpoint.url,
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'X-Session-Token': config.token
            },
            chatId: chatId,
            messageLimit: messageHistoryLimit
          };

          if (endpoint.method === 'GET' && endpoint.params) {
            const url = new URL(endpoint.url);
            Object.entries(endpoint.params).forEach(([key, value]) => {
              url.searchParams.append(key, value.toString());
            });
            proxyPayload.url = url.toString();
          } else if (endpoint.method === 'POST' && endpoint.body) {
            proxyPayload.body = JSON.stringify(endpoint.body);
          }

          // CHAMANDO O EDGE FUNCTION USANDO SUPABASE.CLIENT
          // AGORA usa supabase.functions.invoke corretamente!
          const { data: result, error } = await supabase.functions.invoke('wppconnect-proxy', {
            body: proxyPayload
          });

          if (error) {
            console.log('❌ [MESSAGES DEBUG] Erro no proxy:', error);
            continue;
          }

          console.log('📋 [MESSAGES DEBUG] Response do proxy:', result);

          let messagesData = [];
          
          if (result && typeof result === 'object') {
            if (result.response && Array.isArray(result.response)) {
              messagesData = result.response;
            } else if (Array.isArray(result)) {
              messagesData = result;
            } else if (result.messages && Array.isArray(result.messages)) {
              messagesData = result.messages;
            } else if (result.data && Array.isArray(result.data)) {
              messagesData = result.data;
            }
          }

          console.log('📊 [MESSAGES DEBUG] Mensagens extraídas via proxy:', messagesData.length);

          if (messagesData.length > 0) {
            const formattedMessages: WPPConnectMessage[] = messagesData.map((msg: any) => {
              let messageText = '';
              if (msg.body) {
                messageText = msg.body;
              } else if (msg.text) {
                messageText = msg.text;
              } else if (msg.content) {
                messageText = msg.content;
              } else if (msg.message) {
                messageText = msg.message;
              } else if (msg.type === 'ptt') {
                messageText = '🎵 Áudio';
              } else {
                messageText = 'Mensagem sem texto';
              }

              const isFromMe = msg.fromMe || msg.from === config.sessionName || (msg.sender && msg.sender.isMe);

              return {
                id: msg.id || msg._id || `msg_${Date.now()}_${Math.random()}`,
                text: messageText,
                sender: isFromMe ? 'user' : 'contact',
                timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : 
                         msg.t ? new Date(msg.t * 1000).toISOString() : 
                         msg.time ? new Date(msg.time).toISOString() : 
                         new Date().toISOString(),
                fromMe: isFromMe,
                chatId: chatId,
                isAudio: msg.type === 'ptt' || msg.type === 'audio' || msg.isAudio || false,
                status: msg.ack ? (msg.ack === 1 ? 'sent' : msg.ack === 2 ? 'delivered' : 'read') : 'sent'
              };
            });

            console.log('✅ [MESSAGES DEBUG] Mensagens formatadas via proxy:', formattedMessages.length);

            setMessages(prev => {
              const currentMessages = prev.filter(m => m.chatId === chatId);
              const newMessages = formattedMessages.filter(newMsg => 
                !currentMessages.some(currentMsg => currentMsg.id === newMsg.id)
              );

              if (newMessages.length > 0 && silent) {
                console.log('🔥 [LIVE] Novas mensagens detectadas via proxy:', newMessages.length);
                if (!document.hidden) {
                  toast({
                    title: "💬 Nova mensagem!",
                    description: `${newMessages.length} mensagem(s) nova(s) em ${chats.find(c => c.chatId === chatId)?.name || 'conversa'}`,
                    duration: 3000
                  });
                }
              }

              const filteredPrev = prev.filter(m => m.chatId !== chatId);
              return [...filteredPrev, ...formattedMessages.reverse()];
            });

            console.log('✅ [MESSAGES DEBUG] Sucesso no endpoint via proxy:', endpoint.url);
            return formattedMessages;
          }
        } catch (endpointError) {
          console.log('❌ [MESSAGES DEBUG] Erro ao testar endpoint via proxy:', endpoint.url, 'Error:', endpointError);
          continue;
        }
      }

      console.log('⚠️ [MESSAGES DEBUG] Nenhum endpoint funcionou via proxy');
      
      if (!silent) {
        toast({
          title: "⚠️ Problema na comunicação",
          description: "Não foi possível carregar as mensagens via proxy. Verifique se o WPPConnect está funcionando.",
          variant: "destructive"
        });
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [MESSAGES DEBUG] Erro geral ao carregar mensagens via proxy:', error);
      if (!silent) {
        toast({
          title: "❌ Erro ao carregar mensagens",
          description: "Problema na comunicação via proxy",
          variant: "destructive"
        });
      }
      return [];
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  }, [messageHistoryLimit, toast, getWPPConfig, chats, supabase.functions]);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    console.log('📤 Enviando mensagem via WPPConnect:', { chatId, message });
    
    try {
      const config = getWPPConfig();
      const isGroup = chats.find(chat => chat.chatId === chatId)?.isGroup || false;
      console.log('📋 Tipo de chat:', { chatId, isGroup });

      const endpoint = `${config.serverUrl}/api/${config.sessionName}/send-message`;
      
      let payload;
      if (isGroup) {
        payload = {
          chatId: chatId,
          message: message
        };
      } else {
        const phone = chatId.replace('@c.us', '');
        payload = {
          phone: phone,
          message: message
        };
      }

      console.log('📦 Payload final:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada:', result);

      const newMessage: WPPConnectMessage = {
        id: `sent_${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        fromMe: true,
        chatId: chatId
      };

      setMessages(prev => [...prev, newMessage]);

      toast({
        title: "✅ Mensagem enviada",
        description: isGroup ? "Mensagem enviada para o grupo" : "Mensagem enviada para o contato"
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "❌ Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [chats, toast, getWPPConfig]);

  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    toast({
      title: "📊 Limite atualizado",
      description: `Agora carregando ${newLimit} mensagens por conversa via proxy corrigido`
    });
  }, [toast]);

  return {
    messages,
    setMessages,
    isLoadingMessages,
    messageHistoryLimit,
    loadRealMessages,
    sendMessage,
    updateMessageHistoryLimit
  };
}
