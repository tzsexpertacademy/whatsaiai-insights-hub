
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';
import { useWhatsAppQRCode } from "@/hooks/useWhatsAppQRCode";

export function WhatsAppConnectionStatus() {
  const { qrState, getConnectionStatus } = useWhatsAppQRCode();
  const connectionStatus = getConnectionStatus();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'idle':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Inativo</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'active':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'idle':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          Status da Conexão
        </CardTitle>
        <CardDescription>
          Informações sobre sua conexão WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">WhatsApp Business</span>
          </div>
          {getStatusBadge()}
        </div>

        {qrState.isConnected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Número conectado: {qrState.phoneNumber}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>
                Última conexão: {new Date(qrState.lastConnected).toLocaleDateString('pt-BR')} às {new Date(qrState.lastConnected).toLocaleTimeString('pt-BR')}
              </span>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                ✅ <strong>Conectado com sucesso!</strong> Agora você pode receber e enviar mensagens automaticamente.
              </p>
            </div>
          </div>
        )}

        {!qrState.isConnected && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              📱 Para conectar seu WhatsApp Business, gere um QR Code na seção ao lado e escaneie com seu celular.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
