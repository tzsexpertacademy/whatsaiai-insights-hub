
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
  AlertTriangle,
  Settings,
  Save,
  Key,
  Shield,
  MessageSquare
} from 'lucide-react';

export function WPPConnectConfig() {
  const { toast } = useToast();
  const {
    getWPPConfig,
    saveWPPConfig
  } = useWPPConnect();

  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = getWPPConfig();
      console.log('🔧 Config carregado no componente:', savedConfig);
      
      return {
        ...savedConfig,
        serverUrl: savedConfig.serverUrl || 'http://localhost:21465',
        token: savedConfig.token || ''
      };
    } catch (error) {
      console.log('⚠️ Erro ao carregar config, usando padrão');
      return {
        serverUrl: 'http://localhost:21465',
        sessionName: 'NERDWHATS_AMERICA',
        secretKey: 'THISISMYSECURETOKEN',
        token: '',
        webhookUrl: ''
      };
    }
  });

  const handleSaveConfig = () => {
    saveWPPConfig(config);
    toast({
      title: "Configuração salva! ✅",
      description: "Token, Secret Key e configurações do WPPConnect atualizados"
    });
  };

  const isSecretKeyValid = config.secretKey && config.secretKey !== 'THISISMYSECURETOKEN' && config.secretKey.length > 10;
  const isTokenValid = config.token && config.token.length > 10;

  return (
    <div className="space-y-6">
      {/* Aviso sobre configurações */}
      {(!isSecretKeyValid || !isTokenValid) && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Configuração Incompleta do WPPConnect
            </CardTitle>
            <CardDescription className="text-red-700">
              Configure tanto o Secret Key quanto o Token para usar o WhatsApp Real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">📋 Informações necessárias:</h4>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li><strong>Secret Key:</strong> Chave de autenticação do servidor WPPConnect</li>
                <li><strong>Token:</strong> Token de sessão específico gerado pelo WPPConnect</li>
                <li>Ambos devem ter pelo menos 10 caracteres</li>
                <li>Configure ambos e clique em "Salvar Configuração"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração WPPConnect Real */}
      <Card className={`border-2 ${isSecretKeyValid && isTokenValid ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Server className="h-5 w-5" />
            WPPConnect Real - Configuração Completa
            {isSecretKeyValid && isTokenValid && <Badge className="bg-blue-100 text-blue-800">CONFIGURADO</Badge>}
          </CardTitle>
          <CardDescription>
            Para WhatsApp Business com API própria (requer WPPConnect Server)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Nome da Sessão</Label>
            <Input
              id="sessionName"
              placeholder="NERDWHATS_AMERICA"
              value={config.sessionName}
              onChange={(e) => setConfig(prev => ({ ...prev, sessionName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverUrl">URL do Servidor WPPConnect</Label>
            <Input
              id="serverUrl"
              placeholder="http://localhost:21465"
              value={config.serverUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secret Key (Chave do Servidor) *
            </Label>
            <div className="space-y-2">
              <Input
                id="secretKey"
                type="password"
                placeholder="Secret Key do servidor WPPConnect"
                value={config.secretKey}
                onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                className={!isSecretKeyValid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {isSecretKeyValid ? (
                <p className="text-sm text-green-600">
                  ✅ Secret Key configurado corretamente
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  ⚠️ Configure o Secret Key do servidor WPPConnect (mínimo 10 caracteres)
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Token de Sessão *
            </Label>
            <div className="space-y-2">
              <Input
                id="token"
                type="password"
                placeholder="Token específico da sessão"
                value={config.token}
                onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                className={!isTokenValid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {isTokenValid ? (
                <p className="text-sm text-green-600">
                  ✅ Token configurado corretamente
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  ⚠️ Configure o Token da sessão (mínimo 10 caracteres)
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL (Opcional)</Label>
            <Input
              id="webhookUrl"
              placeholder="https://seu-webhook.com/whatsapp"
              value={config.webhookUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveConfig} 
              variant={isSecretKeyValid && isTokenValid ? "default" : "secondary"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Configuração
            </Button>
            {isSecretKeyValid && isTokenValid && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                ✅ Configuração completa
              </Badge>
            )}
          </div>

          {(!isSecretKeyValid || !isTokenValid) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Configuração necessária:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Secret Key:</strong> Chave de autenticação configurada no servidor WPPConnect</p>
                <p><strong>Token:</strong> Token específico gerado para a sessão pelo WPPConnect</p>
                <p>Ambos são necessários para conectar ao WhatsApp Real.</p>
              </div>
            </div>
          )}

          {isSecretKeyValid && isTokenValid && (
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🔄 Configuração completa:</h4>
              <p className="text-sm text-blue-700">
                Secret Key e Token configurados. Vá para a aba "WhatsApp Real" para conectar seu WhatsApp.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Diferença entre Secret Key e Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-blue-900 mb-1">Secret Key</h3>
              <p className="text-sm text-blue-700">
                Chave de autenticação do servidor WPPConnect. 
                Configurada uma vez no servidor.
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Key className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-green-900 mb-1">Token de Sessão</h3>
              <p className="text-sm text-green-700">
                Token específico gerado pelo WPPConnect para cada sessão/conexão.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
