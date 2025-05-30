
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from "@/hooks/useGreenAPI";
import { Webhook, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export function GreenAPIWebhookConfig() {
  const { apiConfig, updateAPIConfig } = useGreenAPI();
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);

  // URL do webhook para este projeto
  const webhookUrl = 'https://duyxbtfknilgrvgsvlyy.supabase.co/functions/v1/greenapi-webhook';

  const configureWebhook = async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configuração incompleta",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsConfiguring(true);

    try {
      console.log('🔗 Configurando webhook GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/setSettings/${apiConfig.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: webhookUrl,
            webhookUrlToken: '',
            incomingWebhook: true,
            outgoingWebhook: true,
            outgoingMessageWebhook: true,
            outgoingAPIMessageWebhook: true,
            stateWebhook: true,
            statusInstanceWebhook: true
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao configurar webhook: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Webhook configurado:', data);

      updateAPIConfig({ webhookUrl });

      toast({
        title: "Webhook configurado!",
        description: "GREEN-API está configurado para enviar mensagens para este sistema"
      });

    } catch (error) {
      console.error('❌ Erro ao configurar webhook:', error);
      toast({
        title: "Erro na configuração",
        description: `Não foi possível configurar o webhook: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada!",
      description: "URL do webhook copiada para a área de transferência"
    });
  };

  const testWebhook = async () => {
    try {
      console.log('🧪 Testando webhook...');
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeWebhook: 'test',
          instanceData: { wid: 'test' },
          timestamp: Date.now()
        })
      });

      console.log('📊 Resposta do teste:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado do teste:', result);
        
        toast({
          title: "Webhook funcionando!",
          description: "O webhook está respondendo corretamente"
        });
      } else {
        throw new Error(`Webhook retornou status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro no teste do webhook:', error);
      toast({
        title: "Erro no teste",
        description: "O webhook não está funcionando corretamente",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Configuração do Webhook GREEN-API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>URL do Webhook</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyWebhookUrl} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Esta URL será usada pelo GREEN-API para enviar mensagens recebidas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {apiConfig.webhookUrl ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Webhook Configurado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Webhook Não Configurado
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={configureWebhook}
            disabled={isConfiguring || !apiConfig.instanceId || !apiConfig.apiToken}
            className="flex-1"
          >
            {isConfiguring ? 'Configurando...' : 'Configurar Webhook Automaticamente'}
          </Button>
          
          <Button onClick={testWebhook} variant="outline">
            Testar Webhook
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O webhook recebe mensagens do WhatsApp em tempo real</li>
            <li>• Mensagens de conversas monitoradas são salvas no banco</li>
            <li>• Auto-conversas geram respostas automáticas do assistente</li>
            <li>• Status de mensagens são atualizados automaticamente</li>
          </ul>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ExternalLink className="h-4 w-4" />
          <a 
            href="https://green-api.com/docs/api/receiving/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-800"
          >
            Documentação do GREEN-API sobre Webhooks
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
