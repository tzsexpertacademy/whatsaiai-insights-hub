
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientConfig, defaultConfig } from '@/types/clientConfig';

interface UseConfigPersistenceReturn {
  loadConfig: (userId: string) => Promise<ClientConfig>;
  saveConfig: (config: ClientConfig, userId: string) => Promise<void>;
}

export function useConfigPersistence(): UseConfigPersistenceReturn {
  const loadConfig = useCallback(async (userId: string): Promise<ClientConfig> => {
    console.log('📥 Carregando configurações para usuário:', userId);
    
    const { data, error } = await supabase
      .from('client_configs')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao carregar config:', error);
      throw error;
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
      console.log('✅ Configurações carregadas');
      return loadedConfig;
    } else {
      console.log('ℹ️ Criando configuração inicial');
      
      const { error: insertError } = await supabase
        .from('client_configs')
        .insert({
          id: userId,
          whatsapp_config: defaultConfig.whatsapp as any,
          openai_config: defaultConfig.openai as any,
          firebase_config: defaultConfig.firebase as any
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar config:', insertError);
        throw insertError;
      }
      
      return defaultConfig;
    }
  }, []);

  const saveConfig = useCallback(async (config: ClientConfig, userId: string): Promise<void> => {
    console.log('💾 Salvando configurações...');
    
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
      console.error('❌ Erro ao salvar:', error);
      throw error;
    }
    
    console.log('✅ Configurações salvas');
  }, []);

  return {
    loadConfig,
    saveConfig
  };
}
