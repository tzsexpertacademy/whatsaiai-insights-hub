
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';

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
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Carregar configurações apenas uma vez quando o usuário estiver autenticado
  useEffect(() => {
    if (!isAuthenticated || !user?.id || hasLoadedRef.current || isLoadingRef.current) {
      if (!isAuthenticated) {
        console.log('🔄 Usuário não autenticado, usando config padrão');
        setConfig(defaultConfig);
        hasLoadedRef.current = false;
      }
      return;
    }

    const loadUserConfig = async () => {
      if (isLoadingRef.current) return;
      
      try {
        isLoadingRef.current = true;
        setIsLoading(true);
        console.log('📥 Carregando configurações do usuário:', user.id);
        
        const { data, error } = await supabase
          .from('client_configs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Erro ao carregar configurações:', error);
          setConfig(defaultConfig);
          return;
        }

        if (data) {
          const loadedConfig = {
            whatsapp: { 
              ...defaultConfig.whatsapp, 
              ...(typeof data.whatsapp_config === 'object' && data.whatsapp_config !== null ? data.whatsapp_config as any : {})
            },
            openai: { 
              ...defaultConfig.openai, 
              ...(typeof data.openai_config === 'object' && data.openai_config !== null ? data.openai_config as any : {})
            },
            firebase: { 
              ...defaultConfig.firebase, 
              ...(typeof data.firebase_config === 'object' && data.firebase_config !== null ? data.firebase_config as any : {})
            }
          };
          setConfig(loadedConfig);
          console.log('✅ Configurações carregadas');
        } else {
          console.log('ℹ️ Criando configuração inicial');
          await supabase
            .from('client_configs')
            .insert({
              id: user.id,
              whatsapp_config: defaultConfig.whatsapp,
              openai_config: defaultConfig.openai,
              firebase_config: defaultConfig.firebase
            });
          setConfig(defaultConfig);
        }
        
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
        setConfig(defaultConfig);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadUserConfig();
  }, [user?.id, isAuthenticated]);

  const updateConfig = (section: keyof ClientConfig, updates: Partial<ClientConfig[keyof ClientConfig]>) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const saveConfig = async (): Promise<void> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsLoading(true);
      console.log('💾 Salvando configurações...');
      
      const { error } = await supabase
        .from('client_configs')
        .upsert({
          id: user.id,
          whatsapp_config: config.whatsapp,
          openai_config: config.openai,
          firebase_config: config.firebase,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      console.log('✅ Configurações salvas');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    const { projectId, apiKey, databaseURL } = config.firebase;
    
    if (!projectId || !apiKey || !databaseURL) {
      setIsFirebaseConnected(false);
      return false;
    }

    try {
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      const response = await fetch(testUrl, { method: 'GET' });
      const connected = response.ok;
      setIsFirebaseConnected(connected);
      return connected;
    } catch (error) {
      console.error('❌ Erro de conexão Firebase:', error);
      setIsFirebaseConnected(false);
      return false;
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
