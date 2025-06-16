
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Wifi, WifiOff, MessageSquare, Settings, Zap, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { useToast } from "@/hooks/use-toast";
import { WPPConnectSettings } from './WPPConnectSettings';
import { WhatsAppChat } from './WhatsAppChat';

export function WhatsAppAPIHub() {
  const [activeTab, setActiveTab] = useState('connection');
  const { 
    sessionStatus, 
    generateQRCode, 
    checkConnectionStatus, 
    disconnectWhatsApp,
    getWPPConfig,
    saveWPPConfig 
  } = useWPPConnect();
  const { toast } = useToast();

  const config = getWPPConfig();
  const isConfigured = config.token && config.secretKey && config.token.length > 10;

  const handleGenerateQR = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuração necessária",
        description: "Configure WPPConnect primeiro na aba Configurações",
        variant: "destructive"
      });
      setActiveTab('settings');
      return;
    }

    const qrCode = await generateQRCode();
    if (qrCode) {
      toast({
        title: "QR Code gerado!",
        description: "Escaneie com seu WhatsApp Business"
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnectWhatsApp();
    toast({
      title: "Desconectado",
      description: "WhatsApp foi desconectado com sucesso"
    });
  };

  const getStatusBadge = () => {
    if (sessionStatus.isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Conectado
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
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                WhatsApp API Hub - Status
              </CardTitle>
              <CardDescription>
                Status da conexão com WhatsApp Business
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Configuração</p>
                <p className="text-xs text-gray-600">
                  {isConfigured ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Telefone</p>
                <p className="text-xs text-gray-600">
                  {sessionStatus.phoneNumber || 'Não conectado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Mensagens</p>
                <p className="text-xs text-gray-600">
                  {sessionStatus.isConnected ? 'Ativas' : 'Inativas'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Conexão
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Conectar WhatsApp Business
              </CardTitle>
              <CardDescription>
                {sessionStatus.isConnected 
                  ? 'Seu WhatsApp está conectado e pronto para usar'
                  : 'Conecte seu WhatsApp Business escaneando o QR Code abaixo'
                }
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
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• API pronta para receber requisições</li>
                      <li>• Mensagens sendo processadas automaticamente</li>
                      <li>• Use a aba "Chat" para testar conversas</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleDisconnect}
                    variant="destructive"
                    className="w-full"
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar WhatsApp
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  {sessionStatus.qrCode ? (
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mx-auto max-w-sm">
                        <img 
                          src={sessionStatus.qrCode} 
                          alt="QR Code WhatsApp" 
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">📱 Como escanear:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 text-left">
                          <li>1. Abra o WhatsApp Business no seu celular</li>
                          <li>2. Toque nos três pontos (⋮) e depois em "Aparelhos conectados"</li>
                          <li>3. Toque em "Conectar um aparelho"</li>
                          <li>4. Escaneie este QR Code</li>
                        </ol>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateQR}
                        disabled={sessionStatus.isLoading}
                        className="w-full"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Gerar Novo QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">Pronto para conectar</h3>
                        <p className="text-gray-600 text-sm">
                          Clique no botão abaixo para gerar um QR Code e conectar seu WhatsApp Business
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateQR}
                        disabled={sessionStatus.isLoading || !isConfigured}
                        className="w-full"
                        size="lg"
                      >
                        {sessionStatus.isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando QR Code...
                          </>
                        ) : (
                          <>
                            <QrCode className="h-4 w-4 mr-2" />
                            Gerar QR Code
                          </>
                        )}
                      </Button>
                      
                      {!isConfigured && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                          ⚠️ Configure o WPPConnect primeiro na aba "Configurações"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <WhatsAppChat />
        </TabsContent>

        <TabsContent value="settings">
          <WPPConnectSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
