
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConfig {
  isConnected: boolean;
  authorizedNumber: string;
  qrCode: string;
  platform: string;
  autoSync: boolean;
  syncInterval: string;
  autoReply: boolean;
  lastImport: string;
}

interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL: string;
}

interface ClientConfig {
  whatsapp: WhatsAppConfig;
  openai: OpenAIConfig;
  firebase: FirebaseConfig;
}

interface ClientConfigContextType {
  config: ClientConfig;
  updateConfig: (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => void;
  saveConfig: () => Promise<void>;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  testFirebaseConnection: () => Promise<boolean>;
}

const defaultConfig: ClientConfig = {
  whatsapp: {
    isConnected: false,
    authorizedNumber: '',
    qrCode: '',
    platform: 'atendechat',
    autoSync: false,
    syncInterval: 'daily',
    autoReply: false,
    lastImport: ''
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    databaseURL: ''
  }
};

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ClientConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadConfig();
    }
  }, [isAuthenticated, user]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading config:', error);
        return;
      }

      if (data) {
        setConfig({
          whatsapp: { ...defaultConfig.whatsapp, ...(data.whatsapp_config as Partial<WhatsAppConfig> || {}) },
          openai: { ...defaultConfig.openai, ...(data.openai_config as Partial<OpenAIConfig> || {}) },
          firebase: { ...defaultConfig.firebase, ...(data.firebase_config as Partial<FirebaseConfig> || {}) }
        });

        // Verificar se Firebase está conectado
        const firebaseConfig = data.firebase_config as Partial<FirebaseConfig>;
        setIsFirebaseConnected(!!(firebaseConfig?.projectId && firebaseConfig?.apiKey));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    const { projectId, apiKey } = config.firebase;
    
    if (!projectId || !apiKey) {
      return false;
    }

    try {
      // Teste simples de conectividade com Firebase
      const testUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}?key=${apiKey}`;
      const response = await fetch(testUrl, { method: 'GET' });
      
      const isConnected = response.status !== 404 && response.status !== 401;
      setIsFirebaseConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      setIsFirebaseConnected(false);
      return false;
    }
  };

  const saveConfig = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsLoading(true);
      
      const configData = {
        user_id: user.id,
        whatsapp_config: config.whatsapp,
        openai_config: config.openai,
        firebase_config: config.firebase,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('client_configs')
        .upsert(configData);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso"
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
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
      isLoading,
      isFirebaseConnected,
      testFirebaseConnection
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
