import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Estados para tempo real
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestampRef = useRef<number>(0);

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
    
    switch (period) {
      case 'today':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        console.log(`📅 Período "hoje": desde ${yesterday.toISOString()}`);
        return yesterday;
      case '7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        console.log(`📅 Período "7 dias": desde ${sevenDaysAgo.toISOString()}`);
        return sevenDaysAgo;
      case '1month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        console.log(`📅 Período "1 mês": desde ${oneMonthAgo.toISOString()}`);
        return oneMonthAgo;
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        console.log(`📅 Período "3 meses": desde ${threeMonthsAgo.toISOString()}`);
        return threeMonthsAgo;
      case 'all':
        const allTime = new Date(0);
        console.log(`📅 Período "todas": desde ${allTime.toISOString()}`);
        return allTime;
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
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
      stopLiveMode();
      
      toast({
        title: "Desconectado",
        description: "WhatsApp Business desconectado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, [getAPIConfig, toast]);

  // Carregar conversas
  const loadChats = useCallback(async (specificContactOverride?: string) => {
    const { instanceId, apiToken } = getAPIConfig();
    
    console.log('📱 Iniciando carregamento de conversas...');
    
    if (!instanceId || !apiToken || !connectionState.isConnected) {
      console.log('❌ Não é possível carregar conversas - credenciais ou conexão ausente');
      return;
    }

    const specificContact = specificContactOverride || config?.whatsapp?.specificContactFilter;
    console.log('🎯 Filtro de contato específico:', specificContact || 'Nenhum');

    try {
      if (specificContact && specificContact.trim()) {
        console.log('📞 Carregando conversa específica para:', specificContact);
        
        let chatId = specificContact.trim();
        if (!chatId.includes('@')) {
          chatId = chatId.replace(/\D/g, '') + '@c.us';
        }
        
        console.log('💬 ChatId formatado:', chatId);
        
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
      console.log(`📊 Total de conversas disponíveis: ${data.length}`);
      
      if (Array.isArray(data)) {
        const formattedChats: Chat[] = data.map((chat: any) => ({
          chatId: chat.id,
          name: chat.name || chat.id.split('@')[0],
          lastMessage: 'Toque para carregar mensagens',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
          isGroup: chat.id.includes('@g.us')
        }));

        setChats(formattedChats);
        console.log(`✅ Carregadas ${formattedChats.length} conversas (TODAS):`, formattedChats.slice(0, 5).map(c => c.name));
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

  // Carregar mensagens (função principal)
  const loadChatMessages = useCallback(async (chatId: string, period: MessagePeriod = currentPeriod) => {
    const { instanceId, apiToken } = getAPIConfig();
    
    console.log(`📨 Iniciando carregamento de mensagens para chat: ${chatId}, período: ${period}`);
    
    if (!instanceId || !apiToken || !chatId) {
      console.log('❌ Não é possível carregar mensagens - parâmetros ausentes');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoadingMessages(true);
    
    try {
      const startDate = getStartDate(period);
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const nowTimestamp = Math.floor(Date.now() / 1000);
      
      console.log(`📅 Período: ${period}`);
      console.log(`📅 Data de início: ${startDate.toISOString()}`);
      console.log(`📅 Timestamp início: ${startTimestamp}`);
      console.log(`📅 Timestamp agora: ${nowTimestamp}`);
      console.log(`📅 Diferença em horas: ${(nowTimestamp - startTimestamp) / 3600}`);
      
      const url = `https://api.green-api.com/waInstance${instanceId}/getChatHistory/${apiToken}`;
      const requestBody = {
        chatId: chatId,
        count: period === 'today' ? 100 : period === '7days' ? 200 : 500
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
        console.log(`📨 Total de mensagens brutas recebidas: ${data.length}`);
        
        if (data.length > 0) {
          console.log('📋 Primeiras 3 mensagens brutas:', data.slice(0, 3).map(msg => ({
            timestamp: msg.timestamp,
            timestampFormatted: new Date(msg.timestamp * 1000).toISOString(),
            type: msg.type,
            text: msg.textMessage?.substring(0, 50) + '...'
          })));
          
          // Armazenar timestamp da última mensagem para o modo ao vivo
          if (data.length > 0) {
            lastMessageTimestampRef.current = Math.max(...data.map(msg => msg.timestamp || 0));
            console.log('📅 Última mensagem timestamp:', lastMessageTimestampRef.current);
          }
        }
        
        let filteredData = data;
        
        if (period !== 'all') {
          const originalLength = filteredData.length;
          filteredData = data.filter((msg: any) => {
            const msgTimestamp = msg.timestamp || 0;
            const isInPeriod = msgTimestamp >= startTimestamp;
            
            if (!isInPeriod) {
              console.log(`🔄 Mensagem filtrada (fora do período): timestamp ${msgTimestamp} (${new Date(msgTimestamp * 1000).toISOString()}), limite ${startTimestamp} (${startDate.toISOString()})`);
            }
            
            return isInPeriod;
          });
          
          console.log(`📊 Mensagens antes do filtro: ${originalLength}`);
          console.log(`📊 Mensagens após filtro de período: ${filteredData.length}`);
        }
        
        const formattedMessages: Message[] = filteredData.map((msg: any, index: number) => {
          const messageDate = new Date(msg.timestamp * 1000);
          console.log(`📝 Formatando mensagem ${index + 1}:`, {
            id: msg.idMessage,
            type: msg.type,
            text: msg.textMessage?.substring(0, 30) + '...',
            timestamp: msg.timestamp,
            date: messageDate.toISOString(),
            isToday: messageDate.toDateString() === new Date().toDateString()
          });
          
          return {
            id: msg.idMessage || Math.random().toString(),
            text: msg.textMessage || '[Mídia ou mensagem especial]',
            sender: msg.type === 'outgoing' ? 'user' : 'contact',
            timestamp: messageDate.toISOString(),
            chatId: chatId
          };
        });

        setMessages(prev => [
          ...prev.filter(m => m.chatId !== chatId),
          ...formattedMessages
        ]);
        
        setCurrentPeriod(period);
        
        console.log(`✅ Processadas ${formattedMessages.length} mensagens (${period}) para ${chatId}`);
        
        if (formattedMessages.length > 0) {
          console.log('📋 Mensagens processadas (primeiras 3):', formattedMessages.slice(0, 3).map(msg => ({
            text: msg.text.substring(0, 30) + '...',
            sender: msg.sender,
            timestamp: msg.timestamp,
            isToday: new Date(msg.timestamp).toDateString() === new Date().toDateString()
          })));
          
          const todayMessages = formattedMessages.filter(msg => 
            new Date(msg.timestamp).toDateString() === new Date().toDateString()
          );
          console.log(`📅 Mensagens especificamente de HOJE: ${todayMessages.length}`);
        } else {
          console.log('⚠️ Nenhuma mensagem foi processada!');
          
          if (period === 'today') {
            console.log('🔄 Tentando carregar mensagens dos últimos 7 dias...');
            setTimeout(() => loadChatMessages(chatId, '7days'), 2000);
          }
        }
      } else {
        console.error('❌ Resposta de mensagens não é um array:', data);
        console.error('📋 Estrutura da resposta:', Object.keys(data || {}));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      
      if (error instanceof Error && error.message.includes('429')) {
        console.error('🚫 ERRO 429 - Rate limit atingido! Aguarde alguns minutos antes de tentar novamente.');
        toast({
          title: "Rate limit atingido",
          description: "Muitas requisições seguidas. Aguarde alguns minutos e tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao carregar mensagens",
          description: `${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [getAPIConfig, currentPeriod, getStartDate, toast]);

  // NOVA FUNÇÃO: Carregar apenas novas mensagens (para modo ao vivo)
  const loadNewMessages = useCallback(async (chatId: string) => {
    const { instanceId, apiToken } = getAPIConfig();
    
    if (!instanceId || !apiToken || !chatId || !lastMessageTimestampRef.current) return;

    try {
      console.log('🔴 [LIVE] Verificando novas mensagens...');
      
      const url = `https://api.green-api.com/waInstance${instanceId}/getChatHistory/${apiToken}`;
      const requestBody = {
        chatId: chatId,
        count: 20 // Apenas as 20 mais recentes
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Filtrar apenas mensagens mais novas que a última conhecida
        const newMessages = data.filter((msg: any) => 
          msg.timestamp > lastMessageTimestampRef.current
        );
        
        if (newMessages.length > 0) {
          console.log(`🔴 [LIVE] ${newMessages.length} novas mensagens encontradas!`);
          
          const formattedNewMessages: Message[] = newMessages.map((msg: any) => ({
            id: msg.idMessage || Math.random().toString(),
            text: msg.textMessage || '[Mídia ou mensagem especial]',
            sender: msg.type === 'outgoing' ? 'user' : 'contact',
            timestamp: new Date(msg.timestamp * 1000).toISOString(),
            chatId: chatId
          }));

          // Adicionar novas mensagens ao estado
          setMessages(prev => [...prev, ...formattedNewMessages]);
          
          // Atualizar último timestamp
          lastMessageTimestampRef.current = Math.max(...newMessages.map(msg => msg.timestamp));
          
          // Mostrar notificação para novas mensagens recebidas
          const newIncomingMessages = formattedNewMessages.filter(msg => msg.sender === 'contact');
          if (newIncomingMessages.length > 0) {
            toast({
              title: "Nova mensagem!",
              description: `${newIncomingMessages.length} nova(s) mensagem(ns) recebida(s)`,
            });
          }
        } else {
          console.log('🔴 [LIVE] Nenhuma mensagem nova');
        }
      }
    } catch (error) {
      console.error('❌ [LIVE] Erro ao verificar novas mensagens:', error);
    }
  }, [getAPIConfig, toast]);

  // NOVA FUNÇÃO: Iniciar modo ao vivo
  const startLiveMode = useCallback((chatId: string) => {
    console.log('🔴 [LIVE] Iniciando modo ao vivo para:', chatId);
    
    // Parar polling anterior se existir
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    // Iniciar polling a cada 3 segundos
    pollingIntervalRef.current = setInterval(() => {
      loadNewMessages(chatId);
    }, 3000);
    
    toast({
      title: "Modo ao vivo ativado",
      description: "Conversas serão atualizadas automaticamente",
    });
  }, [loadNewMessages, toast]);

  // NOVA FUNÇÃO: Parar modo ao vivo
  const stopLiveMode = useCallback(() => {
    console.log('🔴 [LIVE] Parando modo ao vivo');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsLiveMode(false);
    setCurrentChatId('');
    
    toast({
      title: "Modo ao vivo desativado",
      description: "Atualizações automáticas foram interrompidas",
    });
  }, [toast]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
      
      const newMessage: Message = {
        id: data.idMessage || Math.random().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: chatId
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Atualizar timestamp da última mensagem
      lastMessageTimestampRef.current = Math.floor(Date.now() / 1000);
      
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
    
    // Estados do modo ao vivo
    isLiveMode,
    currentChatId,
    
    // Configuração
    getAPIConfig,
    saveAPIConfig,
    
    // Ações
    checkInstanceStatus,
    generateQRCode,
    disconnect,
    loadChats,
    loadChatMessages,
    sendMessage,
    
    // Ações do modo ao vivo
    startLiveMode,
    stopLiveMode,
    loadNewMessages
  };
}
