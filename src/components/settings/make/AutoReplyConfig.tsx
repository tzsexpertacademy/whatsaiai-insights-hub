
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AutoReplyConfigProps {
  makeConfig: {
    receiveMessageWebhook: string;
    autoReplyWebhook: string;
  };
  updateMakeConfig: (config: any) => void;
  connectionState: {
    isConnected: boolean;
    autoReplyEnabled: boolean;
  };
  toggleAutoReply: (enabled: boolean) => void;
}

export function AutoReplyConfig({ 
  makeConfig, 
  updateMakeConfig, 
  connectionState, 
  toggleAutoReply 
}: AutoReplyConfigProps) {
  const { toast } = useToast();

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

  const isAutoReplyConfigured = [
    makeConfig.receiveMessageWebhook,
    makeConfig.autoReplyWebhook
  ].every(url => url.length > 0);

  return (
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
  );
}
