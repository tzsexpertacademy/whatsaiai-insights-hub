
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';
import { useConfigPersistence } from '@/hooks/useConfigPersistence';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { loadConfig, saveConfigToDatabase } = useConfigPersistence({
    user,
    isAuthenticated,
    setConfig,
    setIsLoading,
    toast
  });
  
  const { isFirebaseConnected, testFirebaseConnection } = useFirebaseConnection(config.firebase);

  useEffect(() => {
    if (isInitialized) return;

    const initializeConfig = async () => {
      if (isAuthenticated && user?.id) {
        console.log('🔄 Usuário autenticado, carregando configurações...');
        try {
          await loadConfig();
        } catch (error) {
          console.error('❌ Erro ao carregar configurações:', error);
          setConfig(defaultConfig);
        }
      } else {
        console.log('ℹ️ Usando configurações padrão');
        setConfig(defaultConfig);
      }
      setIsInitialized(true);
    };

    initializeConfig();
  }, [isAuthenticated, user?.id, loadConfig, isInitialized]);

  const updateConfig = (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => {
    console.log(`🔧 Atualizando seção ${section}:`, updates);
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const saveConfig = async (): Promise<void> => {
    if (!isAuthenticated || !user?.id) {
      console.error('❌ SaveConfig: Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    await saveConfigToDatabase(config, user.id, setIsLoading);
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
