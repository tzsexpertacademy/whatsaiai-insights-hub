
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SleekFlowConfigProps {
  sleekflowConfig: {
    apiToken: string;
    channelId: string;
    webhookUrl: string;
  };
  updateSleekFlowConfig: (config: any) => void;
}

export function SleekFlowConfig({ sleekflowConfig, updateSleekFlowConfig }: SleekFlowConfigProps) {
  const { toast } = useToast();

  const testConnection = async () => {
    if (!sleekflowConfig.apiToken || !sleekflowConfig.channelId) {
      toast({
        title: "Configuração incompleta",
        description: "Preencha o token e channel ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('https://api.sleekflow.io/v2/channels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sleekflowConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Conexão OK",
          description: "SleekFlow conectado com sucesso",
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais SleekFlow",
        variant: "destructive"
      });
    }
  };

  const isConfigured = sleekflowConfig.apiToken && sleekflowConfig.channelId && sleekflowConfig.webhookUrl;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Configuração SleekFlow
        </CardTitle>
        <CardDescription>
          Configure sua conta SleekFlow para multi-canal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isConfigured ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {isConfigured ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isConfigured ? 'SleekFlow configurado' : 'Configure o SleekFlow'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sleekflowToken">API Token</Label>
            <Input
              id="sleekflowToken"
              type="password"
              placeholder="Seu token de API do SleekFlow"
              value={sleekflowConfig.apiToken}
              onChange={(e) => updateSleekFlowConfig({ apiToken: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Encontre em: SleekFlow → Settings → API & Webhooks
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleekflowChannel">Channel ID (WhatsApp)</Label>
            <Input
              id="sleekflowChannel"
              placeholder="whatsapp_channel_id"
              value={sleekflowConfig.channelId}
              onChange={(e) => updateSleekFlowConfig({ channelId: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              ID do canal WhatsApp Business no SleekFlow
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleekflowWebhook">Webhook URL</Label>
            <Input
              id="sleekflowWebhook"
              placeholder="https://sua-api.com/webhook/sleekflow"
              value={sleekflowConfig.webhookUrl}
              onChange={(e) => updateSleekFlowConfig({ webhookUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              URL onde o SleekFlow enviará eventos
            </p>
          </div>

          <Button onClick={testConnection} className="w-full">
            Testar Conexão
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Passos para configurar:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Crie conta no <Button variant="link" className="p-0 h-auto" asChild>
              <a href="https://sleekflow.io" target="_blank" rel="noopener noreferrer">
                SleekFlow.io <ExternalLink className="h-3 w-3 inline" />
              </a>
            </Button></li>
            <li>Conecte WhatsApp Business no painel</li>
            <li>Gere um API token nas configurações</li>
            <li>Copie o Channel ID do WhatsApp</li>
            <li>Configure webhook para receber mensagens</li>
            <li>Cole as informações acima e teste</li>
          </ol>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Recursos adicionais:</h4>
          <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
            <li>Multi-canal: WhatsApp + Instagram + Facebook</li>
            <li>Analytics avançados de conversas</li>
            <li>Chatbots e automação inteligente</li>
            <li>Team collaboration em tempo real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
