
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    
    const configString = JSON.stringify(config);
    
    // Skip initial load
    if (isInitialLoad.current) {
      lastConfigRef.current = configString;
      isInitialLoad.current = false;
      return;
    }
    
    // Only save if changed and not saving
    if (configString === lastConfigRef.current || isSavingRef.current) {
      return;
    }
    
    lastConfigRef.current = configString;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-save after 3 seconds
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
