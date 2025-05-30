
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ExternalLink, Copy, Smartphone, Zap, Globe, QrCode, Loader2, MessageSquare, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from '@/hooks/useGreenAPI';
import { GreenAPIWebhookConfig } from './GreenAPIWebhookConfig';

export function GreenAPIConfig() {
  const { toast } = useToast();
  const {
    greenAPIState,
    apiConfig,
    isLoading,
    updateAPIConfig,
    getQRCode,
    disconnect,
    checkConnectionStatus
  } = useGreenAPI();

  const [instanceId, setInstanceId] = useState(apiConfig.instanceId || '');
  const [apiToken, setApiToken] = useState(apiConfig.apiToken || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para área de transferência",
    });
  };

  const saveConfig = () => {
    if (!instanceId.trim() || !apiToken.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Instance ID e API Token",
        variant: "destructive"
      });
      return;
    }

    updateAPIConfig({
      instanceId: instanceId.trim(),
      apiToken: apiToken.trim()
    });

    toast({
      title: "Configuração salva!",
      description: "Credenciais GREEN-API configuradas com sucesso",
    });
  };

  const handleGenerateQR = async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configure primeiro",
        description: "Salve as configurações antes de gerar o QR Code",
        variant: "destructive"
      });
      return;
    }

    await getQRCode();
  };

  const testConnection = async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configure primeiro",
        description: "Salve as configurações antes de testar",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const status = await checkConnectionStatus();
      
      if (status.isConnected) {
        toast({
          title: "✅ Conectado!",
          description: `WhatsApp conectado: ${status.phoneNumber}`,
        });
      } else {
        toast({
          title: "Não conectado",
          description: "WhatsApp não está conectado à instância",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais GREEN-API",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            GREEN-API (Integração Direta)
          </CardTitle>
          <CardDescription className="text-green-700">
            <strong>🚀 WhatsApp Business API Oficial!</strong> Conecte diretamente sem intermediários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className={`text-center p-2 rounded-lg border ${
              apiConfig.instanceId && apiConfig.apiToken ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-lg mb-1">⚙️</div>
              <div className={`text-xs font-medium ${
                apiConfig.instanceId && apiConfig.apiToken ? 'text-green-800' : 'text-gray-600'
              }`}>
                Configurado
              </div>
            </div>
            
            <div className={`text-center p-2 rounded-lg border ${
              greenAPIState.qrCode ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-lg mb-1">📱</div>
              <div className={`text-xs font-medium ${
                greenAPIState.qrCode ? 'text-blue-800' : 'text-gray-600'
              }`}>
                QR Code
              </div>
            </div>
            
            <div className={`text-center p-2 rounded-lg border ${
              greenAPIState.isConnected ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-lg mb-1">🔗</div>
              <div className={`text-xs font-medium ${
                greenAPIState.isConnected ? 'text-green-800' : 'text-gray-600'
              }`}>
                Conectado
              </div>
            </div>
            
            <div className={`text-center p-2 rounded-lg border ${
              greenAPIState.isConnected ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-lg mb-1">💬</div>
              <div className={`text-xs font-medium ${
                greenAPIState.isConnected ? 'text-green-800' : 'text-gray-600'
              }`}>
                Conversas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">⚙️ Configuração</TabsTrigger>
          <TabsTrigger value="connect">📱 Conectar</TabsTrigger>
          <TabsTrigger value="status">📊 Status</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Credenciais GREEN-API
              </CardTitle>
              <CardDescription>
                Configure suas credenciais da GREEN-API para conectar ao WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instance-id">Instance ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="instance-id"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="1234567890"
                  />
                  <Button onClick={() => copyToClipboard(instanceId)} variant="outline" size="sm" disabled={!instanceId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-token">API Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-token"
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="abc123def456..."
                  />
                  <Button onClick={() => copyToClipboard(apiToken)} variant="outline" size="sm" disabled={!apiToken}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveConfig} className="flex-1" disabled={!instanceId.trim() || !apiToken.trim()}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Salvar Configuração
                </Button>
                <Button 
                  onClick={testConnection} 
                  variant="outline" 
                  disabled={!apiConfig.instanceId || !apiConfig.apiToken || isTestingConnection}
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔗 Como obter suas credenciais:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://green-api.com" target="_blank" className="underline">green-api.com</a></li>
                  <li>Crie uma conta e uma nova instância</li>
                  <li>Copie o Instance ID e API Token</li>
                  <li>Cole os dados acima e salve</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connect">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Conectar WhatsApp Business
              </CardTitle>
              <CardDescription>
                Gere o QR Code e escaneie com seu WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {greenAPIState.isConnected ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    <Phone className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-green-600 font-medium mb-2">WhatsApp Business Conectado! 🎉</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Número: {greenAPIState.phoneNumber}
                  </p>
                  {greenAPIState.lastConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                      Conectado em: {new Date(greenAPIState.lastConnected).toLocaleString('pt-BR')}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button onClick={disconnect} variant="outline" size="sm">
                      Desconectar
                    </Button>
                    <Button onClick={testConnection} variant="outline" size="sm" disabled={isTestingConnection}>
                      {isTestingConnection ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </div>
              ) : greenAPIState.qrCode && !greenAPIState.isGenerating ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-200 mb-4">
                    <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden bg-white">
                      <img 
                        src={greenAPIState.qrCode} 
                        alt="QR Code GREEN-API" 
                        className="max-w-full max-h-full rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="font-medium text-blue-600">📱 Como conectar:</p>
                    <p>1. Abra o WhatsApp Business no seu celular</p>
                    <p>2. Vá em Menu (⋮) → Dispositivos conectados</p>
                    <p>3. Toque em "Conectar um dispositivo"</p>
                    <p>4. Escaneie este código QR</p>
                  </div>
                  
                  <Button onClick={handleGenerateQR} variant="outline" size="sm">
                    <QrCode className="mr-2 h-4 w-4" />
                    Gerar Novo QR Code
                  </Button>
                </div>
              ) : greenAPIState.isGenerating ? (
                <div className="text-center py-8">
                  <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto mb-4" />
                      <p className="text-blue-600 font-medium">Gerando QR Code...</p>
                      <p className="text-sm text-gray-500">Conectando com GREEN-API</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Configure as credenciais e gere o QR Code</p>
                  <Button 
                    onClick={handleGenerateQR} 
                    disabled={!apiConfig.instanceId || !apiConfig.apiToken || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Gerar QR Code
                      </>
                    )}
                  </Button>
                  
                  {!apiConfig.instanceId || !apiConfig.apiToken ? (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Configure suas credenciais na aba "Configuração" primeiro.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Status da Integração
              </CardTitle>
              <CardDescription>
                Monitor da integração GREEN-API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className={`p-3 rounded-lg border ${
                  apiConfig.instanceId && apiConfig.apiToken ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {apiConfig.instanceId && apiConfig.apiToken ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <QrCode className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      apiConfig.instanceId && apiConfig.apiToken ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Credenciais GREEN-API
                    </span>
                  </div>
                  <p className={`text-sm ${
                    apiConfig.instanceId && apiConfig.apiToken ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {apiConfig.instanceId && apiConfig.apiToken ? 'Configuradas' : 'Não configuradas'}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border ${
                  greenAPIState.isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {greenAPIState.isConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`font-medium ${
                      greenAPIState.isConnected ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Status WhatsApp
                    </span>
                  </div>
                  <p className={`text-sm ${
                    greenAPIState.isConnected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {greenAPIState.isConnected ? 'Conectado e ativo' : 'Aguardando conexão'}
                  </p>
                  {greenAPIState.phoneNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      {greenAPIState.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testConnection} variant="outline" size="sm">
                  Testar Conexão
                </Button>
                <Button onClick={() => window.open('https://green-api.com', '_blank')} variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GREEN-API
                </Button>
              </div>

              {greenAPIState.isConnected && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">✅ Tudo funcionando!</h4>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>WhatsApp Business conectado via GREEN-API</li>
                    <li>Conversas sendo espelhadas em tempo real</li>
                    <li>Envio e recebimento de mensagens ativo</li>
                    <li>Acesse a aba "Chat" para ver as conversas</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GreenAPIWebhookConfig />
    </div>
  );
}
