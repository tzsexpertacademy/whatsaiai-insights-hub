
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, WifiOff, QrCode } from 'lucide-react';
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from "@/components/ui/badge";

export function WhatsAppConnection() {
  const { config } = useClientConfig();
  const whatsappConfig = config.whatsapp;

  const headerActions = (
    <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
      📱 WhatsApp Business
    </Badge>
  );

  const navigateToSettings = () => {
    window.location.href = '/settings';
  };

  return (
    <PageLayout
      title="Conexão WhatsApp"
      description="Configure sua conexão com o WhatsApp Business"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Status atual da sua conexão WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {whatsappConfig.isConnected ? (
                <>
                  <Wifi className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {whatsappConfig.isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  Conectado ao número: {whatsappConfig.authorizedNumber}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={navigateToSettings} 
                className="w-full"
              >
                {whatsappConfig.isConnected ? 'Gerenciar Conexão' : 'Configurar WhatsApp'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              QR Code WhatsApp
            </CardTitle>
            <CardDescription>
              {whatsappConfig.isConnected 
                ? 'Seu WhatsApp está conectado' 
                : 'Escaneie com o app WhatsApp Business'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {whatsappConfig.qrCode ? (
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="w-48 h-48 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={whatsappConfig.qrCode} 
                    alt="QR Code para WhatsApp" 
                    className="max-w-full max-h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {whatsappConfig.isConnected 
                    ? 'WhatsApp já conectado'
                    : 'Vá para as configurações para gerar o QR Code'}
                </p>
                <Button onClick={navigateToSettings}>
                  Ir para Configurações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Como Conectar</CardTitle>
          <CardDescription>
            Siga os passos abaixo para configurar sua integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Aplicativo</h3>
              <p className="text-sm text-blue-700">Instale o WhatsApp Business no seu celular</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">QR Code</h3>
              <p className="text-sm text-green-700">Escaneie o QR code nas configurações</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Conversas</h3>
              <p className="text-sm text-purple-700">Acesse e responda mensagens na aba Chat</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
