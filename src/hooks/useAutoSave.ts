
import { useEffect, useRef } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function useAutoSave() {
  const { config, saveConfig } = useClientConfig();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const isInitialLoad = useRef(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    
    const configString = JSON.stringify(config);
    
    // Pular o primeiro carregamento
    if (isInitialLoad.current) {
      lastConfigRef.current = configString;
      isInitialLoad.current = false;
      return;
    }
    
    // Só salvar se mudou e não está salvando
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
      if (!mountedRef.current || isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        await saveConfig();
        console.log('✅ Auto-save realizado');
      } catch (error) {
        console.error('❌ Erro no auto-save:', error);
      } finally {
        if (mountedRef.current) {
          isSavingRef.current = false;
        }
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config, saveConfig]);

  const forceSave = async () => {
    if (!mountedRef.current || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await saveConfig();
      console.log('✅ Save manual realizado');
    } catch (error) {
      console.error('❌ Erro no save manual:', error);
      throw error;
    } finally {
      if (mountedRef.current) {
        isSavingRef.current = false;
      }
    }
  };

  return { forceSave };
}
