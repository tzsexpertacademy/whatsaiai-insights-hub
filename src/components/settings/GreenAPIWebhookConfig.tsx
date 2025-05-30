
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useGreenAPI } from "@/hooks/useGreenAPI";
import { Webhook, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export function GreenAPIWebhookConfig() {
  const { apiConfig, updateAPIConfig } = useGreenAPI();
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'unknown' | 'active' | 'inactive'>('unknown');

  // URL do webhook para este projeto
  const webhookUrl = 'https://duyxbtfknilgrvgsvlyy.supabase.co/functions/v1/greenapi-webhook';

  // Verificar status do webhook ao carregar
  useEffect(() => {
    if (apiConfig.instanceId && apiConfig.apiToken) {
      checkWebhookStatus();
    }
  }, [apiConfig.instanceId, apiConfig.apiToken]);

  const checkWebhookStatus = async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) return;

    try {
      console.log('🔍 Verificando status do webhook...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/getSettings/${apiConfig.apiToken}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Configurações atuais:', data);
        
        const isWebhookConfigured = data.webhookUrl === webhookUrl && data.incomingWebhook === true;
        
        if (isWebhookConfigured) {
          setWebhookStatus('active');
          console.log('✅ Webhook configurado corretamente');
        } else {
          setWebhookStatus('inactive');
          console.log('❌ Webhook não configurado ou incorreto');
          console.log('❌ URL esperada:', webhookUrl);
          console.log('❌ URL atual:', data.webhookUrl);
          console.log('❌ incomingWebhook:', data.incomingWebhook);
        }
      } else {
        console.error('❌ Erro ao verificar configurações:', response.status);
        const errorText = await response.text();
        console.error('❌ Erro detalhes:', errorText);
        setWebhookStatus('unknown');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status do webhook:', error);
      setWebhookStatus('unknown');
    }
  };

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
      console.log('🔗 Instance ID:', apiConfig.instanceId);
      console.log('🔗 Webhook URL:', webhookUrl);
      
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
            statusInstanceWebhook: true,
            delaySendMessagesMilliseconds: 1000,
            markIncomingMessagesReaded: false,
            proxy: null
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao configurar webhook:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Webhook configurado:', data);

      // Salvar URL do webhook na configuração
      await updateAPIConfig({ webhookUrl });
      
      setWebhookStatus('active');

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
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configuração incompleta",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);

    try {
      console.log('🧪 Testando webhook... URL:', webhookUrl);
      
      // Teste simples enviando dados mockados
      const testPayload = {
        typeWebhook: 'test',
        instanceData: { 
          idInstance: apiConfig.instanceId,
          wid: 'test@webhook.test',
          typeInstance: 'whatsapp'
        },
        timestamp: Date.now(),
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: {
            textMessage: 'Teste do webhook GREEN-API'
          }
        },
        senderData: {
          chatId: 'test@c.us',
          chatName: 'Teste Webhook',
          sender: 'test@c.us'
        }
      };

      console.log('📤 Enviando payload de teste:', testPayload);

      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      console.log('📊 Status da resposta do teste:', testResponse.status);

      if (testResponse.ok) {
        const result = await testResponse.json();
        console.log('✅ Resultado do teste:', result);
        
        toast({
          title: "Webhook funcionando!",
          description: "O webhook está respondendo corretamente aos testes"
        });
      } else {
        const errorText = await testResponse.text();
        console.error('❌ Erro no teste:', testResponse.status, errorText);
        
        toast({
          title: "Erro no teste",
          description: `Webhook retornou erro ${testResponse.status}. Verifique os logs do Supabase.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro no teste do webhook:', error);
      toast({
        title: "Erro no teste",
        description: `Erro ao testar webhook: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    switch (webhookStatus) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Webhook Ativo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Webhook Inativo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Status Desconhecido
          </Badge>
        );
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

        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <Button
            onClick={checkWebhookStatus}
            variant="outline"
            size="sm"
            disabled={!apiConfig.instanceId || !apiConfig.apiToken}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {webhookStatus === 'inactive' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O webhook não está configurado corretamente. Configure-o para receber mensagens automaticamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Configurações atuais:</strong>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Instance ID: {apiConfig.instanceId || 'Não configurado'}</div>
            <div>API Token: {apiConfig.apiToken ? 'Configurado' : 'Não configurado'}</div>
            <div>Webhook URL: {apiConfig.webhookUrl || 'Não configurado'}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={configureWebhook}
            disabled={isConfiguring || !apiConfig.instanceId || !apiConfig.apiToken}
            className="flex-1"
          >
            {isConfiguring ? 'Configurando...' : 'Configurar Webhook Automaticamente'}
          </Button>
          
          <Button 
            onClick={testWebhook} 
            variant="outline"
            disabled={isTesting || !apiConfig.instanceId || !apiConfig.apiToken}
          >
            {isTesting ? 'Testando...' : 'Testar Webhook'}
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O webhook recebe mensagens do WhatsApp em tempo real</li>
            <li>• Mensagens são salvas automaticamente no banco de dados</li>
            <li>• Sistema processa mensagens para todos os usuários configurados</li>
            <li>• Status de conexão é atualizado automaticamente</li>
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
