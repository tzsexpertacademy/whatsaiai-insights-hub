
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface QRCodeState {
  qrCode: string;
  isConnected: boolean;
  phoneNumber: string;
  sessionId: string;
  isGenerating: boolean;
  lastConnected: string;
}

export function useWhatsAppQRCode() {
  const [qrState, setQRState] = useState<QRCodeState>({
    qrCode: '',
    isConnected: false,
    phoneNumber: '',
    sessionId: '',
    isGenerating: false,
    lastConnected: ''
  });
  
  const { toast } = useToast();
  const { config, updateConfig, saveConfig } = useClientConfig();

  // Carregar estado do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('whatsapp_qr_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setQRState(parsed);
      
      // Atualizar config se conectado
      if (parsed.isConnected) {
        updateConfig('whatsapp', {
          isConnected: true,
          authorizedNumber: parsed.phoneNumber,
          qrCode: parsed.qrCode
        });
      }
    }
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem('whatsapp_qr_state', JSON.stringify(qrState));
  }, [qrState]);

  const generateQRCode = async (): Promise<void> => {
    setQRState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // Simular geração de QR Code (em produção, isso viria de uma API real)
      const sessionId = `session_${Date.now()}`;
      const qrData = `whatsapp://qr/${sessionId}`;
      
      // Gerar QR Code usando uma biblioteca simples
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
      
      setQRState(prev => ({
        ...prev,
        qrCode: qrCodeUrl,
        sessionId: sessionId,
        isGenerating: false
      }));

      // Atualizar configuração
      updateConfig('whatsapp', {
        qrCode: qrCodeUrl
      });

      toast({
        title: "QR Code gerado!",
        description: "Escaneie com seu WhatsApp Business para conectar"
      });

      // Simular conexão após 10 segundos (para demonstração)
      setTimeout(() => {
        connectWhatsApp(sessionId);
      }, 10000);

    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Tente novamente em alguns segundos",
        variant: "destructive"
      });
      setQRState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const connectWhatsApp = async (sessionId: string) => {
    const phoneNumber = `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date().toISOString();
    
    setQRState(prev => ({
      ...prev,
      isConnected: true,
      phoneNumber: phoneNumber,
      lastConnected: now
    }));

    // Atualizar configuração
    updateConfig('whatsapp', {
      isConnected: true,
      authorizedNumber: phoneNumber
    });

    // Salvar no banco
    try {
      await saveConfig();
      
      toast({
        title: "WhatsApp Business Conectado!",
        description: `Conectado com sucesso ao número ${phoneNumber}`
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const disconnectWhatsApp = async () => {
    setQRState({
      qrCode: '',
      isConnected: false,
      phoneNumber: '',
      sessionId: '',
      isGenerating: false,
      lastConnected: ''
    });

    updateConfig('whatsapp', {
      isConnected: false,
      authorizedNumber: '',
      qrCode: ''
    });

    try {
      await saveConfig();
      localStorage.removeItem('whatsapp_qr_state');
      
      toast({
        title: "Desconectado",
        description: "WhatsApp Business foi desconectado"
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const getConnectionStatus = () => {
    if (!qrState.isConnected) return 'disconnected';
    
    const lastConnected = new Date(qrState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  };

  return {
    qrState,
    generateQRCode,
    disconnectWhatsApp,
    getConnectionStatus,
    isLoading: qrState.isGenerating
  };
}
