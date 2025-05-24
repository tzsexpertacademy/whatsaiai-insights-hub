
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
      
      // Primeiro, tentar buscar pelo user_id
      let { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Se não encontrar pelo user_id, tentar pelo id (fallback)
      if (!data && !error) {
        console.log('🔄 Tentando buscar configuração pelo campo id...');
        const fallbackResult = await supabase
          .from('client_configs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

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
        // Tentar criar com user_id primeiro
        try {
          await supabase
            .from('client_configs')
            .insert([{
              user_id: user.id,
              whatsapp_config: defaultConfig.whatsapp,
              openai_config: defaultConfig.openai,
              firebase_config: defaultConfig.firebase
            }]);
        } catch (insertError) {
          console.log('🔄 Tentando inserir com campo id...');
          // Fallback para id se user_id não funcionar
          await supabase
            .from('client_configs')
            .insert([{
              id: user.id,
              whatsapp_config: defaultConfig.whatsapp,
              openai_config: defaultConfig.openai,
              firebase_config: defaultConfig.firebase
            }]);
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
      
      const configData = {
        whatsapp_config: config.whatsapp,
        openai_config: config.openai,
        firebase_config: config.firebase,
        updated_at: new Date().toISOString()
      };

      // Tentar salvar com user_id primeiro
      let { error } = await supabase
        .from('client_configs')
        .upsert([{
          user_id: userId,
          ...configData
        }]);

      // Se falhar, tentar com id
      if (error) {
        console.log('🔄 Tentando salvar com campo id...');
        const fallbackResult = await supabase
          .from('client_configs')
          .upsert([{
            id: userId,
            ...configData
          }]);
        
        error = fallbackResult.error;
      }

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
