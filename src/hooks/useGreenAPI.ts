
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface GreenAPIConfig {
  instanceId: string;
  apiToken: string;
  webhookUrl?: string;
}

interface GreenAPIState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  isGenerating: boolean;
  lastConnected: string;
}

interface GreenAPIMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  chatId: string;
  messageId: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface GreenAPIChat {
  chatId: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isGroup: boolean;
}

export function useGreenAPI() {
  const [greenAPIState, setGreenAPIState] = useState<GreenAPIState>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    isGenerating: false,
    lastConnected: ''
  });
  
  const [apiConfig, setApiConfig] = useState<GreenAPIConfig>({
    instanceId: '',
    apiToken: '',
    webhookUrl: ''
  });
  
  const [chats, setChats] = useState<GreenAPIChat[]>([]);
  const [messages, setMessages] = useState<Record<string, GreenAPIMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { config, updateConfig, saveConfig } = useClientConfig();

  // Carregar configuração do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('greenapi_config');
    const savedState = localStorage.getItem('greenapi_state');
    
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setApiConfig(parsed);
    }
    
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setGreenAPIState(parsed);
      
      if (parsed.isConnected) {
        updateConfig('whatsapp', {
          isConnected: true,
          authorizedNumber: parsed.phoneNumber,
          platform: 'greenapi'
        });
      }
    }
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    if (greenAPIState.qrCode || greenAPIState.isConnected) {
      localStorage.setItem('greenapi_state', JSON.stringify(greenAPIState));
    }
  }, [greenAPIState]);

  useEffect(() => {
    if (apiConfig.instanceId || apiConfig.apiToken) {
      localStorage.setItem('greenapi_config', JSON.stringify(apiConfig));
    }
  }, [apiConfig]);

  const getAPIUrl = (method: string) => {
    return `https://api.green-api.com/waInstance${apiConfig.instanceId}/${method}/${apiConfig.apiToken}`;
  };

  const updateAPIConfig = (newConfig: Partial<GreenAPIConfig>) => {
    setApiConfig(prev => ({ ...prev, ...newConfig }));
  };

  const getQRCode = async (): Promise<string> => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configuração necessária",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return '';
    }

    setIsLoading(true);
    setGreenAPIState(prev => ({ ...prev, isGenerating: true }));

    try {
      console.log('🔄 Gerando QR Code GREEN-API...');
      console.log('📡 URL da API:', getAPIUrl('qr'));
      
      // Primeiro vamos verificar o status da instância
      const statusResponse = await fetch(getAPIUrl('getStateInstance'), {
        method: 'GET'
      });

      if (!statusResponse.ok) {
        throw new Error(`Erro ao verificar status da instância: ${statusResponse.status} - ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      console.log('📊 Status da instância:', statusData);

      // Se já estiver autorizado, não precisa de QR Code
      if (statusData.stateInstance === 'authorized') {
        setGreenAPIState(prev => ({
          ...prev,
          isConnected: true,
          phoneNumber: statusData.phoneNumber || 'Conectado',
          lastConnected: new Date().toISOString(),
          isGenerating: false
        }));

        updateConfig('whatsapp', {
          isConnected: true,
          authorizedNumber: statusData.phoneNumber || 'Conectado',
          platform: 'greenapi'
        });

        toast({
          title: "✅ Já conectado!",
          description: `WhatsApp já está conectado: ${statusData.phoneNumber || 'Número não disponível'}`
        });

        return '';
      }

      // Se não estiver conectado, gerar QR Code
      const qrResponse = await fetch(getAPIUrl('qr'), {
        method: 'GET'
      });

      console.log('📱 Status da resposta QR:', qrResponse.status);

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro GREEN-API (${qrResponse.status}): ${errorText}`);
      }

      const qrData = await qrResponse.json();
      console.log('📱 Resposta QR Code:', qrData);
      
      if (qrData.type === 'qrCode' && qrData.message) {
        const qrCodeBase64 = qrData.message;
        const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
        
        setGreenAPIState(prev => ({
          ...prev,
          qrCode: qrCodeDataUrl,
          isGenerating: false
        }));

        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business para conectar"
        });

        // Iniciar polling para verificar conexão
        startConnectionPolling();
        
        return qrCodeDataUrl;
      } else if (qrData.type === 'error') {
        throw new Error(qrData.message || 'Erro desconhecido ao gerar QR Code');
      } else {
        throw new Error('Formato de resposta inesperado da GREEN-API');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setGreenAPIState(prev => ({ ...prev, isGenerating: false }));
      
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao gerar QR Code",
        description: errorMessage,
        variant: "destructive"
      });
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const startConnectionPolling = () => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setGreenAPIState(prev => ({ ...prev, qrCode: '' }));
        toast({
          title: "QR Code expirado",
          description: "Gere um novo QR Code para conectar",
          variant: "destructive"
        });
        return;
      }

      try {
        const status = await checkConnectionStatus();
        if (status.isConnected) {
          clearInterval(pollInterval);
          setGreenAPIState(prev => ({
            ...prev,
            isConnected: true,
            phoneNumber: status.phoneNumber,
            lastConnected: new Date().toISOString(),
            qrCode: '' // Limpar QR Code após conexão
          }));

          updateConfig('whatsapp', {
            isConnected: true,
            authorizedNumber: status.phoneNumber,
            platform: 'greenapi'
          });

          await saveConfig();

          toast({
            title: "WhatsApp conectado!",
            description: `Conectado ao número ${status.phoneNumber}`
          });

          // Carregar chats após conectar
          loadChats();
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }
    }, 5000);
  };

  const checkConnectionStatus = async () => {
    const response = await fetch(getAPIUrl('getStateInstance'));
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }

    const data = await response.json();
    return {
      isConnected: data.stateInstance === 'authorized',
      phoneNumber: data.phoneNumber || ''
    };
  };

  const loadChats = async () => {
    try {
      console.log('📋 Carregando chats GREEN-API...');
      
      const response = await fetch(getAPIUrl('getChats'));
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar chats: ${response.status}`);
      }

      const data = await response.json();
      console.log('💬 Chats carregados:', data);
      
      const formattedChats: GreenAPIChat[] = data.map((chat: any) => ({
        chatId: chat.id,
        name: chat.name || chat.id.replace('@c.us', ''),
        lastMessage: chat.lastMessage?.body || '',
        lastMessageTime: chat.lastMessage?.timestamp,
        unreadCount: chat.unreadCount || 0,
        isGroup: chat.id.includes('@g.us')
      }));

      setChats(formattedChats);
      
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      toast({
        title: "Erro ao carregar chats",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    }
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      console.log('📜 Carregando histórico do chat:', chatId);
      
      const response = await fetch(getAPIUrl('getChatHistory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          count: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar histórico: ${response.status}`);
      }

      const data = await response.json();
      console.log('📜 Histórico carregado:', data);
      
      const formattedMessages: GreenAPIMessage[] = data.map((msg: any) => ({
        id: msg.idMessage,
        text: msg.textMessage || msg.extendedTextMessage?.text || '[Mídia]',
        sender: msg.type === 'outgoing' ? 'user' : 'contact',
        timestamp: new Date(msg.timestamp * 1000).toISOString(),
        chatId: chatId,
        messageId: msg.idMessage,
        status: msg.status
      }));

      setMessages(prev => ({
        ...prev,
        [chatId]: formattedMessages
      }));
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (chatId: string, message: string): Promise<boolean> => {
    try {
      console.log('📤 Enviando mensagem GREEN-API:', { chatId, message });
      
      const response = await fetch(getAPIUrl('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mensagem enviada:', data);

      // Adicionar mensagem ao estado local
      const newMessage: GreenAPIMessage = {
        id: data.idMessage,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: chatId,
        messageId: data.idMessage,
        status: 'sent'
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      return true;
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: `Erro: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const disconnect = async () => {
    try {
      await fetch(getAPIUrl('logout'), { method: 'GET' });
      
      setGreenAPIState({
        isConnected: false,
        qrCode: '',
        phoneNumber: '',
        isGenerating: false,
        lastConnected: ''
      });

      setChats([]);
      setMessages({});

      updateConfig('whatsapp', {
        isConnected: false,
        authorizedNumber: '',
        platform: 'greenapi'
      });

      await saveConfig();
      localStorage.removeItem('greenapi_state');

      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
      
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  };

  return {
    greenAPIState,
    apiConfig,
    chats,
    messages,
    isLoading,
    updateAPIConfig,
    getQRCode,
    loadChats,
    loadChatHistory,
    sendMessage,
    disconnect,
    checkConnectionStatus
  };
}
