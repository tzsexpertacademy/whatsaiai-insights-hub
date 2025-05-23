
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WatiConfigProps {
  watiConfig: {
    apiKey: string;
    webhookUrl: string;
    sendEndpoint: string;
  };
  updateWatiConfig: (config: any) => void;
}

export function WatiConfig({ watiConfig, updateWatiConfig }: WatiConfigProps) {
  const { toast } = useToast();

  const testConnection = async () => {
    if (!watiConfig.apiKey || !watiConfig.sendEndpoint) {
      toast({
        title: "Configuração incompleta",
        description: "Preencha a API Key e o endpoint de envio",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${watiConfig.sendEndpoint}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${watiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Conexão OK",
          description: "Wati conectado com sucesso",
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique suas credenciais Wati",
        variant: "destructive"
      });
    }
  };

  const isConfigured = watiConfig.apiKey && watiConfig.sendEndpoint && watiConfig.webhookUrl;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Configuração Wati
        </CardTitle>
        <CardDescription>
          Configure sua conta Wati para WhatsApp Business
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
            {isConfigured ? 'Wati configurado' : 'Configure o Wati'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watiApiKey">API Key do Wati</Label>
            <Input
              id="watiApiKey"
              type="password"
              placeholder="Sua API key do Wati"
              value={watiConfig.apiKey}
              onChange={(e) => updateWatiConfig({ apiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Encontre em: Wati Dashboard → Settings → API Keys
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="watiEndpoint">Endpoint de Envio</Label>
            <Input
              id="watiEndpoint"
              placeholder="https://live-server-XXXX.wati.io/api/v1"
              value={watiConfig.sendEndpoint}
              onChange={(e) => updateWatiConfig({ sendEndpoint: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              URL base da API do seu servidor Wati
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="watiWebhook">Webhook URL</Label>
            <Input
              id="watiWebhook"
              placeholder="https://sua-api.com/webhook/wati"
              value={watiConfig.webhookUrl}
              onChange={(e) => updateWatiConfig({ webhookUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              URL onde o Wati enviará mensagens recebidas
            </p>
          </div>

          <Button onClick={testConnection} className="w-full">
            Testar Conexão
          </Button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Passos para configurar:</h4>
          <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
            <li>Crie conta no <Button variant="link" className="p-0 h-auto" asChild>
              <a href="https://app.wati.io" target="_blank" rel="noopener noreferrer">
                Wati.io <ExternalLink className="h-3 w-3 inline" />
              </a>
            </Button></li>
            <li>Conecte seu WhatsApp Business via QR code no Wati</li>
            <li>Copie a API Key das configurações</li>
            <li>Configure o webhook para receber mensagens</li>
            <li>Cole as informações acima e teste a conexão</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
