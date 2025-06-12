
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PersonalAssistantConfig {
  enabled: boolean;
  masterNumber: string;
  assistantName: string;
  systemPrompt: string;
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
  
  const [config, setConfig] = useState<PersonalAssistantConfig>(() => {
    const saved = localStorage.getItem('personal_assistant_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      masterNumber: '',
      assistantName: 'Kairon',
      systemPrompt: '',
      responseDelay: 2
    };
  });

  const [recentMessages, setRecentMessages] = useState<AssistantMessage[]>([]);

  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove prefixos comuns do WhatsApp
    if (cleaned.endsWith('@c.us')) {
      cleaned = cleaned.replace('@c.us', '');
    }
    
    // Se começar com 55, mantém, senão adiciona
    if (cleaned.length >= 11 && !cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  }, []);

  const isAuthorizedMaster = useCallback((fromNumber: string): boolean => {
    if (!config.enabled || !config.masterNumber) {
      return false;
    }

    const cleanFrom = formatPhoneNumber(fromNumber);
    const cleanMaster = formatPhoneNumber(config.masterNumber);
    
    console.log('🔍 Verificando autorização:', {
      fromNumber,
      cleanFrom,
      masterNumber: config.masterNumber,
      cleanMaster,
      isMatch: cleanFrom === cleanMaster
    });

    return cleanFrom === cleanMaster;
  }, [config.enabled, config.masterNumber, formatPhoneNumber]);

  const generateAIResponse = useCallback(async (message: string): Promise<string> => {
    try {
      // Simular chamada para IA (OpenAI, etc.)
      // Aqui você integraria com sua API de IA preferida
      
      const aiPrompt = `${config.systemPrompt}

Mensagem do usuário: ${message}

Responda de forma natural e útil:`;

      console.log('🤖 Gerando resposta IA para:', message);
      
      // Simulação de resposta da IA
      const responses = [
        `Olá! Sou o ${config.assistantName}, seu assistente pessoal. Como posso ajudar você hoje?`,
        `Entendi sua mensagem: "${message}". Estou aqui para ajudar!`,
        `Perfeito! Vou processar isso para você. Mais alguma coisa?`,
        `Interessante! Deixe-me pensar na melhor forma de ajudar com isso.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Adicionar delay configurado
      await new Promise(resolve => setTimeout(resolve, config.responseDelay * 1000));
      
      return randomResponse;
      
    } catch (error) {
      console.error('❌ Erro ao gerar resposta IA:', error);
      return `Desculpe, tive um problema técnico. Sou o ${config.assistantName} e normalmente consigo ajudar melhor!`;
    }
  }, [config.assistantName, config.systemPrompt, config.responseDelay]);

  const processIncomingMessage = useCallback(async (
    fromNumber: string, 
    toNumber: string, 
    messageText: string,
    sendReplyFunction: (phone: string, message: string) => Promise<boolean>
  ): Promise<{ shouldRespond: boolean; response?: string }> => {
    
    console.log('📥 Processando mensagem recebida:', {
      from: fromNumber,
      to: toNumber,
      message: messageText,
      assistantEnabled: config.enabled
    });

    // Verificar se o assistente está ativo
    if (!config.enabled) {
      console.log('🔇 Assistente desativado');
      return { shouldRespond: false };
    }

    // Verificar se é do número master autorizado
    const isFromMaster = isAuthorizedMaster(fromNumber);
    
    if (!isFromMaster) {
      console.log('🚫 Mensagem não é do número master autorizado');
      return { shouldRespond: false };
    }

    console.log('✅ Mensagem autorizada do master, gerando resposta...');

    // Registrar mensagem
    const newMessage: AssistantMessage = {
      from: fromNumber,
      to: toNumber,
      message: messageText,
      timestamp: new Date().toISOString(),
      isFromMaster: true
    };

    setRecentMessages(prev => [...prev.slice(-9), newMessage]);

    // Gerar resposta da IA
    const aiResponse = await generateAIResponse(messageText);
    
    // Enviar resposta
    try {
      const success = await sendReplyFunction(fromNumber, aiResponse);
      
      if (success) {
        console.log('✅ Resposta enviada com sucesso');
        
        toast({
          title: `${config.assistantName} respondeu! 🤖`,
          description: `"${aiResponse.substring(0, 50)}${aiResponse.length > 50 ? '...' : ''}"`
        });

        return { shouldRespond: true, response: aiResponse };
      } else {
        console.error('❌ Falha ao enviar resposta');
        return { shouldRespond: false };
      }
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      return { shouldRespond: false };
    }
  }, [config, isAuthorizedMaster, generateAIResponse, toast]);

  const updateConfig = useCallback((newConfig: Partial<PersonalAssistantConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('personal_assistant_config', JSON.stringify(updatedConfig));
  }, [config]);

  return {
    config,
    recentMessages,
    updateConfig,
    processIncomingMessage,
    isAuthorizedMaster,
    formatPhoneNumber
  };
}
