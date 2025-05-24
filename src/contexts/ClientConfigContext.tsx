
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
  const initialized = useRef(false);
  const mountedRef = useRef(true);

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

    const loadConfig = async () => {
      if (!mountedRef.current) return;
      
      try {
        setIsLoading(true);
        console.log('📥 Carregando configurações para usuário:', user.id);
        
        const { data, error } = await supabase
          .from('client_configs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!mountedRef.current) return;

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar config:', error);
          return;
        }

        if (data) {
          const loadedConfig: ClientConfig = {
            whatsapp: {
              ...defaultConfig.whatsapp,
              ...(data.whatsapp_config && typeof data.whatsapp_config === 'object' ? data.whatsapp_config as any : {})
            },
            openai: {
              ...defaultConfig.openai,
              ...(data.openai_config && typeof data.openai_config === 'object' ? data.openai_config as any : {})
            },
            firebase: {
              ...defaultConfig.firebase,
              ...(data.firebase_config && typeof data.firebase_config === 'object' ? data.firebase_config as any : {})
            }
          };
          setConfig(loadedConfig);
          console.log('✅ Configurações carregadas');
        } else {
          console.log('ℹ️ Criando configuração inicial');
          
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
        
        initialized.current = true;
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadConfig();
  }, [user?.id, isAuthenticated]);

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
      console.log('💾 Salvando configurações...');
      
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
