
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWPPConfig } from './useWPPConfig';

interface SessionStatus {
  isConnected: boolean;
  qrCode: string | null;
  isLoading: boolean;
  phoneNumber: string | null;
}

export function useWPPStatus() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: null,
    isLoading: false,
    phoneNumber: null
  });
  
  const { toast } = useToast();
  const { getWPPConfig } = useWPPConfig();

  const getConnectionStatus = useCallback(() => {
    console.log('🔍 getConnectionStatus chamado - isConnected:', sessionStatus.isConnected);
    if (!sessionStatus.isConnected) return 'disconnected';
    return 'connected';
  }, [sessionStatus.isConnected]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 [DEBUG] Verificando status da conexão WPPConnect...');
      const config = getWPPConfig();
      
      console.log('🔑 [DEBUG] Configuração carregada:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        hasToken: !!config.token,
        hasSecretKey: !!config.secretKey,
        tokenLength: config.token?.length || 0
      });
      
      if (!config.token || !config.secretKey) {
        console.log('⚠️ [DEBUG] Token ou Secret Key não configurados');
        setSessionStatus({
          isConnected: false,
          qrCode: null,
          isLoading: false,
          phoneNumber: null
        });
        return false;
      }

      // Primeiro, testar se o servidor está rodando
      const serverTestUrl = `${config.serverUrl}/api/status`;
      try {
        const serverResponse = await fetch(serverTestUrl, {
          method: 'GET'
        });
        console.log('🔍 [DEBUG] Teste do servidor:', serverResponse.status);
      } catch (serverError) {
        console.log('❌ [DEBUG] Servidor WPPConnect não está rodando:', config.serverUrl);
        toast({
          title: "❌ Servidor WPPConnect não encontrado",
          description: `Verifique se o WPPConnect está rodando em ${config.serverUrl}`,
          variant: "destructive"
        });
        return false;
      }

      // Testar múltiplos endpoints para verificar status
      const statusEndpoints = [
        `${config.serverUrl}/api/${config.sessionName}/status-session`,
        `${config.serverUrl}/api/${config.sessionName}/check-connection-session`,
        `${config.serverUrl}/api/${config.sessionName}/status`
      ];

      for (const endpoint of statusEndpoints) {
        try {
          console.log('🎯 [DEBUG] Testando endpoint:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📊 [DEBUG] Response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('📋 [DEBUG] Response body:', result);

            const isConnected = result.status === 'CONNECTED' || 
                               result.state === 'CONNECTED' || 
                               result.connected === true ||
                               result.status === 'inChat' ||
                               result.session?.state === 'CONNECTED';

            console.log('✅ [DEBUG] Status detectado:', {
              isConnected,
              rawStatus: result.status,
              rawState: result.state,
              rawConnected: result.connected,
              sessionState: result.session?.state
            });

            if (isConnected) {
              console.log('🎉 [DEBUG] WhatsApp conectado detectado!');
              setSessionStatus({
                isConnected: true,
                qrCode: null,
                isLoading: false,
                phoneNumber: result.phoneNumber || result.phone || result.number || result.session?.me || 'Conectado'
              });
              
              toast({
                title: "✅ WhatsApp conectado!",
                description: "Conexão detectada com sucesso"
              });
              
              return true;
            }
          } else {
            const errorText = await response.text();
            console.log('❌ [DEBUG] Erro no endpoint:', endpoint, 'Status:', response.status, 'Error:', errorText);
          }
        } catch (endpointError) {
          console.log('❌ [DEBUG] Erro ao testar endpoint:', endpoint, 'Error:', endpointError);
          continue;
        }
      }

      console.log('❌ [DEBUG] Nenhum endpoint retornou conexão ativa');
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      return false;

    } catch (error) {
      console.error('❌ [DEBUG] Erro geral ao verificar status:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      return false;
    }
  }, [getWPPConfig, toast]);

  const generateQRCode = useCallback(async () => {
    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code WPPConnect...');
      const config = getWPPConfig();
      
      if (!config.token || !config.secretKey) {
        throw new Error('Token ou Secret Key não configurados');
      }

      // Primeiro verificar se já está conectado
      const isAlreadyConnected = await checkConnectionStatus();
      if (isAlreadyConnected) {
        setSessionStatus(prev => ({ ...prev, isLoading: false }));
        return null;
      }
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/start-session`;
      console.log('🎯 Endpoint start session:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify({
          webhook: config.webhookUrl || undefined,
          waitQrCode: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta start session:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta start session:', result);

      if (result.status === 'CONNECTED' || result.connected) {
        setSessionStatus({
          isConnected: true,
          qrCode: null,
          isLoading: false,
          phoneNumber: result.phoneNumber || 'Conectado'
        });
        
        toast({
          title: "✅ Já conectado!",
          description: "WhatsApp já estava conectado"
        });
        
        return null;
      } else if (result.qrcode || result.qr) {
        const qrCodeData = result.qrcode || result.qr;
        console.log('📱 QR Code recebido');

        setSessionStatus({
          isConnected: false,
          qrCode: qrCodeData,
          isLoading: false,
          phoneNumber: null
        });

        // Iniciar verificação automática de status
        startConnectionPolling();
        
        return qrCodeData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      toast({
        title: "❌ Erro na conexão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    }
  }, [toast, getWPPConfig, checkConnectionStatus]);

  const startConnectionPolling = useCallback(() => {
    console.log('🔄 Iniciando verificação automática de conexão...');
    
    let attempts = 0;
    const maxAttempts = 30; // 30 tentativas = 1.5 minutos
    
    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Tentativa ${attempts}/${maxAttempts} de verificar conexão`);
      
      const isConnected = await checkConnectionStatus();
      
      if (isConnected) {
        console.log('✅ Conexão estabelecida, parando verificação');
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.log('⏰ Tempo limite atingido, parando verificação');
        clearInterval(interval);
        toast({
          title: "⏰ Tempo limite",
          description: "QR Code expirou. Gere um novo QR Code.",
          variant: "destructive"
        });
        setSessionStatus(prev => ({ ...prev, qrCode: null }));
      }
    }, 3000); // Verificar a cada 3 segundos
    
    // Cleanup em caso de unmount
    return () => clearInterval(interval);
  }, [checkConnectionStatus, toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      console.log('🔌 Desconectando WhatsApp...');
      
      const config = getWPPConfig();
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/close-session`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      
      toast({
        title: "🔌 Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "❌ Erro ao desconectar",
        description: "Não foi possível desconectar",
        variant: "destructive"
      });
    }
  }, [toast, getWPPConfig]);

  return {
    sessionStatus,
    setSessionStatus,
    getConnectionStatus,
    checkConnectionStatus,
    generateQRCode,
    disconnectWhatsApp
  };
}
