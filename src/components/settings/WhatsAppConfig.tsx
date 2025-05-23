
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Smartphone, Wifi, WifiOff, Phone, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function WhatsAppConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [authorizedNumber, setAuthorizedNumber] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setIsGeneratingQr(true);
    // Simular geração de QR Code
    setTimeout(() => {
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      setIsGeneratingQr(false);
      toast({
        title: "QR Code Gerado",
        description: "Escaneie o código com seu WhatsApp Business",
      });
    }, 2000);
  };

  const handleConnect = () => {
    if (!authorizedNumber) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número autorizado",
        variant: "destructive",
      });
      return;
    }

    setIsConnected(true);
    toast({
      title: "Conectado!",
      description: "WhatsApp Business conectado com sucesso",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setQrCode('');
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
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
              {isConnected ? (
                <>
                  <Wifi className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Número autorizado: {authorizedNumber}
                </p>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="authorized">Número Autorizado (Conselheiro Principal)</Label>
              <Input
                id="authorized"
                placeholder="+55 11 99999-9999"
                value={authorizedNumber}
                onChange={(e) => setAuthorizedNumber(e.target.value)}
                disabled={isConnected}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Somente este número receberá respostas do conselheiro principal
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              {!isConnected ? (
                <Button onClick={handleConnect} className="flex-1" disabled={!authorizedNumber}>
                  Conectar WhatsApp
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
            {!qrCode ? (
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar o QR Code</p>
                <Button onClick={generateQRCode} disabled={isGeneratingQr}>
                  {isGeneratingQr ? 'Gerando...' : 'Gerar QR Code'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
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
                <Button onClick={generateQRCode} variant="outline" size="sm">
                  Gerar Novo QR Code
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
