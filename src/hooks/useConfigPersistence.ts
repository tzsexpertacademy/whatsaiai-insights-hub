
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
  
  const createInitialConfig = async () => {
    if (!user?.id) return;

    try {
      console.log('🆕 Criando configuração inicial para usuário:', user.id);
      
      const { error } = await supabase
        .from('client_configs')
        .insert({
          user_id: user.id,
          whatsapp_config: defaultConfig.whatsapp as any,
          openai_config: defaultConfig.openai as any,
          firebase_config: defaultConfig.firebase as any
        });

      if (error) {
        console.error('❌ Erro ao criar configuração inicial:', error);
        throw error;
      }

      console.log('✅ Configuração inicial criada com sucesso');
    } catch (error) {
      console.error('❌ Falha ao criar configuração inicial:', error);
    }
  };

  const loadConfig = useCallback(async () => {
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
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        setConfig(defaultConfig);
        return;
      }

      if (!data) {
        console.log('ℹ️ Nenhuma configuração encontrada, criando registro inicial...');
        await createInitialConfig();
        setConfig(defaultConfig);
        return;
      }

      console.log('✅ Configurações carregadas com sucesso');

      const loadedConfig = {
        whatsapp: { ...defaultConfig.whatsapp, ...(data.whatsapp_config as any || {}) },
        openai: { ...defaultConfig.openai, ...(data.openai_config as any || {}) },
        firebase: { ...defaultConfig.firebase, ...(data.firebase_config as any || {}) }
      };

      setConfig(loadedConfig);

    } catch (error) {
      console.error('❌ Erro inesperado ao carregar configurações:', error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setConfig, setIsLoading]);

  const saveConfigToDatabase = async (config: ClientConfig, userId: string, setIsLoading: (loading: boolean) => void) => {
    try {
      setIsLoading(true);
      console.log('💾 Salvando configurações para usuário:', userId);
      
      const { data: existingConfig } = await supabase
        .from('client_configs')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      let result;
      
      if (existingConfig) {
        result = await supabase
          .from('client_configs')
          .update({
            whatsapp_config: config.whatsapp as any,
            openai_config: config.openai as any,
            firebase_config: config.firebase as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);
      } else {
        result = await supabase
          .from('client_configs')
          .insert({
            user_id: userId,
            whatsapp_config: config.whatsapp as any,
            openai_config: config.openai as any,
            firebase_config: config.firebase as any
          });
      }

      if (result.error) {
        console.error('❌ Erro ao salvar configurações:', result.error);
        throw result.error;
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
