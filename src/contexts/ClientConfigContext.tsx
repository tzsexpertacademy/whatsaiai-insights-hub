import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ClientConfig {
  whatsapp: {
    isConnected: boolean;
    authorizedNumber?: string;
    qrCode: string;
    autoReply: boolean;
    lastImport?: string;  // Data da última importação de conversas
  };
  firebase: {
    isConnected: boolean;
    projectId: string;
    apiKey: string;
    authDomain: string;
    databaseUrl: string;
    storageBucket: string;
  };
  openai: {
    isConnected: boolean;
    apiKey: string;
    defaultModel: string;
    maxTokens: string;
    temperature: string;
    organization: string;
  };
  assistants: {
    principal: {
      name: string;
      prompt: string;
      model: string;
      isActive: boolean;
    };
    others: Array<{
      id: string;
      name: string;
      prompt: string;
      model: string;
      isActive: boolean;
    }>;
  };
}

interface ClientConfigContextType {
  config: ClientConfig;
  updateConfig: (section: keyof ClientConfig, data: any) => void;
  saveConfig: () => Promise<void>;
  isLoading: boolean;
}

const defaultConfig: ClientConfig = {
  whatsapp: {
    isConnected: false,
    authorizedNumber: '',
    qrCode: '',
    autoReply: false,
    lastImport: ''
  },
  firebase: {
    isConnected: false,
    projectId: '',
    apiKey: '',
    authDomain: '',
    databaseUrl: '',
    storageBucket: ''
  },
  openai: {
    isConnected: false,
    apiKey: '',
    defaultModel: 'gpt-4o-mini',
    maxTokens: '4000',
    temperature: '0.7',
    organization: ''
  },
  assistants: {
    principal: {
      name: 'Conselheiro Principal',
      prompt: 'Você é um conselheiro especializado em análise comportamental e psicológica. Sua função é fornecer insights valiosos baseados nas conversas analisadas.',
      model: 'gpt-4o-mini',
      isActive: true
    },
    others: []
  }
};

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [config, setConfig] = useState<ClientConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento das configurações do cliente
      const savedConfig = localStorage.getItem(`config_${user?.id}`);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof ClientConfig, data: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const saveConfig = async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Simular salvamento no banco de dados
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(`config_${user.id}`, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientConfigContext.Provider value={{
      config,
      updateConfig,
      saveConfig,
      isLoading
    }}>
      {children}
    </ClientConfigContext.Provider>
  );
}

export function useClientConfig() {
  const context = useContext(ClientConfigContext);
  if (context === undefined) {
    throw new Error('useClientConfig deve ser usado dentro de um ClientConfigProvider');
  }
  return context;
}
