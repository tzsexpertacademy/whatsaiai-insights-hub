
import { useCallback } from 'react';
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
  
  const loadConfig = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ LoadConfig: user.id não disponível');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📥 Carregando configurações para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('user_id', user.id)
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
        const { error: insertError } = await supabase
          .from('client_configs')
          .insert({
            user_id: user.id,
            whatsapp_config: defaultConfig.whatsapp as any,
            openai_config: defaultConfig.openai as any,
            firebase_config: defaultConfig.firebase as any
          });
        
        if (insertError) {
          console.error('❌ Erro ao criar configuração:', insertError);
        }
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setConfig, setIsLoading]);

  const saveConfigToDatabase = async (config: ClientConfig, userId: string, setIsLoading: (loading: boolean) => void) => {
    try {
      setIsLoading(true);
      console.log('💾 Salvando configurações para usuário:', userId);
      
      const { error } = await supabase
        .from('client_configs')
        .upsert({
          user_id: userId,
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
    }
  };

  return {
    loadConfig,
    saveConfigToDatabase
  };
}
