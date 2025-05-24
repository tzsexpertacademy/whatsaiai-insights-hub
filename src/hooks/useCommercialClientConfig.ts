
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommercialClientConfig {
  id?: string;
  user_id?: string;
  whatsapp_config?: any;
  openai_config?: any;
  firebase_config?: any;
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
        .from('commercial_client_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar configuração comercial:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Configuração comercial carregada:', data);
        setConfig(data);
      } else {
        console.log('📝 Criando configuração comercial inicial...');
        const newConfig = {
          user_id: user.id,
          whatsapp_config: {},
          openai_config: {},
          firebase_config: {}
        };

        const { data: created, error: createError } = await supabase
          .from('commercial_client_configs')
          .insert([newConfig])
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar configuração comercial:', createError);
          throw createError;
        }

        setConfig(created);
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
      
      const { data, error } = await supabase
        .from('commercial_client_configs')
        .update(updates)
        .eq('id', config.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar configuração comercial:', error);
        throw error;
      }

      console.log('✅ Configuração comercial atualizada:', data);
      setConfig(data);
      
      return data;
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
