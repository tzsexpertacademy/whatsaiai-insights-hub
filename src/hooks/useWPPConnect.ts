
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

interface SessionStatus {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  sessionId: string;
  lastConnected: string;
}

export function useWPPConnect() {
  const { toast } = useToast();
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    sessionId: '',
    lastConnected: ''
  });

  const getWPPConfig = (): WPPConfig => {
    try {
      const config = {
        sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
        serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
        secretKey: localStorage.getItem('wpp_secret_key') || 'THISISMYSECURETOKEN',
        token: localStorage.getItem('wpp_token') || '',
        webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
      };
      
      console.log('🔧 Config WPPConnect carregado:', {
        ...config,
        secretKey: config.secretKey ? '***HIDDEN***' : 'NOT_SET',
        token: config.token ? '***HIDDEN***' : 'NOT_SET'
      });
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao carregar config WPPConnect:', error);
      return {
        sessionName: 'NERDWHATS_AMERICA',
        serverUrl: 'http://localhost:21465',
        secretKey: 'THISISMYSECURETOKEN',
        token: '',
        webhookUrl: ''
      };
    }
  };

  const saveWPPConfig = (config: WPPConfig) => {
    try {
      localStorage.setItem('wpp_session_name', config.sessionName);
      localStorage.setItem('wpp_server_url', config.serverUrl);
      localStorage.setItem('wpp_secret_key', config.secretKey);
      localStorage.setItem('wpp_token', config.token);
      localStorage.setItem('wpp_webhook_url', config.webhookUrl || '');
      
      console.log('💾 Config WPPConnect salvo:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        secretKey: config.secretKey ? '***HIDDEN***' : 'NOT_SET',
        token: config.token ? '***HIDDEN***' : 'NOT_SET',
        webhookUrl: config.webhookUrl
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar config WPPConnect:', error);
      return false;
    }
  };

  const createSession = async (): Promise<string | null> => {
    const config = getWPPConfig();
    
    if (!config.secretKey || config.secretKey === 'THISISMYSECURETOKEN') {
      toast({
        title: "❌ Secret Key não configurado",
        description: "Configure o Secret Key primeiro",
        variant: "destructive"
      });
      return null;
    }

    if (!config.token) {
      toast({
        title: "❌ Token não configurado",
        description: "Configure o Token da sessão primeiro",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('🔄 Criando sessão WPPConnect...');
      
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          session: config.sessionName,
          webhookUrl: config.webhookUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.qrcode) {
        setSessionStatus(prev => ({
          ...prev,
          qrCode: data.qrcode,
          sessionId: config.sessionName
        }));
        
        return data.qrcode;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      throw error;
    }
  };

  const checkSessionStatus = async (): Promise<boolean> => {
    const config = getWPPConfig();
    
    if (!config.secretKey || !config.token) {
      return false;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/check-connection-session`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.connected || data.status === 'connected') {
        setSessionStatus(prev => ({
          ...prev,
          isConnected: true,
          phoneNumber: data.phoneNumber || data.number || 'Conectado',
          lastConnected: new Date().toISOString()
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  };

  const disconnect = async () => {
    const config = getWPPConfig();
    
    if (config.secretKey && config.token) {
      try {
        await fetch(`${config.serverUrl}/api/${config.sessionName}/close-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.secretKey}`,
            'X-Session-Token': config.token
          }
        });
      } catch (error) {
        console.log('Erro ao fechar sessão:', error);
      }
    }

    setSessionStatus({
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      sessionId: '',
      lastConnected: ''
    });
  };

  return {
    sessionStatus,
    getWPPConfig,
    saveWPPConfig,
    createSession,
    checkSessionStatus,
    disconnect
  };
}
