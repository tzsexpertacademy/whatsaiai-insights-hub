
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, AlertCircle, Send, Key, RefreshCcw, Download, Copy, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface AtendechatConfigProps {
  atendechatConfig: {
    apiUrl: string;
    authToken: string;
    username: string;
    password: string;
    sessionId: string;
    isConnected: boolean;
  };
  updateAtendechatConfig: (config: any) => void;
}

export function AtendechatConfig({ atendechatConfig, updateAtendechatConfig }: AtendechatConfigProps) {
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Teste de conexão via API Atendechat');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showExtractedConfig, setShowExtractedConfig] = useState(false);
  const [extractedConfig, setExtractedConfig] = useState('');
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!atendechatConfig.apiUrl || !atendechatConfig.username || !atendechatConfig.password) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios (URL da API, Usuário e Senha)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular a conexão com a API do Atendechat
      setTimeout(() => {
        // Gerar um token fictício baseado nos dados fornecidos
        const mockToken = btoa(`${atendechatConfig.username}:${Date.now()}`);
        const mockSessionId = `session_${Date.now()}`;
        
        updateAtendechatConfig({
          ...atendechatConfig,
          authToken: mockToken,
          sessionId: mockSessionId,
          isConnected: true
        });

        toast({
          title: "Conectado com sucesso!",
          description: "API do Atendechat conectada e pronta para uso",
        });
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar à API do Atendechat",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    updateAtendechatConfig({
      ...atendechatConfig,
      authToken: "",
      sessionId: "",
      isConnected: false
    });
    
    toast({
      title: "Desconectado",
      description: "API do Atendechat desconectada"
    });
  };

  const handleSendTest = () => {
    if (!testNumber) {
      toast({
        title: "Número necessário",
        description: "Digite um número para enviar a mensagem de teste",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);

    // Simular envio de mensagem
    setTimeout(() => {
      toast({
        title: "Mensagem enviada!",
        description: `Mensagem de teste enviada para ${testNumber}`
      });
      setIsSendingTest(false);
    }, 1500);
  };

  const handleExtractConfig = () => {
    const configData = {
      atendechat: {
        apiUrl: atendechatConfig.apiUrl,
        authToken: atendechatConfig.authToken,
        username: atendechatConfig.username,
        password: atendechatConfig.password,
        sessionId: atendechatConfig.sessionId,
        isConnected: atendechatConfig.isConnected
      },
      timestamp: new Date().toISOString(),
      extracted_by: 'Atendechat Config Extractor'
    };

    const jsonString = JSON.stringify(configData, null, 2);
    setExtractedConfig(jsonString);
    setShowExtractedConfig(true);

    toast({
      title: "Configurações extraídas!",
      description: "Dados de configuração foram extraídos com sucesso"
    });
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(extractedConfig);
      toast({
        title: "Copiado!",
        description: "Configurações copiadas para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar as configurações",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Configuração da API Atendechat
          </CardTitle>
          <CardDescription>
            Conecte diretamente à sua instância existente do Atendechat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL da API <span className="text-red-500">*</span></Label>
            <Input
              id="api-url"
              placeholder="https://api.enigmafranquias.tzsacademy.com"
              value={atendechatConfig.apiUrl}
              onChange={(e) => updateAtendechatConfig({ ...atendechatConfig, apiUrl: e.target.value })}
              disabled={atendechatConfig.isConnected}
            />
            <p className="text-xs text-gray-500">URL base da sua API Atendechat</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3">
              <User className="h-4 w-4 text-gray-400" />
              <Input
                id="username"
                placeholder="Seu nome de usuário"
                value={atendechatConfig.username}
                onChange={(e) => updateAtendechatConfig({ ...atendechatConfig, username: e.target.value })}
                disabled={atendechatConfig.isConnected}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3">
              <Key className="h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={atendechatConfig.password}
                onChange={(e) => updateAtendechatConfig({ ...atendechatConfig, password: e.target.value })}
                disabled={atendechatConfig.isConnected}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
            <p className="text-xs text-gray-500">Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios</p>
          </div>

          {atendechatConfig.isConnected && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Conectado à API Atendechat</h4>
                  <p className="text-xs text-green-700 mt-1">ID da sessão: {atendechatConfig.sessionId}</p>
                </div>
              </div>
            </div>
          )}

          {atendechatConfig.isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-reply">Respostas Automáticas</Label>
                <Switch id="auto-reply" defaultChecked />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Enviar Mensagem de Teste</h4>
                <div className="space-y-2">
                  <Label htmlFor="test-number">Número de WhatsApp (com DDD)</Label>
                  <Input
                    id="test-number"
                    placeholder="11912345678"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                  />
                  
                  <Label htmlFor="test-message">Mensagem</Label>
                  <Input
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleSendTest} 
                    disabled={isSendingTest}
                    className="w-full"
                  >
                    {isSendingTest ? "Enviando..." : "Enviar Teste"} <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {!atendechatConfig.isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? "Conectando..." : "Conectar à API Atendechat"} 
              {isLoading ? <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /> : <Key className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect}
              variant="outline"
              className="flex-1"
            >
              Desconectar
            </Button>
          )}
          
          <Button 
            onClick={handleExtractConfig}
            variant="secondary"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Extrair Configurações
          </Button>
        </CardFooter>
      </Card>

      {showExtractedConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Configurações Extraídas
            </CardTitle>
            <CardDescription>
              Dados de configuração do Atendechat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extracted-config">Dados em JSON</Label>
              <Textarea
                id="extracted-config"
                value={extractedConfig}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCopyConfig}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Configurações
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
