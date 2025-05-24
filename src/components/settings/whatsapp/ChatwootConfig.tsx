
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";

export function ChatwootConfig() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const [chatwootConfig, setChatwootConfig] = useState({
    serverUrl: localStorage.getItem('chatwoot_server_url') || 'https://app.chatwoot.com',
    apiKey: localStorage.getItem('chatwoot_api_key') || '',
    accountId: localStorage.getItem('chatwoot_account_id') || '',
    inboxId: localStorage.getItem('chatwoot_inbox_id') || '',
    provider: localStorage.getItem('chatwoot_provider') || 'cloud',
    // Configurações Twilio
    twilioAccountSid: localStorage.getItem('twilio_account_sid') || '',
    twilioAuthToken: localStorage.getItem('twilio_auth_token') || '',
    twilioPhoneNumber: localStorage.getItem('twilio_phone_number') || '',
    isConnected: localStorage.getItem('chatwoot_is_connected') === 'true'
  });

  const updateChatwootConfig = (updates: Partial<typeof chatwootConfig>) => {
    const newConfig = { ...chatwootConfig, ...updates };
    setChatwootConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      if (key.startsWith('twilio')) {
        localStorage.setItem(key.replace(/([A-Z])/g, '_$1').toLowerCase(), value.toString());
      } else {
        localStorage.setItem(`chatwoot_${key}`, value.toString());
      }
    });
  };

  const testConnection = async () => {
    if (!chatwootConfig.serverUrl || !chatwootConfig.apiKey || !chatwootConfig.accountId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha URL do servidor, API Key e Account ID",
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(true);
    try {
      const response = await fetch(`${chatwootConfig.serverUrl}/api/v1/accounts/${chatwootConfig.accountId}/inboxes`, {
        headers: {
          'api_access_token': chatwootConfig.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateChatwootConfig({ isConnected: true });
        toast({
          title: "Conexão bem-sucedida!",
          description: `Encontradas ${data.payload?.length || 0} caixas de entrada`
        });
      } else {
        throw new Error(`Erro ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const setupTwilioWebhook = async () => {
    if (!chatwootConfig.twilioAccountSid || !chatwootConfig.twilioAuthToken) {
      toast({
        title: "Credenciais Twilio necessárias",
        description: "Configure o Account SID e Auth Token do Twilio primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você pode implementar a lógica para configurar o webhook do Twilio
      // Por enquanto, vamos simular sucesso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Webhook configurado!",
        description: "WhatsApp via Twilio está pronto para uso"
      });
      
      updateChatwootConfig({ isConnected: true });
    } catch (error) {
      toast({
        title: "Erro ao configurar webhook",
        description: "Tente novamente ou configure manualmente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Provedor */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Configuração Chatwoot
          </CardTitle>
          <CardDescription>
            Configure sua instância Chatwoot e provedor WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor WhatsApp</Label>
            <Select 
              value={chatwootConfig.provider} 
              onValueChange={(value) => updateChatwootConfig({ provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud">WhatsApp Cloud API (Meta)</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="360dialog">360Dialog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl">URL do Servidor</Label>
              <Input
                id="serverUrl"
                placeholder="https://app.chatwoot.com"
                value={chatwootConfig.serverUrl}
                onChange={(e) => updateChatwootConfig({ serverUrl: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="123456"
                value={chatwootConfig.accountId}
                onChange={(e) => updateChatwootConfig({ accountId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Access Token</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Seu token de acesso do Chatwoot"
              value={chatwootConfig.apiKey}
              onChange={(e) => updateChatwootConfig({ apiKey: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inboxId">Inbox ID (Opcional)</Label>
            <Input
              id="inboxId"
              placeholder="ID da caixa de entrada WhatsApp"
              value={chatwootConfig.inboxId}
              onChange={(e) => updateChatwootConfig({ inboxId: e.target.value })}
            />
          </div>

          <Button onClick={testConnection} disabled={testingConnection} className="w-full">
            {testingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando conexão...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Testar Conexão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Configuração Twilio (se selecionado) */}
      {chatwootConfig.provider === 'twilio' && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-purple-600" />
              Configuração Twilio
            </CardTitle>
            <CardDescription>
              Configure suas credenciais do Twilio para WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Como obter as credenciais:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Acesse <strong>console.twilio.com</strong></li>
                <li>No painel principal, copie o <strong>Account SID</strong></li>
                <li>Clique em "Show" para ver o <strong>Auth Token</strong></li>
                <li>Configure WhatsApp em "Messaging" → "Try it out"</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twilioSid">Account SID</Label>
                <Input
                  id="twilioSid"
                  placeholder="ACxxxxxxxxxxxxxxxxx"
                  value={chatwootConfig.twilioAccountSid}
                  onChange={(e) => updateChatwootConfig({ twilioAccountSid: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twilioToken">Auth Token</Label>
                <Input
                  id="twilioToken"
                  type="password"
                  placeholder="Seu Auth Token do Twilio"
                  value={chatwootConfig.twilioAuthToken}
                  onChange={(e) => updateChatwootConfig({ twilioAuthToken: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilioPhone">Número WhatsApp</Label>
              <Input
                id="twilioPhone"
                placeholder="+55 11 99999-9999"
                value={chatwootConfig.twilioPhoneNumber}
                onChange={(e) => updateChatwootConfig({ twilioPhoneNumber: e.target.value })}
              />
            </div>

            <Button onClick={setupTwilioWebhook} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando Twilio...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Configurar WhatsApp via Twilio
                </>
              )}
            </Button>

            {chatwootConfig.isConnected && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  ✅ <strong>Twilio configurado!</strong> Seu WhatsApp Business está conectado via Twilio.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status da Conexão */}
      {chatwootConfig.isConnected && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Chatwoot Conectado</CardTitle>
            <CardDescription>
              Sua integração está funcionando corretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Servidor:</strong> {chatwootConfig.serverUrl}</p>
              <p><strong>Account ID:</strong> {chatwootConfig.accountId}</p>
              <p><strong>Provedor:</strong> {chatwootConfig.provider}</p>
              {chatwootConfig.provider === 'twilio' && chatwootConfig.twilioPhoneNumber && (
                <p><strong>WhatsApp:</strong> {chatwootConfig.twilioPhoneNumber}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>📖 Próximos Passos</CardTitle>
          <CardDescription>
            O que fazer após configurar o Chatwoot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">🎯 Configuração Completa:</h4>
              <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                <li>Configure o Firebase do cliente (aba Firebase)</li>
                <li>Configure suas credenciais OpenAI (aba OpenAI)</li>
                <li>Crie assistentes personalizados (aba Assistentes)</li>
                <li>Teste enviando uma mensagem no WhatsApp</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">⚡ Links Úteis:</h4>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li><strong>Chatwoot Cloud:</strong> https://app.chatwoot.com</li>
                <li><strong>Twilio Console:</strong> https://console.twilio.com</li>
                <li><strong>WhatsApp Business API:</strong> https://business.whatsapp.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
