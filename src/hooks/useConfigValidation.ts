
import { useEffect, useRef } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function useConfigValidation() {
  const { config } = useClientConfig();
  const { toast } = useToast();
  const lastValidationRef = useRef<string>('');
  const hasValidated = useRef(false);

  useEffect(() => {
    // Só validar se a configuração mudou e não é o primeiro carregamento
    const configString = JSON.stringify(config);
    if (configString === lastValidationRef.current || !hasValidated.current) {
      if (configString !== '{}') {
        hasValidated.current = true;
      }
      lastValidationRef.current = configString;
      return;
    }
    
    lastValidationRef.current = configString;
    
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
