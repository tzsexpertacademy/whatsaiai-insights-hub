
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ExternalLink, Copy, Download, Smartphone, Zap, Globe, PlayCircle, QrCode, Loader2, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function WhatsAppWebMakeSetup() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState('https://hook.eu2.make.com/rl4ldgcqv5cvae66bf4gckoc5ghdcpki');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do Observatório via Make.com + GREEN-API 🚀');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para área de transferência",
    });
  };

  const saveWebhook = () => {
    localStorage.setItem('make_greenapi_webhook', webhookUrl);
    toast({
      title: "Webhook GREEN-API salvo!",
      description: "URL do webhook Make.com foi salva",
    });
    setCurrentStep(1);
  };

  const testSendMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o número e a mensagem para teste",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          phoneNumber: testPhone.replace(/\D/g, ''), // Remove caracteres não numéricos
          message: testMessage,
          timestamp: new Date().toISOString(),
          source: 'observatorio_test'
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Mensagem enviada!",
          description: "Verifique seu WhatsApp para confirmar o recebimento",
        });
        setIsConnected(true);
        setCurrentStep(3);
      } else {
        throw new Error('Falha na resposta do webhook');
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Verifique se o Make.com está ativo e configurado corretamente",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testReceiveMessage = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'receive_message',
          phoneNumber: testPhone.replace(/\D/g, ''),
          message: 'Teste de recebimento de mensagem',
          timestamp: new Date().toISOString(),
          source: 'observatorio_test_receive'
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Teste de recebimento OK!",
          description: "Webhook está processando mensagens recebidas",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Verifique a configuração do Make.com",
        variant: "destructive"
      });
    }
  };

  const steps = [
    { title: "1. Webhook", icon: "🔗", description: "URL do Make.com" },
    { title: "2. Teste", icon: "📱", description: "Enviar mensagem" },
    { title: "3. Receber", icon: "📥", description: "Testar recebimento" },
    { title: "4. Pronto!", icon: "✅", description: "Tudo funcionando" }
  ];

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            Make.com + GREEN-API (Solução Completa)
          </CardTitle>
          <CardDescription className="text-green-700">
            <strong>🎯 WhatsApp Real funcionando!</strong> Enviando e recebendo mensagens via GREEN-API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <div key={index} className={`text-center p-2 rounded-lg border ${
                index <= currentStep ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-lg mb-1">{step.icon}</div>
                <div className={`text-xs font-medium ${
                  index <= currentStep ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">⚙️ Configuração</TabsTrigger>
          <TabsTrigger value="test">🧪 Teste</TabsTrigger>
          <TabsTrigger value="status">📊 Status</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Webhook Make.com + GREEN-API
              </CardTitle>
              <CardDescription>
                URL do seu cenário Make.com configurado com GREEN-API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook Make.com</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button onClick={() => copyToClipboard(webhookUrl)} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={saveWebhook} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Salvar Configuração
              </Button>

              {webhookUrl && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>✅ Webhook configurado!</strong> Agora você pode testar o envio de mensagens.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔄 Como funciona:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Envio:</strong> Nossa plataforma → Make.com → GREEN-API → WhatsApp</p>
                  <p>• <strong>Recebimento:</strong> WhatsApp → GREEN-API → Make.com → Nossa plataforma</p>
                  <p>• <strong>Roteamento:</strong> Action decide se é "send_message" ou "receive_message"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Teste de Envio e Recebimento
              </CardTitle>
              <CardDescription>
                Teste se sua automação Make.com + GREEN-API está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-phone">Número de Teste (com código do país)</Label>
                <Input
                  id="test-phone"
                  placeholder="5511999999999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Formato: 5511999999999 (sem espaços, apenas números)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem de Teste</Label>
                <Input
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Button 
                  onClick={testSendMessage} 
                  disabled={isTesting || !testPhone || !testMessage}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Teste de Envio
                    </>
                  )}
                </Button>

                <Button 
                  onClick={testReceiveMessage} 
                  variant="outline"
                  disabled={!testPhone}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Teste de Recebimento
                </Button>
              </div>

              {isConnected && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>🎉 Funcionando!</strong> Sua automação Make.com + GREEN-API está operacional.
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">📋 Como testar:</h4>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Coloque seu número de WhatsApp no campo acima</li>
                  <li>Clique em "Teste de Envio"</li>
                  <li>Verifique se recebeu a mensagem no WhatsApp</li>
                  <li>Responda algo neste WhatsApp</li>
                  <li>Clique em "Teste de Recebimento" para simular</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Status da Integração
              </CardTitle>
              <CardDescription>
                Monitor da integração Make.com + GREEN-API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className={`p-3 rounded-lg border ${
                  webhookUrl ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {webhookUrl ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <QrCode className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      webhookUrl ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Webhook URL
                    </span>
                  </div>
                  <p className={`text-sm ${
                    webhookUrl ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {webhookUrl ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border ${
                  isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`font-medium ${
                      isConnected ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Teste de Conexão
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isConnected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isConnected ? 'Sucesso - Mensagem enviada' : 'Aguardando teste'}
                  </p>
                </div>
              </div>

              {isConnected && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Próximos passos:</h4>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Sua automação está funcionando!</li>
                    <li>Configure respostas automáticas no Make.com</li>
                    <li>Adicione mais triggers conforme necessário</li>
                    <li>Monitor as execuções no painel do Make.com</li>
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔗 Links úteis:</h4>
                <div className="space-y-1">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://make.com" target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Painel Make.com
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
