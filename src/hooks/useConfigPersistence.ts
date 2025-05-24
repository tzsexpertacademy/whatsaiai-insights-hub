
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';

interface UseConfigPersistenceProps {
  user: any;
  isAuthenticated: boolean;
  setConfig: (config: ClientConfig) => void;
  setIsLoading: (loading: boolean) => void;
  toast: any;
}

export function useConfigPersistence({
  user,
  isAuthenticated,
  setConfig,
  setIsLoading,
  toast
}: UseConfigPersistenceProps) {
  const operationRef = useRef(false);
  
  const loadConfig = useCallback(async () => {
    if (!user?.id || operationRef.current) {
      console.log('❌ LoadConfig: condições não atendidas');
      return;
    }

    try {
      operationRef.current = true;
      setIsLoading(true);
      console.log('📥 Carregando configurações para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar configurações:', error);
        setConfig(defaultConfig);
        return;
      }

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
        console.log('ℹ️ Nenhuma configuração encontrada, usando padrão');
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
      operationRef.current = false;
    }
  }, [user?.id, setConfig, setIsLoading]);

  const saveConfigToDatabase = async (config: ClientConfig, userId: string, setIsLoading: (loading: boolean) => void) => {
    if (operationRef.current) {
      console.log('⏳ Operação já em andamento, pulando...');
      return;
    }

    try {
      operationRef.current = true;
      setIsLoading(true);
      console.log('💾 Salvando configurações para usuário:', userId);
      
      const { error } = await supabase
        .from('client_configs')
        .upsert({
          id: userId,
          whatsapp_config: config.whatsapp as any,
          openai_config: config.openai as any,
          firebase_config: config.firebase as any,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        throw error;
      }

      console.log('✅ Configurações salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      throw error;
    } finally {
      setIsLoading(false);
      operationRef.current = false;
    }
  };

  return {
    loadConfig,
    saveConfigToDatabase
  };
}
