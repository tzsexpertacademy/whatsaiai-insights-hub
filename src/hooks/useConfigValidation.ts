
import { useEffect } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function useConfigValidation() {
  const { config } = useClientConfig();
  const { toast } = useToast();

  useEffect(() => {
    // Validar configurações quando carregam
    validateConfigurations();
  }, [config]);

  const validateConfigurations = () => {
    const issues = [];

    // Validar OpenAI
    if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-')) {
      issues.push('Chave OpenAI inválida');
    }

    // Validar Firebase
    if (config.firebase.projectId && !config.firebase.apiKey) {
      issues.push('Firebase incompleto: falta API Key');
    }

    if (config.firebase.databaseURL && !config.firebase.databaseURL.includes('firebaseio.com')) {
      issues.push('URL do Firebase inválida');
    }

    // Validar WhatsApp
    if (config.whatsapp.platform === 'atendechat' && !config.whatsapp.atendechatApiKey) {
      issues.push('Atendechat: falta API Key');
    }

    // Exibir alertas se houver problemas
    if (issues.length > 0) {
      console.warn('Problemas de configuração detectados:', issues);
    }
  };

  const isOpenAIConfigured = () => {
    return config.openai.apiKey && config.openai.apiKey.startsWith('sk-');
  };

  const isFirebaseConfigured = () => {
    return config.firebase.projectId && config.firebase.apiKey && config.firebase.databaseURL;
  };

  const isWhatsAppConfigured = () => {
    return config.whatsapp.isConnected && config.whatsapp.authorizedNumber;
  };

  return {
    validateConfigurations,
    isOpenAIConfigured,
    isFirebaseConfigured,
    isWhatsAppConfigured
  };
}
