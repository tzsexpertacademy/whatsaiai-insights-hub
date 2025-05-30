
import { useState, useCallback } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConfig {
  instanceId: string;
  apiToken: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

export function useWhatsAppConfig() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const whatsappConfig: WhatsAppConfig = {
    instanceId: config?.whatsapp?.greenapi?.instanceId || '',
    apiToken: config?.whatsapp?.greenapi?.apiToken || '',
    phoneNumber: config?.whatsapp?.greenapi?.phoneNumber || '',
    webhookUrl: config?.whatsapp?.greenapi?.webhookUrl || ''
  };

  const updateWhatsAppConfig = useCallback(async (newConfig: Partial<WhatsAppConfig>) => {
    setIsSaving(true);
    
    try {
      console.log('🔧 Salvando configuração WhatsApp:', newConfig);
      
      const updatedWhatsApp = {
        ...config?.whatsapp,
        greenapi: {
          ...config?.whatsapp?.greenapi,
          ...newConfig
        }
      };

      console.log('🔧 Configuração final:', updatedWhatsApp);
      
      updateConfig('whatsapp', updatedWhatsApp);
      await saveConfig();

      toast({
        title: "Configuração salva!",
        description: "Credenciais GREEN-API foram atualizadas"
      });

      console.log('✅ Configuração salva com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config, updateConfig, saveConfig, toast]);

  return {
    whatsappConfig,
    updateWhatsAppConfig,
    isSaving
  };
}
