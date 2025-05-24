
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
        
        // Fazer casting seguro das configurações JSON
        const whatsappConfig = data.whatsapp_config as any || {};
        const openaiConfig = data.openai_config as any || {};
        const firebaseConfig = data.firebase_config as any || {};
        
        // Extrair configurações comerciais dos campos existentes
        const commercialConfig = {
          id: data.id,
          user_id: data.user_id,
          commercial_whatsapp_config: whatsappConfig.commercial || {},
          commercial_openai_config: openaiConfig.commercial || {},
          commercial_firebase_config: firebaseConfig.commercial || {},
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

      // Fazer casting seguro dos dados atuais
      const currentWhatsapp = currentData.whatsapp_config as any || {};
      const currentOpenAI = currentData.openai_config as any || {};
      const currentFirebase = currentData.firebase_config as any || {};

      // Mesclar as atualizações com a configuração existente
      const updatedWhatsappConfig = {
        ...currentWhatsapp,
        commercial: updates.commercial_whatsapp_config || currentWhatsapp.commercial || {}
      };

      const updatedOpenAIConfig = {
        ...currentOpenAI,
        commercial: updates.commercial_openai_config || currentOpenAI.commercial || {}
      };

      const updatedFirebaseConfig = {
        ...currentFirebase,
        commercial: updates.commercial_firebase_config || currentFirebase.commercial || {}
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
      
      // Fazer casting seguro dos dados atualizados
      const updatedWhatsapp = data.whatsapp_config as any || {};
      const updatedOpenai = data.openai_config as any || {};
      const updatedFirebaseData = data.firebase_config as any || {};
      
      const commercialConfig = {
        id: data.id,
        user_id: data.user_id,
        commercial_whatsapp_config: updatedWhatsapp.commercial || {},
        commercial_openai_config: updatedOpenai.commercial || {},
        commercial_firebase_config: updatedFirebaseData.commercial || {},
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
