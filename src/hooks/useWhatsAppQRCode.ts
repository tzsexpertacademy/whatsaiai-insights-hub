
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
    console.log('🔄 useWhatsAppQRCode - Carregando estado do localStorage...');
    const savedState = localStorage.getItem('whatsapp_qr_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        console.log('📦 Estado carregado do localStorage:', parsed);
        setQRState(parsed);
        
        // Atualizar config se conectado
        if (parsed.isConnected) {
          updateConfig('whatsapp', {
            isConnected: true,
            authorizedNumber: parsed.phoneNumber,
            qrCode: parsed.qrCode
          });
        }
      } catch (error) {
        console.log('❌ Erro ao carregar estado salvo:', error);
        localStorage.removeItem('whatsapp_qr_state');
      }
    } else {
      console.log('📦 Nenhum estado salvo encontrado');
    }
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    if (qrState.qrCode || qrState.isConnected) {
      console.log('💾 Salvando estado no localStorage:', qrState);
      localStorage.setItem('whatsapp_qr_state', JSON.stringify(qrState));
    }
  }, [qrState]);

  const generateQRCode = async (): Promise<void> => {
    console.log('🔄 INICIANDO GERAÇÃO DE QR CODE - Função chamada');
    console.log('📊 Estado atual antes da geração:', qrState);
    
    try {
      console.log('🎯 Definindo isGenerating = true');
      setQRState(prev => {
        const newState = { ...prev, isGenerating: true };
        console.log('🔄 Estado atualizado para:', newState);
        return newState;
      });
      
      // Aguardar um pouco para garantir que o estado seja atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Gerar sessionId único
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      console.log('🆔 SessionId gerado:', sessionId);
      
      // Dados para o QR Code
      const qrData = `whatsapp://connect/${sessionId}`;
      console.log('📋 Dados do QR Code:', qrData);
      
      // Gerar QR Code usando API pública
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&bgcolor=FFFFFF&color=000000&margin=10`;
      console.log('🖼️ URL do QR Code gerada:', qrCodeUrl);
      
      console.log('✅ QR Code gerado com sucesso - Atualizando estado');
      
      setQRState(prev => {
        const newState = {
          ...prev,
          qrCode: qrCodeUrl,
          sessionId: sessionId,
          isGenerating: false
        };
        console.log('🎉 Estado final do QR Code:', newState);
        return newState;
      });

      // Atualizar configuração
      updateConfig('whatsapp', {
        qrCode: qrCodeUrl
      });

      toast({
        title: "✅ QR Code gerado!",
        description: "Escaneie com seu WhatsApp Business para conectar"
      });

      console.log('⏰ Configurando simulação de conexão em 15 segundos...');
      // Simular detecção de conexão após 15 segundos (para demonstração)
      setTimeout(() => {
        console.log('🔄 Executando simulação de conexão automática...');
        connectWhatsApp(sessionId);
      }, 15000);

    } catch (error) {
      console.error('❌ ERRO na geração do QR Code:', error);
      
      setQRState(prev => ({ 
        ...prev, 
        isGenerating: false 
      }));
      
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: "Tente novamente em alguns segundos",
        variant: "destructive"
      });
    }
  };

  const connectWhatsApp = async (sessionId: string) => {
    console.log('📱 Conectando WhatsApp com sessionId:', sessionId);
    
    // Gerar número fictício para demonstração
    const phoneNumber = `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date().toISOString();
    
    console.log('✅ WhatsApp conectado com número:', phoneNumber);
    
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
        title: "🎉 WhatsApp Business Conectado!",
        description: `Conectado com sucesso ao número ${phoneNumber}`
      });
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
    }
  };

  const disconnectWhatsApp = async () => {
    console.log('🔌 Desconectando WhatsApp...');
    
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
        title: "🔌 Desconectado",
        description: "WhatsApp Business foi desconectado"
      });
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
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

  console.log('🔍 Hook useWhatsAppQRCode - Estado atual:', {
    isGenerating: qrState.isGenerating,
    hasQRCode: !!qrState.qrCode,
    isConnected: qrState.isConnected
  });

  return {
    qrState,
    generateQRCode,
    disconnectWhatsApp,
    getConnectionStatus,
    isLoading: qrState.isGenerating
  };
}
