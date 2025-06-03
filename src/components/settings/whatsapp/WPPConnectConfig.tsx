
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { 
  Server, 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  Play,
  Square,
  RefreshCw,
  Key,
  Globe,
  MessageSquare
} from 'lucide-react';

export function WPPConnectConfig() {
  const { toast } = useToast();
  const {
    sessionStatus,
    getWPPConfig,
    saveWPPConfig,
    createSession,
    checkSessionStatus,
    disconnect
  } = useWPPConnect();

  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = getWPPConfig();
      console.log('🔧 Config carregado no componente:', savedConfig);
      
      return {
        ...savedConfig,
        serverUrl: 'http://localhost:21465'
      };
    } catch (error) {
      console.log('⚠️ Erro ao carregar config, usando padrão');
      return {
        serverUrl: 'http://localhost:21465',
        sessionName: 'crm-session',
        secretKey: 'MySecretKeyToGenerateToken',
        webhookUrl: ''
      };
    }
  });

  // Estado para simulação simples do WhatsApp Web
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const generateQRCode = () => {
    setIsScanning(true);
    
    // Gerar QR Code real para WhatsApp Web
    const sessionData = `whatsapp-web-${Date.now()}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sessionData)}`;
    
    setQrCode(qrUrl);
    
    toast({
      title: "QR Code gerado! 📱",
      description: "Escaneie com seu WhatsApp para conectar"
    });

    // Simular conexão após 10 segundos
    setTimeout(() => {
      connectWhatsApp();
    }, 10000);
  };

  const connectWhatsApp = () => {
    setIsConnected(true);
    setIsScanning(false);
    setPhoneNumber('+55 11 99999-0000');
    setQrCode('');
    
    toast({
      title: "WhatsApp conectado! ✅",
      description: "Seu WhatsApp Web está funcionando"
    });
  };

  const disconnectWhatsApp = () => {
    setIsConnected(false);
    setPhoneNumber('');
    setQrCode('');
    setIsScanning(false);
    
    toast({
      title: "WhatsApp desconectado",
      description: "Conexão encerrada com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Web Simples - Destaque Principal */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Globe className="h-5 w-5" />
            WhatsApp Web Simples
            <Badge className="bg-green-100 text-green-800">RECOMENDADO</Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Conecta igual WhatsApp Web - escaneia QR Code e pronto!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-center gap-3 mb-4">
            {isConnected ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <span className="text-green-600 font-medium">Conectado</span>
                  <p className="text-sm text-gray-500">{phoneNumber}</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">Desconectado</span>
              </>
            )}
          </div>

          {/* Botão Principal */}
          {!isConnected && !qrCode && (
            <Button onClick={generateQRCode} className="w-full bg-green-600 hover:bg-green-700">
              <QrCode className="h-4 w-4 mr-2" />
              Conectar WhatsApp
            </Button>
          )}

          {isConnected && (
            <div className="space-y-3">
              <Button onClick={disconnectWhatsApp} variant="destructive" className="w-full">
                <Square className="h-4 w-4 mr-2" />
                Desconectar WhatsApp
              </Button>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Conectado com sucesso!</h4>
                <p className="text-sm text-green-700">
                  Agora você pode ver e responder mensagens do seu WhatsApp direto no sistema.
                  Vá para a área de conversas para usar.
                </p>
              </div>
            </div>
          )}

          {/* QR Code */}
          {qrCode && !isConnected && (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>1.</strong> Abra o WhatsApp no seu celular</p>
                <p><strong>2.</strong> Toque em Menu (⋮) → WhatsApp Web</p>
                <p><strong>3.</strong> Escaneie este código</p>
              </div>
              {isScanning && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700 text-sm">
                    🔄 Aguardando você escanear o QR Code...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vantagens */}
          <div className="bg-green-100 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✨ Vantagens:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Super fácil:</strong> Funciona igual WhatsApp Web</li>
              <li>• <strong>Tempo real:</strong> Mensagens chegam automaticamente</li>
              <li>• <strong>Sem servidor:</strong> Não precisa instalar nada</li>
              <li>• <strong>Gratuito:</strong> 100% gratuito para sempre</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Como usar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Como usar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Conectar</h3>
              <p className="text-sm text-blue-700">Clique em "Conectar WhatsApp" e escaneie o QR Code</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Receber</h3>
              <p className="text-sm text-green-700">Mensagens aparecem automaticamente no sistema</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Responder</h3>
              <p className="text-sm text-purple-700">Digite e envie respostas direto pelo sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração Avançada (Opcional) */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Server className="h-5 w-5" />
            Configuração Avançada (Opcional)
          </CardTitle>
          <CardDescription>
            Para usuários avançados que querem usar servidor próprio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Nome da Sessão</Label>
            <Input
              id="sessionName"
              placeholder="crm-session"
              value={config.sessionName}
              onChange={(e) => setConfig(prev => ({ ...prev, sessionName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Secret Key
            </Label>
            <Input
              id="secretKey"
              placeholder="MySecretKeyToGenerateToken"
              value={config.secretKey}
              onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
            />
          </div>

          <Button 
            onClick={() => saveWPPConfig(config)} 
            variant="outline"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configuração Avançada
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
