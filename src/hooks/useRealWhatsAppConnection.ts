
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  token: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { config } = useClientConfig();
  const [isConnecting, setIsConnecting] = useState(false);

  // Obter configuração atual do WPPConnect
  const wppConfig: WPPConfig = {
    serverUrl: config?.whatsapp?.wppconnect?.serverUrl || 'http://localhost:21465',
    sessionName: config?.whatsapp?.wppconnect?.sessionName || '',
    token: config?.whatsapp?.wppconnect?.token || ''
  };

  // Verificar status da conexão
  const getConnectionStatus = useCallback(async () => {
    try {
      if (!wppConfig.serverUrl || !wppConfig.sessionName || !wppConfig.token) {
        console.log('⚠️ Configurações WPPConnect incompletas');
        return { connected: false, phone: '', qr: '' };
      }

      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📱 Status WPPConnect:', data);
        
        return {
          connected: data.status === 'CONNECTED' || data.state === 'CONNECTED',
          phone: data.phone || '',
          qr: data.qrcode || ''
        };
      }
      
      return { connected: false, phone: '', qr: '' };
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { connected: false, phone: '', qr: '' };
    }
  }, [wppConfig]);

  // Enviar mensagem
  const sendMessage = useCallback(async (to: string, message: string): Promise<boolean> => {
    try {
      console.log(`📤 [SEND] Enviando mensagem para ${to}: ${message}`);
      
      if (!wppConfig.serverUrl || !wppConfig.sessionName || !wppConfig.token) {
        console.error('❌ [SEND] Configurações WPPConnect não estão completas');
        toast({
          title: "Erro de Configuração",
          description: "Configure o WPPConnect nas configurações primeiro",
          variant: "destructive"
        });
        return false;
      }

      // Formatação do número para WPPConnect
      let phoneNumber = to.replace(/\D/g, '');
      if (!phoneNumber.includes('@')) {
        phoneNumber = phoneNumber + '@c.us';
      }

      console.log(`📞 [SEND] Número formatado: ${phoneNumber}`);

      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message
        })
      });

      console.log(`📡 [SEND] Resposta do servidor: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [SEND] Mensagem enviada com sucesso:', result);
        
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem enviada para ${to}`
        });
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ [SEND] Erro na resposta:', errorText);
        
        toast({
          title: "Erro ao enviar mensagem",
          description: `Erro ${response.status}: ${errorText}`,
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ [SEND] Erro no envio:', error);
      
      toast({
        title: "Erro no envio",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [wppConfig, toast]);

  // Processar webhook de mensagem recebida
  const processWebhookMessage = useCallback(async (webhookData: any) => {
    try {
      console.log('📥 [WEBHOOK] Processando webhook:', webhookData);
      
      // Aqui você pode implementar a lógica de processamento
      // Por enquanto, apenas registra que recebeu
      
      toast({
        title: "Mensagem recebida",
        description: "Webhook processado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar:', error);
      return false;
    }
  }, [toast]);

  return {
    wppConfig,
    isConnecting,
    getConnectionStatus,
    sendMessage,
    processWebhookMessage
  };
}
