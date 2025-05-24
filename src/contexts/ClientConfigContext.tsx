
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';
import { useConfigPersistence } from '@/hooks/useConfigPersistence';

interface ClientConfigContextType {
  config: ClientConfig;
  updateConfig: (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => void;
  saveConfig: () => Promise<void>;
  isLoading: boolean;
  connectionStatus: {
    firebase: boolean;
    openai: boolean;
    whatsapp: boolean;
  };
  setConnectionStatus: (service: keyof ClientConfigContextType['connectionStatus'], status: boolean) => void;
  testFirebaseConnection: () => Promise<boolean>;
  testOpenAIConnection: () => Promise<boolean>;
}

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ClientConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatusState] = useState({
    firebase: false,
    openai: false,
    whatsapp: false
  });
  
  const { user, isAuthenticated } = useAuth();
  const initialized = useRef(false);
  const mountedRef = useRef(true);
  
  const { loadConfig, saveConfig: saveConfigToDb } = useConfigPersistence();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load config only once when user is available
  useEffect(() => {
    if (!mountedRef.current || !isAuthenticated || !user?.id || initialized.current) {
      return;
    }

    const initializeConfig = async () => {
      if (!mountedRef.current) return;
      
      try {
        setIsLoading(true);
        const loadedConfig = await loadConfig(user.id);
        
        if (mountedRef.current) {
          setConfig(loadedConfig);
          
          // Verificar status de conexões após carregar config
          const firebaseConnected = await checkFirebaseConnection(loadedConfig);
          const openaiConnected = await checkOpenAIConnection(loadedConfig);
          
          setConnectionStatusState({
            firebase: firebaseConnected,
            openai: openaiConnected,
            whatsapp: loadedConfig.whatsapp.isConnected
          });
          
          initialized.current = true;
        }
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
        if (mountedRef.current) {
          setConfig(defaultConfig);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeConfig();
  }, [user?.id, isAuthenticated, loadConfig]);

  // Reset when user changes
  useEffect(() => {
    if (!user?.id) {
      initialized.current = false;
      setConfig(defaultConfig);
      setConnectionStatusState({
        firebase: false,
        openai: false,
        whatsapp: false
      });
      setIsLoading(false);
      console.log('🔄 Reset config for user logout');
    }
  }, [user?.id]);

  const checkFirebaseConnection = async (configToCheck: ClientConfig): Promise<boolean> => {
    const { projectId, apiKey, databaseURL } = configToCheck.firebase;
    
    if (!projectId || !apiKey || !databaseURL) {
      return false;
    }

    try {
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      const response = await fetch(testUrl, { method: 'GET' });
      return response.ok || response.status === 401;
    } catch (error) {
      console.error('❌ Erro de conexão Firebase:', error);
      return false;
    }
  };

  const checkOpenAIConnection = async (configToCheck: ClientConfig): Promise<boolean> => {
    if (!configToCheck.openai.apiKey || !configToCheck.openai.apiKey.startsWith('sk-')) {
      return false;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${configToCheck.openai.apiKey}`,
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Erro de conexão OpenAI:', error);
      return false;
    }
  };

  const updateConfig = (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => {
    if (!mountedRef.current) return;
    
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const saveConfig = async (): Promise<void> => {
    if (!user?.id || !mountedRef.current) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsLoading(true);
      await saveConfigToDb(config, user.id);
      
      // Verificar conexões após salvar
      const firebaseConnected = await checkFirebaseConnection(config);
      const openaiConnected = await checkOpenAIConnection(config);
      
      setConnectionStatusState(prev => ({
        ...prev,
        firebase: firebaseConnected,
        openai: openaiConnected
      }));
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const setConnectionStatus = (service: keyof ClientConfigContextType['connectionStatus'], status: boolean) => {
    setConnectionStatusState(prev => ({
      ...prev,
      [service]: status
    }));
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    const connected = await checkFirebaseConnection(config);
    setConnectionStatus('firebase', connected);
    return connected;
  };

  const testOpenAIConnection = async (): Promise<boolean> => {
    const connected = await checkOpenAIConnection(config);
    setConnectionStatus('openai', connected);
    return connected;
  };

  return (
    <ClientConfigContext.Provider value={{
      config,
      updateConfig,
      saveConfig,
      isLoading,
      connectionStatus,
      setConnectionStatus,
      testFirebaseConnection,
      testOpenAIConnection
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
