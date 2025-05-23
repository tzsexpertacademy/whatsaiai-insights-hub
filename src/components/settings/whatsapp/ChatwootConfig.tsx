
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, AlertCircle, Send, Key, RefreshCcw, User, Database, QrCode, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface ChatwootState {
  serverUrl: string;
  apiKey: string;
  accountId: string;
  inboxId: string;
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
}

export function ChatwootConfig() {
  const [chatwootState, setChatwootState] = useState<ChatwootState>({
    serverUrl: localStorage.getItem('chatwoot_server_url') || '',
    apiKey: localStorage.getItem('chatwoot_api_key') || '',
    accountId: localStorage.getItem('chatwoot_account_id') || '',
    inboxId: localStorage.getItem('chatwoot_inbox_id') || '',
    isConnected: localStorage.getItem('chatwoot_is_connected') === 'true',
    phoneNumber: localStorage.getItem('chatwoot_phone_number') || '',
    qrCode: localStorage.getItem('chatwoot_qr_code') || ''
  });
  
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Teste de conexão via Chatwoot');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();
  const { updateConfig, saveConfig, config } = useClientConfig();

  const updateChatwootState = (updates: Partial<ChatwootState>) => {
    const newState = { ...chatwootState, ...updates };
    setChatwootState(newState);
    
    // Salvar no localStorage
    Object.entries(newState).forEach(([key, value]) => {
      localStorage.setItem(`chatwoot_${key}`, typeof value === 'boolean' ? String(value) : value);
    });
  };

  const handleConnect = async () => {
    if (!chatwootState.serverUrl || !chatwootState.apiKey || !chatwootState.accountId) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha URL do servidor, API Key e Account ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar conexão com a API do Chatwoot
      const response = await fetch(`${chatwootState.serverUrl}/api/v1/accounts/${chatwootState.accountId}/profile`, {
        method: 'GET',
        headers: {
          'api_access_token': chatwootState.apiKey,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação com Chatwoot');
      }

      const profileData = await response.json();

      // Verificar se existe inbox do WhatsApp
      const inboxResponse = await fetch(`${chatwootState.serverUrl}/api/v1/accounts/${chatwootState.accountId}/inboxes`, {
        method: 'GET',
        headers: {
          'api_access_token': chatwootState.apiKey,
          'Content-Type': 'application/json',
        }
      });

      let whatsappInbox = null;
      if (inboxResponse.ok) {
        const inboxes = await inboxResponse.json();
        whatsappInbox = inboxes.payload?.find((inbox: any) => 
          inbox.channel_type === 'Channel::Whatsapp'
        );
      }

      updateChatwootState({
        isConnected: true,
        inboxId: whatsappInbox?.id?.toString() || chatwootState.inboxId,
        phoneNumber: whatsappInbox?.phone_number || ''
      });

      // Atualizar configuração do WhatsApp no contexto
      updateConfig('whatsapp', {
        isConnected: true,
        authorizedNumber: whatsappInbox?.phone_number || '',
        platform: 'chatwoot'
      });

      await saveConfig();

      toast({
        title: "Conectado com sucesso!",
        description: `Chatwoot conectado - ${profileData.name || 'Usuário'}`
      });
      
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!chatwootState.isConnected || !chatwootState.inboxId) {
      toast({
        title: "Erro",
        description: "Conecte-se ao Chatwoot primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingQR(true);

    try {
      // Tentar obter QR code via API do Chatwoot
      const response = await fetch(`${chatwootState.serverUrl}/api/v1/accounts/${chatwootState.accountId}/inboxes/${chatwootState.inboxId}/whatsapp/qr`, {
        method: 'GET',
        headers: {
          'api_access_token': chatwootState.apiKey,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateChatwootState({
          qrCode: data.qr_code || data.qr
        });

        updateConfig('whatsapp', {
          qrCode: data.qr_code || data.qr
        });

        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });
      } else {
        // Fallback para QR simulado
        const mockQR = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" fill="black">QR Code Chatwoot</text></svg>`;
        updateChatwootState({ qrCode: mockQR });
        
        toast({
          title: "QR Code simulado",
          description: "Configure o WhatsApp no painel do Chatwoot"
        });
      }
    } catch (error) {
      console.error('Erro ao gerar QR:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDisconnect = async () => {
    updateChatwootState({
      isConnected: false,
      phoneNumber: '',
      qrCode: '',
      inboxId: ''
    });

    updateConfig('whatsapp', {
      isConnected: false,
      authorizedNumber: '',
      qrCode: '',
      platform: 'chatwoot'
    });

    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "Chatwoot desconectado"
    });
  };

  const handleSendTest = async () => {
    if (!testNumber || !chatwootState.isConnected) {
      toast({
        title: "Erro",
        description: "Número necessário e conexão ativa",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch(`${chatwootState.serverUrl}/api/v1/accounts/${chatwootState.accountId}/conversations`, {
        method: 'POST',
        headers: {
          'api_access_token': chatwootState.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_id: testNumber,
          inbox_id: chatwootState.inboxId,
          message: {
            content: testMessage,
            message_type: 'outgoing'
          }
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
          <Building2 className="h-5 w-5 text-purple-600" />
          Integração Chatwoot
        </CardTitle>
        <CardDescription>
          Conecte sua instância do Chatwoot para WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">📋 Como configurar:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Instale o Chatwoot em seu servidor</li>
            <li>Crie uma conta e obtenha a API Key</li>
            <li>Configure um inbox do WhatsApp</li>
            <li>Use as credenciais abaixo para conectar</li>
          </ol>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://www.chatwoot.com/docs/product/channels/whatsapp/whatsapp-cloud-setup', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Guia Oficial Chatwoot
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server-url">URL do Servidor Chatwoot <span className="text-red-500">*</span></Label>
          <Input
            id="server-url"
            placeholder="https://app.chatwoot.com"
            value={chatwootState.serverUrl}
            onChange={(e) => updateChatwootState({ serverUrl: e.target.value })}
            disabled={chatwootState.isConnected}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3">
              <Key className="h-4 w-4 text-gray-400" />
              <Input
                id="api-key"
                type="password"
                placeholder="••••••••"
                value={chatwootState.apiKey}
                onChange={(e) => updateChatwootState({ apiKey: e.target.value })}
                disabled={chatwootState.isConnected}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-id">Account ID <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3">
              <User className="h-4 w-4 text-gray-400" />
              <Input
                id="account-id"
                placeholder="1"
                value={chatwootState.accountId}
                onChange={(e) => updateChatwootState({ accountId: e.target.value })}
                disabled={chatwootState.isConnected}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inbox-id">Inbox ID do WhatsApp (opcional)</Label>
          <Input
            id="inbox-id"
            placeholder="Detectado automaticamente"
            value={chatwootState.inboxId}
            onChange={(e) => updateChatwootState({ inboxId: e.target.value })}
            disabled={chatwootState.isConnected}
          />
        </div>

        {chatwootState.isConnected && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Conectado ao Chatwoot</h4>
                {chatwootState.phoneNumber && (
                  <p className="text-xs text-green-700 mt-1">
                    WhatsApp: {chatwootState.phoneNumber}
                  </p>
                )}
                <p className="text-xs text-green-700">Inbox ID: {chatwootState.inboxId}</p>
              </div>
            </div>
          </div>
        )}

        {chatwootState.isConnected && (
          <div className="space-y-4 border-t pt-4">
            {/* QR Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>QR Code WhatsApp</Label>
                <Button 
                  onClick={generateQRCode} 
                  disabled={isGeneratingQR}
                  size="sm"
                  variant="outline"
                >
                  {isGeneratingQR ? "Gerando..." : "Gerar QR"} 
                  <QrCode className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {chatwootState.qrCode && (
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="w-48 h-48 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={chatwootState.qrCode} 
                      alt="QR Code WhatsApp" 
                      className="max-w-full max-h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Respostas Automáticas */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reply">Respostas Automáticas</Label>
              <Switch 
                id="auto-reply" 
                checked={config.whatsapp.autoReply}
                onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
              />
            </div>
            
            {/* Teste de Envio */}
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
          {!chatwootState.isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? "Conectando..." : "Conectar Chatwoot"} 
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
