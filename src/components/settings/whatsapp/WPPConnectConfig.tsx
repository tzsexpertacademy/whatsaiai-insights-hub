
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
  CheckCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

export function WPPConnectConfig() {
  const { toast } = useToast();
  const { getWPPConfig, saveWPPConfig } = useWPPConnect();

  const [config, setConfig] = useState(() => {
    // Carregar configuração inicial
    const currentConfig = getWPPConfig();
    console.log('🔧 Config inicial carregado:', currentConfig);
    return currentConfig;
  });

  // Lista REDUZIDA de tokens inválidos
  const INVALID_TOKENS = [
    'YOUR_SECRET_KEY_HERE', 
    'YOUR_TOKEN_HERE',
    'DEFAULT_TOKEN',
    'CHANGE_ME'
  ];

  // Verificar se os tokens estão configurados corretamente
  const isSecretKeyValid = config.secretKey && 
                          config.secretKey.length > 0 && 
                          !INVALID_TOKENS.includes(config.secretKey);
                          
  const isTokenValid = config.token && 
                      config.token.length > 0 && 
                      !INVALID_TOKENS.includes(config.token);

  const isConfigComplete = isSecretKeyValid && isTokenValid;

  // Auto-salvamento com debounce
  useEffect(() => {
    console.log('💾 Efeito de salvamento disparado:', config);
    
    const timer = setTimeout(() => {
      if (isSecretKeyValid && isTokenValid) {
        console.log('💾 Auto-salvando configuração válida...');
        saveWPPConfig(config);
        
        toast({
          title: "💾 Configuração salva automaticamente",
          description: "Tokens válidos salvos com sucesso"
        });
      } else {
        console.log('⚠️ Não salvando - tokens ainda inválidos:', {
          secretKeyValid: isSecretKeyValid,
          tokenValid: isTokenValid,
          secretKeyLength: config.secretKey?.length || 0,
          tokenLength: config.token?.length || 0
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [config, isSecretKeyValid, isTokenValid, saveWPPConfig, toast]);

  const handleSaveConfig = () => {
    if (!isConfigComplete) {
      toast({
        title: "❌ Configuração incompleta",
        description: "Configure Secret Key e Token válidos",
        variant: "destructive"
      });
      return;
    }

    // Forçar salvamento manual
    console.log('🔄 Salvamento manual forçado:', config);
    saveWPPConfig(config);
    
    toast({
      title: "✅ Configuração salva!",
      description: "Secret Key, Token e configurações do WPPConnect atualizados"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔄 Atualizando campo ${field}:`, field === 'secretKey' || field === 'token' ? `***${value.slice(-4)}` : value);
    
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      console.log('🔄 Nova configuração:', {
        ...newConfig,
        secretKey: newConfig.secretKey ? `***${newConfig.secretKey.slice(-4)}` : 'VAZIO',
        token: newConfig.token ? `***${newConfig.token.slice(-4)}` : 'VAZIO'
      });
      return newConfig;
    });
  };

  const handleClearTokens = () => {
    console.log('🗑️ Limpando tokens...');
    
    const newConfig = {
      ...config,
      secretKey: '',
      token: ''
    };
    
    setConfig(newConfig);
    
    // Limpar do localStorage também
    localStorage.removeItem('wpp_secret_key');
    localStorage.removeItem('wpp_token');
    
    toast({
      title: "🗑️ Tokens limpos",
      description: "Configure novos valores"
    });
  };

  const getSecretKeyStatus = () => {
    if (!config.secretKey) {
      return { valid: false, message: "Secret Key não configurado" };
    }
    if (INVALID_TOKENS.includes(config.secretKey)) {
      return { valid: false, message: "Valor padrão detectado - configure valor real" };
    }
    return { valid: true, message: "Secret Key configurado corretamente" };
  };

  const getTokenStatus = () => {
    if (!config.token) {
      return { valid: false, message: "Token não configurado" };
    }
    if (INVALID_TOKENS.includes(config.token)) {
      return { valid: false, message: "Valor padrão detectado - configure valor real" };
    }
    return { valid: true, message: "Token configurado corretamente" };
  };

  const secretKeyStatus = getSecretKeyStatus();
  const tokenStatus = getTokenStatus();

  // Debug logs
  console.log('🔍 Status atual:', {
    secretKeyValid: secretKeyStatus.valid,
    tokenValid: tokenStatus.valid,
    isConfigComplete,
    secretKeyLength: config.secretKey?.length || 0,
    tokenLength: config.token?.length || 0
  });

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
            {isConfigComplete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearTokens}
                className="ml-auto flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Tokens
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {isConfigComplete 
              ? 'Configuração completa com tokens válidos - Pronto para conectar' 
              : 'Configure Secret Key e Token válidos para usar o WhatsApp Real'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${secretKeyStatus.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secret Key</span>
                {secretKeyStatus.valid ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">✅ VÁLIDO</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-300">❌ INVÁLIDO</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {secretKeyStatus.message}
              </p>
              {config.secretKey && (
                <p className="text-xs text-gray-500 mt-1">
                  Comprimento: {config.secretKey.length} caracteres
                </p>
              )}
            </div>
            
            <div className={`p-3 rounded-lg border ${tokenStatus.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4" />
                <span className="font-medium">Token de Sessão</span>
                {tokenStatus.valid ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">✅ VÁLIDO</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-300">❌ INVÁLIDO</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {tokenStatus.message}
              </p>
              {config.token && (
                <p className="text-xs text-gray-500 mt-1">
                  Comprimento: {config.token.length} caracteres
                </p>
              )}
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
            {isConfigComplete && <Badge className="bg-blue-100 text-blue-800">TOKENS VÁLIDOS</Badge>}
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
                placeholder="THISISMYSECURETOKEN ou sua chave personalizada"
                value={config.secretKey}
                onChange={(e) => handleInputChange('secretKey', e.target.value)}
                className={!secretKeyStatus.valid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {secretKeyStatus.valid ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {secretKeyStatus.message}
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {secretKeyStatus.message}
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
                placeholder="Token da sua sessão WPPConnect"
                value={config.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                className={!tokenStatus.valid ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'}
              />
              {tokenStatus.valid ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {tokenStatus.message}
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {tokenStatus.message}
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
                ✅ Tokens válidos detectados
              </Badge>
            )}
          </div>

          {/* Instruções de configuração */}
          {!isConfigComplete && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">🚨 CONFIGURAÇÃO OBRIGATÓRIA:</h4>
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>1. Secret Key:</strong> Use "THISISMYSECURETOKEN" ou sua chave personalizada do WPPConnect</p>
                <p><strong>2. Token:</strong> Token específico gerado para a sessão pelo WPPConnect</p>
                <p><strong>3. Auto-salvamento:</strong> Configurações são salvas automaticamente quando válidas</p>
              </div>
            </div>
          )}

          {isConfigComplete && (
            <div className="bg-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">🎉 Configuração validada!</h4>
              <p className="text-sm text-green-700">
                Secret Key e Token configurados com valores válidos. Vá para a aba "WhatsApp Real" para conectar seu WhatsApp.
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
            Sobre os Tokens WPPConnect
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
                Pode ser "THISISMYSECURETOKEN" (padrão) ou personalizada.
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Key className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-green-900 mb-1">Token de Sessão</h3>
              <p className="text-sm text-green-700">
                Token específico gerado pelo WPPConnect para cada sessão/conexão.
                Deve ser obtido da resposta da API do WPPConnect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
