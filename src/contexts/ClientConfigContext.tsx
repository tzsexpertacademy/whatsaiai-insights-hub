
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
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset quando usuário muda
  useEffect(() => {
    if (!mountedRef.current) return;
    
    loadedRef.current = false;
    loadingRef.current = false;
    setConfig(defaultConfig);
    console.log('🔄 Reset config for user change');
  }, [user?.id]);

  // Carregar configurações apenas quando necessário
  useEffect(() => {
    if (!mountedRef.current || !isAuthenticated || !user?.id || loadedRef.current || loadingRef.current) {
      return;
    }

    const loadConfig = async () => {
      if (loadingRef.current || !mountedRef.current) return;
      
      try {
        loadingRef.current = true;
        setIsLoading(true);
        
        console.log('📋 Carregando configurações para:', user.id);
        
        // Buscar por ID do usuário usando filtro where
        const { data, error } = await supabase
          .from('client_configs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar config:', error);
          return;
        }

        if (!mountedRef.current) return;

        if (data) {
          const loadedConfig: ClientConfig = {
            whatsapp: {
              ...defaultConfig.whatsapp,
              ...(typeof data.whatsapp_config === 'object' && data.whatsapp_config ? data.whatsapp_config as any : {})
            },
            openai: {
              ...defaultConfig.openai,
              ...(typeof data.openai_config === 'object' && data.openai_config ? data.openai_config as any : {})
            },
            firebase: {
              ...defaultConfig.firebase,
              ...(typeof data.firebase_config === 'object' && data.firebase_config ? data.firebase_config as any : {})
            }
          };
          setConfig(loadedConfig);
          console.log('✅ Configurações carregadas');
        } else {
          console.log('ℹ️ Criando configuração inicial');
          
          // Usar insert simples sem array
          const { error: insertError } = await supabase
            .from('client_configs')
            .insert({
              id: user.id,
              whatsapp_config: defaultConfig.whatsapp as any,
              openai_config: defaultConfig.openai as any,
              firebase_config: defaultConfig.firebase as any
            });
          
          if (insertError) {
            console.error('❌ Erro ao criar config:', insertError);
          } else {
            setConfig(defaultConfig);
          }
        }
        
        loadedRef.current = true;
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        loadingRef.current = false;
      }
    };

    loadConfig();
  }, [user?.id, isAuthenticated]);

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
      console.log('💾 Salvando configurações...');
      
      // Usar upsert simples sem array
      const { error } = await supabase
        .from('client_configs')
        .upsert({
          id: user.id,
          whatsapp_config: config.whatsapp as any,
          openai_config: config.openai as any,
          firebase_config: config.firebase as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      console.log('✅ Configurações salvas');
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
