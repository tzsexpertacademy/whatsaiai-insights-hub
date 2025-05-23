
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Zap, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { useToast } from "@/hooks/use-toast";

export function MakeConfig() {
  const { makeConfig, updateMakeConfig, connectionState, toggleAutoReply } = useWhatsAppConnection();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Webhooks do Make.com configurados com sucesso",
      });
    }, 500);
  };

  const testWebhook = async (webhookUrl: string, webhookName: string) => {
    if (!webhookUrl) {
      toast({
        title: "URL necessária",
        description: `Configure a URL do webhook ${webhookName} primeiro`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          timestamp: new Date().toISOString(),
          source: 'lovable_frontend'
        })
      });

      if (response.ok) {
        toast({
          title: "Webhook funcionando",
          description: `${webhookName} respondeu corretamente`,
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro no webhook",
        description: `${webhookName} não está respondendo`,
        variant: "destructive"
      });
    }
  };

  const isBasicConfigured = [
    makeConfig.qrWebhook,
    makeConfig.statusWebhook,
    makeConfig.sendMessageWebhook,
    makeConfig.disconnectWebhook
  ].every(url => url.length > 0);

  const isAutoReplyConfigured = [
    makeConfig.receiveMessageWebhook,
    makeConfig.autoReplyWebhook
  ].every(url => url.length > 0);

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Configuração Make.com - Conexão Básica
          </CardTitle>
          <CardDescription>
            Configure os webhooks básicos para conexão com WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da configuração básica */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isBasicConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isBasicConfigured ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isBasicConfigured ? 'Conexão básica configurada' : 'Configure a conexão básica'}
            </span>
          </div>

          {/* Webhook para gerar QR Code */}
          <div className="space-y-2">
            <Label htmlFor="qrWebhook">Webhook - QR Code</Label>
            <div className="flex gap-2">
              <Input
                id="qrWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.qrWebhook}
                onChange={(e) => updateMakeConfig({ qrWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.qrWebhook, 'QR Code')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Gera QR Code para fazer login no WhatsApp Business</p>
          </div>

          {/* Webhook para verificar status */}
          <div className="space-y-2">
            <Label htmlFor="statusWebhook">Webhook - Status</Label>
            <div className="flex gap-2">
              <Input
                id="statusWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.statusWebhook}
                onChange={(e) => updateMakeConfig({ statusWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.statusWebhook, 'Status')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Verifica se o WhatsApp Business está conectado</p>
          </div>

          {/* Webhook para enviar mensagens */}
          <div className="space-y-2">
            <Label htmlFor="sendWebhook">Webhook - Enviar</Label>
            <div className="flex gap-2">
              <Input
                id="sendWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.sendMessageWebhook}
                onChange={(e) => updateMakeConfig({ sendMessageWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.sendMessageWebhook, 'Envio')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Envia mensagens através do WhatsApp Business</p>
          </div>

          {/* Webhook para desconectar */}
          <div className="space-y-2">
            <Label htmlFor="disconnectWebhook">Webhook - Desconectar</Label>
            <div className="flex gap-2">
              <Input
                id="disconnectWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.disconnectWebhook}
                onChange={(e) => updateMakeConfig({ disconnectWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.disconnectWebhook, 'Desconexão')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Encerra a sessão do WhatsApp Business</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Configuração Make.com - Respostas Automáticas
          </CardTitle>
          <CardDescription>
            Configure os webhooks para o assistente conselheiro responder automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da configuração de auto-resposta */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isAutoReplyConfigured ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {isAutoReplyConfigured ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isAutoReplyConfigured ? 'Respostas automáticas configuradas' : 'Configure as respostas automáticas'}
            </span>
          </div>

          {/* Controle de resposta automática */}
          {connectionState.isConnected && isAutoReplyConfigured && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-green-900">Assistente Conselheiro</h4>
                <p className="text-sm text-green-700">
                  {connectionState.autoReplyEnabled ? 'Respondendo automaticamente' : 'Pausado'}
                </p>
              </div>
              <Button
                onClick={() => toggleAutoReply(!connectionState.autoReplyEnabled)}
                variant={connectionState.autoReplyEnabled ? "destructive" : "default"}
                size="sm"
              >
                {connectionState.autoReplyEnabled ? 'Pausar' : 'Ativar'}
              </Button>
            </div>
          )}

          {/* Webhook para receber mensagens */}
          <div className="space-y-2">
            <Label htmlFor="receiveWebhook">Webhook - Receber Mensagens</Label>
            <div className="flex gap-2">
              <Input
                id="receiveWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.receiveMessageWebhook}
                onChange={(e) => updateMakeConfig({ receiveMessageWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.receiveMessageWebhook, 'Receber')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Captura mensagens recebidas no WhatsApp Business</p>
          </div>

          {/* Webhook para resposta automática */}
          <div className="space-y-2">
            <Label htmlFor="autoReplyWebhook">Webhook - Resposta Automática</Label>
            <div className="flex gap-2">
              <Input
                id="autoReplyWebhook"
                placeholder="https://hook.make.com/..."
                value={makeConfig.autoReplyWebhook}
                onChange={(e) => updateMakeConfig({ autoReplyWebhook: e.target.value })}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testWebhook(makeConfig.autoReplyWebhook, 'Auto-Reply')}
              >
                Testar
              </Button>
            </div>
            <p className="text-xs text-gray-500">Processa mensagens com OpenAI e envia respostas automáticas</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Fluxo das Respostas Automáticas:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Cliente envia mensagem → Webhook "Receber" captura</li>
              <li>Sistema analisa com contexto psicológico do cliente</li>
              <li>OpenAI gera resposta como conselheiro empático</li>
              <li>Webhook "Auto-Reply" envia resposta automaticamente</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Instruções para Make.com</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSave} disabled={isLoading} className="w-full mb-4">
            {isLoading ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </Button>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cenários necessários no Make.com:</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li><strong>Conexão WhatsApp:</strong> QR Code, Status, Envio, Desconexão</li>
                <li><strong>Monitor de Mensagens:</strong> Captura mensagens recebidas</li>
                <li><strong>Assistente IA:</strong> Integração OpenAI + resposta automática</li>
                <li><strong>Puppeteer/WhatsApp Web:</strong> Controle do navegador</li>
              </ol>
            </div>
            
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://make.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Make.com
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
