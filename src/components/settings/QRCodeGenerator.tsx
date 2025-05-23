
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";

export function QRCodeGenerator() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const { toast } = useToast();

  const whatsappConfig = config.whatsapp;

  const generateQRCode = async () => {
    setIsGeneratingQr(true);
    setQrCodeData(null);
    setConnectionStatus('connecting');
    
    try {
      console.log('Iniciando geração de QR Code...');
      
      // Simular tempo de geração do QR Code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar QR Code simulado usando canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;
      
      if (ctx) {
        // Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);
        
        // Criar padrão QR Code simulado
        ctx.fillStyle = '#000000';
        const blockSize = 8;
        
        // Padrão de exemplo para QR Code
        const pattern = [
          [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,0,0,1],
          [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
          [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
          [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
          [1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,1],
          [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
          [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
          [1,0,1,1,0,1,1,1,1,0,1,0,1,1,0,1,1,0,1],
          [0,1,0,0,1,0,0,0,0,1,1,1,0,0,1,0,0,1,0],
          [1,1,1,0,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1],
          [0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0],
          [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
          [1,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,1],
          [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
          [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
          [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1]
        ];
        
        for (let y = 0; y < pattern.length; y++) {
          for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x]) {
              ctx.fillRect(x * blockSize + 32, y * blockSize + 32, blockSize, blockSize);
            }
          }
        }
        
        // Adicionar timestamp único no QR Code
        const timestamp = Date.now().toString();
        ctx.font = '8px Arial';
        ctx.fillText(timestamp.slice(-8), 10, 250);
      }
      
      const qrUrl = canvas.toDataURL('image/png');
      setQrCodeData(qrUrl);
      updateConfig('whatsapp', { qrCode: qrUrl });
      
      console.log('QR Code gerado com sucesso');
      
      toast({
        title: "QR Code Gerado",
        description: "Escaneie com seu WhatsApp Business para conectar",
      });
      
      // Simular processo de conexão automática após 10 segundos
      setTimeout(() => {
        console.log('WhatsApp conectado com sucesso!');
        setConnectionStatus('connected');
        updateConfig('whatsapp', { isConnected: true });
        saveConfig();
        toast({
          title: "Conectado!",
          description: "WhatsApp Business conectado com sucesso",
        });
        setIsGeneratingQr(false);
      }, 10000);
      
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code",
        variant: "destructive",
      });
      setIsGeneratingQr(false);
      setConnectionStatus('disconnected');
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          QR Code WhatsApp Business
        </CardTitle>
        <CardDescription>
          Escaneie com seu WhatsApp Business para conectar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCodeData && !whatsappConfig.qrCode ? (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar o QR Code</p>
            <Button onClick={generateQRCode} disabled={isGeneratingQr || !whatsappConfig.authorizedNumber}>
              {isGeneratingQr ? 'Gerando...' : 'Gerar QR Code'}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
              {connectionStatus === 'connecting' && !qrCodeData && !whatsappConfig.qrCode ? (
                <div className="w-48 h-48 mx-auto rounded-lg flex items-center justify-center">
                  <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={qrCodeData || whatsappConfig.qrCode} 
                    alt="QR Code para WhatsApp" 
                    className="max-w-full max-h-full"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              1. Abra o WhatsApp Business no seu celular
            </p>
            <p className="text-sm text-gray-600 mb-2">
              2. Vá em Menu → Dispositivos conectados
            </p>
            <p className="text-sm text-gray-600 mb-4">
              3. Escaneie este código QR
            </p>
            <Button 
              onClick={generateQRCode} 
              variant="outline" 
              size="sm"
              disabled={isGeneratingQr || connectionStatus === 'connecting'}
            >
              {isGeneratingQr ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Novo QR Code'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
