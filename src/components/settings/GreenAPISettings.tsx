
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, QrCode, Smartphone, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from '@/hooks/useGreenAPI';

export function GreenAPISettings() {
  const { toast } = useToast();
  const {
    connectionState,
    getAPIConfig,
    saveAPIConfig,
    checkInstanceStatus,
    generateQRCode,
    disconnect
  } = useGreenAPI();

  const [instanceId, setInstanceId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Carregar configuração atual
  useEffect(() => {
    const config = getAPIConfig();
    setInstanceId(config.instanceId);
    setApiToken(config.apiToken);
  }, [getAPIConfig]);

  // Verificar conexão quando as credenciais mudarem
  useEffect(() => {
    if (instanceId && apiToken) {
      checkInstanceStatus();
    }
  }, [instanceId, apiToken, checkInstanceStatus]);

  const handleSaveConfig = () => {
    if (!instanceId.trim() || !apiToken.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Instance ID e API Token",
        variant: "destructive"
      });
      return;
    }

    saveAPIConfig({
      instanceId: instanceId.trim(),
      apiToken: apiToken.trim()
    });

    toast({
      title: "Configuração salva!",
      description: "Credenciais GREEN-API salvas com sucesso"
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const isConnected = await checkInstanceStatus();
    
    if (isConnected) {
      toast({
        title: "✅ Conectado!",
        description: `WhatsApp conectado: ${connectionState.phoneNumber}`
      });
    } else {
      toast({
        title: "Não conectado",
        description: "WhatsApp não está conectado à instância",
        variant: "destructive"
      });
    }
    
    setIsTestingConnection(false);
  };

  const handleGenerateQR = async () => {
    if (!instanceId || !apiToken) {
      toast({
        title: "Configure primeiro",
        description: "Salve as configurações antes de gerar o QR Code",
        variant: "destructive"
      });
      return;
    }

    await generateQRCode();
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Smartphone className="h-6 w-6" />
            GREEN-API WhatsApp Business
          </CardTitle>
          <CardDescription className="text-green-700">
            Integração oficial do WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              connectionState.isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {connectionState.isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Desconectado
                </>
              )}
            </div>
            
            {connectionState.phoneNumber && (
              <Badge variant="outline">{connectionState.phoneNumber}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuração das Credenciais */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração das Credenciais</CardTitle>
          <CardDescription>
            Configure suas credenciais da GREEN-API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instance-id">Instance ID</Label>
            <Input
              id="instance-id"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-token">API Token</Label>
            <Input
              id="api-token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="abc123def456..."
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveConfig} 
              className="flex-1"
              disabled={!instanceId.trim() || !apiToken.trim()}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Salvar Configuração
            </Button>
            
            <Button 
              onClick={handleTestConnection}
              variant="outline"
              disabled={!instanceId || !apiToken || isTestingConnection}
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Testar'
              )}
            </Button>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              Obtenha suas credenciais em{' '}
              <a 
                href="https://green-api.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                green-api.com
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Conexão WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle>Conexão WhatsApp</CardTitle>
          <CardDescription>
            Conecte seu WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionState.isConnected ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                WhatsApp Conectado! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Número: {connectionState.phoneNumber}
              </p>
              <Button onClick={disconnect} variant="outline">
                Desconectar
              </Button>
            </div>
          ) : connectionState.qrCode ? (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border mb-4 inline-block">
                <img 
                  src={connectionState.qrCode} 
                  alt="QR Code GREEN-API" 
                  className="w-64 h-64 rounded"
                />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="font-medium">📱 Como conectar:</p>
                <p>1. Abra o WhatsApp Business</p>
                <p>2. Menu → Dispositivos conectados</p>
                <p>3. Conectar um dispositivo</p>
                <p>4. Escaneie este QR Code</p>
              </div>
              
              <Button onClick={handleGenerateQR} variant="outline">
                Gerar Novo QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Configure as credenciais e gere o QR Code
              </p>
              <Button 
                onClick={handleGenerateQR}
                disabled={!instanceId || !apiToken || connectionState.isLoading}
              >
                {connectionState.isLoading ? (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
