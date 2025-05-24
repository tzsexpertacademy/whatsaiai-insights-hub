
import { useEffect, useRef } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function useAutoSave() {
  const { config, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-save após 3 segundos de inatividade
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveConfig();
        console.log('✅ Configurações salvas automaticamente');
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config, saveConfig]);

  const forceSave = async () => {
    try {
      await saveConfig();
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram salvas no seu perfil"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  };

  return { forceSave };
}
