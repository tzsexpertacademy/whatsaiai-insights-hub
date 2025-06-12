
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WPPConnectConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  webhookUrl: string;
}

interface SessionStatus {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export function useWPPConnect() {
  const { toast } = useToast();
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    status: 'disconnected'
  });

  const getWPPConfig = useCallback((): WPPConnectConfig => {
    try {
      return {
        serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
        sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
        secretKey: localStorage.getItem('wpp_secret_key') || 'THISISMYSECURETOKEN',
        webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
      };
    } catch (error) {
      console.error('Erro ao carregar config WPPConnect:', error);
      return {
        serverUrl: 'http://localhost:21465',
        sessionName: 'NERDWHATS_AMERICA',
        secretKey: 'THISISMYSECURETOKEN',
        webhookUrl: ''
      };
    }
  }, []);

  const saveWPPConfig = useCallback((config: WPPConnectConfig) => {
    try {
      localStorage.setItem('wpp_server_url', config.serverUrl);
      localStorage.setItem('wpp_session_name', config.sessionName);
      localStorage.setItem('wpp_secret_key', config.secretKey);
      localStorage.setItem('wpp_webhook_url', config.webhookUrl);
      
      toast({
        title: "Configuração salva",
        description: "Configurações do WPPConnect foram salvas"
      });
    } catch (error) {
      console.error('Erro ao salvar config:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createSession = useCallback(async () => {
    const config = getWPPConfig();
    
    if (!config.secretKey || config.secretKey === 'THISISMYSECURETOKEN') {
      toast({
        title: "Token necessário",
        description: "Configure um token válido do WPPConnect",
        variant: "destructive"
      });
      return;
    }

    setSessionStatus(prev => ({ ...prev, status: 'connecting' }));

    try {
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      
      setSessionStatus({
        isConnected: data.success || false,
        phoneNumber: data.phoneNumber || '',
        qrCode: data.qrcode || '',
        status: data.success ? 'connected' : 'disconnected'
      });

      toast({
        title: data.success ? "Sessão criada" : "Erro na sessão",
        description: data.message || "Verifique o WPPConnect Server"
      });

    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      setSessionStatus(prev => ({ ...prev, status: 'error' }));
      
      toast({
        title: "Erro de conexão",
        description: "Verifique se o WPPConnect Server está rodando",
        variant: "destructive"
      });
    }
  }, [getWPPConfig, toast]);

  const checkSessionStatus = useCallback(async () => {
    const config = getWPPConfig();
    
    try {
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/check-connection-session`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStatus(prev => ({
          ...prev,
          isConnected: data.connected || false,
          status: data.connected ? 'connected' : 'disconnected'
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  }, [getWPPConfig]);

  const disconnect = useCallback(async () => {
    const config = getWPPConfig();
    
    try {
      await fetch(`${config.serverUrl}/api/${config.sessionName}/logout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      });

      setSessionStatus({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        status: 'disconnected'
      });

      toast({
        title: "Desconectado",
        description: "Sessão WPPConnect encerrada"
      });

    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, [getWPPConfig, toast]);

  return {
    sessionStatus,
    getWPPConfig,
    saveWPPConfig,
    createSession,
    checkSessionStatus,
    disconnect
  };
}
