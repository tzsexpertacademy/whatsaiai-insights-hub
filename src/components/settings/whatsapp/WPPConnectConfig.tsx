
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
  RefreshCw
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

  const [config, setConfig] = useState(() => getWPPConfig());
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const handleConfigChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    saveWPPConfig(config);
    toast({
      title: "Configuração salva",
      description: "Configurações do WPPConnect foram salvas"
    });
  };

  const handleCheckServer = async () => {
    setIsCheckingServer(true);
    try {
      const response = await fetch(`${config.serverUrl}/api/server/status`);
      if (response.ok) {
        toast({
          title: "Servidor online!",
          description: "WPPConnect Server está funcionando corretamente"
        });
      } else {
        throw new Error('Servidor não respondeu');
      }
    } catch (error) {
      toast({
        title: "Servidor offline",
        description: "Verifique se o WPPConnect Server está rodando",
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
            Configuração do WPPConnect Server
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
              URL onde o WPPConnect Server está rodando
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
          <CardTitle>📋 Como instalar o WPPConnect Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Opção 1 - Docker (Recomendado):</h4>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
              <div>git clone https://github.com/wppconnect-team/wppconnect-server.git</div>
              <div>cd wppconnect-server</div>
              <div>docker-compose up -d</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Opção 2 - Node.js:</h4>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
              <div>git clone https://github.com/wppconnect-team/wppconnect-server.git</div>
              <div>cd wppconnect-server</div>
              <div>cp .env.example .env</div>
              <div>npm install</div>
              <div>npm run dev</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            ℹ️ O servidor será executado na porta 21465 por padrão
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
