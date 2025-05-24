
import { useState, useCallback } from 'react';
import { ClientConfig } from '@/types/clientConfig';

export function useFirebaseTest() {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const testFirebaseConnection = useCallback(async (config: ClientConfig): Promise<boolean> => {
    const { projectId, apiKey, databaseURL } = config.firebase;
    
    if (!projectId || !apiKey || !databaseURL) {
      setIsFirebaseConnected(false);
      return false;
    }

    try {
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      const response = await fetch(testUrl, { method: 'GET' });
      const connected = response.ok;
      setIsFirebaseConnected(connected);
      return connected;
    } catch (error) {
      console.error('❌ Erro de conexão Firebase:', error);
      setIsFirebaseConnected(false);
      return false;
    }
  }, []);

  return {
    isFirebaseConnected,
    testFirebaseConnection
  };
}
