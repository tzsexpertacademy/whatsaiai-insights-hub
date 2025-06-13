
import React from 'react';
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, Wifi } from 'lucide-react';

interface QRCodeDisplayProps {
  connectionState: {
    isConnected: boolean;
    qrCode: string;
    phoneNumber: string;
    lastConnected: string;
  };
  isLoading: boolean;
  isWebhookConfigured: boolean;
  generateQRCode: () => void;
  disconnectWhatsApp: () => void;
}

export function QRCodeDisplay({ 
  connectionState, 
  isLoading, 
  isWebhookConfigured, 
  generateQRCode, 
  disconnectWhatsApp 
}: QRCodeDisplayProps) {
  if (connectionState.isConnected) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <Wifi className="h-16 w-16 text-green-500" />
        </div>
        <p className="text-green-600 font-medium mb-2">WhatsApp Business Conectado!</p>
        <p className="text-sm text-gray-600 mb-4">
          Conectado ao: {connectionState.phoneNumber}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Última conexão: {new Date(connectionState.lastConnected).toLocaleString('pt-BR')}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
            Desconectar
          </Button>
          <Button onClick={generateQRCode} variant="outline" size="sm">
            Gerar Novo QR Code
          </Button>
        </div>
      </div>
    );
  }

  if (!connectionState.qrCode) {
    return (
      <div className="text-center py-8">
        <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">
          {isWebhookConfigured 
            ? "Clique para gerar QR Code real" 
            : "Configure os webhooks primeiro"}
        </p>
        <Button 
          onClick={generateQRCode} 
          disabled={isLoading || !isWebhookConfigured}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando QR Code...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Gerar QR Code Real
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
        <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={connectionState.qrCode} 
            alt="QR Code WhatsApp Business Real" 
            className="max-w-full max-h-full"
          />
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p className="font-medium text-blue-600">📱 Como conectar:</p>
        <p>1. Abra o WhatsApp Business no seu celular</p>
        <p>2. Vá em Menu (⋮) → Dispositivos conectados</p>
        <p>3. Toque em "Conectar um dispositivo"</p>
        <p>4. Escaneie este código QR</p>
      </div>
      
      <div className="p-3 bg-blue-50 rounded-lg mb-4">
        <p className="text-xs text-blue-700">
          🔄 <strong>Aguardando conexão...</strong> O sistema detectará automaticamente quando você escanear o QR Code.
        </p>
      </div>
      
      <Button 
        onClick={generateQRCode} 
        variant="outline" 
        size="sm"
        disabled={isLoading}
      >
        Gerar Novo QR Code
      </Button>
    </div>
  );
}
