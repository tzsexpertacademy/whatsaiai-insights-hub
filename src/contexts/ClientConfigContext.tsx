import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ClientConfig {
  whatsapp: {
    isConnected: boolean;
    authorizedNumber?: string;
    qrCode: string;
    autoReply: boolean;
    lastImport?: string;  // Data da última importação de conversas
    autoSync?: boolean;   // Nova propriedade para sincronização automática
    syncInterval?: string; // 'hourly', 'daily', 'weekly'
    nextSyncTime?: string; // Próxima sincronização agendada
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
    lastImport: '',
    autoSync: false,
    syncInterval: 'daily',
    nextSyncTime: ''
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

  useEffect(() => {
    if (config.whatsapp.autoSync) {
      setupAutoSync();
    }
    
    return () => {
      // Limpar qualquer timer de sincronização quando o componente é desmontado
      if (window.syncTimer) {
        clearTimeout(window.syncTimer);
      }
    };
  }, [config.whatsapp.autoSync, config.whatsapp.syncInterval]);

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

  const setupAutoSync = () => {
    // Limpar qualquer timer existente
    if (window.syncTimer) {
      clearTimeout(window.syncTimer);
    }
    
    // Calcular próximo horário de sincronização
    const calculateNextSync = () => {
      const now = new Date();
      let nextSync: Date;
      
      switch (config.whatsapp.syncInterval) {
        case 'hourly':
          nextSync = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora
          break;
        case 'weekly':
          nextSync = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
          break;
        case 'daily':
        default:
          nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 dia
      }
      
      return nextSync;
    };
    
    const nextSync = calculateNextSync();
    
    // Atualizar próxima sincronização no config
    updateConfig('whatsapp', { nextSyncTime: nextSync.toISOString() });
    
    // Definir timer para sincronização
    const timeUntilSync = nextSync.getTime() - new Date().getTime();
    
    // Armazenar o timer em uma propriedade global para poder limpá-lo depois
    window.syncTimer = setTimeout(() => {
      performSync();
    }, timeUntilSync);
    
    console.log(`Próxima sincronização agendada para: ${nextSync.toLocaleString()}`);
  };

  const performSync = async () => {
    console.log('Executando sincronização automática...');
    
    try {
      // Aqui você implementaria a lógica de sincronização
      // Por exemplo, importar novas conversas do WhatsApp
      
      // Atualizar último horário de importação
      updateConfig('whatsapp', { 
        lastImport: new Date().toISOString(),
      });
      
      // Salvar configuração
      await saveConfig();
      
      console.log('Sincronização automática concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    } finally {
      // Agendar próxima sincronização
      setupAutoSync();
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

// Adicionando a definição do timer ao tipo Window
declare global {
  interface Window {
    syncTimer?: NodeJS.Timeout;
  }
}
