
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWPPConfig } from './useWPPConfig';
import { WPPConnectChat } from './useWPPChats';

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
      console.log('💬 [MESSAGES DEBUG] Carregando mensagens para:', chatId, 'Limite:', messageHistoryLimit);
      const config = getWPPConfig();
      
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
          console.log('🎯 [MESSAGES DEBUG] Testando endpoint:', endpoint.url);
          
          let response;
          if (endpoint.method === 'GET') {
            let url = endpoint.url;
            if (endpoint.params) {
              const params = new URLSearchParams();
              Object.entries(endpoint.params).forEach(([key, value]) => {
                params.append(key, value.toString());
              });
              url += `?${params.toString()}`;
            }
            
            response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            response = await fetch(endpoint.url, {
              method: endpoint.method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.token}`
              },
              body: JSON.stringify(endpoint.body)
            });
          }

          console.log('📊 [MESSAGES DEBUG] Response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('📋 [MESSAGES DEBUG] Response completa:', result);

            let messagesData = [];
            
            if (result.response && Array.isArray(result.response)) {
              messagesData = result.response;
            } else if (Array.isArray(result)) {
              messagesData = result;
            } else if (result.messages && Array.isArray(result.messages)) {
              messagesData = result.messages;
            } else if (result.data && Array.isArray(result.data)) {
              messagesData = result.data;
            }

            console.log('📊 [MESSAGES DEBUG] Mensagens extraídas:', messagesData.length);

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

              console.log('✅ [MESSAGES DEBUG] Mensagens formatadas:', formattedMessages.length);

              setMessages(prev => {
                const currentMessages = prev.filter(m => m.chatId === chatId);
                const newMessages = formattedMessages.filter(newMsg => 
                  !currentMessages.some(currentMsg => currentMsg.id === newMsg.id)
                );

                if (newMessages.length > 0 && silent) {
                  console.log('🔥 [LIVE] Novas mensagens detectadas:', newMessages.length);
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

              console.log('✅ [MESSAGES DEBUG] Sucesso no endpoint:', endpoint.url);
              return formattedMessages;
            }
          } else {
            const errorText = await response.text();
            console.log('❌ [MESSAGES DEBUG] Erro no endpoint:', endpoint.url, 'Status:', response.status, 'Error:', errorText);
          }
        } catch (endpointError) {
          console.log('❌ [MESSAGES DEBUG] Erro ao testar endpoint:', endpoint.url, 'Error:', endpointError);
          continue;
        }
      }

      console.log('⚠️ [MESSAGES DEBUG] Nenhum endpoint de mensagens funcionou');
      
      if (!silent) {
        toast({
          title: "⚠️ Endpoint de mensagens não encontrado",
          description: "O WPPConnect não possui os endpoints padrão de mensagens. Verifique a documentação da sua versão.",
          variant: "destructive"
        });
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [MESSAGES DEBUG] Erro geral ao carregar mensagens:', error);
      if (!silent) {
        toast({
          title: "❌ Erro ao carregar mensagens",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive"
        });
      }
      return [];
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  }, [messageHistoryLimit, toast, getWPPConfig, chats]);

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
      description: `Agora carregando ${newLimit} mensagens por conversa`
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
