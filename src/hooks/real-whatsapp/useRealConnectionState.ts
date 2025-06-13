
import { useState, useEffect } from 'react';

interface ConnectionState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  lastConnected: string;
  sessionId: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export function useRealConnectionState() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    lastConnected: '',
    sessionId: '',
    status: 'disconnected'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('real_whatsapp_connection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConnectionState(parsed);
      } catch (error) {
        console.log('Erro ao carregar estado salvo:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (connectionState.isConnected || connectionState.qrCode) {
      localStorage.setItem('real_whatsapp_connection', JSON.stringify(connectionState));
    }
  }, [connectionState]);

  return {
    connectionState,
    setConnectionState,
    isLoading,
    setIsLoading
  };
}
