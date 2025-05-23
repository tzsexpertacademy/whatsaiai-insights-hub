
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

export function QRCodeGenerator() {
  const { connectionState, isLoading, generateQRCode, getConnectionStatus } = useWhatsAppConnection();
  const connectionStatus = getConnectionStatus();

  const handleGenerateQR = async () => {
    await generateQRCode();
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          text: 'Conectado e Ativo',
          color: 'text-green-600'
        };
      case 'idle':
        return {
          icon: <Clock className="h-6 w-6 text-yellow-500" />,
          text: 'Conectado (Inativo)',
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: <QrCode className="h-6 w-6 text-gray-400" />,
          text: 'Desconectado',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          QR Code WhatsApp Business
        </CardTitle>
        <CardDescription>
          {connectionState.isConnected 
            ? 'Sua sessão está salva localmente'
            : 'Escaneie com seu WhatsApp Business para conectar'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {statusInfo.icon}
          <span className={`font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          {connectionState.phoneNumber && (
            <span className="text-sm text-gray-500 ml-auto">
              {connectionState.phoneNumber}
            </span>
          )}
        </div>

        {!connectionState.qrCode && !connectionState.isConnected ? (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar o QR Code</p>
            <Button onClick={handleGenerateQR} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar QR Code'
              )}
            </Button>
          </div>
        ) : connectionState.isConnected ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-medium mb-2">WhatsApp Conectado!</p>
            <p className="text-sm text-gray-600 mb-4">
              Última conexão: {new Date(connectionState.lastConnected).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500">
              A sessão fica salva no seu navegador
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
              {isLoading ? (
                <div className="w-48 h-48 mx-auto rounded-lg flex items-center justify-center">
                  <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={connectionState.qrCode} 
                    alt="QR Code para WhatsApp" 
                    className="max-w-full max-h-full"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              1. Abra o WhatsApp Business no seu celular
            </p>
            <p className="text-sm text-gray-600 mb-2">
              2. Vá em Menu → Dispositivos conectados
            </p>
            <p className="text-sm text-gray-600 mb-4">
              3. Escaneie este código QR
            </p>
            <Button 
              onClick={handleGenerateQR} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Novo QR Code'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
