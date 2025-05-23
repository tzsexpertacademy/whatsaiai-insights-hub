
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, AlertCircle, Send, Key, RefreshCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!atendechatConfig.apiUrl || !atendechatConfig.username || !atendechatConfig.password) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios",
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

  return (
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
          <Label htmlFor="api-url">URL da API</Label>
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
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            placeholder="Seu nome de usuário"
            value={atendechatConfig.username}
            onChange={(e) => updateAtendechatConfig({ ...atendechatConfig, username: e.target.value })}
            disabled={atendechatConfig.isConnected}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={atendechatConfig.password}
            onChange={(e) => updateAtendechatConfig({ ...atendechatConfig, password: e.target.value })}
            disabled={atendechatConfig.isConnected}
          />
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
      <CardFooter>
        {!atendechatConfig.isConnected ? (
          <Button 
            onClick={handleConnect} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? "Conectando..." : "Conectar à API Atendechat"} 
            {isLoading ? <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /> : <Key className="ml-2 h-4 w-4" />}
          </Button>
        ) : (
          <Button 
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
          >
            Desconectar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
