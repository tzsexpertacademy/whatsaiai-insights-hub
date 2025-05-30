
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, CheckCircle, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWhatsAppQRCode } from "@/hooks/useWhatsAppQRCode";

export function QRCodeGenerator() {
  const { qrState, generateQRCode, disconnectWhatsApp, getConnectionStatus, isLoading } = useWhatsAppQRCode();
  const connectionStatus = getConnectionStatus();

  console.log('🖥️ QRCodeGenerator - Renderizando com estado:', {
    qrCode: qrState.qrCode ? 'presente' : 'ausente',
    isGenerating: qrState.isGenerating,
    isConnected: qrState.isConnected,
    isLoading
  });

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
          icon: <WifiOff className="h-6 w-6 text-gray-400" />,
          text: 'Desconectado',
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleGenerateQR = async () => {
    console.log('🖱️ BOTÃO CLICADO - Iniciando geração de QR Code...');
    console.log('📊 Estado antes do clique:', qrState);
    
    try {
      await generateQRCode();
      console.log('✅ generateQRCode executado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao executar generateQRCode:', error);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          QR Code WhatsApp Business
        </CardTitle>
        <CardDescription>
          {qrState.isConnected 
            ? 'Sua sessão está ativa e salva localmente'
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
          {qrState.phoneNumber && (
            <span className="text-sm text-gray-500 ml-auto">
              {qrState.phoneNumber}
            </span>
          )}
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Debug: QR={qrState.qrCode ? '✅' : '❌'} | Generating={qrState.isGenerating ? '🔄' : '⏹️'} | Connected={qrState.isConnected ? '✅' : '❌'}
        </div>

        {!qrState.qrCode && !qrState.isConnected ? (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar o QR Code</p>
            <Button 
              onClick={handleGenerateQR} 
              disabled={isLoading || qrState.isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading || qrState.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </>
              )}
            </Button>
          </div>
        ) : qrState.isConnected ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <Wifi className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-green-600 font-medium mb-2">WhatsApp Business Conectado! 🎉</p>
            <p className="text-sm text-gray-600 mb-4">
              Conectado ao: {qrState.phoneNumber}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Última conexão: {new Date(qrState.lastConnected).toLocaleString('pt-BR')}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={disconnectWhatsApp} variant="outline" size="sm">
                Desconectar
              </Button>
              <Button onClick={handleGenerateQR} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Gerar Novo QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-200 mb-4">
              {isLoading || qrState.isGenerating ? (
                <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-blue-600 font-medium">Gerando QR Code...</p>
                    <p className="text-sm text-gray-500">Aguarde alguns segundos</p>
                  </div>
                </div>
              ) : qrState.qrCode ? (
                <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  <img 
                    src={qrState.qrCode} 
                    alt="QR Code para WhatsApp Business" 
                    className="max-w-full max-h-full rounded"
                    onLoad={() => console.log('✅ Imagem do QR Code carregada com sucesso')}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar imagem do QR Code');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">QR Code será exibido aqui</p>
                  </div>
                </div>
              )}
            </div>
            
            {!isLoading && !qrState.isGenerating && qrState.qrCode && (
              <>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="font-medium text-blue-600">📱 Como conectar:</p>
                  <p>1. Abra o WhatsApp Business no seu celular</p>
                  <p>2. Vá em Menu (⋮) → Dispositivos conectados</p>
                  <p>3. Toque em "Conectar um dispositivo"</p>
                  <p>4. Escaneie este código QR</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-xs text-blue-700">
                    ⏱️ <strong>Aguardando conexão...</strong> O sistema detectará automaticamente quando você escanear o QR Code (em ~15 segundos para teste).
                  </p>
                </div>
              </>
            )}
            
            <Button 
              onClick={handleGenerateQR} 
              variant="outline" 
              size="sm"
              disabled={isLoading || qrState.isGenerating}
              className="mt-4"
            >
              {isLoading || qrState.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Novo QR Code
                </>
              )}
            </Button>
          </div>
        )}
        
        {qrState.isConnected && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✅ Próximos passos:</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Vá para a aba "Chat" para ver conversas</li>
              <li>Configure as respostas automáticas</li>
              <li>Importe conversas antigas para análise</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
