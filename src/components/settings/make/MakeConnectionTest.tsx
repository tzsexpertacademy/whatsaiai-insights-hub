
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, TestTube, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface MakeConnectionTestProps {
  makeConfig: {
    qrWebhook: string;
    statusWebhook: string;
    sendMessageWebhook: string;
    receiveMessageWebhook: string;
    autoReplyWebhook: string;
  };
  updateMakeConfig: (config: any) => void;
}

export function MakeConnectionTest({ makeConfig, updateMakeConfig }: MakeConnectionTestProps) {
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'loading'>>({});
  const { toast } = useToast();

  const testWebhook = async (webhookUrl: string, webhookName: string, testData: any) => {
    if (!webhookUrl) {
      toast({
        title: "URL necessária",
        description: `Configure a URL do webhook ${webhookName} primeiro`,
        variant: "destructive"
      });
      return;
    }

    setTestResults(prev => ({ ...prev, [webhookName]: 'loading' }));

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          timestamp: new Date().toISOString(),
          source: 'lovable_frontend',
          ...testData
        })
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, [webhookName]: 'success' }));
        toast({
          title: "✅ Webhook funcionando",
          description: `${webhookName} respondeu corretamente`,
        });
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [webhookName]: 'error' }));
      toast({
        title: "❌ Erro no webhook",
        description: `${webhookName} não está respondendo`,
        variant: "destructive"
      });
    }
  };

  const testAllWebhooks = async () => {
    const tests = [
      {
        url: makeConfig.qrWebhook,
        name: 'QR Code',
        data: { sessionId: 'test_session' }
      },
      {
        url: makeConfig.statusWebhook,
        name: 'Status',
        data: { sessionId: 'test_session' }
      },
      {
        url: makeConfig.sendMessageWebhook,
        name: 'Envio',
        data: { phoneNumber: '+5511999999999', message: 'Teste' }
      },
      {
        url: makeConfig.receiveMessageWebhook,
        name: 'Recebimento',
        data: { from: '+5511999999999', message: 'Olá' }
      },
      {
        url: makeConfig.autoReplyWebhook,
        name: 'Auto-Reply',
        data: { message: 'Como você está?', from: '+5511999999999' }
      }
    ];

    for (const test of tests) {
      if (test.url) {
        await testWebhook(test.url, test.name, test.data);
        // Pequena pausa entre os testes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (testResults[status]) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (testResults[status]) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-700">Testando...</Badge>;
      default:
        return <Badge variant="outline">Não testado</Badge>;
    }
  };

  const webhooks = [
    { 
      key: 'qrWebhook', 
      name: 'QR Code', 
      description: 'Gera QR Code para login WhatsApp',
      priority: 'Alta'
    },
    { 
      key: 'statusWebhook', 
      name: 'Status', 
      description: 'Verifica se WhatsApp está conectado',
      priority: 'Alta'
    },
    { 
      key: 'sendMessageWebhook', 
      name: 'Envio', 
      description: 'Envia mensagens via WhatsApp',
      priority: 'Alta'
    },
    { 
      key: 'receiveMessageWebhook', 
      name: 'Recebimento', 
      description: 'Captura mensagens recebidas',
      priority: 'Média'
    },
    { 
      key: 'autoReplyWebhook', 
      name: 'Auto-Reply', 
      description: 'Resposta automática com IA',
      priority: 'Baixa'
    }
  ];

  const configuredWebhooks = webhooks.filter(w => makeConfig[w.key as keyof typeof makeConfig]);
  const progressPercentage = (configuredWebhooks.length / webhooks.length) * 100;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Teste de Conexão Make.com
        </CardTitle>
        <CardDescription>
          Teste todos os webhooks para garantir que estão funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Webhooks configurados:</span>
            <span>{configuredWebhooks.length}/{webhooks.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de webhooks */}
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div key={webhook.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(webhook.name)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{webhook.name}</span>
                    <Badge 
                      variant={webhook.priority === 'Alta' ? 'destructive' : 
                               webhook.priority === 'Média' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {webhook.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{webhook.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(webhook.name)}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!makeConfig[webhook.key as keyof typeof makeConfig] || testResults[webhook.name] === 'loading'}
                  onClick={() => testWebhook(
                    makeConfig[webhook.key as keyof typeof makeConfig], 
                    webhook.name,
                    { test: true }
                  )}
                >
                  {testResults[webhook.name] === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de teste geral */}
        <div className="space-y-3">
          <Button 
            onClick={testAllWebhooks} 
            className="w-full"
            disabled={configuredWebhooks.length === 0}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Testar Todos os Webhooks
          </Button>

          {configuredWebhooks.length === webhooks.length && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                🎉 <strong>Perfeito!</strong> Todos os webhooks estão configurados. 
                Agora você pode testar a conectividade com o Make.com.
              </p>
            </div>
          )}
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para os testes:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Webhook respondendo:</strong> Cenário está ativo no Make.com</li>
            <li><strong>Timeout:</strong> Verifique se a URL está correta</li>
            <li><strong>Erro 404:</strong> Webhook foi excluído ou modificado</li>
            <li><strong>Resposta lenta:</strong> Make.com pode estar processando outros cenários</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
