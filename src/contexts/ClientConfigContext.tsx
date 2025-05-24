
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
  atendechatApiKey?: string;
  atendechatWebhookUrl?: string;
  makeWebhookUrl?: string;
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
    lastImport: '',
    atendechatApiKey: '',
    atendechatWebhookUrl: '',
    makeWebhookUrl: ''
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
    const { projectId, apiKey, databaseURL } = config.firebase;
    
    if (!projectId || !apiKey) {
      console.log('Firebase - Campos obrigatórios ausentes');
      setIsFirebaseConnected(false);
      return false;
    }

    try {
      // Usar a mesma lógica do diagnóstico que está funcionando
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      console.log('Firebase - Testando conexão:', testUrl);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Firebase - Status da resposta:', response.status);
      
      if (response.status === 404) {
        console.log('Firebase - Project ID não encontrado');
        setIsFirebaseConnected(false);
        return false;
      }

      if (response.status === 401) {
        console.log('Firebase - API Key inválida ou com restrições');
        setIsFirebaseConnected(false);
        return false;
      }

      if (response.status === 403) {
        console.log('Firebase - Acesso negado - verificar regras');
        setIsFirebaseConnected(false);
        return false;
      }

      // Se chegou até aqui sem erro 401/403/404, está conectado
      console.log('Firebase - Conexão bem-sucedida!');
      setIsFirebaseConnected(true);
      return true;
      
    } catch (error) {
      console.error('Firebase - Erro de rede:', error);
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
        whatsapp_config: config.whatsapp as any,
        openai_config: config.openai as any,
        firebase_config: config.firebase as any,
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
