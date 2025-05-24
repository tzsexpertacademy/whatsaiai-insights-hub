
import { useEffect, useRef } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function useAutoSave() {
  const { config, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<string>('');
  const isSavingRef = useRef(false);

  useEffect(() => {
    const configString = JSON.stringify(config);
    
    // Só executar se a configuração realmente mudou e não está salvando
    if (configString === lastConfigRef.current || isSavingRef.current) {
      return;
    }
    
    lastConfigRef.current = configString;

    // Clear timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-save após 3 segundos de inatividade
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        await saveConfig();
        console.log('✅ Configurações salvas automaticamente');
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config, saveConfig]);

  const forceSave = async () => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
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
    } finally {
      isSavingRef.current = false;
    }
  };

  return { forceSave };
}
