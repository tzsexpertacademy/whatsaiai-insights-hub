
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Server, Key, Globe, Save, TestTube } from 'lucide-react';
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { useToast } from "@/hooks/use-toast";

export function WPPConnectSettings() {
  const { getWPPConfig, saveWPPConfig, checkConnectionStatus } = useWPPConnect();
  const { toast } = useToast();
  
  const [config, setConfig] = useState(getWPPConfig());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    saveWPPConfig(config);
    toast({
      title: "Configurações salvas!",
      description: "As configurações do WPPConnect foram atualizadas"
    });
  };

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const isConnected = await checkConnectionStatus();
      toast({
        title: isConnected ? "Conexão OK!" : "Conexão falhou",
        description: isConnected 
          ? "WPPConnect está funcionando corretamente" 
          : "Verifique as configurações e se o WPPConnect está rodando",
        variant: isConnected ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao WPPConnect",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigValid = config.token && config.secretKey && config.token.length > 10;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                Configuração WPPConnect
              </CardTitle>
              <CardDescription>
                Configure sua instância WPPConnect para conectar o WhatsApp
              </CardDescription>
            </div>
            <Badge className={isConfigValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isConfigValid ? "Configurado" : "Incompleto"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nome da Sessão
              </Label>
              <Input
                id="sessionName"
                value={config.sessionName}
                onChange={(e) => setConfig({ ...config, sessionName: e.target.value })}
                placeholder="NERDWHATS_AMERICA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverUrl" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                URL do Servidor
              </Label>
              <Input
                id="serverUrl"
                value={config.serverUrl}
                onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                placeholder="http://localhost:21465"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Secret Key
            </Label>
            <Input
              id="secretKey"
              type="password"
              value={config.secretKey}
              onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
              placeholder="Sua secret key do WPPConnect"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Token
            </Label>
            <Input
              id="token"
              type="password"
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value })}
              placeholder="Seu token do WPPConnect"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Webhook URL (opcional)
            </Label>
            <Input
              id="webhookUrl"
              value={config.webhookUrl || ''}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              placeholder="https://sua-url-webhook.com/webhook"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
            
            <Button 
              onClick={handleTest} 
              variant="outline"
              disabled={isLoading || !isConfigValid}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 Instruções de Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">1. Instale o WPPConnect</h4>
            <p className="text-sm text-blue-700">
              Execute o WPPConnect em sua máquina ou servidor seguindo a documentação oficial.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">2. Configure as credenciais</h4>
            <p className="text-sm text-blue-700">
              Insira o Secret Key e Token fornecidos pelo seu WPPConnect.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">3. Teste a conexão</h4>
            <p className="text-sm text-blue-700">
              Use o botão "Testar Conexão" para verificar se tudo está funcionando.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
