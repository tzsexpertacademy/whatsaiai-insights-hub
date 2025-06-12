
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRealWhatsAppConnection } from '@/hooks/useRealWhatsAppConnection';
import { 
  Brain, 
  MessageSquare, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Save,
  Bot,
  Zap
} from 'lucide-react';

export function PersonalAssistantConfig() {
  const { toast } = useToast();
  const {
    connectionState,
    wppConfig,
    updateWebhooks,
    webhooks
  } = useRealWhatsAppConnection();

  const [assistantConfig, setAssistantConfig] = useState({
    enabled: false,
    webhookUrl: '',
    systemPrompt: `Você é um assistente pessoal especializado em bem-estar emocional.
Responda com empatia, usando técnicas de aconselhamento.
Mantenha respostas concisas mas acolhedoras.
Se a situação for grave, sugira procurar ajuda profissional.`,
    autoReply: true,
    responseDelay: 2000
  });

  const isTokenConfigured = wppConfig.secretKey && 
                           wppConfig.secretKey !== 'THISISMYSECURETOKEN' && 
                           wppConfig.secretKey.length > 10;

  const handleSaveConfig = () => {
    updateWebhooks({
      autoReplyWebhook: assistantConfig.webhookUrl
    });
    
    toast({
      title: "Configuração salva! ✅",
      description: "Assistente pessoal configurado com sucesso"
    });
  };

  const handleTestWebhook = async () => {
    if (!assistantConfig.webhookUrl) {
      toast({
        title: "⚠️ URL necessária",
        description: "Configure a URL do webhook primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(assistantConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          message: 'Teste de conexão do assistente pessoal',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Webhook funcionando!",
          description: "Conexão com o assistente estabelecida"
        });
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "❌ Erro no webhook",
        description: "Verifique se a URL está correta e acessível",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do Token */}
      {!isTokenConfigured && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Token do WPPConnect Necessário
            </CardTitle>
            <CardDescription className="text-red-700">
              Configure o token do WPPConnect na aba "WPPConnect" antes de usar o assistente pessoal
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Status da Conexão */}
      <Card className={`border-2 ${connectionState.isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Status do WhatsApp
            {connectionState.isConnected && <Badge className="bg-green-100 text-green-800">CONECTADO</Badge>}
          </CardTitle>
          <CardDescription>
            {connectionState.isConnected 
              ? `Conectado ao número: ${connectionState.phoneNumber}`
              : 'WhatsApp não conectado - conecte na aba "WhatsApp Real"'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuração do Assistente */}
      <Card className={`border-2 ${isTokenConfigured && connectionState.isConnected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Assistente Pessoal IA
            {assistantConfig.enabled && <Badge className="bg-blue-100 text-blue-800">ATIVO</Badge>}
          </CardTitle>
          <CardDescription>
            Configure respostas automáticas inteligentes para suas conversas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="assistant-enabled"
              checked={assistantConfig.enabled}
              onCheckedChange={(enabled) => 
                setAssistantConfig(prev => ({ ...prev, enabled }))
              }
              disabled={!isTokenConfigured || !connectionState.isConnected}
            />
            <Label htmlFor="assistant-enabled">Ativar Assistente Pessoal</Label>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook (Make.com, Zapier, etc.)</Label>
            <Input
              id="webhook-url"
              placeholder="https://hook.make.com/sua-url-aqui"
              value={assistantConfig.webhookUrl}
              onChange={(e) => setAssistantConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              disabled={!isTokenConfigured}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt">Prompt do Sistema (Personalidade da IA)</Label>
            <textarea
              id="system-prompt"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
              placeholder="Defina como sua IA deve se comportar..."
              value={assistantConfig.systemPrompt}
              onChange={(e) => setAssistantConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              disabled={!isTokenConfigured}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-reply"
              checked={assistantConfig.autoReply}
              onCheckedChange={(autoReply) => 
                setAssistantConfig(prev => ({ ...prev, autoReply }))
              }
              disabled={!isTokenConfigured}
            />
            <Label htmlFor="auto-reply">Resposta Automática</Label>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveConfig}
              disabled={!isTokenConfigured}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Configuração
            </Button>
            
            <Button 
              onClick={handleTestWebhook}
              variant="outline"
              disabled={!assistantConfig.webhookUrl}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Testar Webhook
            </Button>
          </div>

          {!isTokenConfigured && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                ⚠️ Configure o token do WPPConnect primeiro na aba "WPPConnect" para usar o assistente pessoal.
              </p>
            </div>
          )}

          {isTokenConfigured && !connectionState.isConnected && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                📱 Conecte seu WhatsApp na aba "WhatsApp Real" para ativar o assistente.
              </p>
            </div>
          )}

          {isTokenConfigured && connectionState.isConnected && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✅ Tudo configurado! Seu assistente pessoal está pronto para usar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Como funciona o Assistente Pessoal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Configure Token</h3>
              <p className="text-sm text-blue-700">
                Configure o token do WPPConnect e conecte o WhatsApp
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Configure Webhook</h3>
              <p className="text-sm text-green-700">Configure a URL do seu webhook (Make.com, Zapier)</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Ative o Assistente</h3>
              <p className="text-sm text-purple-700">Ative e personalize a IA para suas necessidades</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
