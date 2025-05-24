
import { useState, useCallback, useEffect } from 'react';
import { ClientConfig } from '@/types/clientConfig';

export function useFirebaseTest() {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar conexão automaticamente quando config muda
  const checkConnectionStatus = useCallback(async (config: ClientConfig): Promise<boolean> => {
    const { projectId, apiKey, databaseURL } = config.firebase;
    
    if (!projectId || !apiKey || !databaseURL) {
      setIsFirebaseConnected(false);
      return false;
    }

    setIsLoading(true);
    try {
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      const response = await fetch(testUrl, { method: 'GET' });
      const connected = response.ok || response.status === 401; // 401 significa que está conectado mas precisa de auth
      
      setIsFirebaseConnected(connected);
      return connected;
    } catch (error) {
      console.error('❌ Erro de conexão Firebase:', error);
      setIsFirebaseConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testFirebaseConnection = useCallback(async (config: ClientConfig): Promise<boolean> => {
    return await checkConnectionStatus(config);
  }, [checkConnectionStatus]);

  return {
    isFirebaseConnected,
    isLoading,
    testFirebaseConnection,
    checkConnectionStatus
  };
}
