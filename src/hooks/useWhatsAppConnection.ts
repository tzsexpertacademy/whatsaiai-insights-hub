
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  isChecking: boolean;
  lastChecked: string;
}

export function useWhatsAppConnection() {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    isChecking: false,
    lastChecked: ''
  });

  const checkConnection = useCallback(async (instanceId: string, apiToken: string) => {
    if (!instanceId || !apiToken) {
      console.log('❌ Credenciais não fornecidas');
      return { isConnected: false, phoneNumber: '' };
    }

    setConnectionState(prev => ({ ...prev, isChecking: true }));

    try {
      console.log('🔍 Verificando conexão GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Estado da instância:', data);

      const isConnected = data.stateInstance === 'authorized';
      let phoneNumber = '';

      if (isConnected) {
        try {
          const accountResponse = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/getWaSettings/${apiToken}`
          );
          
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            phoneNumber = accountData.wid?.replace('@c.us', '') || '';
          }
        } catch (error) {
          console.error('⚠️ Erro ao buscar número:', error);
        }
      }

      const newState = {
        isConnected,
        phoneNumber,
        isChecking: false,
        lastChecked: new Date().toISOString()
      };

      setConnectionState(newState);

      if (isConnected) {
        toast({
          title: "WhatsApp conectado!",
          description: `Número: ${phoneNumber}`
        });
      }

      return { isConnected, phoneNumber };

    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: '',
        isChecking: false
      }));

      toast({
        title: "Erro de conexão",
        description: "Não foi possível verificar o status",
        variant: "destructive"
      });

      return { isConnected: false, phoneNumber: '' };
    }
  }, [toast]);

  return {
    connectionState,
    checkConnection
  };
}
