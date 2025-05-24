
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
          whatsapp_config: defaultConfig.whatsapp,
          openai_config: defaultConfig.openai,
          firebase_config: defaultConfig.firebase
        });

      if (error) {
        console.error('❌ Erro ao criar configuração inicial:', error);
        throw error;
      }

      console.log('✅ Configuração inicial criada com sucesso');
    } catch (error) {
      console.error('❌ Falha ao criar configuração inicial:', error);
      toast({
        title: "Erro de inicialização",
        description: "Não foi possível criar as configurações iniciais",
        variant: "destructive"
      });
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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Nenhuma configuração encontrada, criando registro inicial...');
          await createInitialConfig();
          return;
        }
        console.error('❌ Erro ao carregar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Usando configurações padrão",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('✅ Configurações carregadas com sucesso:', {
          hasWhatsApp: !!data.whatsapp_config,
          hasOpenAI: !!data.openai_config,
          hasFirebase: !!data.firebase_config
        });

        const loadedConfig = {
          whatsapp: { ...defaultConfig.whatsapp, ...(data.whatsapp_config as any || {}) },
          openai: { ...defaultConfig.openai, ...(data.openai_config as any || {}) },
          firebase: { ...defaultConfig.firebase, ...(data.firebase_config as any || {}) }
        };

        setConfig(loadedConfig);

        toast({
          title: "Configurações carregadas",
          description: "Suas configurações foram restauradas com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar configurações:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setConfig, setIsLoading, toast]);

  const saveConfigToDatabase = async (config: ClientConfig, userId: string, setIsLoading: (loading: boolean) => void) => {
    try {
      setIsLoading(true);
      console.log('💾 Salvando configurações para usuário:', userId);
      console.log('📋 Dados a salvar:', {
        whatsapp: Object.keys(config.whatsapp).length,
        openai: Object.keys(config.openai).length,
        firebase: Object.keys(config.firebase).length
      });
      
      const { error } = await supabase
        .from('client_configs')
        .upsert({
          user_id: userId,
          whatsapp_config: config.whatsapp,
          openai_config: config.openai,
          firebase_config: config.firebase,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        throw error;
      }

      console.log('✅ Configurações salvas com sucesso!');
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso e não serão perdidas"
      });
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
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
