import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface GreenAPIConfig {
  instanceId: string;
  apiToken: string;
}

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  isLoading: boolean;
}

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  chatId: string;
}

export type MessagePeriod = 'today' | '7days' | '1month' | '3months' | 'all';

export function useGreenAPI() {
  const { config, updateConfig } = useClientConfig();
  const { toast } = useToast();

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    isLoading: false
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<MessagePeriod>('today');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Obter configuração atual da GREEN-API
  const getAPIConfig = useCallback((): GreenAPIConfig => {
    if (!config || !config.whatsapp) {
      return { instanceId: '', apiToken: '' };
    }
    
    const whatsappConfig = config.whatsapp;
    if (!whatsappConfig.greenapi) {
      return { instanceId: '', apiToken: '' };
    }
    
    return {
      instanceId: whatsappConfig.greenapi.instanceId || '',
      apiToken: whatsappConfig.greenapi.apiToken || ''
    };
  }, [config]);

  // Salvar configuração da GREEN-API
  const saveAPIConfig = useCallback((newConfig: Partial<GreenAPIConfig>) => {
    if (!config || !config.whatsapp) return;
    
    const currentWhatsapp = config.whatsapp;
    const currentGreenapi = currentWhatsapp.greenapi || { instanceId: '', apiToken: '' };
    
    updateConfig('whatsapp', {
      ...currentWhatsapp,
      greenapi: {
        ...currentGreenapi,
        ...newConfig
      }
    });
  }, [config, updateConfig]);

  // Calcular data de início baseada no período
  const getStartDate = useCallback((period: MessagePeriod): Date => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return today;
      case '7days':
        return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3months':
        return new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'all':
        return new Date(0); // Data muito antiga para pegar todas
      default:
        return today;
    }
  }, []);

  // Verificar status da instância
  const checkInstanceStatus = useCallback(async () => {
    const { instanceId, apiToken } = getAPIConfig();
    
    console.log('🔍 Verificando status da instância:', { instanceId: instanceId ? 'presente' : 'ausente', apiToken: apiToken ? 'presente' : 'ausente' });
    
    if (!instanceId || !apiToken) {
      console.log('❌ Credenciais não configuradas');
      setConnectionState(prev => ({ ...prev, isConnected: false }));
      return false;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true }));
      
      const url = `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`;
      console.log('📡 Fazendo requisição para:', url);
      
      const response = await fetch(url);
      console.log('📥 Status da resposta:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Dados recebidos:', data);
      
      const isConnected = data.stateInstance === 'authorized';
      console.log('✅ Status de conexão:', isConnected ? 'CONECTADO' : 'DESCONECTADO');
      
      let phoneNumber = '';
      if (isConnected) {
        try {
          const settingsResponse = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/getWaSettings/${apiToken}`
          );
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            phoneNumber = settingsData.wid || `Instance ${instanceId}`;
            console.log('📞 Número obtido:', phoneNumber);
          }
        } catch (error) {
          console.log('⚠️ Não foi possível obter número do telefone:', error);
          phoneNumber = `Instance ${instanceId}`;
        }
      }

      setConnectionState(prev => ({
        ...prev,
        isConnected,
        phoneNumber,
        isLoading: false
      }));

      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: '',
        isLoading: false
      }));
      return false;
    }
  }, [getAPIConfig]);

  // Gerar QR Code
  const generateQRCode = useCallback(async () => {
    const { instanceId, apiToken } = getAPIConfig();
    
    if (!instanceId || !apiToken) {
      toast({
        title: "Configuração incompleta",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/qr/${apiToken}`
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.type === 'qrCode' && data.message) {
        setConnectionState(prev => ({
          ...prev,
          qrCode: data.message,
          isLoading: false
        }));
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });
      } else {
        throw new Error('WhatsApp já conectado ou QR Code indisponível');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  }, [getAPIConfig, toast]);

  // Desconectar WhatsApp
  const disconnect = useCallback(async () => {
    const { instanceId, apiToken } = getAPIConfig();
    
    if (!instanceId || !apiToken) return;

    try {
      await fetch(
        `https://api.green-api.com/waInstance${instanceId}/logout/${apiToken}`
      );
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        isLoading: false
      });
      
      setChats([]);
      setMessages([]);
      
      toast({
        title: "Desconectado",
        description: "WhatsApp Business desconectado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, [getAPIConfig, toast]);

  // Carregar conversas com filtro opcional por contato específico
  const loadChats = useCallback(async () => {
    const { instanceId, apiToken } = getAPIConfig();
    
    console.log('📱 Iniciando carregamento de conversas...');
    
    if (!instanceId || !apiToken || !connectionState.isConnected) {
      console.log('❌ Não é possível carregar conversas - credenciais ou conexão ausente');
      return;
    }

    // Verificar se há filtro por contato específico
    const specificContact = config?.whatsapp?.specificContactFilter;
    console.log('🎯 Filtro de contato específico:', specificContact || 'Nenhum');

    try {
      if (specificContact && specificContact.trim()) {
        // Carregar apenas conversa específica
        console.log('📞 Carregando conversa específica para:', specificContact);
        
        // Formatar número para chatId (adicionar @c.us se não for grupo)
        let chatId = specificContact.trim();
        if (!chatId.includes('@')) {
          chatId = chatId.replace(/\D/g, '') + '@c.us'; // Remove caracteres não numéricos e adiciona @c.us
        }
        
        console.log('💬 ChatId formatado:', chatId);
        
        // Verificar se o chat existe
        const checkChatUrl = `https://api.green-api.com/waInstance${instanceId}/checkWhatsapp/${apiToken}`;
        const checkResponse = await fetch(checkChatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: chatId.replace('@c.us', '') })
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          console.log('✅ Verificação do contato:', checkData);
          
          if (checkData.existsWhatsapp) {
            const formattedChats = [{
              chatId: chatId,
              name: specificContact,
              lastMessage: 'Toque para carregar mensagens',
              timestamp: new Date().toISOString(),
              unreadCount: 0,
              isGroup: chatId.includes('@g.us')
            }];
            
            setChats(formattedChats);
            console.log('✅ Conversa específica carregada:', formattedChats[0].name);
            return;
          } else {
            console.log('❌ Contato não encontrado no WhatsApp:', specificContact);
            toast({
              title: "Contato não encontrado",
              description: `O número ${specificContact} não foi encontrado no WhatsApp`,
              variant: "destructive"
            });
            return;
          }
        }
      }

      // Carregar todas as conversas (comportamento padrão)
      const url = `https://api.green-api.com/waInstance${instanceId}/getChats/${apiToken}`;
      console.log('📡 Fazendo requisição para conversas:', url);
      
      const response = await fetch(url);
      console.log('📥 Status da resposta de conversas:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta de conversas:', errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Dados de conversas recebidos:', data);
      
      if (Array.isArray(data)) {
        const formattedChats: Chat[] = data.slice(0, 20).map((chat: any) => ({
          chatId: chat.id,
          name: chat.name || chat.id.split('@')[0],
          lastMessage: 'Toque para carregar mensagens',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
          isGroup: chat.id.includes('@g.us')
        }));

        setChats(formattedChats);
        console.log(`✅ Carregadas ${formattedChats.length} conversas:`, formattedChats.map(c => c.name));
      } else {
        console.error('❌ Resposta de conversas não é um array:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  }, [getAPIConfig, connectionState.isConnected, config, toast]);

  // Carregar mensagens com filtro de período
  const loadChatMessages = useCallback(async (chatId: string, period: MessagePeriod = currentPeriod) => {
    const { instanceId, apiToken } = getAPIConfig();
    
    console.log(`📨 Iniciando carregamento de mensagens para chat: ${chatId}, período: ${period}`);
    
    if (!instanceId || !apiToken || !chatId) {
      console.log('❌ Não é possível carregar mensagens - parâmetros ausentes');
      return;
    }

    setIsLoadingMessages(true);
    
    try {
      const startDate = getStartDate(period);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      console.log(`📅 Período: ${period}, data de início: ${startDate.toISOString()}, timestamp: ${startTimestamp}`);
      
      const url = `https://api.green-api.com/waInstance${instanceId}/getChatHistory/${apiToken}`;
      const requestBody = {
        chatId: chatId,
        count: period === 'today' ? 50 : period === '7days' ? 100 : 200
      };
      
      console.log('📡 Fazendo requisição para mensagens:', url);
      console.log('📋 Body da requisição:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Status da resposta de mensagens:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta de mensagens:', errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Dados de mensagens recebidos:', data);
      console.log('📊 Tipo dos dados:', typeof data, 'É array:', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log(`📨 Total de mensagens brutas: ${data.length}`);
        
        let filteredData = data;
        
        // Filtrar por período se não for 'all'
        if (period !== 'all') {
          filteredData = data.filter((msg: any) => {
            const msgTimestamp = msg.timestamp || 0;
            const isInPeriod = msgTimestamp >= startTimestamp;
            if (!isInPeriod) {
              console.log(`🔄 Mensagem filtrada (fora do período): timestamp ${msgTimestamp}, limite ${startTimestamp}`);
            }
            return isInPeriod;
          });
          console.log(`📊 Mensagens após filtro de período: ${filteredData.length}`);
        }
        
        const formattedMessages: Message[] = filteredData.map((msg: any, index: number) => {
          console.log(`📝 Formatando mensagem ${index + 1}:`, {
            id: msg.idMessage,
            type: msg.type,
            text: msg.textMessage,
            timestamp: msg.timestamp
          });
          
          return {
            id: msg.idMessage || Math.random().toString(),
            text: msg.textMessage || '[Mídia]',
            sender: msg.type === 'outgoing' ? 'user' : 'contact',
            timestamp: new Date(msg.timestamp * 1000).toISOString(),
            chatId: chatId
          };
        });

        // Atualizar apenas as mensagens do chat atual
        setMessages(prev => [
          ...prev.filter(m => m.chatId !== chatId),
          ...formattedMessages
        ]);
        
        setCurrentPeriod(period);
        
        console.log(`✅ Processadas ${formattedMessages.length} mensagens (${period}) para ${chatId}`);
        
        // Log das primeiras mensagens para debug
        if (formattedMessages.length > 0) {
          console.log('📋 Primeiras mensagens formatadas:', formattedMessages.slice(0, 3));
        }
      } else {
        console.error('❌ Resposta de mensagens não é um array:', data);
        console.error('📋 Estrutura da resposta:', Object.keys(data || {}));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [getAPIConfig, currentPeriod, getStartDate, toast]);

  // Enviar mensagem
  const sendMessage = useCallback(async (chatId: string, text: string) => {
    const { instanceId, apiToken } = getAPIConfig();
    
    if (!instanceId || !apiToken || !chatId || !text.trim()) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chatId,
            message: text.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Adicionar mensagem enviada à lista local
      const newMessage: Message = {
        id: data.idMessage || Math.random().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: chatId
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
      return false;
    }
  }, [getAPIConfig, toast]);

  return {
    // Estado
    connectionState,
    chats,
    messages,
    currentPeriod,
    isLoadingMessages,
    
    // Configuração
    getAPIConfig,
    saveAPIConfig,
    
    // Ações
    checkInstanceStatus,
    generateQRCode,
    disconnect,
    loadChats,
    loadChatMessages,
    sendMessage
  };
}
