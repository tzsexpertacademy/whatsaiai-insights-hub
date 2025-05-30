import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { supabase } from '@/integrations/supabase/client';

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
  isPinned?: boolean;
  isMonitored?: boolean; // Nova propriedade para análise
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
  const [pinnedChats, setPinnedChats] = useState<string[]>([]);
  const [monitoredChats, setMonitoredChats] = useState<string[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('autoconhecimento');

  const { toast } = useToast();
  const { config, updateConfig, saveConfig } = useClientConfig();

  // Carregar configuração do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('greenapi_config');
    const savedState = localStorage.getItem('greenapi_state');
    const savedPinnedChats = localStorage.getItem('greenapi_pinned_chats');
    const savedMonitoredChats = localStorage.getItem('greenapi_monitored_chats');
    
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

    if (savedPinnedChats) {
      const parsed = JSON.parse(savedPinnedChats);
      setPinnedChats(parsed);
    }

    if (savedMonitoredChats) {
      const parsed = JSON.parse(savedMonitoredChats);
      setMonitoredChats(parsed);
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

  useEffect(() => {
    localStorage.setItem('greenapi_pinned_chats', JSON.stringify(pinnedChats));
  }, [pinnedChats]);

  useEffect(() => {
    localStorage.setItem('greenapi_monitored_chats', JSON.stringify(monitoredChats));
  }, [monitoredChats]);

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

  const saveConversationToDatabase = async (chat: GreenAPIChat, messageData?: any) => {
    // Só salvar no banco se a conversa estiver sendo monitorada
    if (!monitoredChats.includes(chat.chatId)) {
      console.log('💾 Conversa não está sendo monitorada, não salvando no banco:', chat.chatId);
      return;
    }

    try {
      console.log('💾 Salvando conversa monitorada no banco:', chat.chatId);
      
      const conversationData = {
        contact_phone: chat.chatId,
        contact_name: chat.name,
        messages: messageData ? [messageData] : [],
        session_id: `greenapi_${chat.chatId}`,
        updated_at: new Date().toISOString()
      };

      const { data: existingConversation } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('contact_phone', chat.chatId)
        .maybeSingle();

      if (existingConversation) {
        const existingMessages = Array.isArray(existingConversation.messages) ? existingConversation.messages : [];
        const updatedMessages = [...existingMessages];
        if (messageData) {
          updatedMessages.push(messageData);
        }

        await supabase
          .from('whatsapp_conversations')
          .update({
            contact_name: chat.name,
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);

        console.log('✅ Conversa monitorada atualizada no banco');
      } else {
        await supabase
          .from('whatsapp_conversations')
          .insert([conversationData]);

        console.log('✅ Nova conversa monitorada salva no banco');
      }

    } catch (error) {
      console.error('❌ Erro ao salvar conversa monitorada no banco:', error);
    }
  };

  // Nova função para auto-resposta com IA usando assistente selecionado
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (!config.openai?.apiKey) {
      return "🤖 Para receber respostas inteligentes, configure sua API key da OpenAI nas configurações.";
    }

    try {
      console.log(`🤖 Gerando resposta IA com assistente: ${selectedAssistant}...`);

      // Buscar configuração do assistente selecionado dos assistentes da plataforma
      const { data: assistantConfig } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', config.whatsapp?.authorizedNumber || 'default')
        .single();

      let systemPrompt = `Você é um assistente pessoal especializado em autoconhecimento e desenvolvimento pessoal. 
      
      Características:
      - Responda de forma empática e reflexiva
      - Faça perguntas que promovam autoconhecimento
      - Ofereça insights sobre padrões de comportamento
      - Seja conciso mas profundo (máximo 2 parágrafos)
      - Use tom caloroso e encorajador
      - Foque em ajudar a pessoa a se entender melhor
      
      Contexto: Esta é uma conversa de autoconhecimento onde a pessoa está refletindo consigo mesma.`;

      // Se encontrou configuração dos assistentes da plataforma, buscar o assistente selecionado
      if (assistantConfig?.openai_config?.assistants) {
        const selectedAssistantConfig = assistantConfig.openai_config.assistants.find(
          (assistant: any) => assistant.id === selectedAssistant
        );
        
        if (selectedAssistantConfig && selectedAssistantConfig.prompt) {
          systemPrompt = selectedAssistantConfig.prompt;
          console.log(`✅ Usando prompt do assistente da plataforma: ${selectedAssistantConfig.name}`);
        }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro OpenAI: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('❌ Erro ao gerar resposta IA:', error);
      return "🤖 Desculpe, não consegui processar sua mensagem no momento. Que tal reformular sua reflexão?";
    }
  };

  const formatContactName = (chatId: string, rawName?: string) => {
    // Se já tem um nome definido e não é igual ao chatId, usar ele
    if (rawName && rawName !== chatId && rawName.trim() !== '') {
      return rawName;
    }

    // Extrair número do chatId
    const phoneNumber = chatId.replace('@c.us', '').replace('@g.us', '');
    
    // Se é um grupo, tentar usar o nome ou criar um padrão
    if (chatId.includes('@g.us')) {
      return rawName && rawName.trim() !== '' ? rawName : `Grupo ${phoneNumber.substring(0, 8)}...`;
    }
    
    // Para contatos individuais, tentar formatar o número de forma mais amigável
    if (phoneNumber.length >= 10) {
      // Formato brasileiro: +55 (xx) xxxxx-xxxx
      if (phoneNumber.startsWith('55') && phoneNumber.length === 13) {
        const ddd = phoneNumber.substring(2, 4);
        const firstPart = phoneNumber.substring(4, 9);
        const secondPart = phoneNumber.substring(9);
        return `+55 (${ddd}) ${firstPart}-${secondPart}`;
      }
      // Outros formatos internacionais - mostrar com formatação mais limpa
      if (phoneNumber.length >= 11) {
        const country = phoneNumber.substring(0, 2);
        const area = phoneNumber.substring(2, 4);
        const number = phoneNumber.substring(4);
        return `+${country} (${area}) ${number}`;
      }
      // Números menores - formato simples
      return `+${phoneNumber}`;
    }
    
    return phoneNumber;
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
      
      const formattedChats: GreenAPIChat[] = data.map((chat: any) => {
        // Tentar obter nome do contato de diferentes campos possíveis
        let contactName = chat.name || chat.contact?.name || chat.contact?.pushname || chat.contact?.formattedName;
        
        // Para grupos, usar o nome do grupo
        if (chat.id.includes('@g.us')) {
          contactName = chat.name || chat.subject || contactName;
        }
        
        // Se ainda não temos nome e é um contato individual, tentar usar pushname ou outros campos
        if (!contactName && chat.id.includes('@c.us')) {
          contactName = chat.contact?.pushname || chat.contact?.notify || chat.lastMessage?.author || null;
        }
        
        return {
          chatId: chat.id,
          name: formatContactName(chat.id, contactName),
          lastMessage: chat.lastMessage?.body || '',
          lastMessageTime: chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp * 1000).toISOString() : new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.id.includes('@g.us'),
          isPinned: pinnedChats.includes(chat.id),
          isMonitored: monitoredChats.includes(chat.id)
        };
      });

      // Ordenar: fixados primeiro, depois por timestamp da última mensagem
      const sortedChats = formattedChats.sort((a, b) => {
        // Primeiro critério: chats fixados vêm primeiro
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Segundo critério: ordenar por timestamp da última mensagem (mais recente primeiro)
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      setChats(sortedChats);

      // Salvar apenas conversas monitoradas
      for (const chat of sortedChats) {
        if (chat.isMonitored) {
          await saveConversationToDatabase(chat);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      toast({
        title: "Erro ao carregar chats",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    }
  };

  const togglePinChat = (chatId: string) => {
    setPinnedChats(prev => {
      const newPinnedChats = prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId];
      
      setChats(prevChats => 
        prevChats.map(chat => ({
          ...chat,
          isPinned: newPinnedChats.includes(chat.chatId)
        })).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        })
      );
      
      return newPinnedChats;
    });

    toast({
      title: pinnedChats.includes(chatId) ? "Chat desfixado" : "Chat fixado",
      description: pinnedChats.includes(chatId) ? "Chat removido dos fixos" : "Chat adicionado aos fixos"
    });
  };

  // Nova função para monitorar conversas
  const toggleMonitorChat = (chatId: string) => {
    setMonitoredChats(prev => {
      const newMonitoredChats = prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId];
      
      setChats(prevChats => 
        prevChats.map(chat => ({
          ...chat,
          isMonitored: newMonitoredChats.includes(chat.chatId)
        }))
      );
      
      return newMonitoredChats;
    });

    const isCurrentlyMonitored = monitoredChats.includes(chatId);
    toast({
      title: isCurrentlyMonitored ? "Monitoramento desativado" : "Monitoramento ativado",
      description: isCurrentlyMonitored 
        ? "Esta conversa não será mais analisada para personalidade" 
        : "Esta conversa será analisada para insights de personalidade"
    });
  };

  const loadChatHistory = async (chatId: string) => {
    try {
      console.log('📜 Carregando histórico do chat:', chatId);
      
      const response = await fetch(getAPIUrl('getChatHistory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          count: 100
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

      // Salvar mensagens no banco de dados se a conversa estiver monitorada
      const chat = chats.find(c => c.chatId === chatId);
      if (chat && chat.isMonitored) {
        for (const message of formattedMessages) {
          await saveConversationToDatabase(chat, {
            id: message.id,
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp,
            platform: 'greenapi'
          });
        }
      }
      
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

      // Atualizar lista de chats com a nova mensagem
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.chatId === chatId 
            ? { ...chat, lastMessage: message, lastMessageTime: new Date().toISOString() }
            : chat
        )
      );

      // Verificar se é auto-conversa (mesmo número)
      const currentPhoneNumber = greenAPIState.phoneNumber.replace(/\D/g, '');
      const targetPhoneNumber = chatId.replace('@c.us', '').replace('@g.us', '');
      
      if (currentPhoneNumber && targetPhoneNumber === currentPhoneNumber) {
        console.log(`🤖 Auto-conversa detectada, gerando resposta com assistente: ${selectedAssistant}...`);
        
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(message);
          
          // Buscar nome do assistente para mostrar na resposta
          const { data: assistantConfig } = await supabase
            .from('client_configs')
            .select('openai_config')
            .eq('user_id', config.whatsapp?.authorizedNumber || 'default')
            .single();

          let assistantName = selectedAssistant.toUpperCase();
          if (assistantConfig?.openai_config?.assistants) {
            const selectedAssistantConfig = assistantConfig.openai_config.assistants.find(
              (assistant: any) => assistant.id === selectedAssistant
            );
            if (selectedAssistantConfig) {
              assistantName = selectedAssistantConfig.name;
            }
          }
          
          // Simular resposta do assistente
          const assistantMessage: GreenAPIMessage = {
            id: `ai_${Date.now()}`,
            text: `[${assistantName}] ${aiResponse}`,
            sender: 'contact',
            timestamp: new Date().toISOString(),
            chatId: chatId,
            messageId: `ai_${Date.now()}`,
            status: 'read'
          };

          setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), assistantMessage]
          }));

          // Atualizar lista de chats com a resposta do assistente
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.chatId === chatId 
                ? { ...chat, lastMessage: assistantMessage.text, lastMessageTime: assistantMessage.timestamp }
                : chat
            )
          );

          const chat = chats.find(c => c.chatId === chatId);
          if (chat && chat.isMonitored) {
            await saveConversationToDatabase(chat, {
              id: assistantMessage.id,
              text: assistantMessage.text,
              sender: 'assistant',
              timestamp: assistantMessage.timestamp,
              platform: 'greenapi',
              assistant_used: selectedAssistant
            });
          }
        }, 2000); // Delay de 2 segundos para simular resposta
      }

      const chat = chats.find(c => c.chatId === chatId);
      if (chat && chat.isMonitored) {
        await saveConversationToDatabase(chat, {
          id: newMessage.id,
          text: newMessage.text,
          sender: newMessage.sender,
          timestamp: newMessage.timestamp,
          platform: 'greenapi'
        });
      }

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

  // Função para atualizar chats em tempo real (chamada pelo webhook)
  const refreshChats = async () => {
    console.log('🔄 Atualizando chats em tempo real...');
    await loadChats();
  };

  // Polling para verificar mensagens recebidas a cada 10 segundos
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (greenAPIState.isConnected) {
      pollInterval = setInterval(() => {
        refreshChats();
      }, 10000); // A cada 10 segundos
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [greenAPIState.isConnected]);

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
    pinnedChats,
    monitoredChats,
    selectedAssistant,
    updateAPIConfig,
    getQRCode,
    loadChats,
    loadChatHistory,
    sendMessage,
    disconnect,
    checkConnectionStatus,
    togglePinChat,
    toggleMonitorChat,
    setSelectedAssistant,
    refreshChats
  };
}
