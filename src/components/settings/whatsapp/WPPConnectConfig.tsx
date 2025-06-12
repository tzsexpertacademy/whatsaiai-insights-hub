
import React, { useState, useEffect } from 'react';
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
  Save,
  Key,
  Shield,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

export function WPPConnectConfig() {
  const { toast } = useToast();
  const { getWPPConfig, saveWPPConfig } = useWPPConnect();

  const [config, setConfig] = useState(() => {
    const savedConfig = getWPPConfig();
    console.log('🔧 Config inicial carregado:', savedConfig);
    
    return {
      ...savedConfig,
      serverUrl: savedConfig.serverUrl || 'http://localhost:21465',
      sessionName: savedConfig.sessionName || 'NERDWHATS_AMERICA'
    };
  });

  // Auto-salvar quando o usuário digita (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (config.secretKey || config.token) {
        console.log('💾 Auto-salvando configuração...');
        saveWPPConfig(config);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [config.secretKey, config.token, config.serverUrl, config.sessionName, config.webhookUrl]);

  const handleSaveConfig = () => {
    const success = saveWPPConfig(config);
    if (success) {
      toast({
        title: "✅ Configuração salva!",
        description: "Secret Key, Token e configurações do WPPConnect atualizados"
      });
    } else {
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar a configuração",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    console.log(`🔄 Campo ${field} atualizado:`, value ? `***${value.slice(-4)}***` : 'EMPTY');
  };

  const isSecretKeyValid = config.secretKey && config.secretKey.length > 10;
  const isTokenValid = config.token && config.token.length > 10;
  const isConfigComplete = isSecretKeyValid && isTokenValid;

  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card className={`border-2 ${isConfigComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConfigComplete ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            Status da Configuração WPPConnect
          </CardTitle>
          <CardDescription>
            {isConfigComplete 
              ? 'Configuração completa - Pronto para conectar' 
              : 'Configure Secret Key e Token para usar o WhatsApp Real'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${isSecretKeyValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secret Key</span>
                {isSecretKeyValid ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">✅ OK</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-300">❌ Faltando</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {isSecretKeyValid ? 'Configurado corretamente' : 'Necessário para autenticação'}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg border ${isTokenValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4" />
                <span className="font-medium">Token de Sessão</span>
                {isTokenValid ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">✅ OK</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-300">❌ Faltando</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {isTokenValid ? 'Configurado corretamente' : 'Necessário para sessão'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Configuração */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Server className="h-5 w-5" />
            Configuração WPPConnect
            {isConfigComplete && <Badge className="bg-blue-100 text-blue-800">CONFIGURADO</Badge>}
          </CardTitle>
          <CardDescription className="text-blue-700">
            Para WhatsApp Business com API própria (requer WPPConnect Server)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Nome da Sessão</Label>
              <Input
                id="sessionName"
                placeholder="NERDWHATS_AMERICA"
                value={config.sessionName}
                onChange={(e) => handleInputChange('sessionName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serverUrl">URL do Servidor</Label>
              <Input
                id="serverUrl"
                placeholder="http://localhost:21465"
                value={config.serverUrl}
                onChange={(e) => handleInputChange('serverUrl', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secret Key (Chave do Servidor) *
              </Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Sua chave secreta do WPPConnect"
                value={config.secretKey}
                onChange={(e) => handleInputChange('secretKey', e.target.value)}
                className={!isSecretKeyValid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {isSecretKeyValid ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Secret Key configurado corretamente
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Configure o Secret Key do servidor WPPConnect (mínimo 10 caracteres)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="token" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Token de Sessão *
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="Token específico da sessão"
                value={config.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                className={!isTokenValid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {isTokenValid ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Token configurado corretamente
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Configure o Token da sessão (mínimo 10 caracteres)
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
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveConfig} 
              variant={isConfigComplete ? "default" : "secondary"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Configuração
            </Button>
            {isConfigComplete && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                ✅ Configuração completa - Auto-salvamento ativo
              </Badge>
            )}
          </div>

          {/* Instruções */}
          {!isConfigComplete && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">🔧 Como configurar:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>1. Secret Key:</strong> Chave de autenticação configurada no servidor WPPConnect</p>
                <p><strong>2. Token:</strong> Token específico gerado para a sessão pelo WPPConnect</p>
                <p><strong>3. Auto-salvamento:</strong> As configurações são salvas automaticamente enquanto você digita</p>
                <p>Ambos são necessários para conectar ao WhatsApp Real.</p>
              </div>
            </div>
          )}

          {isConfigComplete && (
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🎉 Configuração completa!</h4>
              <p className="text-sm text-blue-700">
                Secret Key e Token configurados com sucesso. Vá para a aba "WhatsApp Real" para conectar seu WhatsApp.
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
