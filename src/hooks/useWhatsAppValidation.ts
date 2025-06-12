
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const useWhatsAppValidation = () => {
  const validateWPPConfig = (config: any): ValidationResult => {
    if (!config) {
      return { isValid: false, error: 'Configuração não encontrada' };
    }
    
    if (!config.serverUrl || !config.serverUrl.trim()) {
      return { isValid: false, error: 'URL do servidor não configurada' };
    }
    
    if (!config.sessionName || !config.sessionName.trim()) {
      return { isValid: false, error: 'Nome da sessão não configurado' };
    }
    
    if (!config.token || !config.token.trim()) {
      return { isValid: false, error: 'Token não configurado' };
    }
    
    if (config.token === 'THISISMYSECURETOKEN' || config.token === 'YOUR_TOKEN_HERE') {
      return { isValid: false, error: 'Token padrão não é válido - configure um token real' };
    }
    
    return { isValid: true };
  };

  const validatePhoneNumber = (phone: string): ValidationResult => {
    if (!phone || !phone.trim()) {
      return { isValid: false, error: 'Número de telefone não fornecido' };
    }
    
    if (!phone.includes('@c.us') && !phone.includes('@g.us')) {
      return { isValid: false, error: 'Formato de número inválido (deve conter @c.us ou @g.us)' };
    }
    
    return { isValid: true };
  };

  const validateMessage = (message: string): ValidationResult => {
    if (!message || !message.trim()) {
      return { isValid: false, error: 'Mensagem não pode estar vazia' };
    }
    
    if (message.length > 4096) {
      return { isValid: false, error: 'Mensagem muito longa (máximo 4096 caracteres)' };
    }
    
    return { isValid: true };
  };

  const validateWebhookUrl = (url: string): ValidationResult => {
    if (!url || !url.trim()) {
      return { isValid: false, error: 'URL do webhook não fornecida' };
    }
    
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'URL do webhook inválida' };
    }
  };

  return {
    validateWPPConfig,
    validatePhoneNumber,
    validateMessage,
    validateWebhookUrl
  };
};
