import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WPPConnectMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  chatId: string;
  isAudio?: boolean;
  status?: string;
}

interface WPPConnectChat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

interface WPPConnectContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface SessionStatus {
  isConnected: boolean;
  qrCode: string | null;
  isLoading: boolean;
  phoneNumber: string | null;
}

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

export function useWPPConnect() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: null,
    isLoading: false,
    phoneNumber: null
  });
  const [chats, setChats] = useState<WPPConnectChat[]>([]);
  const [messages, setMessages] = useState<WPPConnectMessage[]>([]);
  const [contacts, setContacts] = useState<WPPConnectContact[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const { toast } = useToast();
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getWPPConfig = useCallback((): WPPConfig => {
    const savedConfig = {
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      secretKey: localStorage.getItem('wpp_secret_key') || '',
      token: localStorage.getItem('wpp_token') || '',
      webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
    };
    
    console.log('🔧 getWPPConfig - Configurações atuais:', {
      sessionName: savedConfig.sessionName,
      serverUrl: savedConfig.serverUrl,
      hasSecretKey: !!savedConfig.secretKey,
      hasToken: !!savedConfig.token,
      secretKeyLength: savedConfig.secretKey.length,
      tokenLength: savedConfig.token.length
    });
    
    return savedConfig;
  }, []);

  const saveWPPConfig = useCallback((config: Partial<WPPConfig>) => {
    console.log('💾 Salvando configuração WPPConnect:', config);
    
    if (config.sessionName !== undefined) localStorage.setItem('wpp_session_name', config.sessionName);
    if (config.serverUrl !== undefined) localStorage.setItem('wpp_server_url', config.serverUrl);
    if (config.secretKey !== undefined) localStorage.setItem('wpp_secret_key', config.secretKey);
    if (config.token !== undefined) localStorage.setItem('wpp_token', config.token);
    if (config.webhookUrl !== undefined) localStorage.setItem('wpp_webhook_url', config.webhookUrl);
    
    console.log('✅ Configuração salva no localStorage');
  }, []);

  const getConnectionStatus = useCallback(() => {
    console.log('🔍 getConnectionStatus chamado - isConnected:', sessionStatus.isConnected);
    if (!sessionStatus.isConnected) return 'disconnected';
    return 'connected';
  }, [sessionStatus.isConnected]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 [DEBUG] Verificando status da conexão WPPConnect...');
      const config = getWPPConfig();
      
      console.log('🔑 [DEBUG] Configuração carregada:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        hasToken: !!config.token,
        hasSecretKey: !!config.secretKey,
        tokenLength: config.token?.length || 0
      });
      
      if (!config.token || !config.secretKey) {
        console.log('⚠️ [DEBUG] Token ou Secret Key não configurados');
        setSessionStatus({
          isConnected: false,
          qrCode: null,
          isLoading: false,
          phoneNumber: null
        });
        return false;
      }

      // Testar múltiplos endpoints para verificar status
      const statusEndpoints = [
        `${config.serverUrl}/api/${config.sessionName}/status-session`,
        `${config.serverUrl}/api/${config.sessionName}/check-connection-session`,
        `${config.serverUrl}/api/${config.sessionName}/status`
      ];

      for (const endpoint of statusEndpoints) {
        try {
          console.log('🎯 [DEBUG] Testando endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📊 [DEBUG] Response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('📋 [DEBUG] Response body:', result);

            // Verificar diferentes possíveis respostas do WPPConnect
            const isConnected = result.status === 'CONNECTED' || 
                               result.state === 'CONNECTED' || 
                               result.connected === true ||
                               result.status === 'inChat' ||
                               result.session?.state === 'CONNECTED';

            console.log('✅ [DEBUG] Status detectado:', {
              isConnected,
              rawStatus: result.status,
              rawState: result.state,
              rawConnected: result.connected,
              sessionState: result.session?.state
            });

            if (isConnected) {
              console.log('🎉 [DEBUG] WhatsApp conectado detectado!');
              setSessionStatus({
                isConnected: true,
                qrCode: null,
                isLoading: false,
                phoneNumber: result.phoneNumber || result.phone || result.number || result.session?.me || 'Conectado'
              });
              
              toast({
                title: "✅ WhatsApp conectado!",
                description: "Conexão detectada com sucesso"
              });
              
              return true;
            }
          } else {
            const errorText = await response.text();
            console.log('❌ [DEBUG] Erro no endpoint:', endpoint, 'Status:', response.status, 'Error:', errorText);
          }
        } catch (endpointError) {
          console.log('❌ [DEBUG] Erro ao testar endpoint:', endpoint, 'Error:', endpointError);
          continue;
        }
      }

      console.log('❌ [DEBUG] Nenhum endpoint retornou conexão ativa');
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      return false;

    } catch (error) {
      console.error('❌ [DEBUG] Erro geral ao verificar status:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      return false;
    }
  }, [getWPPConfig, toast]);

  const generateQRCode = useCallback(async () => {
    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code WPPConnect...');
      const config = getWPPConfig();
      
      if (!config.token || !config.secretKey) {
        throw new Error('Token ou Secret Key não configurados');
      }
      
      // Usar endpoint correto do Swagger: /api/:session/start-session
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/start-session`;
      console.log('🎯 Endpoint start session:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify({
          webhook: config.webhookUrl || undefined,
          waitQrCode: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta start session:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta start session:', result);

      if (result.qrcode || result.qr) {
        const qrCodeData = result.qrcode || result.qr;
        console.log('📱 QR Code recebido');

        setSessionStatus({
          isConnected: false,
          qrCode: qrCodeData,
          isLoading: false,
          phoneNumber: null
        });
        
        return qrCodeData;
      } else if (result.status === 'CONNECTED' || result.connected) {
        // Já está conectado
        setSessionStatus({
          isConnected: true,
          qrCode: null,
          isLoading: false,
          phoneNumber: result.phoneNumber || 'Conectado'
        });
        
        toast({
          title: "✅ Já conectado!",
          description: "WhatsApp já estava conectado"
        });
        
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      toast({
        title: "❌ Erro na conexão",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast, getWPPConfig]);

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

      // Adicionar mensagem localmente
      const newMessage: WPPConnectMessage = {
        id: `sent_${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        fromMe: true,
        chatId: chatId
      };

      setMessages(prev => [...prev, newMessage]);

      // Atualizar conversa com nova mensagem
      setChats(prev => prev.map(chat => 
        chat.chatId === chatId 
          ? { ...chat, lastMessage: message, timestamp: new Date().toISOString() }
          : chat
      ));

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

  const loadRealChats = useCallback(async () => {
    if (!sessionStatus.isConnected) {
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
          
          const formattedChat = {
            chatId: chatId,
            name: chatName,
            lastMessage: lastMessage,
            timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : new Date().toISOString(),
            unreadCount: chat.unreadCount || 0,
            isGroup: chat.isGroup || false
          };
          
          return formattedChat;
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
  }, [sessionStatus.isConnected, toast, getWPPConfig, isLiveMode]);

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

  const startLiveMode = useCallback((chatId: string) => {
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
  }, [loadRealMessages, loadRealChats, toast]);

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

  const disconnectWhatsApp = useCallback(async () => {
    try {
      console.log('🔌 Desconectando WhatsApp...');
      stopLiveMode();
      
      const config = getWPPConfig();
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/close-session`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      
      setChats([]);
      setMessages([]);
      setContacts([]);
      
      toast({
        title: "🔌 Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "❌ Erro ao desconectar",
        description: "Não foi possível desconectar",
        variant: "destructive"
      });
    }
  }, [stopLiveMode, toast, getWPPConfig]);

  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    toast({
      title: "📊 Limite atualizado",
      description: `Agora carregando ${newLimit} mensagens por conversa`
    });
  }, [toast]);

  return {
    sessionStatus,
    chats,
    messages,
    contacts,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
    messageHistoryLimit,
    generateQRCode,
    checkConnectionStatus,
    getConnectionStatus,
    loadRealChats,
    loadRealMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    disconnectWhatsApp,
    updateMessageHistoryLimit,
    getWPPConfig,
    saveWPPConfig
  };
}
