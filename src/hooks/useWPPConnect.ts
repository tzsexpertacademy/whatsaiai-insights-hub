import { useState, useCallback, useRef } from 'react';
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

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    console.log('📤 Enviando mensagem via WPPConnect:', { chatId, message });
    
    try {
      const config = getWPPConfig();
      const isGroup = chats.find(chat => chat.chatId === chatId)?.isGroup || false;
      console.log('📋 Tipo de chat:', { chatId, isGroup });

      // Usar endpoint correto do WPPConnect
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
      console.log('🔑 Usando token:', config.token ? `***${config.token.slice(-4)}` : 'VAZIO');

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

  const loadRealChats = useCallback(async () => {
    if (!sessionStatus.isConnected) {
      console.log('❌ Não é possível carregar chats: WhatsApp não conectado');
      return [];
    }
    
    setIsLoadingChats(true);
    try {
      console.log('📱 [CHATS DEBUG] Iniciando carregamento de chats reais do WPPConnect...');
      const config = getWPPConfig();
      
      // Testar múltiplos endpoints para chats
      const chatEndpoints = [
        `${config.serverUrl}/api/${config.sessionName}/all-chats`,
        `${config.serverUrl}/api/${config.sessionName}/all-chats-withcontacts`,
        `${config.serverUrl}/api/${config.sessionName}/get-chats`
      ];
      
      for (const endpoint of chatEndpoints) {
        try {
          console.log('🎯 [CHATS DEBUG] Testando endpoint de chats:', endpoint);
          
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
            continue;
          }

          const result = await response.json();
          console.log('📋 [CHATS DEBUG] Response completa do endpoint:', endpoint, result);

          // Verificar se temos dados válidos
          let chatsData = [];
          
          if (Array.isArray(result)) {
            chatsData = result;
          } else if (result.chats && Array.isArray(result.chats)) {
            chatsData = result.chats;
          } else if (result.data && Array.isArray(result.data)) {
            chatsData = result.data;
          }

          console.log('📊 [CHATS DEBUG] Chats extraídos:', chatsData.length, 'chats encontrados');

          if (chatsData.length > 0) {
            const formattedChats: WPPConnectChat[] = chatsData.map((chat: any, index: number) => {
              console.log(`🔍 [CHATS DEBUG] Processando chat ${index + 1}:`, chat);
              
              return {
                chatId: chat.id || chat.chatId || chat.id?._serialized || `chat_${Date.now()}_${index}`,
                name: chat.name || chat.contact?.name || chat.formattedTitle || chat.id?.split('@')[0] || `Contato ${index + 1}`,
                lastMessage: chat.lastMessage?.body || chat.lastMessage?.content || chat.lastMessage || 'Sem mensagens',
                timestamp: chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp * 1000).toISOString() : new Date().toISOString(),
                unreadCount: chat.unreadCount || 0,
                isGroup: chat.isGroup || false
              };
            });

            console.log('✅ [CHATS DEBUG] Chats formatados com sucesso:', formattedChats);
            setChats(formattedChats);
            
            // Converter chats para contatos para compatibilidade
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
            
            toast({
              title: "✅ Conversas carregadas!",
              description: `${formattedChats.length} conversas encontradas`
            });
            
            return formattedChats;
          } else {
            console.log('⚠️ [CHATS DEBUG] Endpoint retornou array vazio:', endpoint);
          }
        } catch (endpointError) {
          console.error('❌ [CHATS DEBUG] Erro ao testar endpoint:', endpoint, endpointError);
          continue;
        }
      }
      
      // Se chegou aqui, nenhum endpoint funcionou
      console.error('❌ [CHATS DEBUG] NENHUM endpoint de chats funcionou!');
      toast({
        title: "❌ Erro ao carregar chats",
        description: "Nenhum endpoint de chats retornou dados válidos",
        variant: "destructive"
      });
      return [];
      
    } catch (error) {
      console.error('❌ [CHATS DEBUG] Erro geral ao carregar chats:', error);
      toast({
        title: "❌ Erro ao carregar chats",
        description: error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, [sessionStatus.isConnected, toast, getWPPConfig]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    setIsLoadingMessages(true);
    
    try {
      console.log('💬 Carregando mensagens para:', chatId, 'Limite:', messageHistoryLimit);
      const config = getWPPConfig();
      
      // Usar endpoint correto conforme Swagger para obter mensagens
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/all-messages-in-chat`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify({
          phone: chatId.replace('@c.us', '').replace('@g.us', ''),
          count: messageHistoryLimit
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar mensagens:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Mensagens carregadas:', result);

      if (result && Array.isArray(result)) {
        const formattedMessages: WPPConnectMessage[] = result.map((msg: any) => ({
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          text: msg.body || msg.text || 'Mensagem sem texto',
          sender: msg.fromMe ? 'user' : 'contact',
          timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
          fromMe: msg.fromMe || false,
          chatId: chatId,
          isAudio: msg.type === 'ptt' || msg.isAudio || false,
          status: msg.ack ? 'delivered' : 'sent'
        }));

        setMessages(prev => {
          const filtered = prev.filter(m => m.chatId !== chatId);
          return [...filtered, ...formattedMessages];
        });

        console.log('✅ Mensagens formatadas:', formattedMessages.length);
        return formattedMessages;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "❌ Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messageHistoryLimit, toast, getWPPConfig]);

  const startLiveMode = useCallback((chatId: string) => {
    console.log('🔴 Iniciando modo live para:', chatId);
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    liveIntervalRef.current = setInterval(() => {
      loadRealMessages(chatId);
    }, 3000);
    
    toast({
      title: "🔴 Modo Live Ativo",
      description: "Mensagens sendo atualizadas automaticamente"
    });
  }, [loadRealMessages, toast]);

  const stopLiveMode = useCallback(() => {
    console.log('⏹️ Parando modo live');
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    
    toast({
      title: "⏹️ Modo Live Desativado",
      description: "Atualizações automáticas paradas"
    });
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      console.log('🔌 Desconectando WhatsApp...');
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
      stopLiveMode();
      
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
