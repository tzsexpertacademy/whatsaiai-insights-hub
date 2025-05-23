
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConnectionState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  sessionId: string;
  lastConnected: string;
}

export function useWhatsAppConnection() {
  const [connectionState, setConnectionState] = useState<WhatsAppConnectionState>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    sessionId: '',
    lastConnected: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar estado do localStorage ao inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('whatsapp_connection');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setConnectionState(parsed);
      
      // Verificar se a sessão ainda é válida (máximo 24 horas)
      const lastConnected = new Date(parsed.lastConnected);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Sessão expirada
        disconnectWhatsApp();
        toast({
          title: "Sessão Expirada",
          description: "Sua conexão WhatsApp expirou. Reconecte-se.",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('whatsapp_connection', JSON.stringify(connectionState));
  }, [connectionState]);

  const generateQRCode = async (): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Simular delay de geração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar QR Code visual
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;
      
      if (ctx) {
        // Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);
        
        // Padrão QR Code
        ctx.fillStyle = '#000000';
        const blockSize = 8;
        const sessionId = `session_${Date.now()}`;
        
        // Criar padrão baseado no sessionId para consistência
        for (let y = 0; y < 30; y++) {
          for (let x = 0; x < 30; x++) {
            const hash = (x * 31 + y * 17 + sessionId.charCodeAt(x % sessionId.length)) % 100;
            if (hash > 50) {
              ctx.fillRect(x * blockSize + 8, y * blockSize + 8, blockSize, blockSize);
            }
          }
        }
      }
      
      const qrCodeUrl = canvas.toDataURL('image/png');
      const sessionId = `session_${Date.now()}`;
      
      // Atualizar estado com novo QR
      setConnectionState(prev => ({
        ...prev,
        qrCode: qrCodeUrl,
        sessionId: sessionId
      }));
      
      // Simular conexão automática após 8 segundos
      setTimeout(() => {
        connectWhatsApp(sessionId);
      }, 8000);
      
      return qrCodeUrl;
      
    } finally {
      setIsLoading(false);
    }
  };

  const connectWhatsApp = (sessionId: string) => {
    // Simular número de telefone conectado
    const phoneNumber = `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    setConnectionState(prev => ({
      ...prev,
      isConnected: true,
      phoneNumber: phoneNumber,
      sessionId: sessionId,
      lastConnected: new Date().toISOString()
    }));
    
    toast({
      title: "WhatsApp Conectado!",
      description: `Conectado ao número ${phoneNumber}`,
    });
  };

  const disconnectWhatsApp = () => {
    setConnectionState({
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      sessionId: '',
      lastConnected: ''
    });
    
    // Limpar localStorage
    localStorage.removeItem('whatsapp_connection');
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
  };

  const getConnectionStatus = () => {
    if (!connectionState.isConnected) return 'disconnected';
    
    // Verificar se ainda está conectado baseado no tempo
    const lastConnected = new Date(connectionState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 5) return 'idle';
    return 'active';
  };

  return {
    connectionState,
    isLoading,
    generateQRCode,
    disconnectWhatsApp,
    getConnectionStatus
  };
}
