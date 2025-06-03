
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
    try {
      const savedConfig = getWPPConfig();
      console.log('🔧 Config carregado no componente:', savedConfig);
      
      // SEMPRE força localhost
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
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  const handleConfigChange = (field: keyof typeof config, value: string) => {
    console.log(`📝 Alterando ${field}:`, value);
    
    let finalValue = value;
    
    // Se está alterando serverUrl, SEMPRE força localhost
    if (field === 'serverUrl') {
      if (value.includes('192.168.') || !value.includes('localhost')) {
        finalValue = 'http://localhost:21465';
        console.log('🔄 URL forçada para localhost:', finalValue);
        
        toast({
          title: "URL corrigida",
          description: "Forçando uso do localhost para evitar problemas de CORS"
        });
      }
    }
    
    setConfig(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSaveConfig = () => {
    console.log('💾 Salvando configuração:', config);
    
    // SEMPRE força localhost antes de salvar
    const configToSave = {
      ...config,
      serverUrl: 'http://localhost:21465'
    };
    
    console.log('💾 Config final a ser salvo:', configToSave);
    
    saveWPPConfig(configToSave);
    setConfig(configToSave);
    
    toast({
      title: "Configuração salva",
      description: "Configurações salvas com localhost obrigatório"
    });
  };

  const handleCheckServer = async () => {
    setIsCheckingServer(true);
    console.log('🔍 Testando servidor...');
    
    try {
      // SEMPRE usa localhost para teste
      const testUrl = 'http://localhost:21465';
      console.log('📡 Testando URL:', testUrl);
      
      // Testar endpoint de status primeiro
      const statusResponse = await fetch(`${testUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      });
      
      console.log('📥 Status response:', statusResponse.status, statusResponse.ok);
      
      if (statusResponse.ok) {
        console.log('✅ Servidor OK via /api/status');
        toast({
          title: "Servidor online! ✅",
          description: "WPPConnect Server está funcionando perfeitamente"
        });
      } else {
        // Tentar endpoint alternativo /health
        console.log('🔄 Tentando endpoint alternativo /health...');
        const healthResponse = await fetch(`${testUrl}/health`);
        console.log('📥 Health response:', healthResponse.status, healthResponse.ok);
        
        if (healthResponse.ok) {
          console.log('✅ Servidor OK via /health');
          toast({
            title: "Servidor online! ✅",
            description: "WPPConnect Server detectado e funcionando"
          });
        } else {
          throw new Error(`Servidor não respondeu. Status: ${statusResponse.status}`);
        }
      }
    } catch (error) {
      console.error('❌ ERRO COMPLETO no teste:', error);
      toast({
        title: "Servidor offline ❌",
        description: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}. Verifique se está rodando na porta 21465`,
        variant: "destructive"
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">🔧 Debug - Configuração Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Server URL:</strong> {config.serverUrl}</p>
            <p><strong>Session Name:</strong> {config.sessionName}</p>
            <p><strong>Secret Key:</strong> {config.secretKey ? '***' : 'Não definido'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Servidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Configuração do WPPConnect Server v2.8.6
          </CardTitle>
          <CardDescription>
            Configure a conexão com seu servidor WPPConnect (SEMPRE localhost)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverUrl">URL do Servidor (BLOQUEADO EM LOCALHOST)</Label>
            <Input
              id="serverUrl"
              value="http://localhost:21465"
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-green-600 font-medium">
              🔒 URL travada em localhost para evitar problemas de CORS
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook (Opcional)</Label>
            <Input
              id="webhookUrl"
              placeholder="https://seusite.com/webhook/whatsapp"
              value={config.webhookUrl}
              onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
            />
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
