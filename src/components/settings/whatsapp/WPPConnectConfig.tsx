
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
  MessageSquare,
  AlertTriangle,
  Save
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
        serverUrl: savedConfig.serverUrl || 'http://localhost:21465'
      };
    } catch (error) {
      console.log('⚠️ Erro ao carregar config, usando padrão');
      return {
        serverUrl: 'http://localhost:21465',
        sessionName: 'NERDWHATS_AMERICA',
        secretKey: 'THISISMYSECURETOKEN',
        webhookUrl: ''
      };
    }
  });

  const handleSaveConfig = () => {
    saveWPPConfig(config);
    toast({
      title: "Configuração salva! ✅",
      description: "Token e configurações do WPPConnect atualizados"
    });
  };

  const isTokenValid = config.secretKey && config.secretKey !== 'THISISMYSECURETOKEN' && config.secretKey.length > 10;

  return (
    <div className="space-y-6">
      {/* Aviso sobre Token */}
      {!isTokenValid && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Token do WPPConnect Não Configurado
            </CardTitle>
            <CardDescription className="text-red-700">
              Configure um token válido do WPPConnect para usar o WhatsApp Real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">📋 Como obter o token do WPPConnect:</h4>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li>Instale e execute o WPPConnect Server no seu computador</li>
                <li>Acesse a documentação do WPPConnect para configurar o token</li>
                <li>O token deve ter pelo menos 10 caracteres</li>
                <li>Cole o token no campo "Secret Key" abaixo</li>
                <li>Clique em "Salvar Configuração"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração WPPConnect Real */}
      <Card className={`border-2 ${isTokenValid ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Server className="h-5 w-5" />
            WPPConnect Real - Configuração do Token
            {isTokenValid && <Badge className="bg-blue-100 text-blue-800">CONFIGURADO</Badge>}
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

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Secret Key / Token *
            </Label>
            <div className="space-y-2">
              <Input
                id="secretKey"
                type="password"
                placeholder="Cole aqui o token do seu WPPConnect"
                value={config.secretKey}
                onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                className={!isTokenValid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSaveConfig} 
                  variant={isTokenValid ? "default" : "secondary"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Token
                </Button>
                {isTokenValid && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    ✅ Token válido
                  </Badge>
                )}
              </div>
            </div>
            
            {!isTokenValid && (
              <p className="text-sm text-red-600">
                ⚠️ Configure um token válido do WPPConnect (mínimo 10 caracteres)
              </p>
            )}
            {isTokenValid && (
              <p className="text-sm text-green-600">
                ✅ Token configurado corretamente
              </p>
            )}
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

          {!isTokenValid && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Token necessário:</h4>
              <p className="text-sm text-yellow-700">
                Para usar o WhatsApp Real você precisa instalar e configurar o WPPConnect Server. 
                O token é gerado pelo próprio WPPConnect quando você o configura.
              </p>
            </div>
          )}

          {isTokenValid && (
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🔄 Atualizar Token:</h4>
              <p className="text-sm text-blue-700">
                Quando sua sessão do WPPConnect Server expirar, cole aqui o novo token e clique em "Salvar Token".
                Isso vai atualizar automaticamente as configurações do sistema.
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
            Como usar o WPPConnect Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Configurar Token</h3>
              <p className="text-sm text-blue-700">
                Configure o token do WPPConnect Server aqui e salve
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Conectar WhatsApp</h3>
              <p className="text-sm text-green-700">Vá para a aba "WhatsApp Real" para conectar</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Usar Sistema</h3>
              <p className="text-sm text-purple-700">Receba e envie mensagens pelo sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
