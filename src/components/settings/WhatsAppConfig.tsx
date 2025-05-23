
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QrCode, Smartphone, Wifi, WifiOff, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";

export function WhatsAppConfig() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const { toast } = useToast();

  const whatsappConfig = config.whatsapp;

  // Função para gerar QR Code simulado
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

  const handleConnect = async () => {
    if (!whatsappConfig.authorizedNumber) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número autorizado",
        variant: "destructive",
      });
      return;
    }
    
    if (!whatsappConfig.isConnected) {
      await generateQRCode();
    }
  };

  const handleDisconnect = async () => {
    updateConfig('whatsapp', { 
      isConnected: false, 
      qrCode: '' 
    });
    
    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
    
    setConnectionStatus('disconnected');
    setQrCodeData(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Status atual do WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {whatsappConfig.isConnected ? (
                <>
                  <Wifi className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                  <span className="text-amber-600 font-medium">Conectando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {whatsappConfig.isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Número autorizado: {whatsappConfig.authorizedNumber}
                </p>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="authorized">Número Autorizado (Conselheiro Principal)</Label>
              <Input
                id="authorized"
                placeholder="+55 11 99999-9999"
                value={whatsappConfig.authorizedNumber}
                onChange={(e) => updateConfig('whatsapp', { authorizedNumber: e.target.value })}
                disabled={whatsappConfig.isConnected || connectionStatus === 'connecting'}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Somente este número receberá respostas do conselheiro principal
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="autoReply">Resposta Automática</Label>
                <p className="text-xs text-gray-500">Enviar confirmação automática ao receber mensagens</p>
              </div>
              <Switch
                id="autoReply"
                checked={whatsappConfig.autoReply}
                onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
              />
            </div>

            <div className="flex gap-2 mt-4">
              {!whatsappConfig.isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  className="flex-1" 
                  disabled={!whatsappConfig.authorizedNumber || isGeneratingQr || connectionStatus === 'connecting'}
                >
                  {isGeneratingQr || connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar WhatsApp'
                  )}
                </Button>
              ) : (
                <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Como Funciona a Integração</CardTitle>
          <CardDescription>
            Entenda o fluxo de funcionamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Captura</h3>
              <p className="text-sm text-blue-700">Todas as conversas são capturadas automaticamente</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Análise</h3>
              <p className="text-sm text-green-700">IA analisa padrões e comportamentos</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Insights</h3>
              <p className="text-sm text-purple-700">Dashboard exibe métricas e recomendações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
