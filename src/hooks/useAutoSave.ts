
import { useEffect, useRef } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function useAutoSave() {
  const { config, saveConfig } = useClientConfig();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const configString = JSON.stringify(config);
    
    // Pular o primeiro carregamento para evitar auto-save desnecessário
    if (isInitialLoad.current) {
      lastConfigRef.current = configString;
      isInitialLoad.current = false;
      return;
    }
    
    // Só salvar se a configuração mudou e não está salvando
    if (configString === lastConfigRef.current || isSavingRef.current) {
      return;
    }
    
    lastConfigRef.current = configString;

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-save após 3 segundos
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        await saveConfig();
        console.log('✅ Auto-save realizado');
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
      console.log('✅ Save manual realizado');
    } catch (error) {
      console.error('❌ Erro no save manual:', error);
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  };

  return { forceSave };
}
