
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommercialClientConfig {
  id?: string;
  user_id?: string;
  commercial_whatsapp_config?: any;
  commercial_openai_config?: any;
  commercial_firebase_config?: any;
  created_at?: string;
  updated_at?: string;
}

export function useCommercialClientConfig() {
  const [config, setConfig] = useState<CommercialClientConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadConfig = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔧 Carregando configuração comercial para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar configuração comercial:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Configuração comercial carregada:', data);
        // Extrair configurações comerciais dos campos existentes
        const commercialConfig = {
          id: data.id,
          user_id: data.user_id,
          commercial_whatsapp_config: data.whatsapp_config?.commercial || {},
          commercial_openai_config: data.openai_config?.commercial || {},
          commercial_firebase_config: data.firebase_config?.commercial || {},
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setConfig(commercialConfig);
      } else {
        console.log('📝 Criando configuração comercial inicial...');
        const newConfig = {
          user_id: user.id,
          whatsapp_config: { commercial: {} },
          openai_config: { commercial: {} },
          firebase_config: { commercial: {} }
        };

        const { data: created, error: createError } = await supabase
          .from('client_configs')
          .insert([newConfig])
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar configuração comercial:', createError);
          throw createError;
        }

        const commercialConfig = {
          id: created.id,
          user_id: created.user_id,
          commercial_whatsapp_config: {},
          commercial_openai_config: {},
          commercial_firebase_config: {},
          created_at: created.created_at,
          updated_at: created.updated_at
        };
        setConfig(commercialConfig);
      }
    } catch (error) {
      console.error('❌ Erro no hook de configuração comercial:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações comerciais",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<CommercialClientConfig>) => {
    if (!user?.id || !config?.id) return;

    try {
      console.log('🔄 Atualizando configuração comercial:', updates);
      
      // Buscar a configuração atual primeiro
      const { data: currentData } = await supabase
        .from('client_configs')
        .select('*')
        .eq('id', config.id)
        .single();

      if (!currentData) throw new Error('Configuração não encontrada');

      // Mesclar as atualizações com a configuração existente
      const updatedWhatsappConfig = {
        ...currentData.whatsapp_config,
        commercial: updates.commercial_whatsapp_config || currentData.whatsapp_config?.commercial || {}
      };

      const updatedOpenAIConfig = {
        ...currentData.openai_config,
        commercial: updates.commercial_openai_config || currentData.openai_config?.commercial || {}
      };

      const updatedFirebaseConfig = {
        ...currentData.firebase_config,
        commercial: updates.commercial_firebase_config || currentData.firebase_config?.commercial || {}
      };

      const { data, error } = await supabase
        .from('client_configs')
        .update({
          whatsapp_config: updatedWhatsappConfig,
          openai_config: updatedOpenAIConfig,
          firebase_config: updatedFirebaseConfig
        })
        .eq('id', config.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar configuração comercial:', error);
        throw error;
      }

      console.log('✅ Configuração comercial atualizada:', data);
      
      const commercialConfig = {
        id: data.id,
        user_id: data.user_id,
        commercial_whatsapp_config: data.whatsapp_config?.commercial || {},
        commercial_openai_config: data.openai_config?.commercial || {},
        commercial_firebase_config: data.firebase_config?.commercial || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setConfig(commercialConfig);
      return commercialConfig;
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração comercial:', error);
      toast({
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar as configurações comerciais",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    loadConfig();
  }, [user?.id]);

  return {
    config,
    isLoading,
    updateConfig,
    reloadConfig: loadConfig
  };
}
