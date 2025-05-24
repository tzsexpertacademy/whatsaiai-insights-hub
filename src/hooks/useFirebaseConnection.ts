
import { useState, useCallback } from 'react';
import { FirebaseConfig } from '@/types/clientConfig';

export function useFirebaseConnection(firebaseConfig: FirebaseConfig) {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const testFirebaseConnection = useCallback(async (): Promise<boolean> => {
    const { projectId, apiKey, databaseURL } = firebaseConfig;
    
    if (!projectId || !apiKey) {
      console.log('Firebase - Campos obrigatórios ausentes');
      setIsFirebaseConnected(false);
      return false;
    }

    try {
      const cleanUrl = databaseURL.replace(/\/$/, '');
      const testUrl = `${cleanUrl}/.json?auth=${apiKey}`;
      
      console.log('Firebase - Testando conexão:', testUrl);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Firebase - Status da resposta:', response.status);
      
      if (response.status === 404) {
        console.log('Firebase - Project ID não encontrado');
        setIsFirebaseConnected(false);
        return false;
      }

      if (response.status === 401) {
        console.log('Firebase - API Key inválida ou com restrições');
        setIsFirebaseConnected(false);
        return false;
      }

      if (response.status === 403) {
        console.log('Firebase - Acesso negado - verificar regras');
        setIsFirebaseConnected(false);
        return false;
      }

      console.log('Firebase - Conexão bem-sucedida!');
      setIsFirebaseConnected(true);
      return true;
      
    } catch (error) {
      console.error('Firebase - Erro de rede:', error);
      setIsFirebaseConnected(false);
      return false;
    }
  }, [firebaseConfig]);

  return {
    isFirebaseConnected,
    testFirebaseConnection
  };
}
