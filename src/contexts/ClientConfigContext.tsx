
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
      console.log('🔄 Usuário autenticado, carregando configurações...');
      loadConfig();
    } else {
      console.log('❌ Usuário não autenticado, resetando configurações');
      setConfig(defaultConfig);
      setIsFirebaseConnected(false);
    }
  }, [isAuthenticated, user]);

  const loadConfig = async () => {
    if (!user?.id) {
      console.error('❌ LoadConfig: user.id não disponível');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📥 Carregando configurações para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Nenhuma configuração encontrada, criando registro inicial...');
          await createInitialConfig();
          return;
        }
        console.error('❌ Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Usando configurações padrão",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('✅ Configurações carregadas com sucesso:', {
          hasWhatsApp: !!data.whatsapp_config,
          hasOpenAI: !!data.openai_config,
          hasFirebase: !!data.firebase_config
        });

        const loadedConfig = {
          whatsapp: { ...defaultConfig.whatsapp, ...(data.whatsapp_config as Partial<WhatsAppConfig> || {}) },
          openai: { ...defaultConfig.openai, ...(data.openai_config as Partial<OpenAIConfig> || {}) },
          firebase: { ...defaultConfig.firebase, ...(data.firebase_config as Partial<FirebaseConfig> || {}) }
        };

        setConfig(loadedConfig);

        // Verificar conexão Firebase se configurado
        const firebaseConfig = data.firebase_config as Partial<FirebaseConfig>;
        if (firebaseConfig?.projectId && firebaseConfig?.apiKey) {
          console.log('🔥 Firebase configurado, testando conexão...');
          await testFirebaseConnection();
        } else {
          console.log('ℹ️ Firebase não configurado');
          setIsFirebaseConnected(false);
        }

        toast({
          title: "Configurações carregadas",
          description: "Suas configurações foram restauradas com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar configurações:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialConfig = async () => {
    if (!user?.id) return;

    try {
      console.log('🆕 Criando configuração inicial para usuário:', user.id);
      
      const { error } = await supabase
        .from('client_configs')
        .insert({
          user_id: user.id,
          whatsapp_config: defaultConfig.whatsapp,
          openai_config: defaultConfig.openai,
          firebase_config: defaultConfig.firebase
        });

      if (error) {
        console.error('❌ Erro ao criar configuração inicial:', error);
        throw error;
      }

      console.log('✅ Configuração inicial criada com sucesso');
    } catch (error) {
      console.error('❌ Falha ao criar configuração inicial:', error);
      toast({
        title: "Erro de inicialização",
        description: "Não foi possível criar as configurações iniciais",
        variant: "destructive"
      });
    }
  };

  const updateConfig = (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => {
    console.log(`🔧 Atualizando seção ${section}:`, updates);
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
    if (!isAuthenticated || !user?.id) {
      console.error('❌ SaveConfig: Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsLoading(true);
      console.log('💾 Salvando configurações para usuário:', user.id);
      console.log('📋 Dados a salvar:', {
        whatsapp: Object.keys(config.whatsapp).length,
        openai: Object.keys(config.openai).length,
        firebase: Object.keys(config.firebase).length
      });
      
      const configData = {
        user_id: user.id,
        whatsapp_config: config.whatsapp as any,
        openai_config: config.openai as any,
        firebase_config: config.firebase as any,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('client_configs')
        .upsert(configData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        throw error;
      }

      console.log('✅ Configurações salvas com sucesso!');
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso e não serão perdidas"
      });
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
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
