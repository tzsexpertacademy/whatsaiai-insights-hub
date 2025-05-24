
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';
import { useConfigPersistence } from '@/hooks/useConfigPersistence';
import { useFirebaseTest } from '@/hooks/useFirebaseTest';

interface ClientConfigContextType {
  config: ClientConfig;
  updateConfig: (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => void;
  saveConfig: () => Promise<void>;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  testFirebaseConnection: () => Promise<boolean>;
}

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ClientConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const initialized = useRef(false);
  const mountedRef = useRef(true);
  
  const { loadConfig, saveConfig: saveConfigToDb } = useConfigPersistence();
  const { isFirebaseConnected, testFirebaseConnection: testFirebase } = useFirebaseTest();

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
      setIsLoading(false);
      console.log('🔄 Reset config for user logout');
    }
  }, [user?.id]);

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
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    return await testFirebase(config);
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
