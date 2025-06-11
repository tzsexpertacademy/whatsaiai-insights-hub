import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  lastConnected: string;
}

interface WebhookConfig {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  autoReplyWebhook: string;
}

interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  token: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [webhooks, setWebhooks] = useState<WebhookConfig>(() => {
    const saved = localStorage.getItem('whatsapp_webhooks');
    return saved ? JSON.parse(saved) : {
      qrWebhook: '',
      statusWebhook: '',
      sendMessageWebhook: '',
      autoReplyWebhook: ''
    };
  });

  const [wppConfig, setWppConfig] = useState<WPPConfig>(() => {
    const saved = localStorage.getItem('wpp_config');
    return saved ? JSON.parse(saved) : {
      serverUrl: 'http://localhost:21465',
      sessionName: 'NERDWHATS_AMERICA',
      secretKey: 'THISISMYSECURETOKEN',
      token: '$2b$10$jKW5P3gzFYntHqLs0ttw2uRsoFGIxfiM6u4GSMWhsej15Kh6_ZyDa'
    };
  });

  const updateWPPConfig = useCallback((newConfig: Partial<WPPConfig>) => {
    const updated = { ...wppConfig, ...newConfig };
    setWppConfig(updated);
    localStorage.setItem('wpp_config', JSON.stringify(updated));
    
    toast({
      title: "Configuração salva! ⚙️",
      description: "Configurações do WPPConnect atualizadas"
    });
  }, [wppConfig, toast]);

  const updateWebhooks = useCallback((newWebhooks: Partial<WebhookConfig>) => {
    const updated = { ...webhooks, ...newWebhooks };
    setWebhooks(updated);
    localStorage.setItem('whatsapp_webhooks', JSON.stringify(updated));
  }, [webhooks]);

  const generateQRCode = useCallback(async () => {
    console.log('🚀 Gerando QR Code WPPConnect REAL...');
    console.log('📱 Configuração atual:', wppConfig);
    setIsLoading(true);
    
    try {
      console.log('📱 Iniciando sessão para obter QR Code...');
      const startSessionResponse = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify({
          webhook: '',
          waitQrCode: true
        })
      });
      
      console.log('📥 Start Session Response status:', startSessionResponse.status);
      
      if (startSessionResponse.ok) {
        const sessionData = await startSessionResponse.json();
        console.log('📱 Sessão iniciada:', sessionData);
        
        if (sessionData.qrcode || sessionData.qr || sessionData.base64) {
          const qrCodeData = sessionData.qrcode || sessionData.qr || sessionData.base64;
          
          setConnectionState(prev => ({
            ...prev,
            qrCode: qrCodeData
          }));
          
          toast({
            title: "QR Code gerado! 📱",
            description: "Escaneie com seu WhatsApp para conectar"
          });
          
          startStatusPolling();
          return qrCodeData;
        }
        
        if (sessionData.status === 'CONNECTED' || sessionData.state === 'CONNECTED') {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            phoneNumber: sessionData.phone || sessionData.number || 'Conectado',
            qrCode: ''
          }));
          
          toast({
            title: "✅ Já conectado!",
            description: "WhatsApp já está conectado"
          });
          
          return null;
        }
      } else {
        const errorText = await startSessionResponse.text();
        console.error('❌ Erro ao iniciar sessão:', errorText);
        throw new Error(`Erro ao iniciar sessão: ${startSessionResponse.status} - ${errorText}`);
      }
      
      throw new Error('QR Code não foi gerado');
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, wppConfig]);

  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        console.log('🔍 Verificando status da sessão...');
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status-session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📱 Status atual:', data);
          
          const isConnected = data.state === 'CONNECTED' || 
                             data.status === 'inChat' || 
                             data.status === 'CONNECTED' ||
                             data.connected === true ||
                             data.accountStatus === 'authenticated' ||
                             (data.session && data.session.state === 'CONNECTED');
          
          if (isConnected) {
            console.log('✅ WhatsApp conectado!');
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber: data.phone || data.number || data.wid || data.session?.phone || 'Conectado',
              qrCode: '',
              lastConnected: new Date().toISOString()
            }));
            
            toast({
              title: "🎉 WhatsApp conectado!",
              description: `Conectado com sucesso!`
            });
            
            clearInterval(pollInterval);
          }
        } else {
          console.log('❌ Erro no status:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, 3000);
    
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('⏰ Polling timeout');
    }, 120000);
  }, [toast, wppConfig]);

  const checkConnectionStatus = useCallback(async () => {
    console.log('🔍 Verificação manual do status...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📱 Status manual:', data);
        
        const isConnected = data.state === 'CONNECTED' || 
                           data.status === 'inChat' || 
                           data.status === 'CONNECTED' ||
                           data.connected === true ||
                           data.accountStatus === 'authenticated' ||
                           (data.session && data.session.state === 'CONNECTED');
        
        if (isConnected) {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            phoneNumber: data.phone || data.number || data.wid || data.session?.phone || 'Conectado',
            qrCode: '',
            lastConnected: new Date().toISOString()
          }));
          
          toast({
            title: "✅ Status atualizado!",
            description: "WhatsApp está conectado"
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  }, [wppConfig, toast]);

  const disconnectWhatsApp = useCallback(async () => {
    console.log('🔌 Desconectando WhatsApp...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
      
      console.log('📤 Logout response:', response.status);
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
      
      toast({
        title: "🔌 Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
      
      toast({
        title: "⚠️ Desconectado localmente",
        description: "Estado local limpo"
      });
    }
  }, [toast, wppConfig]);

  const sendMessage = useCallback(async (phone: string, message: string) => {
    console.log('📤 Enviando mensagem real via WPPConnect...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        })
      });

      console.log('📤 Send message response:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mensagem enviada:', result);
        
        toast({
          title: "✅ Mensagem enviada!",
          description: "Mensagem enviada via WPPConnect"
        });
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar:', errorText);
        
        toast({
          title: "❌ Erro ao enviar",
          description: `Erro: ${response.status}`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, wppConfig]);

  // FUNÇÃO CORRIGIDA: Carregar conversas reais
  const loadRealChats = useCallback(async () => {
    console.log('📱 Carregando conversas reais da API WPPConnect...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Resposta da API:', responseData);
        
        // Verificar diferentes formatos de resposta da API
        let chatsArray = [];
        
        if (Array.isArray(responseData)) {
          chatsArray = responseData;
        } else if (responseData.chats && Array.isArray(responseData.chats)) {
          chatsArray = responseData.chats;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          chatsArray = responseData.data;
        } else if (responseData.response && Array.isArray(responseData.response)) {
          chatsArray = responseData.response;
        } else {
          console.warn('⚠️ Formato de resposta não reconhecido:', responseData);
          throw new Error('Formato de dados não suportado. Verifique se o WPPConnect está retornando os chats corretamente.');
        }
        
        console.log('📋 Array de chats encontrado:', chatsArray);
        
        if (chatsArray.length === 0) {
          console.log('⚠️ Nenhuma conversa encontrada');
          return [];
        }
        
        return chatsArray;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar conversas:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar conversas:', error);
      throw error;
    }
  }, [wppConfig]);

  // NOVA FUNÇÃO: Carregar mensagens de uma conversa
  const loadRealMessages = useCallback(async (contactId: string) => {
    console.log('📤 Carregando mensagens reais para:', contactId);
    
    try {
      // CORRIGIDO: URL correta da API
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${contactId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const messagesData = await response.json();
        console.log('✅ Mensagens carregadas:', messagesData);
        return messagesData;
      } else {
        console.error('❌ Erro ao carregar mensagens:', response.status);
        throw new Error(`Erro ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  }, [wppConfig]);

  const getConnectionStatus = useCallback(() => {
    if (connectionState.isConnected) {
      return 'active';
    }
    return 'disconnected';
  }, [connectionState.isConnected]);

  return {
    connectionState,
    isLoading,
    webhooks,
    wppConfig,
    updateWebhooks,
    updateWPPConfig,
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus
  };
}
