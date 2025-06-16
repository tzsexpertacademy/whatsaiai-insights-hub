
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Wifi, WifiOff, MessageSquare, Send, CheckCircle, AlertCircle, Phone, Settings, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConnectionConfig {
  platform: 'wppconnect' | 'whatsapp-web-js' | 'baileys' | 'green-api';
  apiUrl: string;
  token?: string;
  instanceId?: string;
  apiKey?: string;
}

interface SessionStatus {
  isConnected: boolean;
  qrCode: string | null;
  isLoading: boolean;
  phoneNumber: string | null;
  platform: string;
}

export function RealWhatsAppHub() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: null,
    isLoading: false,
    phoneNumber: null,
    platform: ''
  });
  
  const [config, setConfig] = useState<ConnectionConfig>({
    platform: 'wppconnect',
    apiUrl: '',
    token: '',
    instanceId: '',
    apiKey: ''
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  
  const { toast } = useToast();

  const platforms = [
    { 
      id: 'wppconnect', 
      name: 'WPPConnect',
      description: 'API mais estável e confiável'
    },
    { 
      id: 'whatsapp-web-js', 
      name: 'WhatsApp Web JS',
      description: 'Baseado no WhatsApp Web oficial'
    },
    { 
      id: 'baileys', 
      name: 'Baileys',
      description: 'Conecta diretamente ao WhatsApp'
    },
    { 
      id: 'green-api', 
      name: 'Green API',
      description: 'Serviço comercial estável'
    }
  ];

  const generateQRCode = async () => {
    if (!config.apiUrl) {
      toast({
        title: "Configuração necessária",
        description: "Configure a URL da API primeiro",
        variant: "destructive"
      });
      return;
    }

    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code real para:', config.platform);
      
      let endpoint = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Configurar endpoint baseado na plataforma
      switch (config.platform) {
        case 'wppconnect':
          endpoint = `${config.apiUrl}/api/${config.instanceId || 'session'}/start-session`;
          if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
          }
          break;
          
        case 'green-api':
          endpoint = `${config.apiUrl}/waInstance${config.instanceId}/qr/${config.apiKey}`;
          break;
          
        case 'whatsapp-web-js':
          endpoint = `${config.apiUrl}/session/${config.instanceId || 'default'}/qr`;
          if (config.apiKey) {
            headers['X-API-Key'] = config.apiKey;
          }
          break;
          
        case 'baileys':
          endpoint = `${config.apiUrl}/sessions/${config.instanceId || 'default'}/qr`;
          if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
          }
          break;
      }

      console.log('🎯 Endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          webhook: `${window.location.origin}/webhook/whatsapp`,
          waitQrCode: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da API:', result);
      
      // Extrair QR Code baseado na plataforma
      let qrCodeData = null;
      if (result.qrcode || result.qr || result.qrCode) {
        qrCodeData = result.qrcode || result.qr || result.qrCode;
      } else if (result.base64) {
        qrCodeData = `data:image/png;base64,${result.base64}`;
      }

      if (qrCodeData) {
        setSessionStatus({
          isConnected: false,
          qrCode: qrCodeData,
          isLoading: false,
          phoneNumber: null,
          platform: config.platform
        });

        toast({
          title: "📱 QR Code Real Gerado!",
          description: `Escaneie com seu WhatsApp usando ${platforms.find(p => p.id === config.platform)?.name}`
        });

        // Verificar status automaticamente
        startConnectionPolling();
      } else {
        throw new Error('QR Code não encontrado na resposta da API');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code real:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null,
        platform: ''
      });
      
      toast({
        title: "❌ Erro na conexão",
        description: error instanceof Error ? error.message : "Erro ao conectar com a API",
        variant: "destructive"
      });
    }
  };

  const startConnectionPolling = () => {
    console.log('🔄 Iniciando verificação automática de conexão...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const interval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Tentativa ${attempts}/${maxAttempts} de verificar conexão`);
      
      try {
        const isConnected = await checkConnectionStatus();
        
        if (isConnected) {
          console.log('✅ Conexão estabelecida!');
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          console.log('⏰ Tempo limite atingido');
          clearInterval(interval);
          toast({
            title: "⏰ Tempo limite",
            description: "QR Code expirou. Gere um novo QR Code.",
            variant: "destructive"
          });
          setSessionStatus(prev => ({ ...prev, qrCode: null }));
        }
      } catch (error) {
        console.error('Erro na verificação:', error);
      }
    }, 3000);
  };

  const checkConnectionStatus = async (): Promise<boolean> => {
    try {
      let endpoint = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      switch (config.platform) {
        case 'wppconnect':
          endpoint = `${config.apiUrl}/api/${config.instanceId || 'session'}/status-session`;
          if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
          }
          break;
          
        case 'green-api':
          endpoint = `${config.apiUrl}/waInstance${config.instanceId}/getStateInstance/${config.apiKey}`;
          break;
          
        case 'whatsapp-web-js':
          endpoint = `${config.apiUrl}/session/${config.instanceId || 'default'}/status`;
          if (config.apiKey) {
            headers['X-API-Key'] = config.apiKey;
          }
          break;
          
        case 'baileys':
          endpoint = `${config.apiUrl}/sessions/${config.instanceId || 'default'}/status`;
          if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
          }
          break;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const result = await response.json();
        const isConnected = result.status === 'CONNECTED' || 
                           result.state === 'CONNECTED' || 
                           result.connected === true ||
                           result.stateInstance === 'authorized';

        if (isConnected) {
          setSessionStatus({
            isConnected: true,
            qrCode: null,
            isLoading: false,
            phoneNumber: result.phoneNumber || result.wid || 'Conectado',
            platform: config.platform
          });
          
          toast({
            title: "✅ WhatsApp Conectado!",
            description: "Sua conta foi conectada com sucesso"
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return false;
    }
  };

  const sendMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e a mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingMessage(true);
    try {
      let endpoint = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      let body: any = {};
      
      switch (config.platform) {
        case 'wppconnect':
          endpoint = `${config.apiUrl}/api/${config.instanceId || 'session'}/send-message`;
          if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
          }
          body = {
            phone: phoneNumber,
            message: message
          };
          break;
          
        case 'green-api':
          endpoint = `${config.apiUrl}/waInstance${config.instanceId}/sendMessage/${config.apiKey}`;
          body = {
            chatId: `${phoneNumber}@c.us`,
            message: message
          };
          break;
          
        case 'whatsapp-web-js':
          endpoint = `${config.apiUrl}/session/${config.instanceId || 'default'}/send`;
          if (config.apiKey) {
            headers['X-API-Key'] = config.apiKey;
          }
          body = {
            to: phoneNumber,
            message: message
          };
          break;
          
        case 'baileys':
          endpoint = `${config.apiUrl}/sessions/${config.instanceId || 'default'}/send`;
          if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
          }
          body = {
            jid: `${phoneNumber}@s.whatsapp.net`,
            type: 'text',
            message: {
              text: message
            }
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({
          title: "✅ Mensagem enviada!",
          description: `Mensagem enviada para ${phoneNumber}`
        });
        setMessage('');
      } else {
        throw new Error(`Erro ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "❌ Erro no envio",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const getStatusBadge = () => {
    if (sessionStatus.isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Conectado via {sessionStatus.platform}
        </Badge>
      );
    } else if (sessionStatus.qrCode) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Aguardando QR
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Desconectado
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                WhatsApp API Hub - Conexão Real
              </CardTitle>
              <CardDescription>
                Conecte seu WhatsApp usando APIs reais e serviços confiáveis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Plataforma</p>
                <p className="text-xs text-gray-600">
                  {platforms.find(p => p.id === config.platform)?.name || 'Não configurada'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Phone className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Telefone</p>
                <p className="text-xs text-gray-600">
                  {sessionStatus.phoneNumber || 'Não conectado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Status da API</p>
                <p className="text-xs text-gray-600">
                  {sessionStatus.isConnected ? 'Ativa' : 'Inativa'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da API</CardTitle>
              <CardDescription>
                Configure sua API WhatsApp real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma</label>
                <Select value={config.platform} onValueChange={(value) => setConfig(prev => ({ ...prev, platform: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-xs text-gray-500">{platform.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL da API</label>
                <Input
                  value={config.apiUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="http://localhost:21465 ou https://api.seudominio.com"
                />
              </div>

              {config.platform !== 'green-api' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token/API Key</label>
                  <Input
                    type="password"
                    value={config.token}
                    onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Seu token de acesso"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Instance ID</label>
                <Input
                  value={config.instanceId}
                  onChange={(e) => setConfig(prev => ({ ...prev, instanceId: e.target.value }))}
                  placeholder="ID da instância (opcional)"
                />
              </div>

              {config.platform === 'green-api' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key Token</label>
                  <Input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Seu API Key Token do Green API"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Conectar WhatsApp Real
              </CardTitle>
              <CardDescription>
                Use APIs reais para conectar seu WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionStatus.isConnected ? (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-900 mb-2">✅ WhatsApp Conectado!</h3>
                    <p className="text-green-700 mb-3">
                      Conectado ao número: {sessionStatus.phoneNumber}
                    </p>
                    <p className="text-green-700 text-sm">
                      Via: {platforms.find(p => p.id === sessionStatus.platform)?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  {sessionStatus.qrCode ? (
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mx-auto max-w-sm">
                        <img 
                          src={sessionStatus.qrCode} 
                          alt="QR Code WhatsApp Real" 
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">📱 Como conectar:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 text-left">
                          <li>1. Abra o WhatsApp no seu celular</li>
                          <li>2. Toque nos três pontos (⋮) e depois em "Aparelhos conectados"</li>
                          <li>3. Toque em "Conectar um aparelho"</li>
                          <li>4. Escaneie este QR Code REAL</li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-2">
                          ⏱️ QR Code real gerado via {platforms.find(p => p.id === config.platform)?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Pronto para conectar</h3>
                        <p className="text-gray-600 text-sm">
                          Configure a API e clique para gerar QR Code real
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={generateQRCode}
                    disabled={sessionStatus.isLoading || !config.apiUrl}
                    className="w-full"
                    size="lg"
                  >
                    {sessionStatus.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gerando QR Code Real...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Gerar QR Code Real
                      </>
                    )}
                  </Button>

                  {!config.apiUrl && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      ⚠️ Configure a URL da API primeiro na aba "Configuração"
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          {sessionStatus.isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  Teste de Mensagem Real
                  <Badge className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Envie mensagens reais através da API conectada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Número de WhatsApp
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem</label>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                </div>

                <Button 
                  onClick={sendMessage}
                  disabled={isLoadingMessage || !phoneNumber.trim() || !message.trim()}
                  className="w-full"
                >
                  {isLoadingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando via {sessionStatus.platform}...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem Real
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">WhatsApp não conectado</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Conecte seu WhatsApp primeiro na aba "Conexão"
                </p>
                <Badge className="bg-amber-100 text-amber-800">
                  Configure e conecte para usar o chat
                </Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Guia de APIs */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🚀 Guia de APIs Suportadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">WPPConnect</h4>
              <p className="text-sm text-gray-600 mb-2">API mais estável e confiável</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Instale: npm i -g @wppconnect-team/wppconnect-server</li>
                <li>• Execute: wppconnect-server --port 21465</li>
                <li>• URL: http://localhost:21465</li>
              </ul>
            </div>
            
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-2">Green API</h4>
              <p className="text-sm text-gray-600 mb-2">Serviço comercial confiável</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Crie conta em green-api.com</li>
                <li>• Configure Instance ID</li>
                <li>• Use API Key Token</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
