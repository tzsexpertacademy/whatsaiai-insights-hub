
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from 'lucide-react';
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { WebhookConfiguration } from './real-whatsapp/WebhookConfiguration';
import { QRCodeDisplay } from './real-whatsapp/QRCodeDisplay';
import { ConnectionStatusDisplay } from './real-whatsapp/ConnectionStatusDisplay';
import { MakeInstructionsCard } from './real-whatsapp/MakeInstructionsCard';

export function RealQRCodeGenerator() {
  const { 
    connectionState, 
    isLoading, 
    webhooks, 
    updateWebhooks, 
    generateQRCode, 
    disconnectWhatsApp, 
    getConnectionStatus 
  } = useRealWhatsAppConnection();
  
  const connectionStatus = getConnectionStatus();
  const isWebhookConfigured = webhooks.qrWebhook && webhooks.statusWebhook;

  const handleWebhookUpdate = (field: string, value: string) => {
    updateWebhooks({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Configuração de Webhooks */}
      <WebhookConfiguration 
        webhooks={webhooks} 
        updateWebhooks={handleWebhookUpdate} 
      />

      {/* QR Code Generator */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            WhatsApp Business Real
          </CardTitle>
          <CardDescription>
            Conecte seu WhatsApp Business real usando Make.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Conexão */}
          <ConnectionStatusDisplay 
            connectionStatus={connectionStatus}
            phoneNumber={connectionState.phoneNumber}
          />

          <QRCodeDisplay
            connectionState={connectionState}
            isLoading={isLoading}
            isWebhookConfigured={isWebhookConfigured}
            generateQRCode={generateQRCode}
            disconnectWhatsApp={disconnectWhatsApp}
          />

          {connectionState.isConnected && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ WhatsApp Conectado!</h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>Mensagens são recebidas automaticamente</li>
                <li>Respostas automáticas estão ativas (se configuradas)</li>
                <li>Vá para a aba "Chat" para ver conversas</li>
                <li>Configure OpenAI para respostas inteligentes</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções Make.com */}
      <MakeInstructionsCard />
    </div>
  );
}
