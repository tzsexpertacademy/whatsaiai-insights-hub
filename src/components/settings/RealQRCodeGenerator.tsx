import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Loader2, CheckCircle, Clock, Wifi, WifiOff, Settings } from 'lucide-react';
import { useRealWhatsAppConnection } from "@/hooks/useRealWhatsAppConnection";
import { useToast } from "@/hooks/use-toast";

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
  
  const { toast } = useToast();
  const connectionStatus = getConnectionStatus();

  const handleWebhookUpdate = (field: string, value: string) => {
    updateWebhooks({ [field]: value });
    toast({
      title: "Webhook atualizado",
      description: `${field} foi salvo localmente`
    });
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          text: 'Conectado e Ativo',
          color: 'text-green-600'
        };
      default:
        return {
          icon: <WifiOff className="h-6 w-6 text-gray-400" />,
          text: 'Desconectado',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isWebhookConfigured = webhooks.qrWebhook && webhooks.statusWebhook;

  return (
    <div className="space-y-6">
      {/* Configuração de Webhooks */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configuração Make.com
          </CardTitle>
          <CardDescription>
            Configure os webhooks do Make.com para conectar WhatsApp real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-webhook">Webhook QR Code *</Label>
            <Input
              id="qr-webhook"
              placeholder="https://hook.eu1.make.com/xxxxx"
              value={webhooks.qrWebhook}
              onChange={(e) => handleWebhookUpdate('qrWebhook', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-webhook">Webhook Status *</Label>
            <Input
              id="status-webhook"
              placeholder="https://hook.eu1.make.com/xxxxx"
              value={webhooks.statusWebhook}
              onChange={(e) => handleWebhookUpdate('statusWebhook', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="send-webhook">Webhook Envio (Opcional)</Label>
            <Input
              id="send-webhook"
              placeholder="https://hook.eu1.make.com/xxxxx"
              value={webhooks.sendMessageWebhook}
              onChange={(e) => handleWebhookUpdate('sendMessageWebhook', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="autoreply-webhook">Webhook Auto-resposta (Opcional)</Label>
            <Input
              id="autoreply-webhook"
              placeholder="https://hook.eu1.make.com/xxxxx"
              value={webhooks.autoReplyWebhook}
              onChange={(e) => handleWebhookUpdate('autoReplyWebhook', e.target.value)}
            />
          </div>
          
          {!isWebhookConfigured && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                ⚠️ Configure pelo menos os webhooks QR Code e Status para continuar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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

          {!connectionState.isConnected ? (
            <>
              {!connectionState.qrCode ? (
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
              ) : (
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
              )}
            </>
          ) : (
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
          )}

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
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Configuração Make.com</CardTitle>
          <CardDescription>
            Como criar os webhooks no Make.com para WhatsApp real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Passo a passo:</h4>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Acesse <strong>make.com</strong> e crie uma conta</li>
                <li>Crie um novo cenário</li>
                <li>Adicione um módulo <strong>"Webhook"</strong> → <strong>"Custom webhook"</strong></li>
                <li>Copie a URL do webhook e cole no campo "Webhook QR Code"</li>
                <li>Adicione módulos do WhatsApp Business API</li>
                <li>Configure os outros webhooks conforme necessário</li>
                <li>Ative o cenário no Make.com</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">⚡ Dica importante:</h4>
              <p className="text-sm text-amber-700">
                Você precisará de uma conta WhatsApp Business API válida. 
                O Make.com pode conectar com provedores como Twilio, 360Dialog, ou outros.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
