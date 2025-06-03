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
  Key
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
    const defaultConfig = {
      serverUrl: 'http://localhost:21465',
      sessionName: 'crm-session',
      secretKey: 'MySecretKeyToGenerateToken',
      webhookUrl: ''
    };
    
    try {
      const savedConfig = getWPPConfig();
      // Força localhost se estiver usando IP local
      if (savedConfig.serverUrl.includes('192.168.')) {
        savedConfig.serverUrl = 'http://localhost:21465';
      }
      return savedConfig;
    } catch (error) {
      return defaultConfig;
    }
  });
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const handleConfigChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    // Garante que usa localhost
    const configToSave = {
      ...config,
      serverUrl: config.serverUrl.includes('192.168.') ? 'http://localhost:21465' : config.serverUrl
    };
    
    saveWPPConfig(configToSave);
    setConfig(configToSave);
    
    toast({
      title: "Configuração salva",
      description: "Configurações do WPPConnect foram salvas com localhost"
    });
  };

  const handleCheckServer = async () => {
    setIsCheckingServer(true);
    try {
      const testUrl = config.serverUrl.includes('192.168.') 
        ? 'http://localhost:21465' 
        : config.serverUrl;
      
      // Testar endpoint simples primeiro
      const response = await fetch(`${testUrl}/api/status`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Servidor online!",
          description: "WPPConnect Server v2.8.6 está funcionando corretamente"
        });
      } else {
        // Tentar endpoint alternativo
        const altResponse = await fetch(`${testUrl}/health`);
        if (altResponse.ok) {
          toast({
            title: "Servidor online!",
            description: "WPPConnect Server v2.8.6 detectado"
          });
        } else {
          throw new Error('Servidor não respondeu');
        }
      }
    } catch (error) {
      toast({
        title: "Servidor offline",
        description: "Verifique se o WPPConnect Server está rodando em localhost:21465",
        variant: "destructive"
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração do Servidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Configuração do WPPConnect Server v2.8.6
          </CardTitle>
          <CardDescription>
            Configure a conexão com seu servidor WPPConnect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverUrl">URL do Servidor</Label>
            <Input
              id="serverUrl"
              placeholder="http://localhost:21465"
              value={config.serverUrl}
              onChange={(e) => handleConfigChange('serverUrl', e.target.value)}
            />
            <p className="text-sm text-gray-600">
              URL onde o WPPConnect Server está rodando (use localhost, não IP local)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionName">Nome da Sessão</Label>
            <Input
              id="sessionName"
              placeholder="crm-session"
              value={config.sessionName}
              onChange={(e) => handleConfigChange('sessionName', e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Identificador único para sua sessão WhatsApp
            </p>
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
              onChange={(e) => handleConfigChange('secretKey', e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Chave secreta para autenticação (padrão: MySecretKeyToGenerateToken)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook (Opcional)</Label>
            <Input
              id="webhookUrl"
              placeholder="https://seusite.com/webhook/whatsapp"
              value={config.webhookUrl}
              onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
            />
            <p className="text-sm text-gray-600">
              URL para receber mensagens em tempo real
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig}>
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCheckServer}
              disabled={isCheckingServer}
            >
              {isCheckingServer ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Server className="h-4 w-4 mr-2" />
              )}
              Testar Servidor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status da Sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status da Sessão WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sessionStatus.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {sessionStatus.isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <Badge 
              className={sessionStatus.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
              {sessionStatus.isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {sessionStatus.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4" />
              <span>Número: {sessionStatus.phoneNumber}</span>
            </div>
          )}

          {sessionStatus.sessionName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings className="h-4 w-4" />
              <span>Sessão: {sessionStatus.sessionName}</span>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            {!sessionStatus.isConnected ? (
              <Button 
                onClick={createSession}
                disabled={sessionStatus.isLoading}
              >
                {sessionStatus.isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Criar Sessão
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={disconnect}
              >
                <Square className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={checkSessionStatus}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {sessionStatus.qrCode && !sessionStatus.isConnected && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code para Conexão
            </CardTitle>
            <CardDescription>
              Escaneie este QR Code com seu WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={sessionStatus.qrCode} 
                alt="QR Code WhatsApp" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            <p className="text-sm text-blue-600 mt-4">
              📱 Abra o WhatsApp → Dispositivos vinculados → Vincular dispositivo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruções de Instalação */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle>📋 Configuração corrigida para localhost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">✅ URL atualizada!</h4>
            <p className="text-sm text-green-700">
              Agora usando localhost:21465 em vez do IP 192.168.x.x 
              para evitar problemas de CORS e conectividade.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">🔧 Endpoints localhost:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Servidor: <code>http://localhost:21465</code></p>
              <p>• Criar sessão: <code>/api/crm-session/start-session</code></p>
              <p>• QR Code: <code>/api/crm-session/qr-code</code></p>
              <p>• Status: <code>/api/crm-session/status</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
