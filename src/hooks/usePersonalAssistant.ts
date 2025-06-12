
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
    console.log('🔧 [ASSISTANT] Formatando número:', phone);
    
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
    
    console.log('🔧 [ASSISTANT] Número formatado:', cleaned);
    return cleaned;
  }, []);

  const isAuthorizedMaster = useCallback((fromNumber: string): boolean => {
    console.log('🛡️ [ASSISTANT] Verificando autorização...');
    console.log('🛡️ [ASSISTANT] Config atual:', {
      enabled: config.enabled,
      masterNumber: config.masterNumber,
      assistantName: config.assistantName
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
    console.log('🤖 [ASSISTANT] Prompt do sistema:', config.systemPrompt);
    
    try {
      // Simular chamada para IA (OpenAI, etc.)
      // Aqui você integraria com sua API de IA preferida
      
      const aiPrompt = `${config.systemPrompt}

Mensagem do usuário: ${message}

Responda de forma natural e útil:`;

      console.log('🤖 [ASSISTANT] Prompt completo:', aiPrompt);
      
      // Simulação de resposta da IA
      const responses = [
        `Olá! Sou o ${config.assistantName}, seu assistente pessoal. Recebi sua mensagem: "${message}". Como posso ajudar você hoje?`,
        `Entendi sua mensagem: "${message}". Estou aqui para ajudar! Sou o ${config.assistantName}.`,
        `Perfeito! Processando: "${message}". Mais alguma coisa em que posso ajudar?`,
        `Interessante! Sobre "${message}" - deixe-me pensar na melhor forma de ajudar com isso.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      console.log('🤖 [ASSISTANT] Resposta gerada:', randomResponse);
      console.log('🤖 [ASSISTANT] Aplicando delay de', config.responseDelay, 'segundos');
      
      // Adicionar delay configurado
      await new Promise(resolve => setTimeout(resolve, config.responseDelay * 1000));
      
      console.log('✅ [ASSISTANT] Resposta pronta para envio');
      return randomResponse;
      
    } catch (error) {
      console.error('❌ [ASSISTANT] Erro ao gerar resposta IA:', error);
      return `Desculpe, tive um problema técnico. Sou o ${config.assistantName} e normalmente consigo ajudar melhor!`;
    }
  }, [config.assistantName, config.systemPrompt, config.responseDelay]);

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
      masterNumber: config.masterNumber
    });

    // Verificar se o assistente está ativo
    if (!config.enabled) {
      console.log('🔇 [ASSISTANT] Assistente desativado - ignorando mensagem');
      return { shouldRespond: false };
    }

    // Verificar se é do número master autorizado
    const isFromMaster = isAuthorizedMaster(fromNumber);
    
    if (!isFromMaster) {
      console.log('🚫 [ASSISTANT] Mensagem não é do número master autorizado - ignorando');
      return { shouldRespond: false };
    }

    console.log('✅ [ASSISTANT] Mensagem autorizada do master - processando...');

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
    console.log('🔄 [ASSISTANT] Gerando resposta...');
    const aiResponse = await generateAIResponse(messageText);
    
    // Enviar resposta
    try {
      console.log('📤 [ASSISTANT] Tentando enviar resposta:', aiResponse);
      const success = await sendReplyFunction(fromNumber, aiResponse);
      
      if (success) {
        console.log('✅ [ASSISTANT] Resposta enviada com sucesso!');
        
        toast({
          title: `${config.assistantName} respondeu! 🤖`,
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
  }, [config, isAuthorizedMaster, generateAIResponse, toast]);

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

  // Log do estado atual quando o hook é usado
  console.log('🔧 [ASSISTANT] Hook inicializado com config:', config);

  return {
    config,
    recentMessages,
    updateConfig,
    processIncomingMessage,
    isAuthorizedMaster,
    formatPhoneNumber
  };
}
