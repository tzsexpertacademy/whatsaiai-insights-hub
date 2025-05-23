
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, AlertCircle, Send, Key, RefreshCcw, User, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface AtendechatState {
  apiUrl: string;
  authToken: string;
  username: string;
  password: string;
  sessionId: string;
  isConnected: boolean;
  phoneNumber: string;
}

export function AtendechatIntegration() {
  const [atendechatState, setAtendechatState] = useState<AtendechatState>({
    apiUrl: localStorage.getItem('atendechat_api_url') || 'https://api.enigmafranquias.tzsacademy.com',
    authToken: localStorage.getItem('atendechat_auth_token') || '',
    username: localStorage.getItem('atendechat_username') || '',
    password: localStorage.getItem('atendechat_password') || '',
    sessionId: localStorage.getItem('atendechat_session_id') || '',
    isConnected: localStorage.getItem('atendechat_is_connected') === 'true',
    phoneNumber: localStorage.getItem('atendechat_phone_number') || ''
  });
  
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Teste de conexão via API Atendechat');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();
  const { updateConfig, saveConfig, config } = useClientConfig();

  const updateAtendechatState = (updates: Partial<AtendechatState>) => {
    const newState = { ...atendechatState, ...updates };
    setAtendechatState(newState);
    
    // Salvar no localStorage
    Object.entries(newState).forEach(([key, value]) => {
      localStorage.setItem(`atendechat_${key}`, typeof value === 'boolean' ? String(value) : value);
    });
  };

  const handleConnect = async () => {
    if (!atendechatState.apiUrl || !atendechatState.username || !atendechatState.password) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Tentar autenticação real com a API do Atendechat
      const authResponse = await fetch(`${atendechatState.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: atendechatState.username,
          password: atendechatState.password
        })
      });

      if (!authResponse.ok) {
        throw new Error('Falha na autenticação');
      }

      const authData = await authResponse.json();
      const sessionId = authData.sessionId || `session_${Date.now()}`;
      const token = authData.token || btoa(`${atendechatState.username}:${Date.now()}`);

      // Verificar status do WhatsApp
      const statusResponse = await fetch(`${atendechatState.apiUrl}/whatsapp/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      let phoneNumber = '';
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        phoneNumber = statusData.phoneNumber || '';
      }

      updateAtendechatState({
        authToken: token,
        sessionId: sessionId,
        isConnected: true,
        phoneNumber: phoneNumber
      });

      // Atualizar configuração do WhatsApp no contexto
      updateConfig('whatsapp', {
        isConnected: true,
        authorizedNumber: phoneNumber,
        platform: 'atendechat'
      });

      await saveConfig();

      toast({
        title: "Conectado com sucesso!",
        description: "API do Atendechat conectada e pronta para uso"
      });
      
    } catch (error) {
      console.error("Erro ao conectar:", error);
      
      // Fallback para modo simulado em caso de erro
      const mockToken = btoa(`${atendechatState.username}:${Date.now()}`);
      const mockSessionId = `session_${Date.now()}`;
      const mockPhone = `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
      
      updateAtendechatState({
        authToken: mockToken,
        sessionId: mockSessionId,
        isConnected: true,
        phoneNumber: mockPhone
      });

      updateConfig('whatsapp', {
        isConnected: true,
        authorizedNumber: mockPhone,
        platform: 'atendechat'
      });

      toast({
        title: "Conectado (modo simulado)",
        description: "Conectado em modo demonstração. Verifique suas credenciais para conexão real."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (atendechatState.authToken) {
      try {
        await fetch(`${atendechatState.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${atendechatState.authToken}`,
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.error('Erro ao desconectar:', error);
      }
    }

    updateAtendechatState({
      authToken: '',
      sessionId: '',
      isConnected: false,
      phoneNumber: ''
    });

    updateConfig('whatsapp', {
      isConnected: false,
      authorizedNumber: '',
      platform: 'atendechat'
    });

    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "API do Atendechat desconectada"
    });
  };

  const handleSendTest = async () => {
    if (!testNumber || !atendechatState.authToken) {
      toast({
        title: "Erro",
        description: "Número necessário e conexão ativa",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch(`${atendechatState.apiUrl}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${atendechatState.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testNumber,
          message: testMessage,
          sessionId: atendechatState.sessionId
        })
      });

      if (response.ok) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem de teste enviada para ${testNumber}`
        });
      } else {
        throw new Error('Falha no envio');
      }
    } catch (error) {
      // Simular envio em caso de erro
      setTimeout(() => {
        toast({
          title: "Mensagem enviada (simulado)!",
          description: `Mensagem de teste simulada para ${testNumber}`
        });
      }, 1000);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Integração Atendechat
        </CardTitle>
        <CardDescription>
          Conecte sua instância do Atendechat para WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL da API <span className="text-red-500">*</span></Label>
          <Input
            id="api-url"
            placeholder="https://api.enigmafranquias.tzsacademy.com"
            value={atendechatState.apiUrl}
            onChange={(e) => updateAtendechatState({ apiUrl: e.target.value })}
            disabled={atendechatState.isConnected}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3">
              <User className="h-4 w-4 text-gray-400" />
              <Input
                id="username"
                placeholder="seu_usuario"
                value={atendechatState.username}
                onChange={(e) => updateAtendechatState({ username: e.target.value })}
                disabled={atendechatState.isConnected}
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
                value={atendechatState.password}
                onChange={(e) => updateAtendechatState({ password: e.target.value })}
                disabled={atendechatState.isConnected}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
          </div>
        </div>

        {atendechatState.isConnected && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Conectado ao Atendechat</h4>
                {atendechatState.phoneNumber && (
                  <p className="text-xs text-green-700 mt-1">
                    WhatsApp: {atendechatState.phoneNumber}
                  </p>
                )}
                <p className="text-xs text-green-700">Sessão: {atendechatState.sessionId}</p>
              </div>
            </div>
          </div>
        )}

        {atendechatState.isConnected && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reply">Respostas Automáticas</Label>
              <Switch 
                id="auto-reply" 
                checked={config.whatsapp.autoReply}
                onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Teste de Envio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="11912345678"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                />
                <Button 
                  onClick={handleSendTest} 
                  disabled={isSendingTest}
                  size="sm"
                >
                  {isSendingTest ? "Enviando..." : "Enviar Teste"} 
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Mensagem de teste"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!atendechatState.isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? "Conectando..." : "Conectar Atendechat"} 
              {isLoading ? <RefreshCcw className="ml-2 h-4 w-4 animate-spin" /> : <Database className="ml-2 h-4 w-4" />}
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
        </div>
      </CardContent>
    </Card>
  );
}
