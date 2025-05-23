
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { useToast } from "@/hooks/use-toast";

export function MakeConfig() {
  const { makeConfig, updateMakeConfig } = useWhatsAppConnection();
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

  const isConfigured = Object.values(makeConfig).every(url => url.length > 0);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Configuração Make.com
        </CardTitle>
        <CardDescription>
          Configure os webhooks para espelhamento do WhatsApp Web
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da configuração */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {isConfigured ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isConfigured ? 'Webhooks configurados' : 'Configure os webhooks abaixo'}
          </span>
        </div>

        {/* Webhook para espelhar QR Code */}
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
          <p className="text-xs text-gray-500">Este webhook deve gerar o QR Code para fazer login no WhatsApp Web</p>
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
          <p className="text-xs text-gray-500">Verifica se o WhatsApp Web está conectado</p>
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
          <p className="text-xs text-gray-500">Envia mensagens para o WhatsApp Web</p>
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
          <p className="text-xs text-gray-500">Encerra a sessão do WhatsApp Web</p>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>

        {/* Instruções para Make.com */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como configurar no Make.com:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Crie cenários no Make.com utilizando o módulo "WhatsApp" ou "Puppeteer"</li>
            <li>Configure cada cenário para controlar o WhatsApp Web (login, envio de mensagens, etc)</li>
            <li>Adicione um webhook HTTP como trigger em cada cenário</li>
            <li>Copie as URLs dos webhooks e cole nos campos acima</li>
            <li>Salve e ative os cenários no Make.com</li>
          </ol>
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
  );
}
