
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface PersonalAssistantConfig {
  enabled: boolean;
  masterNumber: string;
  selectedAssistantId: string;
  responseDelay: number;
}

interface AssistantMessage {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  isFromMaster: boolean;
}

export function usePersonalAssistant() {
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();
  
  const [config, setConfig] = useState<PersonalAssistantConfig>(() => {
    const saved = localStorage.getItem('personal_assistant_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      masterNumber: '',
      selectedAssistantId: 'kairon',
      responseDelay: 2
    };
  });

  const [recentMessages, setRecentMessages] = useState<AssistantMessage[]>([]);

  const formatPhoneNumber = useCallback((phone: string): string => {
    console.log('🔧 [ASSISTANT] Formatando número:', phone);
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.endsWith('@c.us')) {
      cleaned = cleaned.replace('@c.us', '');
    }
    
    if (cleaned.length >= 11 && !cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    console.log('🔧 [ASSISTANT] Número formatado:', cleaned);
    return cleaned;
  }, []);

  const isAuthorizedMaster = useCallback((fromNumber: string): boolean => {
    console.log('🛡️ [ASSISTANT] Verificando autorização...');
    console.log('🛡️ [ASSISTANT] Config atual:', {
      enabled: config.enabled,
      masterNumber: config.masterNumber,
      selectedAssistantId: config.selectedAssistantId
    });

    if (!config.enabled) {
      console.log('🚫 [ASSISTANT] Assistente desativado');
      return false;
    }

    if (!config.masterNumber) {
      console.log('🚫 [ASSISTANT] Número master não configurado');
      return false;
    }

    const cleanFrom = formatPhoneNumber(fromNumber);
    const cleanMaster = formatPhoneNumber(config.masterNumber);
    
    console.log('🔍 [ASSISTANT] Comparando números:', {
      original: fromNumber,
      cleanFrom,
      masterOriginal: config.masterNumber,
      cleanMaster,
      isMatch: cleanFrom === cleanMaster
    });

    const isAuthorized = cleanFrom === cleanMaster;
    
    if (isAuthorized) {
      console.log('✅ [ASSISTANT] Número autorizado!');
    } else {
      console.log('❌ [ASSISTANT] Número NÃO autorizado');
    }

    return isAuthorized;
  }, [config.enabled, config.masterNumber, formatPhoneNumber]);

  const generateAIResponse = useCallback(async (message: string): Promise<string> => {
    console.log('🤖 [ASSISTANT] Gerando resposta IA...');
    console.log('🤖 [ASSISTANT] Mensagem recebida:', message);
    console.log('🤖 [ASSISTANT] Assistente selecionado:', config.selectedAssistantId);
    
    try {
      // Buscar o assistente selecionado
      const selectedAssistant = assistants.find(a => a.id === config.selectedAssistantId);
      const assistantName = selectedAssistant?.name || 'Kairon';
      const systemPrompt = selectedAssistant?.prompt || `Você é ${assistantName}, um assistente pessoal inteligente via WhatsApp.`;
      
      console.log('🤖 [ASSISTANT] Usando assistente:', {
        id: config.selectedAssistantId,
        name: assistantName,
        prompt: systemPrompt.substring(0, 100) + '...'
      });
      
      // Simulação de resposta da IA baseada no assistente selecionado
      const responses = [
        `Olá! Sou o ${assistantName}, seu assistente pessoal. Recebi sua mensagem: "${message}". Como posso ajudar você hoje?`,
        `Entendi sua mensagem: "${message}". Estou aqui para ajudar! Sou o ${assistantName}.`,
        `Perfeito! Processando: "${message}". Mais alguma coisa em que posso ajudar?`,
        `Interessante! Sobre "${message}" - deixe-me pensar na melhor forma de ajudar com isso.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      console.log('🤖 [ASSISTANT] Resposta gerada:', randomResponse);
      console.log('🤖 [ASSISTANT] Aplicando delay de', config.responseDelay, 'segundos');
      
      await new Promise(resolve => setTimeout(resolve, config.responseDelay * 1000));
      
      console.log('✅ [ASSISTANT] Resposta pronta para envio');
      return randomResponse;
      
    } catch (error) {
      console.error('❌ [ASSISTANT] Erro ao gerar resposta IA:', error);
      const assistantName = assistants.find(a => a.id === config.selectedAssistantId)?.name || 'Kairon';
      return `Desculpe, tive um problema técnico. Sou o ${assistantName} e normalmente consigo ajudar melhor!`;
    }
  }, [config.selectedAssistantId, config.responseDelay, assistants]);

  const processIncomingMessage = useCallback(async (
    fromNumber: string, 
    toNumber: string, 
    messageText: string,
    sendReplyFunction: (phone: string, message: string) => Promise<boolean>
  ): Promise<{ shouldRespond: boolean; response?: string }> => {
    
    console.log('📥 [ASSISTANT] === PROCESSANDO MENSAGEM RECEBIDA ===');
    console.log('📥 [ASSISTANT] Dados da mensagem:', {
      from: fromNumber,
      to: toNumber,
      message: messageText,
      assistantEnabled: config.enabled,
      masterNumber: config.masterNumber,
      selectedAssistant: config.selectedAssistantId
    });

    if (!config.enabled) {
      console.log('🔇 [ASSISTANT] Assistente desativado - ignorando mensagem');
      return { shouldRespond: false };
    }

    const isFromMaster = isAuthorizedMaster(fromNumber);
    
    if (!isFromMaster) {
      console.log('🚫 [ASSISTANT] Mensagem não é do número master autorizado - ignorando');
      return { shouldRespond: false };
    }

    console.log('✅ [ASSISTANT] Mensagem autorizada do master - processando...');

    const newMessage: AssistantMessage = {
      from: fromNumber,
      to: toNumber,
      message: messageText,
      timestamp: new Date().toISOString(),
      isFromMaster: true
    };

    setRecentMessages(prev => [...prev.slice(-9), newMessage]);

    console.log('🔄 [ASSISTANT] Gerando resposta...');
    const aiResponse = await generateAIResponse(messageText);
    
    try {
      console.log('📤 [ASSISTANT] Tentando enviar resposta:', aiResponse);
      const success = await sendReplyFunction(fromNumber, aiResponse);
      
      if (success) {
        console.log('✅ [ASSISTANT] Resposta enviada com sucesso!');
        
        const assistantName = assistants.find(a => a.id === config.selectedAssistantId)?.name || 'Assistente';
        
        toast({
          title: `${assistantName} respondeu! 🤖`,
          description: `"${aiResponse.substring(0, 50)}${aiResponse.length > 50 ? '...' : ''}"`
        });

        return { shouldRespond: true, response: aiResponse };
      } else {
        console.error('❌ [ASSISTANT] Falha ao enviar resposta');
        
        toast({
          title: "❌ Erro no assistente",
          description: "Não foi possível enviar a resposta automática",
          variant: "destructive"
        });
        
        return { shouldRespond: false };
      }
    } catch (error) {
      console.error('❌ [ASSISTANT] Erro ao enviar resposta:', error);
      
      toast({
        title: "❌ Erro no assistente",
        description: "Erro de conexão ao enviar resposta",
        variant: "destructive"
      });
      
      return { shouldRespond: false };
    }
  }, [config, isAuthorizedMaster, generateAIResponse, toast, assistants]);

  const updateConfig = useCallback((newConfig: Partial<PersonalAssistantConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('personal_assistant_config', JSON.stringify(updatedConfig));
    
    console.log('⚙️ [ASSISTANT] Configuração atualizada:', updatedConfig);
    
    toast({
      title: "Configuração salva! 🤖",
      description: "Configurações do assistente pessoal atualizadas"
    });
  }, [config, toast]);

  console.log('🔧 [ASSISTANT] Hook inicializado com config:', config);

  return {
    config,
    recentMessages,
    updateConfig,
    processIncomingMessage,
    isAuthorizedMaster,
    formatPhoneNumber,
    assistants
  };
}
