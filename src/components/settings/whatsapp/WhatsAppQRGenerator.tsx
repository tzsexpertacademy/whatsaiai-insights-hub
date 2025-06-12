
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";

export function WhatsAppQRGenerator() {
  const { 
    connectionState, 
    generateQRCode, 
    checkSessionStatus
  } = useRealWhatsAppConnection();

  const getStatusBadge = () => {
    if (connectionState.isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Wifi className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <WifiOff className="w-3 h-3 mr-1" />
        Desconectado
      </Badge>
    );
  };

  const getLastCheckInfo = () => {
    if (connectionState.lastStatusCheck) {
      const lastCheck = new Date(connectionState.lastStatusCheck);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return "Verificado agora";
      } else if (diffMinutes < 60) {
        return `Verificado há ${diffMinutes} min`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Verificado há ${diffHours}h`;
      }
    }
    
    return "Nunca verificado";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          Conexão WhatsApp Business
        </CardTitle>
        <CardDescription>
          Conecte seu WhatsApp Business para receber e responder mensagens automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-medium">Status da Conexão</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getLastCheckInfo()}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Informações da Conexão */}
        {connectionState.isConnected && connectionState.phoneNumber && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">WhatsApp Conectado</span>
            </div>
            <p className="text-sm text-green-700">
              📱 Número: {connectionState.phoneNumber}
            </p>
            <p className="text-sm text-green-600 mt-1">
              ✅ Verificação automática ativa (a cada 30 segundos)
            </p>
          </div>
        )}

        {/* QR Code */}
        {!connectionState.isConnected && (
          <div className="text-center space-y-4">
            {connectionState.qrCode ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <img 
                    src={connectionState.qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📱 <strong>Abra o WhatsApp Business</strong> no seu celular</p>
                  <p>⚙️ Vá em <strong>Configurações > Dispositivos conectados</strong></p>
                  <p>📷 Toque em <strong>Conectar um dispositivo</strong> e escaneie o código</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Gere um QR Code para conectar seu WhatsApp Business
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3">
          {!connectionState.isConnected && (
            <Button 
              onClick={generateQRCode}
              disabled={connectionState.isLoading}
              className="flex-1"
            >
              {connectionState.isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  {connectionState.qrCode ? 'Atualizar QR Code' : 'Gerar QR Code'}
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={checkSessionStatus}
            disabled={connectionState.isLoading}
            variant="outline"
            className={connectionState.isConnected ? "flex-1" : ""}
          >
            {connectionState.isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Status
              </>
            )}
          </Button>
        </div>

        {/* Instruções */}
        {!connectionState.isConnected && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">🔗 Como conectar:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Clique em "Gerar QR Code" acima</li>
              <li>Abra o WhatsApp Business no seu celular</li>
              <li>Vá em Configurações > Dispositivos conectados</li>
              <li>Toque em "Conectar um dispositivo"</li>
              <li>Escaneie o QR Code que apareceu acima</li>
              <li>Aguarde a confirmação de conexão</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
