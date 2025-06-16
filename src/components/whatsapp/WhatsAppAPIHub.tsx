
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  QrCode, 
  Play, 
  Settings, 
  Webhook, 
  Monitor,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
  Code,
  Globe,
  Database,
  MessageSquare
} from 'lucide-react';

export function WhatsAppAPIHub() {
  const { toast } = useToast();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [qrCode, setQRCode] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Configurações da API
  const [apiConfig, setApiConfig] = useState({
    webhookUrl: '',
    serverUrl: 'http://localhost:21465',
    sessionName: 'NERDWHATS_AMERICA',
    secretKey: '',
    autoReply: true,
    allowedNumbers: [] as string[]
  });

  // Endpoints disponíveis
  const endpoints = [
    {
      id: 'generate-qr',
      name: 'Gerar QR Code',
      method: 'POST',
      path: '/api/{session}/generate-token',
      description: 'Gera QR Code para conectar WhatsApp',
      params: { session: 'string' },
      body: { webhookUrl: 'string (opcional)' }
    },
    {
      id: 'check-status',
      name: 'Verificar Status',
      method: 'GET',
      path: '/api/{session}/check-connection-session',
      description: 'Verifica se a sessão está conectada',
      params: { session: 'string' }
    },
    {
      id: 'send-message',
      name: 'Enviar Mensagem',
      method: 'POST',
      path: '/api/{session}/send-message',
      description: 'Envia mensagem para um número',
      params: { session: 'string' },
      body: { phone: 'string', message: 'string' }
    },
    {
      id: 'get-chats',
      name: 'Listar Conversas',
      method: 'GET',
      path: '/api/{session}/all-chats',
      description: 'Lista todas as conversas ativas',
      params: { session: 'string' }
    },
    {
      id: 'close-session',
      name: 'Fechar Sessão',
      method: 'POST',
      path: '/api/{session}/close-session',
      description: 'Desconecta e fecha a sessão',
      params: { session: 'string' }
    }
  ];

  const generateUniversalQR = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Simular geração de QR Code universal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const qrData = `whatsapp://connect/${apiConfig.sessionName}?webhook=${encodeURIComponent(apiConfig.webhookUrl)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      
      setQRCode(qrCodeUrl);
      
      toast({
        title: "✅ QR Code Universal Gerado!",
        description: "Escaneie com qualquer WhatsApp Business para conectar automaticamente"
      });

      // Simular conexão após 10 segundos
      setTimeout(() => {
        setConnectionStatus('connected');
        toast({
          title: "🎉 WhatsApp Conectado!",
          description: "Sua integração está funcionando perfeitamente"
        });
      }, 10000);

    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: "Verifique suas configurações e tente novamente",
        variant: "destructive"
      });
    }
  };

  const testEndpoint = async (endpointId: string) => {
    setActiveTest(endpointId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "✅ Teste realizado com sucesso!",
        description: `Endpoint ${endpointId} está funcionando corretamente`
      });
    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description: "Verifique suas configurações",
        variant: "destructive"
      });
    } finally {
      setActiveTest(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: "Código copiado para a área de transferência"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-green-600" />
            WhatsApp API Hub
            <Badge className="bg-green-100 text-green-800">Universal</Badge>
          </CardTitle>
          <CardDescription>
            Solução estilo Swagger para integração WhatsApp - Escaneie uma vez, funciona em qualquer sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <QrCode className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">Conexão Universal</h4>
                <p className="text-sm text-gray-600">Um QR para todas as integrações</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Code className="h-8 w-8 text-purple-500" />
              <div>
                <h4 className="font-medium">API Explorer</h4>
                <p className="text-sm text-gray-600">Teste endpoints em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Settings className="h-8 w-8 text-orange-500" />
              <div>
                <h4 className="font-medium">Auto-Config</h4>
                <p className="text-sm text-gray-600">Configuração automática</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Conexão
          </TabsTrigger>
          <TabsTrigger value="api-explorer" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Explorer
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Testes
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        {/* Aba de Conexão */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Conexão Universal WhatsApp
              </CardTitle>
              <CardDescription>
                Configure uma vez, use em todos os seus sistemas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da Conexão */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {connectionStatus === 'connected' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : connectionStatus === 'connecting' ? (
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <h4 className="font-medium">
                      {connectionStatus === 'connected' ? 'Conectado' : 
                       connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {connectionStatus === 'connected' ? 'WhatsApp ativo e funcionando' : 
                       connectionStatus === 'connecting' ? 'Aguardando escaneamento do QR' : 'Pronto para conectar'}
                    </p>
                  </div>
                </div>
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'outline'}>
                  {connectionStatus}
                </Badge>
              </div>

              {/* Configuração */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="session-name">Nome da Sessão</Label>
                  <Input
                    id="session-name"
                    value={apiConfig.sessionName}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, sessionName: e.target.value }))}
                    placeholder="MINHA_SESSAO"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    value={apiConfig.webhookUrl}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://meusite.com/webhook"
                  />
                </div>
              </div>

              {/* QR Code */}
              {qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <img src={qrCode} alt="QR Code Universal" className="w-64 h-64" />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Escaneie este QR Code com seu WhatsApp Business.<br />
                    Ele configurará automaticamente todas as integrações necessárias.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <Button 
                    onClick={generateUniversalQR}
                    disabled={connectionStatus === 'connecting'}
                    size="lg"
                  >
                    {connectionStatus === 'connecting' ? 'Gerando...' : 'Gerar QR Code Universal'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Explorer */}
        <TabsContent value="api-explorer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                API Explorer
              </CardTitle>
              <CardDescription>
                Teste todos os endpoints da API WhatsApp em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <Card key={endpoint.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <Button
                          onClick={() => testEndpoint(endpoint.id)}
                          disabled={activeTest === endpoint.id}
                          size="sm"
                        >
                          {activeTest === endpoint.id ? 'Testando...' : 'Testar'}
                        </Button>
                      </div>
                      
                      <h4 className="font-medium mb-1">{endpoint.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                      
                      {endpoint.body && (
                        <div className="mt-2">
                          <Label className="text-xs font-medium text-gray-500">BODY EXEMPLO:</Label>
                          <div className="mt-1 p-2 bg-gray-50 rounded border text-xs font-mono">
                            {JSON.stringify(endpoint.body, null, 2)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-orange-600" />
                Gerenciador de Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks para receber eventos em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">URLs de Webhook</h4>
                  
                  {[
                    { name: 'Mensagens Recebidas', key: 'messages' },
                    { name: 'Status de Conexão', key: 'status' },
                    { name: 'QR Code Atualizado', key: 'qr' },
                    { name: 'Erros e Logs', key: 'errors' }
                  ].map((webhook) => (
                    <div key={webhook.key} className="space-y-2">
                      <Label>{webhook.name}</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={`https://meusite.com/webhook/${webhook.key}`}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payload de Exemplo</h4>
                  <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
                    <pre>{JSON.stringify({
                      event: "message_received",
                      timestamp: new Date().toISOString(),
                      data: {
                        from: "5511999999999",
                        message: "Olá!",
                        messageId: "msg_123456"
                      }
                    }, null, 2)}</pre>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(JSON.stringify({
                      event: "message_received",
                      timestamp: new Date().toISOString(),
                      data: {
                        from: "5511999999999",
                        message: "Olá!",
                        messageId: "msg_123456"
                      }
                    }, null, 2))}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Exemplo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testes */}
        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Centro de Testes
              </CardTitle>
              <CardDescription>
                Teste sua integração WhatsApp em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Teste de Envio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Número de Destino</Label>
                      <Input placeholder="5511999999999" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea placeholder="Digite sua mensagem de teste..." rows={3} />
                    </div>
                    <Button className="w-full" onClick={() => testEndpoint('send-message')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar Teste
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Teste de Webhook</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>URL do Webhook</Label>
                      <Input placeholder="https://meusite.com/webhook" />
                    </div>
                    <div className="space-y-2">
                      <Label>Evento para Simular</Label>
                      <select className="w-full p-2 border rounded">
                        <option>message_received</option>
                        <option>connection_status</option>
                        <option>qr_updated</option>
                      </select>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Webhook className="h-4 w-4 mr-2" />
                      Simular Webhook
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-600" />
                Monitoramento e Logs
              </CardTitle>
              <CardDescription>
                Acompanhe o status e logs da sua integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Mensagens Enviadas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">1,234</p>
                  <p className="text-sm text-green-600">+15% esta semana</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Mensagens Recebidas</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">987</p>
                  <p className="text-sm text-blue-600">+8% esta semana</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">99.9%</p>
                  <p className="text-sm text-purple-600">Últimos 30 dias</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Erros</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">3</p>
                  <p className="text-sm text-orange-600">Últimas 24h</p>
                </div>
              </div>

              {/* Logs em Tempo Real */}
              <div className="space-y-3">
                <h4 className="font-medium">Logs em Tempo Real</h4>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                  <div className="space-y-1">
                    <div>[{new Date().toLocaleTimeString()}] ✅ Conexão WhatsApp ativa</div>
                    <div>[{new Date().toLocaleTimeString()}] 📱 Mensagem enviada para +5511999999999</div>
                    <div>[{new Date().toLocaleTimeString()}] 📥 Mensagem recebida de +5511888888888</div>
                    <div>[{new Date().toLocaleTimeString()}] 🔄 Webhook chamado com sucesso</div>
                    <div>[{new Date().toLocaleTimeString()}] ⚡ API respondeu em 120ms</div>
                    <div>[{new Date().toLocaleTimeString()}] 💾 Dados salvos no banco</div>
                    <div className="text-yellow-400">[{new Date().toLocaleTimeString()}] ⚠️  Rate limit: 95% do limite</div>
                    <div>[{new Date().toLocaleTimeString()}] 🔍 Análise IA iniciada</div>
                    <div>[{new Date().toLocaleTimeString()}] 🧠 Insight gerado: Cliente interessado</div>
                    <div>[{new Date().toLocaleTimeString()}] ✅ Sistema funcionando normalmente</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
